import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Contribution {
  id: string;
  kashmiri_text: string;
  english_meaning: string;
  category: string | null;
  submitted_by_name: string | null;
  verified: boolean;
  created_at: string;
}

export default function ContributionsReview() {
  const [rows, setRows] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<"unverified" | "verified" | "all">("unverified");

  async function load() {
    setLoading(true);
    let q = supabase
      .from("contributions")
      .select("*")
      .order("created_at", { ascending: false });
    if (filter === "unverified") q = q.eq("verified", false);
    if (filter === "verified") q = q.eq("verified", true);
    const { data } = await q;
    setRows((data as Contribution[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function approve(id: string) {
    setBusy(id);
    await supabase.from("contributions").update({ verified: true }).eq("id", id);
    setBusy(null);
    load();
  }

  async function reject(id: string) {
    if (!confirm("Reject and delete this contribution?")) return;
    setBusy(id);
    await supabase.from("contributions").delete().eq("id", id);
    setBusy(null);
    load();
  }

  async function moveToKb(c: Contribution) {
    setBusy(c.id);
    try {
      const allowed = ["health", "government", "agriculture", "general"];
      const cat = c.category && allowed.includes(c.category) ? c.category : "general";
      const { data, error } = await supabase
        .from("knowledge_base")
        .insert({
          title: c.english_meaning.slice(0, 80),
          content_kashmiri: c.kashmiri_text,
          content_english: c.english_meaning,
          category: cat,
          source: c.submitted_by_name ? `community: ${c.submitted_by_name}` : "community",
        })
        .select("id")
        .single();
      if (error) throw error;
      // Generate embedding via edge function
      await supabase.functions.invoke("embed", {
        body: {
          knowledge_id: data.id,
          text: `${c.english_meaning}. ${c.english_meaning}`,
        },
      });
      await supabase.from("contributions").update({ verified: true }).eq("id", c.id);
      load();
    } catch (err) {
      alert("Error moving to knowledge base: " + String(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Review Contributions ({rows.length})</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-md border bg-background px-2 py-1 text-sm"
        >
          <option value="unverified">Unverified</option>
          <option value="verified">Verified</option>
          <option value="all">All</option>
        </select>
      </div>
      <ul className="space-y-3">
        {loading && <li className="text-sm text-muted-foreground">Loading…</li>}
        {!loading && rows.length === 0 && (
          <li className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No contributions in this view.
          </li>
        )}
        {rows.map((c) => (
          <li key={c.id} className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p
                  dir="rtl"
                  style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
                  className="text-lg"
                >
                  {c.kashmiri_text}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{c.english_meaning}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {c.category && (
                    <span className="rounded bg-muted px-2 py-0.5">{c.category}</span>
                  )}
                  {c.submitted_by_name && <span>by {c.submitted_by_name}</span>}
                  {c.verified && <span className="text-green-600">✓ verified</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col">
                {!c.verified && (
                  <button
                    onClick={() => approve(c.id)}
                    disabled={busy === c.id}
                    className="rounded-md border border-primary px-3 py-1 text-xs text-primary disabled:opacity-50"
                  >
                    Verify
                  </button>
                )}
                <button
                  onClick={() => moveToKb(c)}
                  disabled={busy === c.id}
                  className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground disabled:opacity-50"
                >
                  {busy === c.id ? "…" : "Move to KB"}
                </button>
                <button
                  onClick={() => reject(c.id)}
                  disabled={busy === c.id}
                  className="rounded-md border border-destructive px-3 py-1 text-xs text-destructive disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
