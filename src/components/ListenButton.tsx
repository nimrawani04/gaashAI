import { useEffect, useRef, useState } from "react";
import { Loader2, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { synthesizeKashmiri } from "@/lib/kashmiri-voice.functions";

const cache = new Map<string, string>();
let current: HTMLAudioElement | null = null;

const MESSAGES: Record<string, string> = {
  not_configured: "Kashmiri voice isn't connected yet — the voice server address hasn't been added.",
  unreachable: "The Kashmiri voice server is offline right now.",
};

export default function ListenButton({ text, className = "" }: { text: string; className?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  const stop = () => {
    audioRef.current?.pause();
    setState("idle");
  };

  const play = async () => {
    if (state === "playing") return stop();
    const clean = text.replace(/https?:\/\/\S+/g, "").replace(/[*_`#>]/g, "").trim().slice(0, 1500);
    if (!clean) return;
    setState("loading");
    try {
      let src = cache.get(clean);
      if (!src) {
        const res = await synthesizeKashmiri({ data: { text: clean, dialect: "kupwara" } });
        if (!res.audio) {
          toast.error(MESSAGES[res.error ?? ""] ?? "Couldn't create the voice for this text.");
          setState("idle");
          return;
        }
        src = res.audio;
        cache.set(clean, src);
      }
      current?.pause();
      const audio = new Audio(src);
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
      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[8px] border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
    >
      {state === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state === "playing" ? (
        <Square className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      <span>{state === "playing" ? "Stop" : "Listen"}</span>
    </button>
  );
}
