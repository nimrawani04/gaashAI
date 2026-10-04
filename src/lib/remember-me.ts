/**
 * "Keep me signed in" preference.
 *
 * On (default): the sign-in survives closing the tab, browser or phone app,
 * until the user signs out.
 * Off: the sign-in only lasts while this browser tab / app session is open.
 */
const PREF_KEY = "kb_remember_me";
const ALIVE_KEY = "kb_session_alive";

export function getRememberMe(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) !== "0";
  } catch {
    return true;
  }
}

export function setRememberMe(value: boolean) {
  try {
    localStorage.setItem(PREF_KEY, value ? "1" : "0");
  } catch {
    /* storage unavailable */
  }
  markBrowserSessionAlive();
}

/** Mark this tab/app run as one where the user is actively signed in. */
export function markBrowserSessionAlive() {
  try {
    sessionStorage.setItem(ALIVE_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** True when the user chose not to be remembered and this is a fresh visit. */
export function shouldForgetOnStartup(): boolean {
  if (getRememberMe()) return false;
  try {
    return sessionStorage.getItem(ALIVE_KEY) !== "1";
  } catch {
    return false;
  }
}
