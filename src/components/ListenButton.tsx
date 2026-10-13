import { useEffect, useRef, useState } from "react";
import { Loader2, Play, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { synthesizeKashmiri, type KashmiriAudioSource as PrimarySource } from "@/lib/kashmiri-voice.functions";
import { getBackupKashmiriAudio } from "@/lib/kashmiri-voice-player";

type KashmiriAudioSource = PrimarySource | "backup_voice";

/** In-flight promise cache: prefetching on hover and clicking share one request. */
const cache = new Map<string, Promise<{ audio: string; source: KashmiriAudioSource }>>();
let current: HTMLAudioElement | null = null;
/** Fired before any new playback starts so every other player stops itself. */
export const STOP_AUDIO_EVENT = "kb-stop-audio";

export function stopAllAudio() {
  current?.pause();
  current = null;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(STOP_AUDIO_EVENT));
}

const MESSAGES: Record<string, string> = {
  unreachable: "The Kashmiri voice server is offline right now.",
};

const SOURCE_LABELS: Record<KashmiriAudioSource, string> = {
  dataset_reference: "Original corpus audio",
  fine_tuned_dataset: "Kashmiri corpus model",
  existing_checkpoint: "Kashmiri checkpoint",
  backup_voice: "Backup Kashmiri voice",
};

function cleanText(text: string) {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_`#>]/g, "")
    .trim()
    .slice(0, 1500);
}

function fetchClip(clean: string) {
  let pending = cache.get(clean);
  if (!pending) {
    pending = (async () => {
      const res = await synthesizeKashmiri({
        data: { text: clean, dialect: "kupwara", voice: "Male" },
      }).catch(() => ({ audio: null, error: "unreachable", source: undefined }));
      if (res.audio) {
        return { audio: res.audio, source: (res.source ?? "existing_checkpoint") as KashmiriAudioSource };
      }
      try {
        return { audio: await getBackupKashmiriAudio(clean), source: "backup_voice" as const };
      } catch {
        throw new Error(res.error ?? "no_audio");
      }
    })();
    cache.set(clean, pending);
    void pending.catch(() => cache.delete(clean));
  }
  return pending;
}

export default function ListenButton({
  text,
  className = "",
  variant = "label",
}: {
  text: string;
  className?: string;
  /** "label" = speaker + word; "play" = compact round ▶ button. */
  variant?: "label" | "play";
}) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [source, setSource] = useState<KashmiriAudioSource | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const onStop = () => {
      audioRef.current?.pause();
      setState("idle");
    };
    window.addEventListener(STOP_AUDIO_EVENT, onStop);
    return () => {
      window.removeEventListener(STOP_AUDIO_EVENT, onStop);
      audioRef.current?.pause();
    };
  }, []);

  const stop = () => {
    audioRef.current?.pause();
    setState("idle");
  };

  /** Start synthesis as soon as the user reaches for the button. */
  const prefetch = () => {
    if (state !== "idle") return;
    const clean = cleanText(text);
    if (clean) void fetchClip(clean).catch(() => {});
  };

  const play = async () => {
    if (state === "playing") return stop();
    const clean = cleanText(text);
    if (!clean) return;
    // Stop whatever else is playing (other buttons, lessons page, chat).
    stopAllAudio();
    setState("loading");
    try {
      const clip = await fetchClip(clean);
      setSource(clip.source);
      const audio = new Audio(clip.audio);
      audioRef.current = audio;
      current = audio;
      audio.onended = () => setState("idle");
      audio.onpause = () => setState("idle");
      await audio.play();
      setState("playing");
    } catch (error) {
      const key = error instanceof Error ? error.message : "";
      toast.error(MESSAGES[key] ?? "Couldn't create the voice for this text.");
      setState("idle");
    }
  };

  if (variant === "play") {
    return (
      <button
        type="button"
        onClick={play}
        onPointerEnter={prefetch}
        onPointerDown={prefetch}
        onFocus={prefetch}
        aria-label={state === "playing" ? "Stop" : "Play Kashmiri phrase"}
        title={source ? SOURCE_LABELS[source] : "Play Kashmiri audio"}
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
      >
        {state === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : state === "playing" ? (
          <Square className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={play}
      onPointerEnter={prefetch}
      onPointerDown={prefetch}
      onFocus={prefetch}
      aria-label={state === "playing" ? "Stop" : "Listen in Kashmiri"}
      title={source ? SOURCE_LABELS[source] : "Play Kashmiri audio"}
      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[8px] border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
    >
      {state === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state === "playing" ? (
        <Square className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      <span>
        {state === "playing"
          ? "Stop"
          : source === "dataset_reference"
            ? "Listen · corpus"
            : source === "fine_tuned_dataset"
              ? "Listen · model"
              : "Listen"}
      </span>
    </button>
  );
}
