import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  /** Base64-encoded WAV audio (no data: prefix). */
  audio: z.string().min(64).max(20_000_000),
  /** Optional ISO-639-1 hint, e.g. "ur" or "en". Omit to auto-detect. */
  language: z.string().max(5).optional(),
});

export type SttResult = { text: string };

const KASHMIRI_PROMPT = [
  "You are a Kashmiri (کٲشُر / koshur) speech recognition engine.",
  "The speaker talks in Kashmiri, sometimes mixed with Urdu or English words.",
  "Transcribe the audio verbatim in Kashmiri using the Perso-Arabic Nastaliq script",
  "with Kashmiri vowel diacritics (ٲ ٹ ۆ ۄ ٕ ٪) where they belong.",
  "Do NOT translate, do NOT summarise, do NOT add commentary or quotes.",
  "If the speaker clearly speaks English, transcribe in English.",
  "Reply with the transcript text only.",
].join(" ");

/** Kashmiri-tuned transcription: a multilingual audio LLM prompted for koshur. */
async function transcribeWithKashmiriModel(
  apiKey: string,
  base64Wav: string,
): Promise<string> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: KASHMIRI_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Transcribe this Kashmiri speech in Nastaliq script." },
            { type: "input_audio", input_audio: { data: base64Wav, format: "wav" } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw Object.assign(new Error(`kashmiri_stt_${res.status}: ${body.slice(0, 200)}`), {
      status: res.status,
    });
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return (json.choices?.[0]?.message?.content ?? "").trim();
}

/** Generic fallback so voice input still works if the Kashmiri path fails. */
async function transcribeFallback(
  apiKey: string,
  bytes: Uint8Array,
  language?: string,
): Promise<string> {
  const form = new FormData();
  form.append("model", "openai/gpt-4o-transcribe");
  form.append("file", new Blob([bytes], { type: "audio/wav" }), "recording.wav");
  if (language) form.append("language", language);
  form.append(
    "prompt",
    "The speaker talks in Kashmiri (koshur) or Urdu. Transcribe verbatim in the Perso-Arabic script.",
  );

  const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Too many requests — please try again in a moment.");
    if (res.status === 402)
      throw new Error("AI credits exhausted — please top up to keep using voice input.");
    throw new Error(`Transcription failed [${res.status}]: ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as { text?: string };
  return (json.text ?? "").trim();
}

export const transcribeSpeech = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }): Promise<SttResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Speech recognition is not configured.");

    const bytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
    if (bytes.byteLength < 2048) return { text: "" };

    try {
      const text = await transcribeWithKashmiriModel(apiKey, data.audio);
      if (text) return { text };
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 429) throw new Error("Too many requests — please try again in a moment.");
      if (status === 402)
        throw new Error("AI credits exhausted — please top up to keep using voice input.");
      // fall through to the generic transcription endpoint
    }

    return { text: await transcribeFallback(apiKey, bytes, data.language) };
  });
