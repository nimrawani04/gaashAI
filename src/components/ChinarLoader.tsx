import { memo } from "react";

/**
 * Chinar leaf ⇄ AI bot morphing loader.
 * Two stacked SVGs cross-fade / cross-rotate on an infinite loop, so the
 * Kashmiri chinar leaf appears to turn into a friendly bot and back.
 */
export const ChinarLoader = memo(function ChinarLoader({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
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
      >
        <path
          fill="currentColor"
          d="M24 3c1.2 3.5 3 6.2 5.6 8.2-1 .3-1.9.8-2.6 1.5 3.6.5 6.7 2.3 9.4 5.2-1.4-.2-2.7 0-3.9.5 3.7 1.5 6.4 4 8.3 7.6-1.6-.6-3.1-.8-4.6-.6 3 2.3 4.9 5.3 5.8 9-2.6-1.9-5.3-2.9-8.1-3 1.2 1.2 2 2.6 2.4 4.1-3.1-2.1-6.4-2.9-9.9-2.4.7 1 1.1 2.1 1.3 3.3-1-.7-2-1.2-3-1.5l.9 9.1h-2.2l.9-9.1c-1 .3-2 .8-3 1.5.2-1.2.6-2.3 1.3-3.3-3.5-.5-6.8.3-9.9 2.4.4-1.5 1.2-2.9 2.4-4.1-2.8.1-5.5 1.1-8.1 3 .9-3.7 2.8-6.7 5.8-9-1.5-.2-3 0-4.6.6 1.9-3.6 4.6-6.1 8.3-7.6-1.2-.5-2.5-.7-3.9-.5 2.7-2.9 5.8-4.7 9.4-5.2-.7-.7-1.6-1.2-2.6-1.5C21 9.2 22.8 6.5 24 3z"
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
        <rect x="19" y="32" width="10" height="2.4" rx="1.2" fill="var(--color-background)" opacity="0.7" />
      </svg>
    </span>
  );
});

export default ChinarLoader;
