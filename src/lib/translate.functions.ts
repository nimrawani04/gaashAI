import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { translateOffline } from "@/lib/lexicon";

const Input = z.object({
  text: z.string().min(1).max(2000),
  direction: z.enum(["en2ks", "ks2en"]),
});

export type TranslateResult = {
  translation: string;
  roman: string;
  notes: string;
};

const SCHEMA_HINT = `Reply ONLY with compact JSON:
{"translation":"...","roman":"...","notes":"..."}`;

export const translateText = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<TranslateResult> => {
    // Instant, offline answer from the built-in lexicon (also our safety net).
    const offline = translateOffline(data.text, data.direction);

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) {
      if (offline) return { ...offline, notes: offline.notes };
      throw new Error("AI is not configured");
    }

    // Few-shot grounding from the BPCC (Bharat Parallel Corpus Collection) corpus.
    let examples = "";
    try {
      const { retrieveBpccExamples, formatExamples } = await import("@/lib/bpcc.server");
      examples = formatExamples(await retrieveBpccExamples(data.text, 5));
    } catch {
      examples = "";
    }

    const system =
      data.direction === "en2ks"
        ? [
            "You are a Kashmiri (کٲشُر) language teacher and translator.",
            "Translate the user's English (or Urdu/Hindi) text into natural everyday Kashmiri written in Perso-Arabic Nastaliq script.",
            "'translation' = the Kashmiri Nastaliq text. 'roman' = the same Kashmiri in Roman letters so learners can pronounce it.",
            "'notes' = one short English learning tip (key word meanings or grammar), max 25 words.",
            examples,
            SCHEMA_HINT,
          ].join(" ")
        : [
            "You are a Kashmiri (کٲشُر) language teacher and translator.",
            "The user writes Kashmiri (Nastaliq or Roman). Translate it into simple, natural English.",
            "'translation' = the English translation. 'roman' = the original Kashmiri written in Roman letters.",
            "'notes' = one short English learning tip about key Kashmiri words used, max 25 words.",
            examples,
            SCHEMA_HINT,
          ].join(" ");


    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: system },
            { role: "user", content: data.text },
          ],
        }),
      });
    } catch {
      if (offline) return offline;
      throw new Error("ai_unreachable");
    } finally {
      clearTimeout(timeout);
    }

    if (res.status === 429) {
      if (offline) return offline;
      throw new Error("rate_limited");
    }
    if (res.status === 402) {
      if (offline) return offline;
      throw new Error("credits_exhausted");
    }
    if (!res.ok) {
      if (offline) return offline;
      throw new Error(`ai_failed_${res.status}`);
    }

    const json = await res.json();
    const raw: string = json?.choices?.[0]?.message?.content?.trim() ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (!String(parsed.translation ?? "").trim() && offline) return offline;
        return {
          translation: String(parsed.translation ?? "").trim(),
          roman: String(parsed.roman ?? "").trim(),
          notes: String(parsed.notes ?? "").trim(),
        };
      } catch {
        /* fall through */
      }
    }
    if (raw) return { translation: raw, roman: offline?.roman ?? "", notes: offline?.notes ?? "" };
    if (offline) return offline;
    return { translation: "", roman: "", notes: "" };
  });
