import { synthesizeKashmiri } from "@/lib/kashmiri-voice.functions";

const cache = new Map<string, Promise<string>>();
let current: HTMLAudioElement | null = null;

export function cleanKashmiriText(text: string) {
  return text.replace(/https?:\/\/\S+/g, "").replace(/[*_`#>]/g, "").trim().slice(0, 1500);
}

/** Fetches (and caches) Kashmiri speech from the trained Kashmiri voice model. */
export function getKashmiriAudio(text: string): Promise<string> {
  const clean = cleanKashmiriText(text);
  if (!clean) return Promise.reject(new Error("empty"));
  let p = cache.get(clean);
  if (!p) {
    p = synthesizeKashmiri({ data: { text: clean, dialect: "kupwara", voice: "Female" } }).then((res) => {
      if (!res.audio) throw new Error(res.error ?? "no_audio");
      return res.audio;
    });
    p.catch(() => cache.delete(clean));
    cache.set(clean, p);
  }
  return p;
}

/** Plays Kashmiri speech; stops any other Kashmiri clip already playing. */
export async function playKashmiri(text: string): Promise<HTMLAudioElement> {
  const src = await getKashmiriAudio(text);
  current?.pause();
  const audio = new Audio(src);
  current = audio;
  await audio.play();
  return audio;
}

export function stopKashmiri() {
  current?.pause();
}

export const hasNastaliq = (t: string) => /[\u0600-\u06FF]/.test(t);
