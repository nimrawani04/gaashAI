// Robust browser text-to-speech helper.
// Handles the common reasons speechSynthesis silently does nothing:
//  - voices not loaded yet on first call (async voiceschanged)
//  - no voice installed for the requested lang (ur-PK/hi-IN) -> must fall back
//  - Chrome's paused/stuck queue after cancel()
//  - long utterances being cut off (chunking + keep-alive)

export type SpeakResult = "ok" | "unsupported" | "error";

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

export function ttsSupported(): boolean {
  return !!synth() && typeof window !== "undefined" && "SpeechSynthesisUtterance" in window;
}

/** Voices load asynchronously in Chrome/Safari; wait (briefly) for them. */
export function getVoices(timeoutMs = 2000): Promise<SpeechSynthesisVoice[]> {
  const s = synth();
  if (!s) return Promise.resolve([]);
  const immediate = s.getVoices();
  if (immediate.length) return Promise.resolve(immediate);

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      s.removeEventListener?.("voiceschanged", finish);
      clearInterval(poll);
      clearTimeout(timer);
      resolve(s.getVoices());
    };
    s.addEventListener?.("voiceschanged", finish);
    // Some browsers never fire voiceschanged — poll as a safety net.
    const poll = setInterval(() => {
      if (s.getVoices().length) finish();
    }, 150);
    const timer = setTimeout(finish, timeoutMs);
  });
}

/** Best available voice for Kashmiri/Urdu text, degrading to *any* voice. */
export function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const by = (fn: (v: SpeechSynthesisVoice) => boolean) => voices.find(fn) ?? null;
  return (
    by((v) => v.lang === "ur-PK") ||
    by((v) => v.lang.toLowerCase().startsWith("ur")) ||
    by((v) => v.lang === "ks-IN") ||
    by((v) => v.lang.toLowerCase().startsWith("hi")) ||
    by((v) => v.lang.toLowerCase().startsWith("fa")) ||
    by((v) => v.lang.toLowerCase().startsWith("ar")) ||
    by((v) => v.default) ||
    voices[0]
  );
}

/** Strip markdown/attachment noise so the reader doesn't spell out URLs. */
export function cleanForSpeech(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/^📎 \[(.+?)\]\(.+?\)$/, "$1"))
    .join("\n")
    .replace(/!?\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split long text so engines don't truncate mid-way. */
function chunk(text: string, max = 180): string[] {
  const parts = text.match(/[^.!?۔؟\n]+[.!?۔؟\n]*/g) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const p of parts) {
    if (p.length > max) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
      for (let i = 0; i < p.length; i += max) out.push(p.slice(i, i + max).trim());
      continue;
    }
    if ((cur + p).length > max) {
      if (cur.trim()) out.push(cur.trim());
      cur = p;
    } else {
      cur += p;
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}

let keepAlive: ReturnType<typeof setInterval> | undefined;

function stopKeepAlive() {
  if (keepAlive) {
    clearInterval(keepAlive);
    keepAlive = undefined;
  }
}

export function stopSpeaking() {
  stopKeepAlive();
  const s = synth();
  if (!s) return;
  try {
    s.cancel();
  } catch {
    /* noop */
  }
}

type SpeakOptions = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (reason: string) => void;
};

/**
 * Speak text. Resolves once speaking has been *started* (or failed).
 * Must be triggered from a user gesture the first time on iOS/Safari.
 */
export async function speak(rawText: string, opts: SpeakOptions = {}): Promise<SpeakResult> {
  const s = synth();
  if (!s || !ttsSupported()) {
    opts.onError?.("unsupported");
    return "unsupported";
  }

  const text = cleanForSpeech(rawText);
  if (!text) {
    opts.onError?.("empty");
    return "error";
  }

  stopSpeaking();
  // cancel() is async in Chrome; give the queue a tick before re-queuing.
  await new Promise((r) => setTimeout(r, 60));

  const voices = await getVoices();
  const voice = pickVoice(voices);
  const pieces = chunk(text);

  let started = false;
  let index = 0;
  let errored = false;

  const finish = () => {
    stopKeepAlive();
    opts.onEnd?.();
  };

  const speakPiece = () => {
    if (index >= pieces.length) {
      finish();
      return;
    }
    const utter = new SpeechSynthesisUtterance(pieces[index]);
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    } else {
      utter.lang = "ur-PK";
    }
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.volume = 1;
    utter.onstart = () => {
      if (!started) {
        started = true;
        opts.onStart?.();
      }
    };
    utter.onend = () => {
      index += 1;
      speakPiece();
    };
    utter.onerror = (e) => {
      const reason = (e as SpeechSynthesisErrorEvent).error ?? "error";
      // "interrupted"/"canceled" happen when the user stops on purpose.
      if (reason === "interrupted" || reason === "canceled") {
        finish();
        return;
      }
      errored = true;
      finish();
      opts.onError?.(reason);
    };
    try {
      s.resume(); // undo a stuck paused state
      s.speak(utter);
    } catch {
      errored = true;
      finish();
      opts.onError?.("speak-failed");
    }
  };

  speakPiece();

  // Chrome pauses long synthesis after ~15s; nudge it periodically.
  stopKeepAlive();
  keepAlive = setInterval(() => {
    const cur = synth();
    if (!cur) return stopKeepAlive();
    if (!cur.speaking && !cur.pending) return stopKeepAlive();
    cur.pause();
    cur.resume();
  }, 10_000);

  // Give the engine a moment; if nothing is queued at all, report failure.
  await new Promise((r) => setTimeout(r, 250));
  if (!s.speaking && !s.pending && !started) {
    stopKeepAlive();
    opts.onError?.("no-audio");
    return "error";
  }

  return errored ? "error" : "ok";
}
