import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  text: z.string().min(1).max(2000),
  language: z.enum(["kashmiri", "urdu", "english"]).default("kashmiri"),
});

const READ_PROMPT: Record<string, string> = {
  kashmiri: "Read this aloud naturally in Kashmiri (koshur), warm and clear:",
  urdu: "Read this aloud naturally in Urdu, warm and clear:",
  english: "Read this aloud naturally in English, warm and clear:",
};

export type TtsResult = {
  /** Base64 audio bytes. */
  audio: string;
  mime: string;
};

/**
 * Reads Kashmiri (Nastaliq) text aloud. Gemini-TTS handles Perso-Arabic script
 * far better than the browser's speechSynthesis, which has no Kashmiri voice.
 */
export const speakKashmiri = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }): Promise<TtsResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Voice output is not configured.");

    const prompt = `Read this aloud naturally in Kashmiri (koshur), warm and clear: ${data.text}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-tts",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
          },
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Too many requests — please try again in a moment.");
      if (res.status === 402)
        throw new Error("AI credits exhausted — please top up to keep using voice output.");
      throw new Error(`Voice output failed [${res.status}]: ${body.slice(0, 200)}`);
    }

    const mime = res.headers.get("content-type") ?? "audio/wav";
    const buf = new Uint8Array(await res.arrayBuffer());
    if (!buf.byteLength) throw new Error("No audio was generated.");

    let binary = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < buf.length; i += CHUNK) {
      binary += String.fromCharCode(...buf.subarray(i, i + CHUNK));
    }
    return { audio: btoa(binary), mime: mime.split(";")[0] };
  });
