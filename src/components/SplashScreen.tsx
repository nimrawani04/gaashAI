import { useCallback, useEffect, useRef, useState, type AnimationEvent } from "react";
import ChinarLoader from "@/components/ChinarLoader";

const REQUIRED_CYCLES = 2;

/**
 * Startup animation: chinar leaf morphs into bot and back exactly twice,
 * then the wordmark fades out and hands off to the entry screen.
 */
export default function SplashScreen({ onDone }: { onDone?: () => void }) {
  const [hidden, setHidden] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const onDoneRef = useRef(onDone);
  const cycleCountRef = useRef(0);
  const leavingRef = useRef(false);
  const doneRef = useRef(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setHidden(true);
    onDoneRef.current?.();
  }, []);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      finish();
      return;
    }

    setHidden(false);
  }, [finish]);

  const startLeaving = useCallback(() => {
    if (leavingRef.current || doneRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
  }, []);

  const handleCycleComplete = useCallback(() => {
    if (leavingRef.current || doneRef.current) return;
    cycleCountRef.current += 1;
    if (cycleCountRef.current >= REQUIRED_CYCLES) startLeaving();
  }, [startLeaving]);

  const handleAnimationEnd = useCallback(
    (event: AnimationEvent<HTMLDivElement>) => {
      if (event.animationName === "splash-out") finish();
    },
    [finish],
  );

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center bg-background px-6 ${
        leaving ? "splash-leave" : ""
      }`}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="splash-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative flex flex-col items-center gap-5 text-center">
        <div className="splash-mark text-primary">
          <ChinarLoader size={96} onCycleComplete={handleCycleComplete} />
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
