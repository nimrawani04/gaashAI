import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookMarked, BookOpen, MessageSquareQuote, Mic } from "lucide-react";
import ListenButton from "@/components/ListenButton";
import { GRAMMAR, PHRASES, SOUNDS, type PackPhrase } from "@/lib/kashmiri-pack";

export const Route = createFileRoute("/kashmiri")({
  head: () => ({
    meta: [
      { title: "Kashmiri Language Pack — grammar, phrases, pronunciation" },
      { name: "description", content: "Learn Kashmiri grammar rules, common phrases and pronunciation with native Kashmiri voice playback." },
      { property: "og:title", content: "Kashmiri Language Pack" },
      { property: "og:description", content: "Grammar, everyday phrases and a pronunciation guide for Kashmiri, with audio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LanguagePack,
});

type Tab = "phrases" | "grammar" | "sounds";

function PhraseRow({ p }: { p: PackPhrase }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[12px] border border-border bg-card p-3">
      <div className="min-w-0">
        <p dir="rtl" className="font-nastaliq text-xl sm:text-2xl leading-loose text-foreground break-words">{p.ks}</p>
        <p className="text-xs sm:text-sm italic text-muted-foreground break-words">{p.roman}</p>
        <p className="text-sm text-foreground break-words">{p.en}</p>
      </div>
      <ListenButton text={p.ks} variant="play" />
    </div>
  );
}

function LanguagePack() {
  const [tab, setTab] = useState<Tab>("phrases");
  const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
    { id: "phrases", label: "Phrases", icon: MessageSquareQuote },
    { id: "grammar", label: "Grammar", icon: BookOpen },
    { id: "sounds", label: "Pronunciation", icon: Mic },
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-3 py-3 sm:px-6">
          <Link to="/" aria-label="Back to chat" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg sm:text-2xl font-semibold text-foreground">Kashmiri Language Pack</h1>
            <p dir="rtl" className="truncate text-left font-nastaliq text-sm text-muted-foreground">کٲشُر زَبان</p>
          </div>
          <Link to="/dictionary" className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-[8px] border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
            <BookMarked className="h-4 w-4" />
            Dictionary
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-6 sm:py-6">
        <div role="tablist" className="mb-4 grid grid-cols-3 gap-1 rounded-[12px] border border-border bg-secondary p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`inline-flex min-h-[44px] min-w-0 items-center justify-center gap-1.5 rounded-[8px] px-2 text-xs sm:text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ring ${tab === id ? "bg-primary text-primary-foreground" : "text-secondary-foreground hover:bg-accent"}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        {tab === "phrases" &&
          PHRASES.map((g) => (
            <section key={g.title} className="mb-6">
              <h2 className="mb-2 text-base sm:text-lg font-semibold text-foreground">{g.title}</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {g.items.map((p) => <PhraseRow key={p.ks} p={p} />)}
              </div>
            </section>
          ))}

        {tab === "grammar" &&
          GRAMMAR.map((r) => (
            <section key={r.title} className="mb-5 rounded-[16px] border border-border bg-card/50 p-3 sm:p-4">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">{r.title}</h2>
              <p className="mb-3 mt-1 text-sm text-muted-foreground">{r.rule}</p>
              <div className="grid gap-2">
                {r.examples.map((p) => <PhraseRow key={p.ks} p={p} />)}
              </div>
            </section>
          ))}

        {tab === "sounds" && (
          <div className="grid gap-2">
            {SOUNDS.map((s) => (
              <div key={s.letter} className="rounded-[12px] border border-border bg-card p-3">
                <div className="mb-2 flex items-baseline gap-3">
                  <span dir="rtl" className="font-nastaliq text-3xl text-primary">{s.letter}</span>
                  <span className="font-mono text-sm text-foreground">{s.roman}</span>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">{s.sayLike}</p>
                <PhraseRow p={s.example} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
