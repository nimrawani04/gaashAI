// Supabase Edge Function: chat (with RAG via pgvector + gte-small)
// Deploy: `supabase functions deploy chat --no-verify-jwt`
// Secrets: GROQ_API_KEY, LIBRETRANSLATE_URL (default https://libretranslate.com)
//
// Uses free Supabase AI gte-small (384 dims) to embed the user query, then
// pulls top-3 relevant rows from `knowledge_base` via the `match_knowledge`
// RPC (see embed/index.ts header for the SQL setup).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// deno-lint-ignore no-explicit-any
declare const Supabase: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_SYSTEM_PROMPT =
  "You are KashmirBot (کٲشُر مددگار), a helpful assistant built specifically for the people of Kashmir, especially elderly users who are not comfortable with English or Urdu. Always reply in simple, warm Kashmiri language written in the Perso-Arabic Shahmukhi script. If the user writes in Roman Kashmiri, Urdu, or English, still reply in Kashmiri Shahmukhi script only. Keep replies short — maximum 3 sentences. Be extremely patient and kind. Never use technical jargon. Start every reply with a warm greeting like سلام or خیر۔";

interface ChatBody {
  message: string;
  language: "kashmiri" | "urdu" | "english";
  history?: { role: "user" | "assistant"; content: string }[];
}

const embedSession = new Supabase.ai.Session("gte-small");

async function translateToEnglish(text: string, baseUrl: string): Promise<string> {
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "ur", target: "en", format: "text" }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    return data?.translatedText || text;
  } catch {
    return text;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, language, history = [] }: ChatBody = await req.json();
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "message required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const groqKey = Deno.env.get("GROQ_API_KEY");
    if (!groqKey) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ltUrl = Deno.env.get("LIBRETRANSLATE_URL") || "https://libretranslate.com";
    let englishMessage = message;
    if (language !== "english") englishMessage = await translateToEnglish(message, ltUrl);

    // ---- RAG: embed query + match knowledge_base ------------------------
    let ragContext = "";
    try {
      const queryEmbedding = await embedSession.run(englishMessage, {
        mean_pool: true,
        normalize: true,
      });

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { data: matches } = await supabase.rpc("match_knowledge", {
        query_embedding: queryEmbedding,
        match_threshold: 0.6,
        match_count: 3,
      });

      if (matches && matches.length > 0) {
        const lines = matches
          .map((m: { title: string; content_english: string }) => `- ${m.title}: ${m.content_english}`)
          .join("\n");
        ragContext =
          `Here is relevant local information to help answer this question accurately:\n${lines}\nUse this information in your reply but always respond in Kashmiri Shahmukhi script.\n\n`;
      }
    } catch (e) {
      console.error("RAG lookup failed", e);
    }

    const systemPrompt = ragContext + BASE_SYSTEM_PROMPT;
    const recent = history.slice(-6).map((m) => ({ role: m.role, content: m.content }));

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 300,
        messages: [
          { role: "system", content: systemPrompt },
          ...recent,
          { role: "user", content: englishMessage },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return new Response(JSON.stringify({ error: "groq_failed", detail: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ reply, used_rag: ragContext.length > 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "server_error", detail: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
