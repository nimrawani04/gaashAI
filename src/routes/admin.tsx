import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SEED_ENTRIES, type KbCategory } from "@/lib/seedKnowledge";
import ContributionsReview from "@/components/admin/ContributionsReview";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "KashmirBot — Admin" }] }),
  component: AdminPage,
});

interface KbRow {
  id: string;
  title: string;
  content_kashmiri: string | null;
  content_english: string;
  category: KbCategory | null;
  source: string | null;
  created_at: string;
  embedding: unknown;
}

const CATEGORIES: KbCategory[] = ["health", "government", "agriculture", "general"];

async function callEmbed(id: string, text: string) {
  const { error } = await supabase.functions.invoke("embed", {
    body: { knowledge_id: id, text },
  });
  if (error) throw error;
}

function AdminPage() {
  const [rows, setRows] = useState<KbRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [contentKashmiri, setContentKashmiri] = useState("");
  const [contentEnglish, setContentEnglish] = useState("");
  const [category, setCategory] = useState<KbCategory>("general");
  const [source, setSource] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("id,title,content_kashmiri,content_english,category,source,created_at,embedding")
      .order("created_at", { ascending: false });
    if (!error && data) setRows(data as KbRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !contentEnglish.trim()) return;
    setBusy("new");
    setStatus("ایمبیڈنگ بن رہی ہے...");
    try {
      const { data, error } = await supabase
        .from("knowledge_base")
        .insert({
          title,
          content_kashmiri: contentKashmiri || null,
          content_english: contentEnglish,
          category,
          source: source || null,
        })
        .select("id")
        .single();
      if (error) throw error;
      await callEmbed(data.id, `${title}. ${contentEnglish}`);
      setTitle("");
      setContentKashmiri("");
      setContentEnglish("");
      setSource("");
      setCategory("general");
      setStatus("✓ Saved & embedded");
      await load();
    } catch (err) {
      setStatus("Error: " + String(err));
    } finally {
      setBusy(null);
      setTimeout(() => setStatus(null), 3000);
    }
  }

  async function handleReembed(row: KbRow) {
    setBusy(row.id);
    setStatus("ایمبیڈنگ بن رہی ہے...");
    try {
      await callEmbed(row.id, `${row.title}. ${row.content_english}`);
      setStatus("✓ Re-embedded");
      await load();
    } catch (err) {
      setStatus("Error: " + String(err));
    } finally {
      setBusy(null);
      setTimeout(() => setStatus(null), 3000);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    setBusy(id);
    await supabase.from("knowledge_base").delete().eq("id", id);
    setBusy(null);
    await load();
  }

  async function handleSeed() {
    setBusy("seed");
    setStatus("Seeding...");
    try {
      for (const s of SEED_ENTRIES) {
        const { data, error } = await supabase
          .from("knowledge_base")
          .insert(s)
          .select("id")
          .single();
        if (error) throw error;
        await callEmbed(data.id, `${s.title}. ${s.content_english}`);
      }
      setStatus("✓ Seeded " + SEED_ENTRIES.length + " entries");
      await load();
    } catch (err) {
      setStatus("Error: " + String(err));
    } finally {
      setBusy(null);
      setTimeout(() => setStatus(null), 3000);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Knowledge Base Admin</h1>
            <p className="text-sm text-muted-foreground">
              Manage RAG entries that ground KashmirBot's answers.
            </p>
          </div>
          <a href="/" className="text-sm underline">
            ← Back to chat
          </a>
        </header>

        {status && (
          <div className="mb-4 rounded-md border bg-card px-4 py-2 text-sm">{status}</div>
        )}

        <section className="mb-8 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Add new entry</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              dir="rtl"
              style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
              placeholder="کشمیری متن"
              rows={3}
              value={contentKashmiri}
              onChange={(e) => setContentKashmiri(e.target.value)}
            />
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="English content (used for embedding)"
              rows={3}
              value={contentEnglish}
              onChange={(e) => setContentEnglish(e.target.value)}
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value as KbCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                className="rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Source URL"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy === "new"}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {busy === "new" ? "Saving…" : "Save & embed"}
              </button>
              <button
                type="button"
                onClick={handleSeed}
                disabled={busy === "seed"}
                className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
              >
                {busy === "seed" ? "Seeding…" : "Seed 5 defaults"}
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">
            Entries ({rows.length}) {loading && "…"}
          </h2>
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{r.title}</h3>
                      <span className="rounded bg-muted px-2 py-0.5 text-xs">
                        {r.category}
                      </span>
                      <span
                        className={
                          "text-xs " +
                          (r.embedding ? "text-green-600" : "text-amber-600")
                        }
                      >
                        {r.embedding ? "● embedded" : "○ no embedding"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {r.content_english}
                    </p>
                    {r.content_kashmiri && (
                      <p
                        dir="rtl"
                        style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
                        className="mt-1 text-sm"
                      >
                        {r.content_kashmiri}
                      </p>
                    )}
                    {r.source && (
                      <p className="mt-1 text-xs text-muted-foreground">{r.source}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      onClick={() => handleReembed(r)}
                      disabled={busy === r.id}
                      className="rounded-md border px-3 py-1 text-xs disabled:opacity-50"
                    >
                      {busy === r.id ? "…" : "Re-embed"}
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={busy === r.id}
                      className="rounded-md border border-destructive px-3 py-1 text-xs text-destructive disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {!loading && rows.length === 0 && (
              <li className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No entries yet. Click "Seed 5 defaults" to bootstrap the knowledge base.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
