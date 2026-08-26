import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  GraduationCap,
  ImagePlus,
  Loader2,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  Volume2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { buildLesson, buildQuiz, type Lesson, type QuizQuestion } from "@/lib/learn.functions";
import { readImage } from "@/lib/vision.functions";
import { getSpeech } from "@/lib/ttsCache";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/learn")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Adaptive Learning — Teach any lesson in Kashmiri" },
      {
        name: "description",
        content:
          "Turn a textbook page into a grade-level lesson: concept extraction, simplification, local Kashmiri examples, mother-tongue explanation, audio and an adaptive quiz.",
      },
      { property: "og:title", content: "Adaptive Learning Engine — KashmirBot" },
      {
        property: "og:description",
        content:
          "Curriculum → simplified → localized → mother tongue. Teach, test, detect weak concepts and re-teach automatically.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LearnPage,
});

const PIPELINE = [
  "Teacher input",
  "Concept extraction",
  "Grade simplification",
  "Mother tongue",
  "Local examples",
  "Voice",
  "Quiz",
  "Weak concepts",
  "Re-teach",
];

const TOPICS = [
  { label: "Fractions", subject: "maths", text: "Grade lesson on fractions: numerator, denominator, equivalent fractions and comparing fractions." },
  { label: "Water cycle", subject: "science", text: "Grade lesson on the water cycle: evaporation, condensation, precipitation and collection." },
  { label: "Photosynthesis", subject: "science", text: "Grade lesson on photosynthesis: how green leaves make food using sunlight, water and carbon dioxide." },
  { label: "Gravity & force", subject: "science", text: "Grade lesson on force and gravity: push, pull, weight and why things fall down." },
  { label: "Multiplication", subject: "maths", text: "Grade lesson on multiplication: repeated addition, tables, and word problems." },
  { label: "Our environment", subject: "social", text: "Grade lesson on our environment: land, water, plants, animals and how people depend on them." },
];

const SUBJECTS = ["maths", "science", "social", "language", "general"];
const LANGS = [
  { value: "kashmiri", label: "Kashmiri (کٲشُر)" },
  { value: "urdu", label: "Urdu" },
  { value: "hindi", label: "Hindi" },
  { value: "english", label: "English" },
] as const;

type Lang = (typeof LANGS)[number]["value"];
type Stage = "setup" | "lesson" | "quiz" | "report";

function isRtl(lang: Lang) {
  return lang === "kashmiri" || lang === "urdu";
}

