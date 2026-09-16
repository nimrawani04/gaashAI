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

  document.documentElement.classList.add("is-native");
}
