/**
 * Browser Web Speech API implementation for speech-to-text.
 * Provides client-side speech recognition using window.SpeechRecognition / window.webkitSpeechRecognition.
 * Supported in Chrome, Edge, Safari, and Chromium-based WebViews without needing any server API key.
 */

export type BrowserSpeechSession = {
  stop: () => Promise<string>;
  cancel: () => void;
};

export function isWebSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

export function getBrowserSpeechLang(langHint?: string): string {
  if (!langHint) return "en-IN";
  const lower = langHint.toLowerCase().trim();
  if (lower === "en" || lower === "english" || lower.startsWith("en-")) {
    return "en-IN";
  }
  if (lower === "ur" || lower === "urdu" || lower === "ur-pk") {
    return "ur-PK";
  }
  if (lower === "ks" || lower === "kashmiri" || lower === "ur-in") {
    // Chrome uses Urdu Perso-Arabic model for Kashmiri/Urdu Nastaliq
    return "ur-IN";
  }
  return langHint;
}

export function startBrowserSpeechRecognition(options: {
  lang?: string;
  onInterim?: (text: string) => void;
  onAutoEnd?: (finalText: string) => void;
}): BrowserSpeechSession {
  if (typeof window === "undefined") {
    throw new Error("speech_unsupported");
  }

  const SpeechRecognitionClass =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    throw new Error("speech_unsupported");
  }

  const recognition = new SpeechRecognitionClass();
  const selectedLang = getBrowserSpeechLang(options.lang);
  recognition.lang = selectedLang;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let fullAccumulated = "";
  let isStopped = false;
  let isCanceled = false;

  let stopResolver: ((value: string) => void) | null = null;
  let stopRejecter: ((reason: any) => void) | null = null;
  let stopTimeoutId: any = null;

  recognition.onresult = (event: any) => {
    let finalPart = "";
    let interimPart = "";

    // Always iterate through all results in the current session from index 0
    // to build the complete, continuous transcript without dropping previous words
    for (let i = 0; i < event.results.length; ++i) {
      const res = event.results[i];
      const text = res[0]?.transcript || "";
      if (res.isFinal) {
        finalPart += (finalPart ? " " : "") + text.trim();
      } else {
        interimPart += (interimPart ? " " : "") + text.trim();
      }
    }

    const currentCombined = (finalPart + (interimPart ? ` ${interimPart}` : "")).trim();
    if (currentCombined) {
      fullAccumulated = currentCombined;
    }

    if (options.onInterim && fullAccumulated) {
      options.onInterim(fullAccumulated);
    }
  };

  recognition.onerror = (event: any) => {
    const errorType = event.error;
    if (errorType === "no-speech" || errorType === "aborted") {
      return;
    }

    if (errorType === "not-allowed" || errorType === "service-not-allowed") {
      const err = new Error("Microphone permission was denied.");
      err.name = "NotAllowedError";
      if (stopRejecter) {
        stopRejecter(err);
        stopResolver = null;
        stopRejecter = null;
      }
      return;
    }

    // Network errors can happen if Google speech service is unreachable
    if (stopRejecter) {
      stopRejecter(new Error(errorType || "speech_recognition_error"));
      stopResolver = null;
      stopRejecter = null;
    }
  };

  const finish = () => {
    if (stopTimeoutId) {
      clearTimeout(stopTimeoutId);
      stopTimeoutId = null;
    }
    if (stopResolver) {
      stopResolver(fullAccumulated.trim());
      stopResolver = null;
      stopRejecter = null;
    }
  };

  recognition.onend = () => {
    if (!isCanceled) {
      if (stopResolver) {
        finish();
      } else if (!isStopped && fullAccumulated.trim() && options.onAutoEnd) {
        options.onAutoEnd(fullAccumulated.trim());
      }
    }
  };

  try {
    recognition.start();
  } catch (err: any) {
    if (err?.name === "NotAllowedError") {
      throw err;
    }
    throw new Error(err?.message || "speech_start_failed");
  }

  return {
    stop: () =>
      new Promise<string>((resolve, reject) => {
        if (isStopped) {
          resolve(fullAccumulated.trim());
          return;
        }
        isStopped = true;
        stopResolver = resolve;
        stopRejecter = reject;

        try {
          recognition.stop();
        } catch {
          finish();
        }

        // Safety fallback if onend does not fire within 1s
        stopTimeoutId = setTimeout(() => {
          finish();
        }, 1000);
      }),

    cancel: () => {
      isCanceled = true;
      isStopped = true;
      if (stopTimeoutId) {
        clearTimeout(stopTimeoutId);
        stopTimeoutId = null;
      }
      try {
        recognition.abort();
      } catch {
        /* noop */
      }
    },
  };
}