function LearnPage() {
  const runLesson = useServerFn(buildLesson);
  const runQuiz = useServerFn(buildQuiz);
  const runVision = useServerFn(readImage);

  const [stage, setStage] = useState<Stage>("setup");
  const [source, setSource] = useState("");
  const [grade, setGrade] = useState(5);
  const [subject, setSubject] = useState("maths");
  const [language, setLanguage] = useState<Lang>("kashmiri");

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [scores, setScores] = useState<Record<string, { correct: number; total: number }>>({});

  const [loading, setLoading] = useState<null | "lesson" | "quiz" | "ocr">(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [flagged, setFlagged] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const rtl = isRtl(language);

  useEffect(() => () => audioRef.current?.pause(), []);

  const weakConcepts = useMemo(
    () =>
      Object.entries(scores)
        .filter(([, s]) => s.total > 0 && s.correct / s.total < 0.5)
        .map(([c]) => c),
    [scores],
  );

  async function persistSession(next: Lesson, quizData: QuizQuestion[] = [], results = {}, weak: string[] = []) {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      if (sessionId) {
        await supabase
          .from("lesson_sessions")
          .update({ quiz: quizData, results, weak_concepts: weak, concepts: next.concepts })
          .eq("id", sessionId);
        return;
      }
      const { data } = await supabase
        .from("lesson_sessions")
        .insert({
          user_id: auth.user.id,
          title: next.title,
          grade,
          subject,
          target_language: language,
          source_text: source.slice(0, 8000),
          objective: next.objective,
          prerequisites: next.prerequisites,
          difficulty: next.difficulty,
          concepts: next.concepts,
        })
        .select("id")
        .single();
      if (data?.id) setSessionId(data.id);
    } catch {
      /* saving history is best-effort */
    }
  }

  async function generateLesson(weak?: string[]) {
    if (source.trim().length < 10) {
      toast.error("Paste a paragraph, upload a page, or pick a topic first.");
      return;
    }
    setLoading("lesson");
    try {
      const next = await runLesson({
        data: { source: source.trim(), grade, subject, language, weakConcepts: weak },
      });
      setLesson(next);
      setQuiz([]);
      setAnswers({});
      setStage("lesson");
      void persistSession(next);
      toast.success(weak?.length ? "Re-taught with a simpler explanation" : "Lesson ready");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not build the lesson.");
    } finally {
      setLoading(null);
    }
  }

  async function generateQuiz(easier = false) {
    if (!lesson) return;
    setLoading("quiz");
    try {
      const concepts = (easier && weakConcepts.length ? weakConcepts : lesson.concepts.map((c) => c.name_en)).slice(0, 6);
      const questions = await runQuiz({
        data: { concepts, grade, subject, language, perConcept: 3, easier },
      });
      setQuiz(questions);
      setAnswers({});
      setStage("quiz");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not build the quiz.");
    } finally {
      setLoading(null);
    }
  }

  function submitQuiz() {
    const tally: Record<string, { correct: number; total: number }> = {};
    quiz.forEach((q, i) => {
      const key = q.concept;
      tally[key] ??= { correct: 0, total: 0 };
      tally[key].total += 1;
      const given = (answers[i] ?? "").trim().toLowerCase();
      const expected = q.answer.trim().toLowerCase();
      if (given && (given === expected || (expected.length > 3 && given.includes(expected)))) {
        tally[key].correct += 1;
      }
    });
    setScores(tally);
    setStage("report");
    const weak = Object.entries(tally)
      .filter(([, s]) => s.correct / s.total < 0.5)
      .map(([c]) => c);
    if (lesson) void persistSession(lesson, quiz, tally, weak);
  }

  async function listen(id: string, text: string) {
    if (!text.trim()) return;
    audioRef.current?.pause();
    if (speaking === id) {
      setSpeaking(null);
      return;
    }
    setSpeaking(id);
    try {
      const clip = await getSpeech(text);
      const audio = new Audio(`data:${clip.mime};base64,${clip.audio}`);
      audioRef.current = audio;
      audio.onended = () => setSpeaking(null);
      await audio.play();
    } catch {
      setSpeaking(null);
      toast.error("Audio is unavailable right now.");
    }
  }

  async function flag(concept: string, kind: string) {
    setFlagged((f) => ({ ...f, [concept]: kind }));
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        toast.info("Sign in to send corrections to the team.");
        return;
      }
      await supabase.from("lesson_corrections").insert({
        session_id: sessionId,
        user_id: auth.user.id,
        concept,
        kind,
      });
      toast.success(kind === "good" ? "Thanks — marked as a good explanation" : "Correction recorded");
    } catch {
      toast.error("Could not save the correction.");
    }
  }

  async function onImage(file: File) {
    setLoading("ocr");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      const res = await runVision({ data: { imageData: dataUrl } });
      if (!res.extracted.trim()) {
        toast.error("No readable text found on that page.");
        return;
      }
      setSource((prev) => (prev ? `${prev}\n\n${res.extracted}` : res.extracted));
      toast.success("Textbook page read");
    } catch {
      toast.error("Could not read that page.");
    } finally {
      setLoading(null);
    }
  }

  const activeStep =
    stage === "setup" ? 0 : stage === "lesson" ? 4 : stage === "quiz" ? 6 : 8;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" /> Chat
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 truncate text-lg font-bold text-foreground">
              <GraduationCap className="h-5 w-5 shrink-0 text-primary" /> Adaptive Learning
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Curriculum → simplified → localized → mother tongue
            </p>
          </div>
          <Link
            to="/translate"
            className="hidden min-h-[44px] items-center rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-accent sm:inline-flex"
          >
            Translate
          </Link>
        </div>

        {/* Pipeline visual */}
        <div className="overflow-x-auto border-t border-border/60">
          <ol className="mx-auto flex max-w-4xl items-center gap-1 px-4 py-2 text-[11px]">
            {PIPELINE.map((step, i) => (
              <li key={step} className="flex shrink-0 items-center gap-1">
                <span
                  className={`rounded-full px-2 py-1 font-medium ${
                    i <= activeStep
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
                {i < PIPELINE.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </li>
            ))}
          </ol>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5 pb-24">
        {stage === "setup" && (
          <section className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <BookOpen className="h-4 w-4 text-primary" /> 1. Lesson input
              </h2>
              <textarea
                value={source}
                onChange={(e) => setSource(e.target.value)}
                rows={7}
                placeholder="Paste a textbook paragraph, or upload a textbook page below…"
                className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onImage(f);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={loading === "ocr"}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
                >
                  {loading === "ocr" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  Upload textbook page
                </button>
                {source && (
                  <button
                    onClick={() => setSource("")}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-accent"
                  >
                    <X className="h-4 w-4" /> Clear
                  </button>
                )}
              </div>

              <p className="mt-4 mb-2 text-xs font-medium text-muted-foreground">Or pick a topic</p>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => {
                      setSubject(t.subject);
                      setSource(t.text);
                    }}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
              <label className="text-xs font-medium text-muted-foreground">
                Grade
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="mt-1 h-11 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Subject
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 h-11 w-full rounded-md border border-input bg-background px-2 text-sm capitalize text-foreground"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Mother tongue
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Lang)}
                  className="mt-1 h-11 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"
                >
                  {LANGS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              onClick={() => generateLesson()}
              disabled={loading === "lesson"}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {loading === "lesson" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Create lesson session
            </button>
          </section>
        )}

        {stage !== "setup" && lesson && (
          <section className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-foreground">{lesson.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Objective:</span> {lesson.objective}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold capitalize text-primary">
                  Grade {grade} · {lesson.difficulty}
                </span>
              </div>
              {lesson.prerequisites.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium">Prerequisites:</span> {lesson.prerequisites.join(", ")}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setStage("setup")}
                  className="min-h-[40px] rounded-md border border-border px-3 text-sm text-foreground hover:bg-accent"
                >
                  New lesson
                </button>
                {stage === "lesson" && (
                  <button
                    onClick={() => generateQuiz(false)}
                    disabled={loading === "quiz"}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  >
                    {loading === "quiz" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Generate quiz
                  </button>
                )}
              </div>
            </div>

            {stage === "lesson" &&
              lesson.concepts.map((c, i) => {
                const id = `c${i}`;
                return (
                  <article key={id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        {i + 1}. {c.name_en}
                      </h3>
                      <span
                        dir={rtl ? "rtl" : "ltr"}
                        className={`text-sm font-semibold text-primary ${rtl ? "font-nastaliq" : ""}`}
                      >
                        {c.name_target}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-foreground">{c.simplified_en}</p>

                    <p
                      dir={rtl ? "rtl" : "ltr"}
                      className={`mt-3 rounded-lg bg-muted/60 p-3 text-base leading-loose text-foreground ${rtl ? "font-nastaliq" : ""}`}
                    >
                      {c.explanation_target}
                    </p>

                    <div className="mt-3 rounded-lg border border-dashed border-border p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Local example · {c.example_title}
                      </p>
                      <p className="mt-1 text-sm text-foreground">{c.example_en}</p>
                      <p
                        dir={rtl ? "rtl" : "ltr"}
                        className={`mt-1 text-base leading-loose text-foreground ${rtl ? "font-nastaliq" : ""}`}
                      >
                        {c.example_target}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => listen(id, `${c.explanation_target} ${c.example_target}`)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-accent"
                      >
                        {speaking === id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                        {speaking === id ? "Playing…" : "Listen"}
                      </button>
                      <div className="ml-auto flex flex-wrap items-center gap-1.5">
                        {flagged[c.name_en] ? (
                          <span className="text-xs font-medium text-primary">Feedback saved</span>
                        ) : (
                          <>
                            <button
                              onClick={() => flag(c.name_en, "good")}
                              className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-border px-2 text-xs text-foreground hover:bg-accent"
                            >
                              <ThumbsUp className="h-3.5 w-3.5" /> Good
                            </button>
                            {["Bad translation", "Bad example", "Wrong difficulty"].map((k) => (
                              <button
                                key={k}
                                onClick={() => flag(c.name_en, k.toLowerCase())}
                                className="min-h-[36px] rounded-md border border-border px-2 text-xs text-muted-foreground hover:bg-accent"
                              >
                                {k}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}

            {stage === "quiz" && (
              <div className="space-y-3">
                {quiz.map((q, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {q.concept} · {q.type}
                    </p>
                    <p className="mt-1 text-sm text-foreground">{q.question_en}</p>
                    <p
                      dir={rtl ? "rtl" : "ltr"}
                      className={`mt-1 text-base leading-loose text-foreground ${rtl ? "font-nastaliq" : ""}`}
                    >
                      {q.question_target}
                    </p>
                    {q.type === "mcq" && q.options.length > 0 ? (
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setAnswers((a) => ({ ...a, [i]: opt }))}
                            className={`min-h-[44px] rounded-md border px-3 text-left text-sm ${
                              answers[i] === opt
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-foreground hover:bg-accent"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        value={answers[i] ?? ""}
                        onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
                        placeholder="Your answer"
                        className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={submitQuiz}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Check className="h-4 w-4" /> Submit answers
                </button>
              </div>
            )}

            {stage === "report" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground">Concept mastery</h3>
                  <ul className="mt-3 space-y-3">
                    {Object.entries(scores).map(([concept, s]) => {
                      const pct = Math.round((s.correct / s.total) * 100);
                      return (
                        <li key={concept}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{concept}</span>
                            <span className={pct < 50 ? "font-semibold text-destructive" : "text-muted-foreground"}>
                              {pct}%
                            </span>
                          </div>
                          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${pct < 50 ? "bg-destructive" : "bg-primary"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground">
                    {weakConcepts.length ? "Weak concepts detected" : "No weak concepts — well done"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {weakConcepts.length
                      ? `The student needs re-teaching on: ${weakConcepts.join(", ")}. The next explanation will be simpler, with a different local example and easier practice.`
                      : "You can still re-run the quiz or start a new lesson."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {weakConcepts.length > 0 && (
                      <button
                        onClick={() => generateLesson(weakConcepts)}
                        disabled={loading === "lesson"}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                      >
                        {loading === "lesson" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Re-teach weak concepts
                      </button>
                    )}
                    <button
                      onClick={() => generateQuiz(weakConcepts.length > 0)}
                      disabled={loading === "quiz"}
                      className="min-h-[44px] rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-60"
                    >
                      {weakConcepts.length ? "Easier re-test" : "New quiz"}
                    </button>
                    <button
                      onClick={() => setStage("lesson")}
                      className="min-h-[44px] rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      Back to lesson
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
