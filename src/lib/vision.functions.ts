import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  imageUrl: z.string().url().max(4000),
  question: z.string().max(2000).optional(),
});

export type VisionResult = { text: string };

/**
 * Reads an uploaded image with a multimodal model so text inside the picture
 * (signs, forms, prescriptions, screenshots) becomes part of the conversation.
 */
export const readImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<VisionResult> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("ai_not_configured");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You extract information from images. Transcribe ALL visible text exactly (any script: Urdu, Kashmiri Nastaliq, Hindi, English), then add one short line describing what the image shows. Format: 'TEXT: ...' then 'IMAGE: ...'. If there is no text, write 'TEXT: (none)'.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: data.question?.trim() || "Read this image." },
                { type: "image_url", image_url: { url: data.imageUrl } },
              ],
            },
          ],
        }),
      });

      if (res.status === 429) throw new Error("rate_limited");
      if (res.status === 402) throw new Error("credits_exhausted");
      if (!res.ok) throw new Error(`vision_failed_${res.status}`);

      const json = await res.json();
      const text: string = json?.choices?.[0]?.message?.content?.trim() ?? "";
      return { text };
    } finally {
      clearTimeout(timeout);
    }
  });
