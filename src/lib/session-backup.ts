/**
 * Keeps the user signed in across app/browser restarts.
 *
 * The auth client already persists its session in localStorage, but phone
 * WebViews can lose that storage. On native apps we mirror the refresh token
 * into Capacitor Preferences and restore it when localStorage is empty.
 */
import type { Session, SupabaseClient } from "@supabase/supabase-js";

const BACKUP_KEY = "kashmirbot:auth-backup:v1";

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
