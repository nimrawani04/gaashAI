import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  /** Base64-encoded WAV audio (no data: prefix). */
  audio: z.string().min(64).max(20_000_000),
  /** Optional ISO-639-1 hint, e.g. "ur" or "en". Omit to auto-detect. */
  language: z.string().max(5).optional(),
});

export type SttResult = { text: string };

export const transcribeSpeech = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }): Promise<SttResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Speech recognition is not configured.");

    const bytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
    if (bytes.byteLength < 2048) return { text: "" };

    const form = new FormData();
    form.append("model", "openai/gpt-4o-transcribe");
    form.append("file", new Blob([bytes], { type: "audio/wav" }), "recording.wav");
    if (data.language) form.append("language", data.language);
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
      if (res.status === 402) throw new Error("AI credits exhausted — please top up to keep using voice input.");
      throw new Error(`Transcription failed [${res.status}]: ${body.slice(0, 300)}`);
    }

    const json = (await res.json()) as { text?: string };
    return { text: (json.text ?? "").trim() };
  });
