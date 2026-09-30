export type LessonProgress = Record<string, { correct: number; total: number; completedAt: string }>;

const KEY = "kashmirbot:lesson-progress:v1";

function isNativeApp() {
  return typeof window !== "undefined" && Boolean(
    (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.(),
  );
}

export function readLessonProgress(): LessonProgress {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

/** Native preferences survive WebView cache clearing; import older browser-stored results once. */
export async function loadLessonProgress(): Promise<LessonProgress> {
  const browserProgress = readLessonProgress();
  if (!isNativeApp()) return browserProgress;
  try {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key: KEY });
    const stored = value ? JSON.parse(value) : {};
    const nativeProgress: LessonProgress = stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
    const merged = { ...browserProgress, ...nativeProgress };
    await Preferences.set({ key: KEY, value: JSON.stringify(merged) });
    return merged;
  } catch {
    return browserProgress;
  }
}

export function saveLessonCompletion(
  previous: LessonProgress,
  lessonId: string,
  correct: number,
  total: number,
): LessonProgress {
  const next = { ...previous, [lessonId]: { correct, total, completedAt: new Date().toISOString() } };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Private browsing may not allow device storage. Current session still updates. */
  }
  if (isNativeApp()) {
    void import("@capacitor/preferences")
      .then(({ Preferences }) => Preferences.set({ key: KEY, value: JSON.stringify(next) }))
      .catch(() => { /* Keep current progress even if native storage is unavailable. */ });
  }
  return next;
}