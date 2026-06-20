// Supabase Edge Function: chat
// Deploy: `supabase functions deploy chat --no-verify-jwt`
// Secrets: GROQ_API_KEY, LIBRETRANSLATE_URL (default https://libretranslate.com)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT =
  "You are KashmirBot (کٲشُر مددگار), a helpful assistant built specifically for the people of Kashmir, especially elderly users who are not comfortable with English or Urdu. Always reply in simple, warm Kashmiri language written in the Perso-Arabic Shahmukhi script. If the user writes in Roman Kashmiri, Urdu, or English, still reply in Kashmiri Shahmukhi script only. Keep replies short — maximum 3 sentences. Be extremely patient and kind. Never use technical jargon. Start every reply with a warm greeting like سلام or خیر۔";

interface ChatBody {
  message: string;
  language: "kashmiri" | "urdu" | "english";
  history?: { role: "user" | "assistant"; content: string }[];
}

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
    if (language !== "english") {
      englishMessage = await translateToEnglish(message, ltUrl);
    }

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
          { role: "system", content: SYSTEM_PROMPT },
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

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "server_error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
