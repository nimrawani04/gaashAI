import { useEffect, useState } from "react";
import ChinarLoader from "@/components/ChinarLoader";

const SEEN_KEY = "kb_splash_seen_at";
const REPEAT_AFTER_MS = 1000 * 60 * 30; // replay only after 30 min

/**
 * Startup animation: chinar leaf blooms, morphs into the bot, then the
 * wordmark fades in and the whole screen lifts away.
 */
export default function SplashScreen({ onDone }: { onDone?: () => void }) {
  const [hidden, setHidden] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let last = 0;
    try {
      last = Number(sessionStorage.getItem(SEEN_KEY) || 0);
    } catch {
      last = 0;
    }
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced || Date.now() - last < REPEAT_AFTER_MS) {
      onDone?.();
      return;
    }

    setHidden(false);
    try {
      sessionStorage.setItem(SEEN_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }

    const leaveTimer = setTimeout(() => setLeaving(true), 1900);
    const doneTimer = setTimeout(() => {
      setHidden(true);
      onDone?.();
    }, 2500);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center bg-background px-6 ${
        leaving ? "splash-leave" : ""
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="splash-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative flex flex-col items-center gap-5 text-center">
        <div className="splash-mark text-primary">
          <ChinarLoader size={96} />
        </div>
        <div className="splash-title flex flex-col items-center gap-1">
          <h1 className="font-nastaliq text-3xl text-foreground sm:text-4xl">کٲشُر مددگار</h1>
          <p className="text-sm tracking-wide text-muted-foreground sm:text-base">KashmirBot</p>
        </div>
        <div className="splash-bar h-1 w-32 overflow-hidden rounded-full bg-muted">
          <span className="block h-full w-1/3 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
