import { lovable } from "@/integrations/lovable";

/**
 * Managed Google sign-in runs through Lovable's OAuth broker, which is served
 * from `/~oauth/initiate` on Lovable-hosted origins only. On any other host
 * (e.g. a Vercel mirror) that path 404s, so we send the user to the canonical
 * app origin and finish the flow there instead of hitting a dead route.
 */
export const CANONICAL_APP_ORIGIN = "https://gaash-ai.lovable.app";

/** Query flag used to auto-resume Google sign-in on the canonical origin. */
export const GOOGLE_AUTOSTART_PARAM = "google";

export function hasManagedOAuthBroker(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovable.dev") ||
    host.endsWith(".lovableproject.com")
  );
}

/** Where the provider should return the user. Always a public same-origin URL. */
export function oauthRedirectUri(): string {
  return `${window.location.origin}/oauth-callback`;
}

/** Remember where the user wanted to land, applied only after a real session. */
export function rememberPostAuthPath(path: string) {
  try {
    if (path.startsWith("/") && !path.startsWith("//")) {
      sessionStorage.setItem("post_auth_path", path);
    }
  } catch {
    /* storage unavailable */
  }
}

export function takePostAuthPath(): string {
  try {
    const v = sessionStorage.getItem("post_auth_path");
    sessionStorage.removeItem("post_auth_path");
    if (v && v.startsWith("/") && !v.startsWith("//")) return v;
  } catch {
    /* ignore */
  }
  return "/";
}

export type GoogleSignInResult = { error?: Error; redirected?: boolean };

export async function signInWithGoogle(nextPath = "/"): Promise<GoogleSignInResult> {
  rememberPostAuthPath(nextPath);

  if (!hasManagedOAuthBroker()) {
    // This deployment cannot serve the broker route — continue on the app's
    // canonical origin, which can.
    window.location.href = `${CANONICAL_APP_ORIGIN}/?${GOOGLE_AUTOSTART_PARAM}=1`;
    return { redirected: true };
  }

  return (await lovable.auth.signInWithOAuth("google", {
    redirect_uri: oauthRedirectUri(),
  })) as GoogleSignInResult;
}

/** True when the current URL asks us to start Google sign-in immediately. */
export function shouldAutostartGoogle(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(GOOGLE_AUTOSTART_PARAM) === "1";
}

export function clearGoogleAutostart() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete(GOOGLE_AUTOSTART_PARAM);
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}
