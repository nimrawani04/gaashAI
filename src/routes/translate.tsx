import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRightLeft, Copy, History, ImagePlus, Loader2, Mic, Square, Trash2, Volume2 } from "lucide-react";
import { toast } from "sonner";

import { translateText, type TranslateResult } from "@/lib/translate.functions";
import { readImage } from "@/lib/vision.functions";
import { speak } from "@/lib/tts";
import { startRecording, blobToBase64, type Recorder } from "@/lib/recorder";
import { transcribeSpeech } from "@/lib/stt.functions";
import GuestPrompt from "@/components/GuestPrompt";
import { isGuestMode } from "@/lib/guest";




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

type HistoryItem = {
  id: string;
  direction: "en2ks" | "ks2en";
  source: string;
  translation: string;
  roman: string;
  at: number;
};

const HISTORY_KEY = "kashmiri-translate-history";
const HISTORY_LIMIT = 20;

function TranslatePage() {
  const run = useServerFn(translateText);
  const [direction, setDirection] = useState<"en2ks" | "ks2en">("en2ks");
  const [text, setText] = useState("");
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [guest, setGuest] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [reading, setReading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recorderRef = useRef<Recorder | null>(null);


  const toKashmiri = direction === "en2ks";

  useEffect(() => {
    if (isGuestMode()) {
      setGuest(true);
      return; // guests get no persisted history
    }
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw) as HistoryItem[]);
    } catch {
      /* ignore corrupt history */
    }
  }, []);

  const persist = (items: HistoryItem[]) => {
    if (guest) {
      setShowGuestPrompt(true);
      return;
    }
    setHistory(items);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch {
      /* storage may be unavailable */
    }
  };

  const handleTranslate = async (override?: { text: string; direction: "en2ks" | "ks2en" }) => {
    const source = (override?.text ?? text).trim();
    const dir = override?.direction ?? direction;
    if (!source || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await run({ data: { text: source, direction: dir } });
      setResult(res);
      if (res.translation) {
        persist(
          [
            {
              id: `${Date.now()}`,
              direction: dir,
              source,
              translation: res.translation,
              roman: res.roman,
              at: Date.now(),
            },
            ...history.filter((h) => !(h.source === source && h.direction === dir)),
          ].slice(0, HISTORY_LIMIT),
        );
      }
    } catch (err) {
      const msg = String((err as Error)?.message ?? "");
      if (msg.includes("rate_limited")) toast.error("Too many requests — please try again in a moment.");
      else if (msg.includes("credits_exhausted")) toast.error("AI credits exhausted. Add credits to continue.");
      else toast.error("Translation failed — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = () => imageInputRef.current?.click();

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image too large (max 8MB).");
      return;
    }
    setReading(true);
    setResult(null);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read_failed"));
        reader.readAsDataURL(file);
      });
      const vision = await readImage({ data: { imageData: dataUrl } });
      const extracted = vision.extracted.trim();
      if (!extracted) {
        toast.error("No readable text found in that image.");
        return;
      }
      const dir: "en2ks" | "ks2en" = vision.script === "latin" ? "en2ks" : "ks2en";
      setDirection(dir);
      setText(extracted);
      toast.success(
        `Detected ${vision.language || (dir === "ks2en" ? "Kashmiri/Urdu" : "English")} — translating…`,
      );
      await handleTranslate({ text: extracted, direction: dir });
    } catch (err) {
      const msg = String((err as Error)?.message ?? "");
      if (msg.includes("rate_limited")) toast.error("Too many requests — please try again in a moment.");
      else if (msg.includes("credits_exhausted")) toast.error("AI credits exhausted. Add credits to continue.");
      else toast.error("Couldn't read that image — try a clearer photo.");
    } finally {
      setReading(false);
    }
  };

  /** Speak instead of type: records mic audio and transcribes it into the box. */
  const handleMic = async () => {
    if (transcribing) return;
    if (listening && recorderRef.current) {
      const rec = recorderRef.current;
      recorderRef.current = null;
      setListening(false);
      setTranscribing(true);
      try {
        const wav = await rec.stop();
        if (wav.size < 4096) {
          toast("No speech was heard — try again.");
          return;
        }
        const audio = await blobToBase64(wav);
        const { text: heard } = await transcribeSpeech({
          data: { audio, ...(toKashmiri ? { language: "en" } : {}) },
        });
        const clean = heard.trim();
        if (!clean) {
          toast("No speech was heard — try again.");
          return;
        }
        setText(clean);
        await handleTranslate({ text: clean, direction });
      } catch (err) {
        toast.error("Couldn't understand that recording", {
          description: String((err as Error)?.message ?? "").slice(0, 160),
        });
      } finally {
        setTranscribing(false);
      }
      return;
    }
    try {
      recorderRef.current = await startRecording();
      setListening(true);
    } catch {
      recorderRef.current = null;
      toast.error("Microphone access is needed to speak.");
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
      {showGuestPrompt && (
        <GuestPrompt feature="history" onDismiss={() => setShowGuestPrompt(false)} />
      )}
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl items-center gap-2 xs:gap-3 px-3 xs:px-4 sm:px-6 py-3 xs:py-4">
          <Link
            to="/"
            aria-label="Back to chat"
            className="flex h-9 w-9 xs:h-10 xs:w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <ArrowLeft className="h-4 w-4 xs:h-5 xs:w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base xs:text-lg sm:text-xl md:text-2xl font-semibold text-foreground">Translate</h1>
            <p className="truncate text-[10px] xs:text-xs sm:text-sm text-muted-foreground">
              English ⇄ کٲشُر — translate, listen, practise
            </p>
          </div>
          <Link
            to="/learn"
            aria-label="Adaptive learning lessons"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-md border border-border bg-secondary px-3 text-sm font-semibold text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="hidden xs:inline">Learn</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl px-3 xs:px-4 sm:px-6 md:px-8 py-4 xs:py-5 sm:py-6">
        {/* Direction switch */}
        <div className="flex items-center justify-center gap-2 xs:gap-3 rounded-2xl border border-border bg-card p-2.5 xs:p-3">
          <span className="flex-1 text-center text-xs xs:text-sm sm:text-base font-semibold text-foreground">
            {toKashmiri ? "English" : "کٲشُر (Kashmiri)"}
          </span>
          <button
            onClick={() => {
              setDirection(toKashmiri ? "ks2en" : "en2ks");
              setText(result?.translation ?? "");
              setResult(null);
            }}
            aria-label="Swap translation direction"
            className="flex h-9 w-9 xs:h-10 xs:w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
          </button>
          <span className="flex-1 text-center text-xs xs:text-sm sm:text-base font-semibold text-foreground">
            {toKashmiri ? "کٲشُر (Kashmiri)" : "English"}
          </span>
        </div>

        {/* Input */}
        <div className="mt-3 xs:mt-4 rounded-2xl border border-border bg-card p-3 xs:p-4 sm:p-5">
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
            className={`w-full resize-none bg-transparent text-sm xs:text-base sm:text-lg text-foreground outline-none placeholder:text-muted-foreground ${
              toKashmiri ? "" : "font-nastaliq text-lg xs:text-xl sm:text-2xl leading-loose"
            }`}
          />
          <div className="mt-2 xs:mt-3 flex items-center justify-between gap-2 xs:gap-3">
            <span className="text-[10px] xs:text-xs text-muted-foreground">{text.length}/2000</span>
            <div className="flex items-center gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImage}
              />
              <button
                onClick={handleMic}
                disabled={transcribing || loading || reading}
                aria-pressed={listening}
                aria-label={listening ? "Stop recording and transcribe" : "Speak instead of typing"}
                title={listening ? "Stop and transcribe" : "Speak instead of typing"}
                className={[
                  "inline-flex min-h-[44px] items-center gap-2 rounded-[9999px] border px-4 text-sm font-medium transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-ring",
                  listening
                    ? "border-primary bg-primary text-primary-foreground animate-pulse"
                    : "border-border bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
                ].join(" ")}
              >
                {transcribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : listening ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                <span className="hidden xs:inline">
                  {transcribing ? "Transcribing…" : listening ? "Stop" : "Speak"}
                </span>
              </button>
              <button

                onClick={handlePickImage}
                disabled={reading || loading}
                aria-label="Translate text from an image"
                title="Read text from an image"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[9999px] border border-border bg-secondary px-4 text-sm font-medium text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {reading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                <span className="hidden xs:inline">{reading ? "Reading…" : "Image"}</span>
              </button>
              <button
                onClick={() => handleTranslate()}
                disabled={!text.trim() || loading || reading}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[9999px] bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Translate
              </button>
            </div>
          </div>

        </div>

        {/* Result */}
        {result ? (
          <div className="mt-3 xs:mt-4 rounded-[16px] border border-primary/30 bg-primary/5 p-3 xs:p-4 sm:p-5">
            <p
              dir={toKashmiri ? "rtl" : "ltr"}
              className={`text-foreground ${toKashmiri ? "font-nastaliq text-xl xs:text-2xl sm:text-3xl leading-loose" : "text-base xs:text-lg sm:text-xl"}`}
            >
              {result.translation}
            </p>
            {result.roman ? (
              <p className="mt-2 text-xs xs:text-sm italic text-muted-foreground">{result.roman}</p>
            ) : null}
            <div className="mt-2 xs:mt-3 flex items-center gap-2">
              {!toKashmiri && (
                <button
                  onClick={() => handleSpeak(result.translation)}
                  aria-label="Read translation aloud"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] border border-border bg-secondary text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => handleCopy(result.translation)}
                aria-label="Copy translation"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] border border-border bg-secondary text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            {result.notes ? (
              <p className="mt-2 xs:mt-3 rounded-[8px] bg-card p-2.5 xs:p-3 text-xs xs:text-sm text-muted-foreground">💡 {result.notes}</p>
            ) : null}
          </div>
        ) : null}

        {/* History */}
        {history.length ? (
          <section className="mt-6 xs:mt-8">
            <div className="flex items-center justify-between gap-2 xs:gap-3">
              <h2 className="flex items-center gap-1.5 xs:gap-2 text-sm xs:text-base sm:text-lg font-semibold text-foreground">
                <History className="h-4 w-4" /> Recent translations
              </h2>
              <button
                onClick={() => {
                  persist([]);
                  toast.success("History cleared");
                }}
                className="inline-flex min-h-[44px] items-center gap-1 rounded-[8px] border border-border px-3 text-xs text-muted-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
            <ul className="mt-2 xs:mt-3 space-y-2">
              {history.map((h) => (
                <li
                  key={h.id}
                  className="flex items-start justify-between gap-2 rounded-[16px] border border-border bg-card p-3 border-s-4 border-s-primary/40"
                >
                  <button
                    onClick={() => {
                      setDirection(h.direction);
                      setText(h.source);
                      setResult({ translation: h.translation, roman: h.roman, notes: "" });
                    }}
                    className="min-w-0 flex-1 rounded text-left focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                      {h.direction === "en2ks" ? "English → کٲشُر" : "کٲشُر → English"}
                    </span>
                    <span
                      dir={h.direction === "en2ks" ? "ltr" : "rtl"}
                      className={`mt-1 block truncate text-xs xs:text-sm text-muted-foreground ${
                        h.direction === "en2ks" ? "" : "font-nastaliq text-base"
                      }`}
                    >
                      {h.source}
                    </span>
                    <span
                      dir={h.direction === "en2ks" ? "rtl" : "ltr"}
                      className={`mt-1 block text-foreground ${
                        h.direction === "en2ks" ? "font-nastaliq text-xl" : "text-sm"
                      }`}
                    >
                      {h.translation}
                    </span>
                    {h.roman ? (
                      <span className="mt-0.5 block text-xs italic text-muted-foreground">{h.roman}</span>
                    ) : null}
                  </button>
                  <div className="flex shrink-0 flex-col gap-1">
                    {h.direction !== "en2ks" && (
                      <button
                        onClick={() => handleSpeak(h.translation)}
                        aria-label="Read this translation aloud"
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] border border-border bg-secondary text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => persist(history.filter((x) => x.id !== h.id))}
                      aria-label="Remove from history"
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] border border-border bg-secondary text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Phrasebook */}
        <section className="mt-6 xs:mt-8">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Everyday phrases</h2>
          <p className="mt-1 text-xs xs:text-sm text-muted-foreground">Tap a phrase to load it, or press play to hear it.</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PHRASES.map((p) => (
              <li
                key={p.en}
                className="flex items-start justify-between gap-2 rounded-[16px] border border-border bg-card p-3.5 border-s-4 border-s-primary/50 shadow-sm transition-all hover:border-primary"
              >
                <button
                  onClick={() => {
                    setDirection("en2ks");
                    setText(p.en);
                    setResult(null);
                  }}
                  className="min-w-0 flex-1 text-left focus:outline-none focus:ring-2 focus:ring-ring rounded"
                >
                  <span className="block text-xs xs:text-sm font-medium text-foreground">{p.en}</span>
                  <span dir="rtl" className="mt-1 block font-nastaliq text-xl sm:text-2xl text-foreground">
                    {p.ks}
                  </span>
                  <span className="mt-0.5 block text-xs italic text-muted-foreground">{p.roman}</span>
                </button>
                <button
                  onClick={() => handleSpeak(p.ks)}
                  aria-label={`Hear "${p.en}" in Kashmiri`}
                  className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[8px] border border-border bg-secondary text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                  title="Press play to hear it"
                >
                  <Volume2 className="h-4 w-4 text-primary" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
