import { Link } from "@tanstack/react-router";
import { LogIn, Sparkles, X } from "lucide-react";
import { GUEST_FEATURE_LABELS, type GuestFeature } from "@/lib/guest";

const BENEFITS = [
  "Your full chat & translation history",
  "Saved conversations across devices",
  "Attachments, feedback and contributions",
  "No usage limits",
];

/**
 * Friendly prompt shown when a guest reaches a feature (or a usage limit)
 * that needs an account. Matches the existing chinar/green visual identity.
 */
export default function GuestPrompt({
  feature,
  onDismiss,
  onSignIn,
}: {
  feature: GuestFeature;
  onDismiss?: () => void;
  onSignIn?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-foreground/40 p-3 backdrop-blur-sm sm:items-center">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="font-nastaliq text-2xl text-foreground" dir="rtl">
          سائن اِن کٔرِو
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to continue using this feature and unlock your full history and access.
        </p>
        <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
          {GUEST_FEATURE_LABELS[feature]} needs an account.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/auth"
            onClick={onSignIn}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </Link>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Keep exploring
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
