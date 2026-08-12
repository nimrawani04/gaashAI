import { useCallback, useEffect, useRef } from "react";
import ChinarLoader from "@/components/ChinarLoader";

const REQUIRED_CYCLES = 2;

/**
 * Reports completion from the animation itself after exactly two complete
 * chinar → bot → chinar cycles. Auth and network state never participate.
 */
export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const completedCyclesRef = useRef(0);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) onDone();
  }, [onDone]);

  const handleCycleComplete = useCallback(() => {
    completedCyclesRef.current += 1;
    if (completedCyclesRef.current === REQUIRED_CYCLES) onDone();
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-background px-6"
      data-startup-splash="active"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
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
