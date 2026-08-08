import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRightLeft, Copy, Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";

import { translateText, type TranslateResult } from "@/lib/translate.functions";
import { speak } from "@/lib/tts";

export const Route = createFileRoute("/translate")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Learn Kashmiri — English ⇄ Kashmiri Translator" },
      {
        name: "description",
        content:
          "Translate between English and Kashmiri (Nastaliq), see Roman pronunciation, hear it spoken, and learn everyday phrases.",
      },
      { property: "og:title", content: "Learn Kashmiri — English ⇄ Kashmiri Translator" },
      {
        property: "og:description",
        content: "Free English to Kashmiri translation with Roman pronunciation and audio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TranslatePage,
});

const PHRASES: { en: string; ks: string; roman: string }[] = [
  { en: "Hello / Peace be upon you", ks: "اَسلامُ علیکم", roman: "Assalamu alaikum" },
  { en: "How are you?", ks: "تُہہٕ کِتھ پٲٹھؠ چھِو؟", roman: "Tohe kith pAthy chhiv?" },
  { en: "I am fine", ks: "بہٕ چھُس ٹھیک", roman: "Bi chhus theek" },
  { en: "Thank you", ks: "شُکریہ", roman: "Shukriya" },
  { en: "What is your name?", ks: "تُہُنٛد ناو کیا چھُ؟", roman: "Tohund naav kya chhu?" },
  { en: "Yes / No", ks: "آ / نہٕ", roman: "Aa / Na" },
  { en: "Please come", ks: "مہربانی کٔرِتھ یِیو", roman: "Meharbani karith yiyiv" },
  { en: "I don't know", ks: "میٚ چھُ نہٕ پتہٕ", roman: "Me chhu na pata" },
  { en: "How much is this?", ks: "یہِ کیٚتھ چھُ؟", roman: "Yi kyot chhu?" },
  { en: "Where are you going?", ks: "کٲتؠ چھِو گژھان؟", roman: "Katy chhiv gatshaan?" },
  { en: "I am hungry", ks: "میٚ چھِ بۄچھ", roman: "Me chhi bwachh" },
  { en: "Good night", ks: "خُدا حافظ، شُبہ خیر", roman: "Khuda hafiz, shubh khair" },
];

function TranslatePage() {
  const run = useServerFn(translateText);
  const [direction, setDirection] = useState<"en2ks" | "ks2en">("en2ks");
  const [text, setText] = useState("");
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [loading, setLoading] = useState(false);

  const toKashmiri = direction === "en2ks";

  const handleTranslate = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await run({ data: { text: text.trim(), direction } });
      setResult(res);
    } catch (err) {
      const msg = String((err as Error)?.message ?? "");
      if (msg.includes("rate_limited")) toast.error("Too many requests — please try again in a moment.");
      else if (msg.includes("credits_exhausted")) toast.error("AI credits exhausted. Add credits to continue.");
      else toast.error("Translation failed — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (value: string) => {
    if (!value) return;
    const res = await speak(value);
    if (res === "unsupported") toast.error("Your browser doesn't support speech.");
    else if (res === "error") toast.error("Couldn't play audio — tap the page once, then try again.");
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-4">
          <Link
            to="/"
            aria-label="Back to chat"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">Learn Kashmiri</h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              English ⇄ کٲشُر — translate, listen, practise
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        {/* Direction switch */}
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-3">
          <span className="flex-1 text-center text-sm font-semibold text-foreground">
            {toKashmiri ? "English" : "کٲشُر (Kashmiri)"}
          </span>
          <button
            onClick={() => {
              setDirection(toKashmiri ? "ks2en" : "en2ks");
              setText(result?.translation ?? "");
              setResult(null);
            }}
            aria-label="Swap translation direction"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>
          <span className="flex-1 text-center text-sm font-semibold text-foreground">
            {toKashmiri ? "کٲشُر (Kashmiri)" : "English"}
          </span>
        </div>

        {/* Input */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleTranslate();
            }}
            dir={toKashmiri ? "ltr" : "rtl"}
            rows={4}
            maxLength={2000}
            placeholder={toKashmiri ? "Type English text…" : "کٲشُر یا رومن کٲشُر لیٚکھِو…"}
            className={`w-full resize-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground ${
              toKashmiri ? "" : "font-nastaliq text-xl leading-loose"
            }`}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{text.length}/2000</span>
            <button
              onClick={handleTranslate}
              disabled={!text.trim() || loading}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Translate
            </button>
          </div>
        </div>

        {/* Result */}
        {result ? (
          <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <p
              dir={toKashmiri ? "rtl" : "ltr"}
              className={`text-foreground ${toKashmiri ? "font-nastaliq text-2xl leading-loose" : "text-lg"}`}
            >
              {result.translation}
            </p>
            {result.roman ? (
              <p className="mt-2 text-sm italic text-muted-foreground">{result.roman}</p>
            ) : null}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => handleSpeak(result.translation)}
                aria-label="Read translation aloud"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Volume2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleCopy(result.translation)}
                aria-label="Copy translation"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            {result.notes ? (
              <p className="mt-3 rounded-xl bg-card p-3 text-sm text-muted-foreground">💡 {result.notes}</p>
            ) : null}
          </div>
        ) : null}

        {/* Phrasebook */}
        <section className="mt-8">
          <h2 className="text-base font-semibold text-foreground">Everyday phrases</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tap a phrase to load it, or press play to hear it.</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {PHRASES.map((p) => (
              <li
                key={p.en}
                className="flex items-start justify-between gap-2 rounded-xl border border-border bg-card p-3"
              >
                <button
                  onClick={() => {
                    setDirection("en2ks");
                    setText(p.en);
                    setResult(null);
                  }}
                  className="min-w-0 flex-1 text-left focus:outline-none focus:ring-2 focus:ring-ring rounded"
                >
                  <span className="block text-sm text-foreground">{p.en}</span>
                  <span dir="rtl" className="mt-1 block font-nastaliq text-xl text-foreground">
                    {p.ks}
                  </span>
                  <span className="mt-0.5 block text-xs italic text-muted-foreground">{p.roman}</span>
                </button>
                <button
                  onClick={() => handleSpeak(p.ks)}
                  aria-label={`Speak: ${p.en}`}
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
