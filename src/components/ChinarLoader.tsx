import { memo, type AnimationEventHandler } from "react";

/**
 * Chinar leaf <-> AI bot morphing loader.
 * Two stacked SVGs cross-fade and cross-rotate on an infinite loop.
 */
export const ChinarLoader = memo(function ChinarLoader({
  size = 40,
  className = "",
  onCycleComplete,
}: {
  size?: number;
  className?: string;
  onCycleComplete?: () => void;
}) {
  const handleLeafIteration: AnimationEventHandler<SVGSVGElement> | undefined = onCycleComplete
    ? (event) => {
        if (event.animationName === "chinar-leaf-cycle") onCycleComplete();
      }
    : undefined;

  return (
    <span
      className={`chinar-morph relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      {/* Chinar leaf */}
      <svg
        viewBox="0 0 48 48"
        className="chinar-morph-leaf absolute inset-0 h-full w-full"
        aria-hidden="true"
        onAnimationIteration={handleLeafIteration}
      >
        <path
          fill="currentColor"
          d="M24 3.5l3.4 6.6c.6 1.1 1.7.9 2.8.3l2.6-1.3-1.5 8c-.3 1.4.5 1.8 1.3.9l5.9-6.4 1.3 3.1c.3.7.9.6 1.7.4l5.8-1.2-1.9 7c-.3 1-.5 1.4.3 1.7l2 1-9.7 7.9c-1 .8-.7 1-.4 2.1l.9 2.8-9.2-1.7c-1.2-.2-1.7.4-1.6 1.3l.5 9.6h-2.9l.5-9.6c.1-.9-.4-1.5-1.6-1.3L15 36.4l.9-2.8c.3-1.1.6-1.3-.4-2.1L5.8 23.6l2-1c.8-.3.6-.7.3-1.7l-1.9-7 5.8 1.2c.8.2 1.4.3 1.7-.4l1.3-3.1 5.9 6.4c.8.9 1.6.5 1.3-.9l-1.5-8 2.6 1.3c1.1.6 2.2.8 2.8-.3z"
        />
      </svg>

      {/* Bot */}
      <svg
        viewBox="0 0 48 48"
        className="chinar-morph-bot absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <rect x="9" y="15" width="30" height="24" rx="8" fill="currentColor" />
        <rect x="22.5" y="6" width="3" height="7" rx="1.5" fill="currentColor" />
        <circle cx="24" cy="5" r="3" fill="currentColor" />
        <circle className="chinar-bot-eye" cx="18" cy="26" r="3.2" fill="var(--color-background)" />
        <circle className="chinar-bot-eye" cx="30" cy="26" r="3.2" fill="var(--color-background)" />
        <rect
          x="19"
          y="32"
          width="10"
          height="2.4"
          rx="1.2"
          fill="var(--color-background)"
          opacity="0.7"
        />
      </svg>
    </span>
  );
});

export default ChinarLoader;
