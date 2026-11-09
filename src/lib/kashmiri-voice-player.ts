import { synthesizeKashmiri } from "@/lib/kashmiri-voice.functions";
import { getSpeech } from "@/lib/ttsCache";
import { speak, stopSpeaking } from "@/lib/tts";

/** Second Kashmiri voice (built-in AI voice) used when the primary voice fails. */
export async function getBackupKashmiriAudio(text: string): Promise<string> {
  const clip = await getSpeech(text, "kashmiri");
  if (!clip?.audio) throw new Error("no_audio");
  return clip.audio.startsWith("data:") ? clip.audio : `data:${clip.mime};base64,${clip.audio}`;
}

const cache = new Map<string, Promise<string>>();
let current: HTMLAudioElement | null = null;

export function cleanKashmiriText(text: string) {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_`#>]/g, "")
    .trim()
    .slice(0, 1500);
}

/** Fetches (and caches) Kashmiri speech from the trained Kashmiri voice model. */
export function getKashmiriAudio(text: string): Promise<string> {
  const clean = cleanKashmiriText(text);
  if (!clean) return Promise.reject(new Error("empty"));
  let p = cache.get(clean);
  if (!p) {
    p = synthesizeKashmiri({ data: { text: clean, dialect: "kupwara", voice: "Male" } })
      .then((res) => {
        if (!res.audio) throw new Error(res.error ?? "no_audio");
        return res.audio;
      })
      // Backup voice: if GAASH Lab's voice is offline, use the built-in AI voice.
      .catch(() => getBackupKashmiriAudio(clean));
    p.catch(() => cache.delete(clean));
    cache.set(clean, p);
  }
  return p;
}

/** Plays Kashmiri speech; stops any other Kashmiri clip already playing. Falls back to device speech. */
export async function playKashmiri(text: string): Promise<HTMLAudioElement | void> {
  current?.pause();
  stopSpeaking();
  try {
    const src = await getKashmiriAudio(text);
    const audio = new Audio(src);
    current = audio;
    await audio.play();
    return audio;
  } catch {
    await speak(text, { language: "kashmiri" });
  }
}

export function stopKashmiri() {
  current?.pause();
  stopSpeaking();
}

export const hasNastaliq = (t: string) => /[\u0600-\u06FF]/.test(t);
