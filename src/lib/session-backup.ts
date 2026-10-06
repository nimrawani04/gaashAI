/**
 * Keeps the user signed in across app/browser restarts.
 *
 * The auth client already persists its session in localStorage, but phone
 * WebViews can lose that storage. On native apps we mirror the refresh token
 * into Capacitor Preferences and restore it when localStorage is empty.
 */
import type { Session, SupabaseClient } from "@supabase/supabase-js";

const BACKUP_KEY = "kashmirbot:auth-backup:v1";
const COOKIE = "kb_auth_backup";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year — cleared on sign-out

function writeCookie(value: string | null) {
  try {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = value
      ? `${COOKIE}=${encodeURIComponent(value)}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`
      : `${COOKIE}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
  } catch {
    /* ignore */
  }
}

function readCookie(): string | null {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

function isNative(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!cap?.isNativePlatform?.();
}

/** True if the auth client has a saved session in localStorage. */
export function hasStoredSession(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("sb-") && k.endsWith("-auth-token") && localStorage.getItem(k)) return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export async function backupSession(session: Session | null): Promise<void> {
  if (typeof window === "undefined") return;
  // Only the long-lived refresh token is kept in the cookie (fits size limits).
  writeCookie(session?.refresh_token ?? null);
  if (!isNative()) return;
  try {
    const { Preferences } = await import("@capacitor/preferences");
    if (session?.refresh_token) {
      await Preferences.set({
        key: BACKUP_KEY,
        value: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
      });
    } else {
      await Preferences.remove({ key: BACKUP_KEY });
    }
  } catch {
    /* optional */
  }
}

/** Restore a session from native storage when the WebView lost it. */
export async function restoreBackupSession(client: SupabaseClient<any>): Promise<Session | null> {
  if (typeof window === "undefined") return null;
  const cookieToken = readCookie();
  if (cookieToken) {
    try {
      const { data, error } = await client.auth.refreshSession({ refresh_token: cookieToken });
      if (data.session) return data.session;
      if (error?.status && error.status >= 400 && error.status < 500) writeCookie(null);
    } catch {
      /* network — fall through */
    }
  }
  if (!isNative()) return null;
  try {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key: BACKUP_KEY });
    if (!value) return null;
    const tokens = JSON.parse(value) as { access_token: string; refresh_token: string };
    const { data, error } = await client.auth.setSession(tokens);
    if (error) {
      // Only drop the backup when the token is definitively rejected.
      if (error.status && error.status >= 400 && error.status < 500) {
        await Preferences.remove({ key: BACKUP_KEY });
      }
      return null;
    }
    return data.session ?? null;
  } catch {
    return null;
  }
}
