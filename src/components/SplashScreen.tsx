import { useCallback, useEffect, useRef, useState, type AnimationEvent } from "react";
import ChinarLoader from "@/components/ChinarLoader";

/** One chinar ⇄ bot morph cycle, matching the CSS animation duration. */
const ANIMATION_CYCLE_MS = 3200;
/** Exactly two complete transitions, then we leave — no matter what. */
const TWO_CYCLES_MS = ANIMATION_CYCLE_MS * 2;
const LEAVE_MS = 600;

/**
 * Startup animation with a deterministic lifecycle: it always runs exactly two
 * chinar↔bot cycles and then reports done. It never waits on auth, network or
 * any other async work, so it can't strand the user on a loading screen.
 */
export default function SplashScreen({ onDone }: { onDone?: () => void }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const onDoneRef = useRef(onDone);
  const finishedRef = useRef(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    // Idempotent: safe under StrictMode double-mount (finishedRef guards it).
    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setVisible(false);
      onDoneRef.current?.();
    };

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      finish();
      return;
    }

    setVisible(true);
    const leaveTimer = setTimeout(() => setLeaving(true), TWO_CYCLES_MS);
    const doneTimer = setTimeout(finish, TWO_CYCLES_MS + LEAVE_MS);
    // Hard safety net: even if a timer is throttled by a background tab,
    // the splash can never outlive this.
    const failsafe = setTimeout(finish, TWO_CYCLES_MS + LEAVE_MS + 4000);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
      clearTimeout(failsafe);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center bg-background px-6 ${
        leaving ? "splash-leave" : ""
      }`}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
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
