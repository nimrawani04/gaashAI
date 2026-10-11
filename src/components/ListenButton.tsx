import { useEffect, useRef, useState } from "react";
import { Loader2, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { synthesizeKashmiri, type KashmiriAudioSource } from "@/lib/kashmiri-voice.functions";

const cache = new Map<string, { audio: string; source: KashmiriAudioSource }>();
let current: HTMLAudioElement | null = null;

const MESSAGES: Record<string, string> = {
  unreachable: "The Kashmiri voice server is offline right now.",
};

const SOURCE_LABELS: Record<KashmiriAudioSource, string> = {
  dataset_reference: "Original corpus audio",
  fine_tuned_dataset: "Kashmiri corpus model",
  existing_checkpoint: "Kashmiri checkpoint",
};

export default function ListenButton({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [source, setSource] = useState<KashmiriAudioSource | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  const stop = () => {
    audioRef.current?.pause();
    setState("idle");
  };

  const play = async () => {
    if (state === "playing") return stop();
    const clean = text
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[*_`#>]/g, "")
      .trim()
      .slice(0, 1500);
    if (!clean) return;
    setState("loading");
    try {
      let clip = cache.get(clean);
      if (!clip) {
        const res = await synthesizeKashmiri({
          data: { text: clean, dialect: "kupwara", voice: "Male" },
        });
        if (!res.audio) {
          toast.error(MESSAGES[res.error ?? ""] ?? "Couldn't create the voice for this text.");
          setState("idle");
          return;
        }
        clip = { audio: res.audio, source: res.source ?? "existing_checkpoint" };
        cache.set(clean, clip);
      }
      current?.pause();
      setSource(clip.source);
      const audio = new Audio(clip.audio);
      audioRef.current = audio;
      current = audio;
      audio.onended = () => setState("idle");
      audio.onpause = () => setState("idle");
      await audio.play();
      setState("playing");
    } catch {
      toast.error("Couldn't play the voice.");
      setState("idle");
    }
  };

  return (
    <button
      type="button"
      onClick={play}
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
