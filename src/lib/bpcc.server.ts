// BPCC (Bharat Parallel Corpus Collection) retrieval helpers.
// Server-only: never import this from client code.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/embeddings";
const EMBED_MODEL = "openai/text-embedding-3-small"; // 1536 dims, matches translation_pairs.embedding
const BATCH = 96;

export type BpccExample = { en: string; ks: string; domain: string; similarity: number };

function apiKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  return key;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Lovable-API-Key": apiKey(),
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });
  if (!res.ok) {
    throw new Error(`embeddings_failed_${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as {
    data: { index: number; embedding: number[] }[];
  };
  const out: number[][] = new Array(texts.length);
  for (const row of json.data) out[row.index] = row.embedding;
  return out;
}

/** Top-k BPCC pairs most similar to the user's text, used as few-shot examples. */
export async function retrieveBpccExamples(text: string, count = 5): Promise<BpccExample[]> {
  try {
    const [embedding] = await embedTexts([text.slice(0, 1000)]);
    if (!embedding) return [];
    const { data, error } = await supabaseAdmin.rpc("match_translation_pairs", {
      query_embedding: embedding as unknown as string,
      match_count: count,
    });
    if (error || !data) return [];
    return (data as unknown as BpccExample[]).filter((r) => r.similarity > 0.15);
  } catch {
    return [];
  }
}

export function formatExamples(examples: BpccExample[]): string {
  if (examples.length === 0) return "";
  const lines = examples
    .map((e) => `EN: ${e.en}\nKS: ${e.ks}`)
    .join("\n---\n");
  return [
    "Reference translations from the BPCC (Bharat Parallel Corpus Collection) human-verified English–Kashmiri corpus.",
    "Match their vocabulary, spelling and Nastaliq orthography as closely as possible:",
    lines,
    "",
  ].join("\n");
}

export type IngestResult = { inserted: number; embedded: number; total: number; skipped: number };

/** Embeds and stores the bundled BPCC pairs. Safe to re-run: existing rows are skipped. */
export async function ingestBpccCorpus(limit?: number): Promise<IngestResult> {
  const mod = (await import("@/data/bpcc-pairs.json")) as unknown as {
    default: { en: string; ks: string; domain: string }[];
  };
  const all = mod.default.slice(0, limit ?? mod.default.length);

  const { data: existing } = await supabaseAdmin
    .from("translation_pairs")
    .select("en")
    .limit(20000);
  const have = new Set((existing ?? []).map((r: { en: string }) => r.en));

  const todo = all.filter((p) => !have.has(p.en));
  let inserted = 0;

  for (let i = 0; i < todo.length; i += BATCH) {
    const chunk = todo.slice(i, i + BATCH);
    const vectors = await embedTexts(chunk.map((p) => p.en));
    const rows = chunk.map((p, idx) => ({
      en: p.en,
      ks: p.ks,
      domain: p.domain,
      source: "BPCC",
      embedding: JSON.stringify(vectors[idx]),
    }));
    const { error } = await supabaseAdmin
      .from("translation_pairs")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(rows as any);
    if (error) throw new Error(error.message);
    inserted += rows.length;
  }

  const { count } = await supabaseAdmin
    .from("translation_pairs")
    .select("id", { count: "exact", head: true });

  return {
    inserted,
    embedded: count ?? inserted,
    total: all.length,
    skipped: all.length - todo.length,
  };
}
