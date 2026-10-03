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

/* ---------- Account sync (signed-in users) ---------- */

async function signedInClient() {
  try {
    const { getSupabaseClient } = await import("@/integrations/supabase/client");
    const client = getSupabaseClient();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    const userId = data.session?.user.id;
    return userId ? { client, userId } : null;
  } catch {
    return null;
  }
}

async function fetchCloudState(): Promise<{ progress: LessonProgress; history: LessonHistoryItem[] } | null> {
  const ctx = await signedInClient();
  if (!ctx) return null;
  const { data, error } = await ctx.client
    .from("user_lesson_state")
    .select("progress, history")
    .eq("user_id", ctx.userId)
    .maybeSingle();
  if (error) return null;
  const progress = data?.progress && typeof data.progress === "object" && !Array.isArray(data.progress)
    ? (data.progress as unknown as LessonProgress) : {};
  const history = Array.isArray(data?.history) ? (data!.history as unknown as LessonHistoryItem[]) : [];
  return { progress, history };
}

async function pushCloud(patch: { progress?: LessonProgress; history?: LessonHistoryItem[] }) {
  const ctx = await signedInClient();
  if (!ctx) return;
  const row: Record<string, unknown> = { user_id: ctx.userId, updated_at: new Date().toISOString() };
  if (patch.progress) row["progress"] = patch.progress;
  if (patch.history) row["history"] = patch.history;
  await ctx.client.from("user_lesson_state").upsert(row as never, { onConflict: "user_id" });
}

/** Keep the most recent completion per key. */
function mergeProgress(a: LessonProgress, b: LessonProgress): LessonProgress {
  const out: LessonProgress = { ...a };
  for (const [k, v] of Object.entries(b)) {
    const cur = out[k];
    if (!cur || new Date(v.completedAt).getTime() > new Date(cur.completedAt).getTime()) out[k] = v;
  }
  return out;
}

function mergeHistory(a: LessonHistoryItem[], b: LessonHistoryItem[]): LessonHistoryItem[] {
  const map = new Map<string, LessonHistoryItem>();
  for (const item of [...a, ...b]) if (item?.id) map.set(item.id, item);
  return Array.from(map.values())
    .sort((x, y) => new Date(y.completedAt).getTime() - new Date(x.completedAt).getTime())
    .slice(0, 200);
}

function writeLocal(key: string, value: unknown) {
  const json = JSON.stringify(value);
  try { localStorage.setItem(key, json); } catch { /* ignore */ }
  if (isNativeApp()) {
    void import("@capacitor/preferences")
      .then(({ Preferences }) => Preferences.set({ key, value: json }))
      .catch(() => {});
  }
}

/**
 * Merge this device's progress/history with the account copy, save the
 * result both locally and to the account. No-op when signed out.
 */
export async function syncLessonStateWithAccount(
  localProgress: LessonProgress,
  localHistory: LessonHistoryItem[],
): Promise<{ progress: LessonProgress; history: LessonHistoryItem[] } | null> {
  try {
    const cloud = await fetchCloudState();
    if (!cloud) return null;
    const progress = mergeProgress(cloud.progress, localProgress);
    const history = mergeHistory(cloud.history, localHistory);
    writeLocal(KEY, progress);
    writeLocal(HISTORY_KEY, history);
    await pushCloud({ progress, history });
    return { progress, history };
  } catch {
    return null;
  }
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

  void pushCloud({ progress: next }).catch(() => {});
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

  void pushCloud({ history: updated }).catch(() => {});
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

  void pushCloud({ history: updated }).catch(() => {});
  return updated;
}