import { useEffect, useState, useRef } from "react";
import ChinarLoader from "@/components/ChinarLoader";

const SEEN_KEY = "kb_splash_seen_at";
const REPEAT_AFTER_MS = 1000 * 60 * 30; // replay only after 30 min
const ANIMATION_CYCLE_MS = 3200; // one chinar↔bot cycle = 3.2s
const TWO_CYCLES_MS = ANIMATION_CYCLE_MS * 2; // 6.4s for 2 full cycles

/**
 * Startup animation: chinar leaf morphs into bot and back (infinite loop)
 * for 2 complete cycles, then the wordmark fades in and screen lifts away.
 */
export default function SplashScreen({ onDone }: { onDone?: () => void }) {
  const [hidden, setHidden] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const onDoneRef = useRef(onDone);

  // Keep onDone ref up to date
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    // TESTING MODE: Uncomment to always show splash on refresh (ignores 30min cooldown)
    // sessionStorage.removeItem(SEEN_KEY);
    
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
      onDoneRef.current?.();
      return;
    }

    setHidden(false);
    try {
      sessionStorage.setItem(SEEN_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }

    // Start leave animation after 2 complete cycles
    const leaveTimer = setTimeout(() => setLeaving(true), TWO_CYCLES_MS);
    // Hide and call onDone after leave animation completes
    const doneTimer = setTimeout(() => {
      setHidden(true);
      onDoneRef.current?.();
    }, TWO_CYCLES_MS + 600); // +600ms for splash-out animation
    
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, []);

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
