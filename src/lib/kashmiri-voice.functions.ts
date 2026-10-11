import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Kashmiri voice output.
 *
 * Exact transcript matches are served from the configured corpus first. New
 * text is sent to the configured fine-tuned service, and the public Kashmiri
 * checkpoint remains a last-resort compatibility fallback. Returning a data
 * URL keeps the browser independent of the model/dataset host.
 */
const MATCHA_SPACE = "https://gaash-lab-matcha-tts-kashmiri-demo.hf.space";
const DATASET_ROWS_SERVER = "https://datasets-server.huggingface.co/rows";
const DATASET_ID = "programindz/kashmiri-audio-corpus";

export type KashmiriAudioSource =
  "dataset_reference" | "fine_tuned_dataset" | "existing_checkpoint";

type AudioResult = { audio: string; source: KashmiriAudioSource };

function cleanCorpusTranscript(raw: string): string {
  const normalized = raw
    .normalize("NFC")
    .replace(/[“”„]/g, '"')
    .replace(/[’‘‚]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[\uFEFF\u200B]/g, "")
    .replace(/\u0640/g, "");
  return Array.from(normalized)
    .map((char) => {
      const code = char.charCodeAt(0);
      return code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127
        ? " "
        : char;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function toDataUrl(buf: Uint8Array, mime = "audio/wav") {
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000)
    bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return `data:${mime};base64,${btoa(bin)}`;
}

const corpusAudioCache = new Map<string, Promise<AudioResult | null>>();
type CorpusRow = {
  text?: string;
  audio?: { src?: string; type?: string }[] | { src?: string; type?: string };
};
let corpusIndexPromise: Promise<Map<string, { src: string; type?: string }>> | null = null;

async function fetchCorpusRows(
  offset: number,
): Promise<{ rows?: { row?: CorpusRow }[]; num_rows_total?: number }> {
  const url = new URL(DATASET_ROWS_SERVER);
  url.searchParams.set("dataset", DATASET_ID);
  url.searchParams.set("config", "default");
  url.searchParams.set("split", "train");
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("length", "100");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`dataset_rows_${response.status}`);
    return (await response.json()) as { rows?: { row?: CorpusRow }[]; num_rows_total?: number };
  } finally {
    clearTimeout(timeout);
  }
}

async function loadCorpusIndex(): Promise<Map<string, { src: string; type?: string }>> {
  if (corpusIndexPromise) return corpusIndexPromise;
  corpusIndexPromise = (async () => {
    const first = await fetchCorpusRows(0);
    const total = first.num_rows_total ?? first.rows?.length ?? 0;
    const pages: { row?: CorpusRow }[][] = [first.rows ?? []];
    const offsets = Array.from(
      { length: Math.max(0, Math.ceil(total / 100) - 1) },
      (_, index) => (index + 1) * 100,
    );
    for (let start = 0; start < offsets.length; start += 8) {
      const batch = await Promise.all(offsets.slice(start, start + 8).map(fetchCorpusRows));
      pages.push(...batch.map((page) => page.rows ?? []));
    }
    const index = new Map<string, { src: string; type?: string }>();
    for (const page of pages) {
      for (const candidate of page) {
        const clean = cleanCorpusTranscript(candidate.row?.text ?? "");
        const audioValue = candidate.row?.audio;
        const audio = Array.isArray(audioValue) ? audioValue[0] : audioValue;
        if (clean && audio?.src) index.set(clean, { src: audio.src, type: audio.type });
      }
    }
    return index;
  })().catch((error) => {
    corpusIndexPromise = null;
    throw error;
  });
  return corpusIndexPromise;
}

/**
 * The viewer's rows API returns dataset metadata and signed audio URLs without
 * downloading the 332 MB Parquet file. Build the small transcript index once,
 * fetch the matching signed WAV server-side, and turn it into a data URL before
 * returning it to the browser.
 */
async function viaHuggingFaceCorpus(text: string): Promise<AudioResult | null> {
  const clean = cleanCorpusTranscript(text);
  if (
    !clean ||
    !/[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/.test(clean)
  ) {
    return null;
  }
  const cached = corpusAudioCache.get(clean);
  if (cached) return cached;

  const pending = (async (): Promise<AudioResult | null> => {
    try {
      const audio = (await loadCorpusIndex()).get(clean);
      if (!audio) return null;
      const audioResponse = await fetch(audio.src);
      if (!audioResponse.ok) return null;
      const mime = audio.type || audioResponse.headers.get("content-type") || "audio/wav";
      return {
        audio: toDataUrl(new Uint8Array(await audioResponse.arrayBuffer()), mime),
        source: "dataset_reference",
      };
    } catch {
      // The corpus is an enhancement for exact pairs; synthesis still works if
      // the dataset viewer is temporarily unavailable.
      return null;
    }
  })();
  corpusAudioCache.set(clean, pending);
  void pending.then((result) => {
    if (!result) corpusAudioCache.delete(clean);
  });
  return pending;
}

async function viaCustomServer(
  base: string,
  text: string,
  dialect: string,
  voice: "Male" | "Female",
): Promise<AudioResult | null> {
  const res = await fetch(`${base}/api/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "1" },
    body: JSON.stringify({ text, dialect, voice }),
  });
  if (!res.ok) return null;
  const json = (await res.json().catch(() => null)) as {
    audio_url?: string;
    audio?: string;
    source?: "fine_tuned_dataset" | "dataset_reference";
  } | null;
  // A hosted server may return a data URL directly. This is useful for small
  // serverless deployments; the reference tts_server returns audio_url.
  if (json?.audio) return { audio: json.audio, source: json.source ?? "fine_tuned_dataset" };
  if (!json?.audio_url) return null;
  const audioRes = await fetch(new URL(json.audio_url, base + "/").toString(), {
    headers: { "ngrok-skip-browser-warning": "1" },
  });
  if (!audioRes.ok) return null;
  return {
    audio: toDataUrl(
      new Uint8Array(await audioRes.arrayBuffer()),
      audioRes.headers.get("content-type") ?? "audio/wav",
    ),
    source: json?.source ?? "fine_tuned_dataset",
  };
}

async function viaMatcha(text: string, voice: "Male" | "Female"): Promise<AudioResult | null> {
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
  return {
    audio: toDataUrl(new Uint8Array(await audioRes.arrayBuffer())),
    source: "existing_checkpoint",
  };
}

export const synthesizeKashmiri = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      text: z.string().min(1).max(1500),
      dialect: z.enum(["kupwara", "bandipora", "shopian", "islamabad"]).default("kupwara"),
      voice: z.enum(["Male", "Female"]).default("Male"),
    }),
  )
  .handler(async ({ data }) => {
    const corpusAudio = await viaHuggingFaceCorpus(data.text);
    if (corpusAudio) return { error: null, ...corpusAudio };

    const base = process.env.KASHMIRI_TTS_URL?.replace(/\/+$/, "");
    // Ignore addresses that are Hugging Face pages (datasets/models), not voice servers.
    if (base && !/huggingface\.co\//.test(base)) {
      try {
        const audio = await viaCustomServer(base, data.text, data.dialect, data.voice);
        if (audio) return { error: null, ...audio };
      } catch {
        /* fall through to Matcha */
      }
    }
    try {
      const audio = await viaMatcha(data.text, data.voice);
      if (audio) return { error: null, ...audio };
      return { error: "no_audio" as const, audio: null };
    } catch {
      return { error: "unreachable" as const, audio: null };
    }
  });
