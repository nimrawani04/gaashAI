import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Proxies the kashmiriVoice server (github.com/nimrawani04/kashmiriVoice):
 * POST {KASHMIRI_TTS_URL}/api/synthesize { text, dialect } -> { audio_url }.
 * Returns the WAV as a data URL so the browser never needs the server address.
 */
export const synthesizeKashmiri = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      text: z.string().min(1).max(1500),
      dialect: z.enum(["kupwara", "bandipora", "shopian", "islamabad"]).default("kupwara"),
    }),
  )
  .handler(async ({ data }) => {
    const base = process.env.KASHMIRI_TTS_URL?.replace(/\/+$/, "");
    if (!base) return { error: "not_configured" as const, audio: null };
    try {
      const res = await fetch(`${base}/api/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "1" },
        body: JSON.stringify({ text: data.text, dialect: data.dialect }),
      });
      if (!res.ok) return { error: `server_${res.status}` as const, audio: null };
      const json = (await res.json()) as { audio_url?: string };
      if (!json.audio_url) return { error: "no_audio" as const, audio: null };
      const audioUrl = new URL(json.audio_url, base + "/").toString();
      const audioRes = await fetch(audioUrl, { headers: { "ngrok-skip-browser-warning": "1" } });
      if (!audioRes.ok) return { error: "no_audio" as const, audio: null };
      const buf = new Uint8Array(await audioRes.arrayBuffer());
      let bin = "";
      for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      return { error: null, audio: `data:audio/wav;base64,${btoa(bin)}` };
    } catch {
      return { error: "unreachable" as const, audio: null };
    }
  });
