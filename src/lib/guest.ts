/**
 * Guest mode — lets someone try KashmirBot without an account.
 *
 * Guests are intentionally limited: nothing is persisted to the backend,
 * there is no history sync, and a soft usage limit nudges them to sign in.
 */

const GUEST_KEY = "kb_guest_mode";
const GUEST_USES_KEY = "kb_guest_uses";

/** How many bot messages / translations a guest gets before the sign-in prompt. */
export const GUEST_MESSAGE_LIMIT = 8;

function safeGet(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    if (typeof window !== "undefined") localStorage.setItem(key, value);
  } catch {
    /* storage may be unavailable (private mode) — guest still works in memory */
  }
}

function safeRemove(key: string) {
  try {
    if (typeof window !== "undefined") localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function isGuestMode(): boolean {
  return safeGet(GUEST_KEY) === "1";
}

export function enterGuestMode() {
  safeSet(GUEST_KEY, "1");
}

export function exitGuestMode() {
  safeRemove(GUEST_KEY);
  safeRemove(GUEST_USES_KEY);
}

export function getGuestUses(): number {
  const raw = Number(safeGet(GUEST_USES_KEY) ?? 0);
  return Number.isFinite(raw) && raw > 0 ? raw : 0;
}

export function bumpGuestUses(): number {
  const next = getGuestUses() + 1;
  safeSet(GUEST_USES_KEY, String(next));
  return next;
}

export function guestLimitReached(): boolean {
  return getGuestUses() >= GUEST_MESSAGE_LIMIT;
}

/** Features a guest cannot use. */
export type GuestFeature =
  | "history"
  | "sessions"
  | "attachments"
  | "feedback"
  | "contribute"
  | "admin"
  | "limit";

export const GUEST_FEATURE_LABELS: Record<GuestFeature, string> = {
  history: "Saved chat history",
  sessions: "Multiple saved conversations",
  attachments: "File and image attachments",
  feedback: "Rating and correcting answers",
  contribute: "Contributing Kashmiri phrases",
  admin: "Admin tools",
  limit: "Unlimited conversation",
};
