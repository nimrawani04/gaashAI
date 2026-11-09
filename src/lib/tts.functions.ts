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
 * Server text-to-speech helper.
 * Tries the AI gateway speech model first, returning base64 audio.
 */
export const speakKashmiri = createServerFn({ method: "POST" })
  .validator((data: unknown) => Input.parse(data))
  .handler(async ({ data }): Promise<TtsResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Voice output is not configured.");

    const prompt = `${READ_PROMPT[data.language] ?? READ_PROMPT.kashmiri} ${data.text}`;

    // 1. Try standard OpenAI-compatible audio/speech on Lovable AI gateway
    let res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Lovable-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: prompt,
        voice: data.language === "english" ? "alloy" : "nova",
      }),
    }).catch(() => null);

    // 2. If tts-1 is not accepted, try Gemini multimodal speech format
    if (!res || !res.ok) {
      const geminiRes = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Lovable-API-Key": apiKey,
          "Content-Type": "application/json",
        },
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
      }).catch(() => null);

      if (geminiRes && geminiRes.ok) {
        res = geminiRes;
      }
    }

    if (!res || !res.ok) {
      const status = res?.status ?? 500;
      if (status === 429) throw new Error("Too many requests — please try again in a moment.");
      if (status === 402)
        throw new Error("AI credits exhausted — please top up to keep using voice output.");
      throw new Error(`Voice output unavailable [${status}]`);
    }

    const contentType = res.headers.get("content-type") ?? "audio/mpeg";

    // If the response is JSON (e.g. Gemini returned inline base64 data)
    if (contentType.includes("application/json")) {
      const json = await res.json().catch(() => null);
      const inlineData = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (inlineData?.data) {
        return { audio: inlineData.data, mime: inlineData.mimeType || "audio/mp3" };
      }
      throw new Error("No audio was returned from speech model.");
    }

    // Binary audio response
    const buf = new Uint8Array(await res.arrayBuffer());
    if (!buf.byteLength) throw new Error("No audio was generated.");

    let binary = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < buf.length; i += CHUNK) {
      binary += String.fromCharCode(...buf.subarray(i, i + CHUNK));
    }
    return { audio: btoa(binary), mime: contentType.split(";")[0] || "audio/mpeg" };
  });
