import { blobToBase64, startRecording, type Recorder } from "@/lib/recorder";
import { checkSttConfigured, transcribeSpeech } from "@/lib/stt.functions";
import {
  isWebSpeechSupported,
  startBrowserSpeechRecognition,
  type BrowserSpeechSession,
} from "@/lib/speech-recognition";

export type VoiceInputSession = {
  stop: () => Promise<string>;
  cancel: () => void;
  mode: "server" | "browser";
};

let cachedServerConfigured: boolean | null = null;
let serverCheckPromise: Promise<boolean> | null = null;

export async function hasServerStt(): Promise<boolean> {
  if (cachedServerConfigured !== null) return cachedServerConfigured;
  if (!serverCheckPromise) {
    serverCheckPromise = checkSttConfigured()
      .then((res) => {
        cachedServerConfigured = Boolean(res?.configured);
        return cachedServerConfigured;
      })
      .catch(() => {
        cachedServerConfigured = false;
        return false;
      })
      .finally(() => {
        serverCheckPromise = null;
      });
  }
  return serverCheckPromise;
}

// Eagerly pre-check server configuration in the background on client mount
if (typeof window !== "undefined") {
  void hasServerStt();
}

export function isVoiceInputAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return isWebSpeechSupported() || cachedServerConfigured !== false;
}

export async function startVoiceInput(options: {
  lang?: string;
  onInterim?: (text: string) => void;
  onAutoEnd?: (finalText: string) => void;
}): Promise<VoiceInputSession> {
  const serverConfigured = await hasServerStt();

  if (serverConfigured) {
    let recorder: Recorder | null = await startRecording();

    return {
      mode: "server",
      stop: async (): Promise<string> => {
        if (!recorder) return "";
        const rec = recorder;
        recorder = null;
        const wav = await rec.stop();
        if (wav.size < 4096) return "";

        const audio = await blobToBase64(wav);
        try {
          const { text } = await transcribeSpeech({
            data: {
              audio,
              mime: wav.type || "audio/wav",
              ...(options.lang ? { language: options.lang.slice(0, 5) } : {}),
            },
          });
          return text.trim();
        } catch (err: any) {
          if (err?.message?.includes("not configured")) {
            cachedServerConfigured = false;
            // If browser speech is available, suggest re-tapping or use it
            if (isWebSpeechSupported()) {
              throw new Error("server_not_configured_use_browser");
            }
          }
          throw err;
        }
      },
      cancel: () => {
        if (recorder) {
          recorder.cancel();
          recorder = null;
        }
      },
    };
  }

  // If server is not configured, fall back to browser Web Speech API
  if (isWebSpeechSupported()) {
    const session: BrowserSpeechSession = startBrowserSpeechRecognition({
      lang: options.lang,
      onInterim: options.onInterim,
      onAutoEnd: options.onAutoEnd,
    });

    return {
      mode: "browser",
      stop: async (): Promise<string> => {
        const text = await session.stop();
        return text.trim();
      },
      cancel: () => {
        session.cancel();
      },
    };
  }

  throw new Error("speech_unsupported");
}
