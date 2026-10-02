export interface LessonProgressItem {
  correct: number;
  total: number;
  completedAt: string;
  language?: string;
  lessonId?: string;
  title?: string;
  grade?: number;
  subject?: string;
}

export type LessonProgress = Record<string, LessonProgressItem>;

export interface QuizHistoryReviewItem {
  concept: string;
  type: string;
  question_en: string;
  question_target?: string;
  options?: string[];
  answer: string;
  answer_target?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface LessonHistoryItem {
  id: string;
  lessonId: string;
  title: string;
  grade: number;
  subject: string;
  language: string;
  completedAt: string;
  score: {
    correct: number;
    total: number;
    percentage: number;
  };
  weakConcepts?: string[];
  conceptScores?: Record<string, { correct: number; total: number }>;
  quiz?: QuizHistoryReviewItem[];
  lesson?: unknown;
  source?: string;
}

const KEY = "kashmirbot:lesson-progress:v1";
const HISTORY_KEY = "kashmirbot:lesson-history:v1";

function isNativeApp(): boolean {
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
    const merged: LessonProgress = { ...browserProgress, ...nativeProgress };

    // Ensure bidirectional indexing by lessonId and by `${language}:${lessonId}`
    for (const [k, v] of Object.entries(merged)) {
      if (v?.language && v?.lessonId) {
        merged[`${v.language}:${v.lessonId}`] = v;
        merged[v.lessonId] = v;
      } else if (v?.language && !k.includes(":")) {
        merged[`${v.language}:${k}`] = { ...v, lessonId: k };
      }
    }

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
  language?: string,
  extra?: { title?: string; grade?: number; subject?: string },
): LessonProgress {
  const now = new Date().toISOString();
  const entry: LessonProgressItem = {
    correct,
    total,
    completedAt: now,
    lessonId,
    language,
    ...extra,
  };

  const next: LessonProgress = {
    ...previous,
    [lessonId]: entry,
  };

  // Track ready-made lesson quiz completion in device storage by language and lesson ID
  if (language) {
    next[`${language}:${lessonId}`] = entry;
  }

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

export function readLessonHistory(): LessonHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function loadLessonHistory(): Promise<LessonHistoryItem[]> {
  const browserList = readLessonHistory();
  if (!isNativeApp()) return browserList;
  try {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key: HISTORY_KEY });
    const stored = value ? JSON.parse(value) : [];
    const nativeList: LessonHistoryItem[] = Array.isArray(stored) ? stored : [];

    // Merge and deduplicate by item.id
    const map = new Map<string, LessonHistoryItem>();
    for (const item of browserList) {
      if (item && item.id) map.set(item.id, item);
    }
    for (const item of nativeList) {
      if (item && item.id) map.set(item.id, item);
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );

    await Preferences.set({ key: HISTORY_KEY, value: JSON.stringify(merged) });
    return merged;
  } catch {
    return browserList;
  }
}

export async function saveLessonHistoryItem(item: LessonHistoryItem): Promise<LessonHistoryItem[]> {
  const existing = await loadLessonHistory();
  // Filter out any older entry with the exact same id
  const filtered = existing.filter((x) => x.id !== item.id);
  const updated = [item, ...filtered];

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    /* Ignore storage quotas in private browsing */
  }

  if (isNativeApp()) {
    try {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.set({ key: HISTORY_KEY, value: JSON.stringify(updated) });
    } catch {
      /* Keep progress in memory */
    }
  }

  return updated;
}

export async function deleteLessonHistoryItem(id: string): Promise<LessonHistoryItem[]> {
  const existing = await loadLessonHistory();
  const updated = existing.filter((x) => x.id !== id);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    /* Ignore */
  }

  if (isNativeApp()) {
    try {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.set({ key: HISTORY_KEY, value: JSON.stringify(updated) });
    } catch {
      /* Ignore */
    }
  }

  return updated;
}