import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Kashmiri voice output.
 * Default: GAASH-Lab Matcha-TTS-Kashmiri (trained on the Kashmiri audio corpus),
 * called through its public Gradio API. If KASHMIRI_TTS_URL points at a running
 * kashmiriVoice server (POST /api/synthesize), that is tried first.
 * Returns the WAV as a data URL so the browser never needs the server address.
 */
const MATCHA_SPACE = "https://gaash-lab-matcha-tts-kashmiri-demo.hf.space";

function toDataUrl(buf: Uint8Array, mime = "audio/wav") {
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return `data:${mime};base64,${btoa(bin)}`;
}

async function viaCustomServer(base: string, text: string, dialect: string) {
  const res = await fetch(`${base}/api/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "1" },
    body: JSON.stringify({ text, dialect }),
  });
  if (!res.ok) return null;
  const json = (await res.json().catch(() => null)) as { audio_url?: string } | null;
  if (!json?.audio_url) return null;
  const audioRes = await fetch(new URL(json.audio_url, base + "/").toString(), {
    headers: { "ngrok-skip-browser-warning": "1" },
  });
  if (!audioRes.ok) return null;
  return toDataUrl(new Uint8Array(await audioRes.arrayBuffer()));
}

async function viaMatcha(text: string, voice: "Male" | "Female") {
  const start = await fetch(`${MATCHA_SPACE}/gradio_api/call/pipeline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [text, false, voice, "Medium"] }),
  });
  if (!start.ok) return null;
  const { event_id } = (await start.json()) as { event_id?: string };
  if (!event_id) return null;
  const stream = await fetch(`${MATCHA_SPACE}/gradio_api/call/pipeline/${event_id}`);
  if (!stream.ok) return null;
  const body = await stream.text();
  const m = body.match(/event:\s*complete\s*\ndata:\s*(.+)/);
  if (!m) return null;
  const out = JSON.parse(m[1]) as [string, { url?: string; path?: string } | null];
  const file = out?.[1];
  const url = file?.url ?? (file?.path ? `${MATCHA_SPACE}/gradio_api/file=${file.path}` : null);
  if (!url) return null;
  const audioRes = await fetch(url);
  if (!audioRes.ok) return null;
  return toDataUrl(new Uint8Array(await audioRes.arrayBuffer()));
}

export const synthesizeKashmiri = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      text: z.string().min(1).max(1500),
      dialect: z.enum(["kupwara", "bandipora", "shopian", "islamabad"]).default("kupwara"),
      voice: z.enum(["Male", "Female"]).default("Female"),
    }),
  )
  .handler(async ({ data }) => {
    const base = process.env.KASHMIRI_TTS_URL?.replace(/\/+$/, "");
    // Ignore addresses that are Hugging Face pages (datasets/models), not voice servers.
    if (base && !/huggingface\.co\//.test(base)) {
      try {
        const audio = await viaCustomServer(base, data.text, data.dialect);
        if (audio) return { error: null, audio };
      } catch {
        /* fall through to Matcha */
      }
    }
    try {
      const audio = await viaMatcha(data.text, data.voice);
      if (audio) return { error: null, audio };
      return { error: "no_audio" as const, audio: null };
    } catch {
      return { error: "unreachable" as const, audio: null };
    }
  });
