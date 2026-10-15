import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookMarked, Search } from "lucide-react";
import ListenButton from "@/components/ListenButton";
import { LEXICON, normalize, type LexEntry } from "@/lib/lexicon";
import { PHRASES, type PackPhrase } from "@/lib/kashmiri-pack";

export const Route = createFileRoute("/dictionary")({
  head: () => ({
    meta: [
      { title: "Kashmiri Dictionary — meanings, examples, audio" },
      { name: "description", content: "Look up Kashmiri words with English meanings, roman spelling, example sentences and native voice playback." },
      { property: "og:title", content: "Kashmiri Dictionary" },
      { property: "og:description", content: "Search Kashmiri words with meanings, examples and audio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DictionaryPage,
});

/** All pack phrases, flattened once, used to find example sentences for a word. */
const ALL_PHRASES: PackPhrase[] = PHRASES.flatMap((g) => g.items);

function examplesFor(entry: LexEntry): PackPhrase[] {
  const needle = normalize(entry.ks);
  if (!needle) return [];
  return ALL_PHRASES.filter((p) => normalize(p.ks).includes(needle)).slice(0, 2);
}

function matches(entry: LexEntry, q: string): boolean {
  const nq = normalize(q);
  if (!nq) return true;
  if (normalize(entry.ks).includes(nq)) return true;
  if (entry.variants?.some((v) => normalize(v).includes(nq))) return true;
  const lq = q.toLowerCase().trim();
  if (entry.roman.toLowerCase().includes(lq)) return true;
  return entry.en.some((m) => m.toLowerCase().includes(lq));
}

function EntryCard({ entry }: { entry: LexEntry }) {
  const examples = examplesFor(entry);
  return (
    <article className="rounded-[12px] border border-border bg-card p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p dir="rtl" className="font-nastaliq text-2xl sm:text-3xl leading-loose text-foreground break-words">{entry.ks}</p>
          <p className="text-xs sm:text-sm italic text-muted-foreground break-words">{entry.roman}</p>
        </div>
        <ListenButton text={entry.ks} variant="play" />
      </div>
      <p className="mt-1 text-sm sm:text-base text-foreground break-words">
        {entry.en.join(" · ")}
        <span className="ml-2 rounded-full border border-border bg-secondary px-2 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wide text-secondary-foreground">
          {entry.kind}
        </span>
      </p>
      {entry.variants && entry.variants.length > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">
          Also written: {entry.variants.map((v) => <span key={v} dir="rtl" className="font-nastaliq">{v}</span>).reduce<React.ReactNode[]>((acc, n, i) => (i ? [...acc, ", ", n] : [n]), [])}
        </p>
      )}
      {examples.length > 0 && (
        <div className="mt-3 grid gap-2 border-t border-border pt-3">
          {examples.map((ex) => (
            <div key={ex.ks} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p dir="rtl" className="font-nastaliq text-lg leading-loose text-foreground break-words">{ex.ks}</p>
                <p className="text-xs italic text-muted-foreground break-words">{ex.roman}</p>
                <p className="text-xs text-foreground break-words">{ex.en}</p>
              </div>
              <ListenButton text={ex.ks} variant="play" />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function DictionaryPage() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const list = query.trim() ? LEXICON.filter((e) => matches(e, query)) : LEXICON;
    return list.slice(0, 60);
  }, [query]);

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-3 py-3 sm:px-6">
          <Link to="/" aria-label="Back to chat" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg sm:text-2xl font-semibold text-foreground">Kashmiri Dictionary</h1>
            <p dir="rtl" className="truncate text-left font-nastaliq text-sm text-muted-foreground">کٲشُر لُغت</p>
          </div>
          <BookMarked className="h-5 w-5 shrink-0 text-muted-foreground" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-6 sm:py-6">
        <label className="mb-4 flex items-center gap-2 rounded-[12px] border border-border bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in Kashmiri, roman or English…"
            className="min-h-[32px] w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </label>

        <p className="mb-3 text-xs text-muted-foreground">
          {query.trim() ? `${results.length} result${results.length === 1 ? "" : "s"}` : `${LEXICON.length} words and phrases`}
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          {results.map((e, i) => <EntryCard key={`${e.ks}-${e.roman}-${i}`} entry={e} />)}
        </div>

        {results.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            No matches for “{query}”. Try a different spelling or the English meaning.
          </p>
        )}
      </main>
    </div>
  );
}
