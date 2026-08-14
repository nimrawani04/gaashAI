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
      <div className="mx-auto max-w-2xl lg:max-w-3xl px-3 xs:px-4 sm:px-6 md:px-8 py-4 xs:py-6 sm:py-8">
        <header className="mb-4 xs:mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Contribute Sentence / دیو مدد
            </h1>
            <p className="mt-1 text-xs xs:text-sm text-muted-foreground">
              Help build the Kashmiri language dataset with authentic phrases.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[8px] border border-border bg-secondary px-3 py-2 text-xs xs:text-sm font-semibold text-secondary-foreground transition hover:bg-accent"
          >
            ← Back
          </Link>
        </header>

        <div className="mb-4 xs:mb-6 rounded-[16px] border border-border bg-card p-4 text-sm flex items-center gap-2">
          <span className="font-semibold text-primary text-lg">{count ?? "…"}</span>
          <span className="text-muted-foreground">contributions submitted so far</span>
        </div>

        {success && (
          <div
            dir="rtl"
            className="font-nastaliq mb-4 rounded-[16px] border border-primary/30 bg-primary/10 px-4 py-3 text-base text-primary"
          >
            شکریہ! آپ کا حصہ محفوظ ہوگیا
          </div>
        )}

        {authLoaded && !userId && (
          <div className="mb-4 rounded-[16px] border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs xs:text-sm text-foreground">
            Please <Link to="/" className="font-semibold underline">sign in</Link> to submit a contribution to the dataset.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-[16px] border border-border bg-card p-4 sm:p-6 shadow-sm"
        >
          {/* Kashmiri sentence label + input */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs xs:text-sm font-semibold text-foreground">
                Kashmiri sentence
              </label>
              <span dir="rtl" className="font-nastaliq text-sm text-muted-foreground">
                کٲشُر جملہ
              </span>
            </div>
            <textarea
              dir="rtl"
              rows={4}
              value={kashmiri}
              onChange={(e) => setKashmiri(e.target.value)}
              required
              className="font-nastaliq w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-lg sm:text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="اَتہِ لیٚکھِو..."
            />
          </div>

          {/* English meaning */}
          <div>
            <label className="mb-1.5 block text-xs xs:text-sm font-semibold text-foreground">
              English meaning / translation
            </label>
            <input
              type="text"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              required
              className="w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Type English meaning..."
            />
          </div>

          {/* Category dropdown & Optional name - Uniformly styled */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs xs:text-sm font-semibold text-foreground">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-[44px] rounded-[8px] border border-border bg-background px-3 py-2 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs xs:text-sm font-semibold text-foreground">
                Your name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-[44px] rounded-[8px] border border-border bg-background px-3 py-2 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy || !userId}
            className="w-full min-h-[44px] rounded-[9999px] bg-primary px-4 py-3 text-sm sm:text-base font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {busy ? "Saving…" : !userId ? "Sign in to submit" : "Submit contribution"}
          </button>
        </form>
      </div>
    </div>
  );
}
