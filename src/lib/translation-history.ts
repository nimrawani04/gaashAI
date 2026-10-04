/**
 * Translation history: kept on the device and, for signed-in users, synced
 * to the account so phone and website show the same recent translations.
 */
import { getSupabaseClient } from "@/integrations/supabase/client";

export type TranslationHistoryItem = {
  id: string;
  direction: "en2ks" | "ks2en";
  source: string;
  translation: string;
  roman: string;
  at: number;
};

export const TRANSLATION_HISTORY_KEY = "kashmiri-translate-history";
export const TRANSLATION_HISTORY_LIMIT = 50;

const keyOf = (h: Pick<TranslationHistoryItem, "direction" | "source">) =>
  `${h.direction}|${h.source}`;

export function readLocalHistory(): TranslationHistoryItem[] {
  try {
    const raw = localStorage.getItem(TRANSLATION_HISTORY_KEY);
    const parsed = raw ? (JSON.parse(raw) as TranslationHistoryItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalHistory(items: TranslationHistoryItem[]) {
  try {
    localStorage.setItem(TRANSLATION_HISTORY_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable */
  }
}

/** Newest entry wins per (direction, source). */
export function mergeHistory(...lists: TranslationHistoryItem[][]): TranslationHistoryItem[] {
  const map = new Map<string, TranslationHistoryItem>();
  for (const list of lists) {
    for (const item of list) {
      const cur = map.get(keyOf(item));
      if (!cur || item.at > cur.at) map.set(keyOf(item), item);
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.at - a.at)
    .slice(0, TRANSLATION_HISTORY_LIMIT);
}

async function signedIn() {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.auth.getSession();
    const userId = data.session?.user.id;
    return userId ? { client, userId } : null;
  } catch {
    return null;
  }
}

/** Merge local history with the account copy; uploads anything only on this device. */
export async function syncHistoryWithAccount(
  local: TranslationHistoryItem[],
): Promise<TranslationHistoryItem[] | null> {
  const ctx = await signedIn();
  if (!ctx) return null;
  const { data, error } = await ctx.client
    .from("translation_history")
    .select("id, direction, source, translation, roman, created_at")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .limit(TRANSLATION_HISTORY_LIMIT);
  if (error) return null;

  const cloud: TranslationHistoryItem[] = (data ?? []).map((r) => ({
    id: r.id,
    direction: r.direction as TranslationHistoryItem["direction"],
    source: r.source,
    translation: r.translation,
    roman: r.roman,
    at: new Date(r.created_at).getTime(),
  }));
  const cloudKeys = new Map(cloud.map((c) => [keyOf(c), c.at]));
  const toUpload = local.filter((l) => {
    const at = cloudKeys.get(keyOf(l));
    return at === undefined || l.at > at;
  });
  if (toUpload.length) {
    await ctx.client.from("translation_history").upsert(
      toUpload.map((l) => ({
        user_id: ctx.userId,
        direction: l.direction,
        source: l.source,
        translation: l.translation,
        roman: l.roman,
        created_at: new Date(l.at).toISOString(),
      })),
      { onConflict: "user_id,direction,source" },
    );
  }
  return mergeHistory(cloud, local);
}

export async function saveHistoryItem(item: TranslationHistoryItem) {
  const ctx = await signedIn();
  if (!ctx) return;
  await ctx.client.from("translation_history").upsert(
    {
      user_id: ctx.userId,
      direction: item.direction,
      source: item.source,
      translation: item.translation,
      roman: item.roman,
      created_at: new Date(item.at).toISOString(),
    },
    { onConflict: "user_id,direction,source" },
  );
}

export async function deleteHistoryItem(item: Pick<TranslationHistoryItem, "direction" | "source">) {
  const ctx = await signedIn();
  if (!ctx) return;
  await ctx.client
    .from("translation_history")
    .delete()
    .eq("user_id", ctx.userId)
    .eq("direction", item.direction)
    .eq("source", item.source);
}
