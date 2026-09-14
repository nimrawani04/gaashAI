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

const SHARED_RULES = [
  "Do your best to understand what the user means, even if their spelling or grammar is imperfect. Kashmiri and Urdu are often mixed with English — treat the meaning as the priority.",
  "NEVER say things like 'I don't understand', 'میں سمجھ نہیں پایا', 'please ask again', or refuse to answer. Refusals are FORBIDDEN.",
  "If you are unsure what the user means, pick the closest relevant topic from the context or general Kashmir knowledge (health, schemes, weather, tourism, culture, daily life) and give a short helpful answer, then gently offer to clarify at the end.",
  "If the retrieved 'relevant local information' block contains anything even loosely related to the user's question, use it as the basis of your reply. If it is empty or unrelated, still give a helpful, plausible answer from general knowledge — never refuse.",
  "Keep replies short (2–4 sentences), warm, and free of technical jargon.",
].join(" ");

const LANGUAGE_RULES: Record<string, string> = {
  kashmiri: [
    "You are KashmirBot (کٲشُر مددگار), a warm, patient assistant for the people of Kashmir, especially elderly users.",
    "ALWAYS reply in simple, everyday Kashmiri written in the Perso-Arabic Nastaliq script (کٲشُر). No matter which language the user writes in — your reply MUST be in Kashmiri Nastaliq. Use natural Kashmiri words (چھُ، چھِ، چھِو، کٔرِو، کٔر، یِمَو، تِمَو، تُہیہ، بہ, etc.), not pure Urdu.",
    "Start with a friendly opener like سلام, خیر, or جی۔",
  ].join(" "),
  urdu: [
    "You are KashmirBot (کشمیر مددگار), a warm, patient Urdu-speaking assistant for the people of Kashmir, especially elderly users.",
    "ALWAYS reply in simple, everyday Urdu written in the Perso-Arabic Nastaliq script. No matter which language the user writes in (Kashmiri, Roman Urdu, Hindi or English) — your reply MUST be in natural Urdu, NOT Kashmiri and NOT English.",
    "Use plain conversational Urdu (آپ، کیجیے، ہے، ہیں) that an elderly person in Srinagar would understand; avoid heavy literary or Arabic-Persian vocabulary.",
    "Start with a friendly opener like سلام, جی, or خیریت۔",
  ].join(" "),
  english: [
    "You are KashmirBot, a warm, patient assistant for the people of Kashmir.",
    "ALWAYS reply in simple, clear English, no matter which language the user writes in.",
  ].join(" "),
};

function systemFor(language: string): string {
  return `${LANGUAGE_RULES[language] ?? LANGUAGE_RULES.kashmiri} ${SHARED_RULES}`;
}

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

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
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
        match_threshold: 0.3,
        match_count: 5,
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

    // ---- BPCC few-shot: closest human-verified EN⇄KS sentence pairs -----
    let bpccContext = "";
    try {
      const embRes = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
        method: "POST",
        headers: {
          "Lovable-API-Key": lovableKey,
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/text-embedding-3-small",
          input: englishMessage.slice(0, 1000),
        }),
      });
      if (embRes.ok) {
        const embJson = await embRes.json();
        const vec = embJson?.data?.[0]?.embedding;
        if (Array.isArray(vec)) {
          const sb = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          );
          const { data: pairs } = await sb.rpc("match_translation_pairs", {
            query_embedding: vec,
            match_count: 5,
          });
          const good = (pairs ?? []).filter(
            (p: { similarity: number }) => p.similarity > 0.15,
          );
          if (good.length > 0) {
            const lines = good
              .map((p: { en: string; ks: string }) => `EN: ${p.en}\nKS: ${p.ks}`)
              .join("\n---\n");
            bpccContext =
              `Reference translations from the BPCC human-verified English–Kashmiri corpus. Match their vocabulary, spelling and Nastaliq orthography as closely as possible when writing your Kashmiri reply:\n${lines}\n\n`;
          }
        }
      }
    } catch (e) {
      console.error("BPCC lookup failed", e);
    }

    const systemPrompt = ragContext + bpccContext + BASE_SYSTEM_PROMPT;

    const recent = history.slice(-6).map((m) => ({ role: m.role, content: m.content }));

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": lovableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...recent,
          { role: "user", content: englishMessage },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway failed", aiRes.status, errText);
      return new Response(JSON.stringify({ error: "ai_failed", status: aiRes.status, detail: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
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
