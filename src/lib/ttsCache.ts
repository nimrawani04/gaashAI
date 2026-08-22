import { speakKashmiri, type TtsResult } from "@/lib/tts.functions";
import { cleanForSpeech } from "@/lib/tts";

/**
 * Small in-memory cache of generated speech, keyed by the cleaned text.
 * Assistant replies are prefetched as soon as they render, so tapping
 * "Listen" plays an already-generated clip instead of waiting on the model.
 */
const cache = new Map<string, Promise<TtsResult>>();
const MAX_ENTRIES = 20;

export function speechKey(text: string): string {
  return cleanForSpeech(text).slice(0, 2000);
}

export function getSpeech(text: string): Promise<TtsResult> {
  const key = speechKey(text);
  const hit = cache.get(key);
  if (hit) return hit;

  const pending = speakKashmiri({ data: { text: key } }).catch((err) => {
    cache.delete(key); // never cache a failure
    throw err;
  });
  cache.set(key, pending);
  if (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return pending;
}

/** Fire-and-forget warm-up; failures are ignored until the user presses Listen. */
export function prefetchSpeech(text: string): void {
  const key = speechKey(text);
  if (!key || key.length < 2) return;
  void getSpeech(key).catch(() => {});
}
