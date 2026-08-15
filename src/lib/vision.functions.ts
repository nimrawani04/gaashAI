import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z
  .object({
    imageUrl: z.string().url().max(4000).optional(),
    /** Full data URL (data:image/png;base64,...) for direct uploads without storage. */
    imageData: z.string().max(12_000_000).optional(),
    question: z.string().max(2000).optional(),
  })
  .refine((v) => Boolean(v.imageUrl || v.imageData), {
    message: "imageUrl or imageData is required",
  });

export type VisionScript = "arabic" | "latin" | "devanagari" | "mixed" | "none";

export type VisionResult = {
  /** Human/AI readable summary block (kept for the chat flow). */
  text: string;
  /** Verbatim text found in the image, in its original script and order. */
  extracted: string;
  /** Roman transliteration of RTL text (empty when not applicable). */
  roman: string;
  /** Dominant script detected in the image. */
  script: VisionScript;
  /** Best-guess language name, e.g. "Kashmiri", "Urdu", "English". */
  language: string;
  /** One-line description of the image. */
  description: string;
};

const SYSTEM = [
  "You are an expert OCR engine for South Asian documents.",
  "Detect the dominant script/language of the visible text: Perso-Arabic (Kashmiri/Urdu), Latin (English), or Devanagari (Hindi).",
  "Transcribe ALL visible text VERBATIM in its original script, preserving right-to-left word order, line breaks, diacritics and Kashmiri-specific characters (ٲ ٳ ؠ ۄ ۆ ٮٕ).",
  "Never translate or transliterate inside 'extracted'. Never reverse or reorder RTL text.",
  "Kashmiri Perso-Arabic and Urdu look similar: prefer 'Kashmiri' only when Kashmiri-specific letters or vocabulary appear, otherwise 'Urdu'.",
  'Reply ONLY with compact JSON: {"extracted":"...","roman":"...","script":"arabic|latin|devanagari|mixed|none","language":"...","description":"..."}',
  "'roman' = Roman transliteration of the extracted text when it is Perso-Arabic or Devanagari, else an empty string.",
  "If there is no readable text, set extracted to \"\" and script to \"none\".",
].join(" ");

function normaliseScript(v: unknown): VisionScript {
  const s = String(v ?? "").toLowerCase();
  if (s.includes("arab") || s.includes("nasta") || s.includes("urdu") || s.includes("kash")) return "arabic";
  if (s.includes("deva") || s.includes("hindi")) return "devanagari";
  if (s.includes("latin") || s.includes("english") || s.includes("roman")) return "latin";
  if (s.includes("mix")) return "mixed";
  return "none";
}

/**
 * Reads an uploaded image with a multimodal model so text inside the picture
 * (signs, forms, prescriptions, screenshots) becomes usable by chat and translate.
 */
export const readImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<VisionResult> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("ai_not_configured");

    const url = data.imageUrl ?? data.imageData!;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: data.question?.trim()
                    ? `Read this image. The user asks: ${data.question.trim()}`
                    : "Read this image.",
                },
                { type: "image_url", image_url: { url } },
              ],
            },
          ],
        }),
      });

      if (res.status === 429) throw new Error("rate_limited");
      if (res.status === 402) throw new Error("credits_exhausted");
      if (!res.ok) throw new Error(`vision_failed_${res.status}`);

      const json = await res.json();
      const raw: string = json?.choices?.[0]?.message?.content?.trim() ?? "";
      const match = raw.match(/\{[\s\S]*\}/);

      let extracted = "";
      let roman = "";
      let script: VisionScript = "none";
      let language = "";
      let description = "";

      if (match) {
        try {
          const p = JSON.parse(match[0]);
          extracted = String(p.extracted ?? "").trim();
          roman = String(p.roman ?? "").trim();
          script = normaliseScript(p.script);
          language = String(p.language ?? "").trim();
          description = String(p.description ?? "").trim();
        } catch {
          /* fall through to raw */
        }
      }

      if (!extracted && !description && raw) {
        extracted = raw;
      }
      if (script === "none" && /[\u0600-\u06FF]/.test(extracted)) script = "arabic";
      if (script === "none" && /[\u0900-\u097F]/.test(extracted)) script = "devanagari";
      if (script === "none" && /[A-Za-z]/.test(extracted)) script = "latin";

      const text = [
        `TEXT (${language || script}): ${extracted || "(none)"}`,
        roman ? `ROMAN: ${roman}` : "",
        description ? `IMAGE: ${description}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      return { text, extracted, roman, script, language, description };
    } finally {
      clearTimeout(timeout);
    }
  });
