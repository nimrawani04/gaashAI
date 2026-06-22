import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/contribute")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "KashmirBot — Contribute" },
      {
        name: "description",
        content:
          "Help build the Kashmiri language dataset by contributing sentences and meanings.",
      },
    ],
  }),
  component: ContributePage,
});

const CATEGORIES = [
  { value: "greeting", label: "Greeting" },
  { value: "question", label: "Question" },
  { value: "health", label: "Health" },
  { value: "daily life", label: "Daily life" },
  { value: "proverb", label: "Proverb" },
];

function ContributePage() {
  const [kashmiri, setKashmiri] = useState("");
  const [english, setEnglish] = useState("");
  const [category, setCategory] = useState("greeting");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  async function loadCount() {
    const { count: c } = await supabase
      .from("contributions")
      .select("*", { count: "exact", head: true });
    setCount(c ?? 0);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setAuthLoaded(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    loadCount();
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!kashmiri.trim() || !english.trim()) return;
    if (!userId) {
      alert("Please sign in to contribute.");
      return;
    }
    setBusy(true);
    setSuccess(false);
    const { error } = await supabase.from("contributions").insert({
      kashmiri_text: kashmiri.trim(),
      english_meaning: english.trim(),
      category,
      submitted_by_name: name.trim() || null,
      submitted_by: userId,
    });
    setBusy(false);
    if (error) {
      alert("Error: " + error.message);
      return;
    }
    setSuccess(true);
    setKashmiri("");
    setEnglish("");
    setName("");
    setCategory("greeting");
    loadCount();
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1
              dir="rtl"
              className="font-nastaliq text-3xl text-foreground"
            >
              اپنا کاشمیری جملہ لکھو
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Help build the Kashmiri language dataset.
            </p>
          </div>
          <Link to="/" className="text-sm underline">
            ← Back
          </Link>
        </header>

        <div className="mb-6 rounded-lg border bg-card p-4 text-sm">
          <span className="font-medium">{count ?? "…"}</span>
          <span className="ms-2 text-muted-foreground">contributions so far</span>
        </div>

        {success && (
          <div
            dir="rtl"
            className="font-nastaliq mb-4 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-primary"
          >
            شکریہ! آپ کا حصہ محفوظ ہوگیا
          </div>
        )}

        {authLoaded && !userId && (
          <div className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
            Please <Link to="/" className="underline">sign in</Link> to submit a contribution.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border bg-card p-6"
        >
          <div>
            <label
              dir="rtl"
              className="font-nastaliq mb-1 block text-sm"
            >
              کاشمیری جملہ
            </label>
            <textarea
              dir="rtl"
              rows={4}
              value={kashmiri}
              onChange={(e) => setKashmiri(e.target.value)}
              required
              className="font-nastaliq w-full rounded-md border bg-background px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">English meaning</label>
            <input
              type="text"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm">Your name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy || !userId}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Saving…" : !userId ? "Sign in to submit" : "Submit contribution"}
          </button>
        </form>
      </div>
    </div>
  );
}
