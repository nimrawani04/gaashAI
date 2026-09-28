export type LessonProgress = Record<string, { correct: number; total: number; completedAt: string }>;

const KEY = "kashmirbot:lesson-progress:v1";

export function readLessonProgress(): LessonProgress {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
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
  return next;
}