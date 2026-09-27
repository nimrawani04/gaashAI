/**
 * Native (Capacitor) niceties. No-ops in a normal browser, so the web app is
 * unaffected. Everything is imported lazily to keep the web bundle untouched.
 */
export async function initNative(): Promise<void> {
  if (typeof window === "undefined") return;

  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor;
  if (!cap?.isNativePlatform?.()) return;

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Default });
  } catch {
    /* status bar styling is optional */
  }

  try {
    const { Keyboard } = await import("@capacitor/keyboard");
    Keyboard.addListener("keyboardWillShow", () => {
      document.documentElement.classList.add("keyboard-open");
    });
    Keyboard.addListener("keyboardWillHide", () => {
      document.documentElement.classList.remove("keyboard-open");
    });
  } catch {
    /* keyboard plugin is optional */
  }

  // Receive the Google session back from the system browser.
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("appUrlOpen", async ({ url }) => {
      if (!url.startsWith("app.kashmirbot://")) return;
      const params = new URLSearchParams(url.split("#")[1] ?? "");
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      try {
        const { Browser } = await import("@capacitor/browser");
        await Browser.close();
      } catch {
        /* already closed */
      }
      if (!access_token || !refresh_token) return;
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.auth.setSession({ access_token, refresh_token });
      window.location.replace("/");
    });
  } catch {
    /* app plugin is optional */
  }

  document.documentElement.classList.add("is-native");
}
