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

  const [authState, setAuthState] = useState<
    "checking" | "anon" | "not-admin" | "admin"
  >("checking");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setAuthState("anon");
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id);
      if (error) {
        setAuthState("not-admin");
        return;
      }
      const isAdmin = (data ?? []).some(
        (r: { role: string }) => r.role === "admin" || r.role === "moderator",
      );
      setAuthState(isAdmin ? "admin" : "not-admin");
    })();
  }, []);

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
    if (authState === "admin") load();
  }, [authState]);

  if (authState === "checking") {
    return (
      <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }
  if (authState !== "admin") {
    return (
      <div className="grid min-h-[100dvh] place-items-center px-4 text-center">
        <div className="max-w-md space-y-2">
          <h1 className="text-xl font-semibold">Admins only</h1>
          <p className="text-sm text-muted-foreground">
            {authState === "anon"
              ? "Please sign in with an admin account to manage the knowledge base."
              : "Your account does not have admin or moderator privileges."}
          </p>
          <a href="/" className="inline-block text-sm underline">
            ← Back to chat
          </a>
        </div>
      </div>
    );
  }

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
      <div className="mx-auto max-w-4xl lg:max-w-5xl xl:max-w-6xl px-3 xs:px-4 sm:px-6 md:px-8 py-4 xs:py-6 sm:py-8">
        <header className="mb-6 xs:mb-8 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">Knowledge Base Admin</h1>
            <p className="text-xs xs:text-sm sm:text-base text-muted-foreground">
              Manage RAG entries that ground KashmirBot's answers.
            </p>
          </div>
          <a href="/" className="text-xs xs:text-sm underline whitespace-nowrap">
            ← Back to chat
          </a>
        </header>

        {status && (
          <div className="mb-3 xs:mb-4 rounded-md border bg-card px-3 xs:px-4 py-2 text-xs xs:text-sm">{status}</div>
        )}

        <section className="mb-6 xs:mb-8 rounded-lg border bg-card p-4 xs:p-5 sm:p-6">
          <h2 className="mb-3 xs:mb-4 text-base xs:text-lg sm:text-xl font-semibold">Add new entry</h2>
          <form onSubmit={handleSubmit} className="space-y-2.5 xs:space-y-3">
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-xs xs:text-sm sm:text-base"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-xs xs:text-sm sm:text-base"
              dir="rtl"
              style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
              placeholder="کشمیری متن"
              rows={3}
              value={contentKashmiri}
              onChange={(e) => setContentKashmiri(e.target.value)}
            />
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-xs xs:text-sm sm:text-base"
              placeholder="English content (used for embedding)"
              rows={3}
              value={contentEnglish}
              onChange={(e) => setContentEnglish(e.target.value)}
              required
            />
            <div className="grid gap-2.5 xs:gap-3 sm:grid-cols-2">
              <select
                className="rounded-md border bg-background px-3 py-2 text-xs xs:text-sm sm:text-base"
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
                className="rounded-md border bg-background px-3 py-2 text-xs xs:text-sm sm:text-base"
                placeholder="Source URL"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div className="flex flex-col xs:flex-row gap-2">
              <button
                type="submit"
                disabled={busy === "new"}
                className="rounded-md bg-primary px-4 py-2 text-xs xs:text-sm sm:text-base font-medium text-primary-foreground disabled:opacity-50"
              >
                {busy === "new" ? "Saving…" : "Save & embed"}
              </button>
              <button
                type="button"
                onClick={handleSeed}
                disabled={busy === "seed"}
                className="rounded-md border px-4 py-2 text-xs xs:text-sm sm:text-base disabled:opacity-50"
              >
                {busy === "seed" ? "Seeding…" : `Seed ${SEED_ENTRIES.length} defaults`}
              </button>
            </div>
          </form>
        </section>

        <ContributionsReview />



        <section>
          <h2 className="mb-3 xs:mb-4 text-base xs:text-lg sm:text-xl font-semibold">
            Entries ({rows.length}) {loading && "…"}
          </h2>
          <ul className="space-y-2.5 xs:space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="rounded-lg border bg-card p-3 xs:p-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-sm xs:text-base">{r.title}</h3>
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] xs:text-xs">
                        {r.category}
                      </span>
                      <span
                        className={
                          "text-[10px] xs:text-xs " +
                          (r.embedding ? "text-green-600" : "text-amber-600")
                        }
                      >
                        {r.embedding ? "● embedded" : "○ no embedding"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs xs:text-sm text-muted-foreground">
                      {r.content_english}
                    </p>
                    {r.content_kashmiri && (
                      <p
                        dir="rtl"
                        style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
                        className="mt-1 text-xs xs:text-sm sm:text-base"
                      >
                        {r.content_kashmiri}
                      </p>
                    )}
                    {r.source && (
                      <p className="mt-1 text-[10px] xs:text-xs text-muted-foreground break-all">{r.source}</p>
                    )}
                  </div>
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto sm:shrink-0">
                    <button
                      onClick={() => handleReembed(r)}
                      disabled={busy === r.id}
                      className="flex-1 sm:flex-none rounded-md border px-3 py-1.5 xs:py-2 text-[10px] xs:text-xs disabled:opacity-50"
                    >
                      {busy === r.id ? "…" : "Re-embed"}
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={busy === r.id}
                      className="flex-1 sm:flex-none rounded-md border border-destructive px-3 py-1.5 xs:py-2 text-[10px] xs:text-xs text-destructive disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {!loading && rows.length === 0 && (
              <li className="rounded-lg border border-dashed p-6 xs:p-8 text-center text-xs xs:text-sm text-muted-foreground">
                No entries yet. Click "Seed {SEED_ENTRIES.length} defaults" to bootstrap the knowledge base.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
