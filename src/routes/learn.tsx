import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Download,
  FileText,
  GraduationCap,
  History,
  ImagePlus,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  ThumbsUp,
  Volume2,
  X,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

import { buildLesson, buildQuiz, type Lesson, type QuizQuestion } from "@/lib/learn.functions";
import { readImage } from "@/lib/vision.functions";
import { ConceptDiagram } from "@/components/learn/ConceptDiagram";
import { LessonPrintView } from "@/components/learn/LessonPrintView";
import { LessonChat } from "@/components/learn/LessonChat";
import { LessonHistoryView } from "@/components/learn/LessonHistoryView";
import { QuizReviewDialog } from "@/components/learn/QuizReviewDialog";
import { SyllabusDialog, type TopicInfo } from "@/components/learn/SyllabusDialog";
import { getSpeech } from "@/lib/ttsCache";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  loadLessonProgress,
  saveLessonCompletion,
  loadLessonHistory,
  saveLessonHistoryItem,
  deleteLessonHistoryItem,
  type LessonProgress,
  type LessonHistoryItem,
} from "@/lib/lesson-progress";

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

const TOPICS: (TopicInfo & { text: string })[] = [
  {
    id: "fractions",
    trackId: "fractions",
    label: "Fractions",
    kashmiriLabel: "ہِصہٕ",
    subject: "maths",
    grade: 5,
    description: "Parts of a whole, numerator/denominator, proper, improper, mixed numbers, and Kashmiri Wazwan sharing.",
    text: "Grade 5 lesson on fractions: parts of a whole, proper/improper fractions, mixed numbers, and equivalent fractions.",
  },
  {
    id: "water-cycle",
    trackId: "water-cycle",
    label: "Water Cycle",
    kashmiriLabel: "آبُک چَکَر",
    subject: "science",
    grade: 4,
    description: "Evaporation from Dal lake, cloud condensation, precipitation (rain & snow), and water conservation.",
    text: "Grade 4 lesson on the water cycle: evaporation, condensation, precipitation, and collection.",
  },
  {
    id: "atoms",
    trackId: "atoms",
    label: "Atoms & Molecules",
    kashmiriLabel: "ایٹَم تہٕ مالیکیول",
    subject: "science",
    grade: 8,
    description: "Atomic structure, protons, neutrons, electrons, chemical bonding, and molecules.",
    text: "Grade 8 lesson on atoms and molecules: atomic structure, nucleus, protons, neutrons, electrons, and chemical bonds.",
  },
  {
    id: "photosynthesis",
    trackId: "photosynthesis",
    label: "Photosynthesis",
    kashmiriLabel: "فوٹوسِنتھِسِس",
    subject: "science",
    grade: 6,
    description: "How green leaves of Chinar and apple orchards make food using sunlight, water, and carbon dioxide.",
    text: "Grade 6 lesson on photosynthesis: how green leaves make food using sunlight, water and carbon dioxide.",
  },
  {
    id: "environment",
    trackId: "environment",
    label: "Our Environment",
    kashmiriLabel: "ہمارا ماحول",
    subject: "social",
    grade: 4,
    description: "Ecosystems, Dal lake & Chinar preservation, pollution prevention, and protecting Kashmir's nature.",
    text: "Grade 4 lesson on our environment: land, water, plants, animals and how people depend on them.",
  },
  {
    id: "multiplication",
    trackId: "multiplication",
    label: "Multiplication",
    kashmiriLabel: "ضَرَب",
    subject: "maths",
    grade: 3,
    description: "Repeated addition, times tables, double-digit multiplication, and everyday Kashmiri market word problems.",
    text: "Grade 3 lesson on multiplication: repeated addition, tables, and word problems.",
  },
  {
    id: "gravity",
    trackId: "gravity",
    label: "Gravity & Force",
    kashmiriLabel: "طاقَت تہٕ کَششِ ثِقَل",
    subject: "science",
    grade: 6,
    description: "Push, pull, friction on icy snow, Earth's gravity, mass vs weight, and balanced forces.",
    text: "Grade 6 lesson on force and gravity: push, pull, weight and why things fall down.",
  },
  {
    id: "electricity",
    trackId: "electricity",
    label: "Electricity & Circuits",
    kashmiriLabel: "بِجلی تہٕ سَرکَٹ",
    subject: "science",
    grade: 6,
    description: "Electric current, simple circuits, conductors, insulators, switches, and electrical safety.",
    text: "Grade 6 lesson on electricity and circuits: current, circuits, conductors, insulators, and safe switches.",
  },
  {
    id: "matter",
    trackId: "matter",
    label: "States of Matter",
    kashmiriLabel: "مادٕ ہِنٛزِ حالَتہٕ",
    subject: "science",
    grade: 5,
    description: "Solids, liquids, gases, melting ice (Shin), boiling Samovar Kahwa, and states of matter changes.",
    text: "Grade 5 lesson on states of matter: solid, liquid, gas, melting, freezing, and evaporation.",
  },
  {
    id: "solar-system",
    trackId: "solar-system",
    label: "Solar System & Earth",
    kashmiriLabel: "نِظامِ شَمسی",
    subject: "science",
    grade: 5,
    description: "The Sun, 8 planets, Earth's rotation & revolution, day and night, and changing seasons in Kashmir.",
    text: "Grade 5 lesson on the solar system: Sun, planets, Earth's rotation, day/night and seasons.",
  },
];

const SUBJECTS = ["maths", "science", "social", "language", "general"];
const LANGS = [
  { value: "kashmiri", label: "Kashmiri (کٲشُر)" },
  { value: "urdu", label: "Urdu (اردو)" },
] as const;

type ExtractedPage = { id: string; label: string; text: string; selected: boolean };

type Lang = (typeof LANGS)[number]["value"];
type Stage = "setup" | "lesson" | "quiz" | "report";

/** A pre-generated lesson + quiz in a structured topic curriculum track. */
type DemoPack = {
  id: string;
  trackId?: string;
  trackTitle?: string;
  trackOrder?: number;
  totalInTrack?: number;
  nextLessonId?: string | null;
  label: string;
  grade: number;
  subject: string;
  language: Lang;
  source: string;
  lesson: Lesson;
  quiz: QuizQuestion[];
};

function isRtl(lang: Lang) {
  return lang === "kashmiri" || lang === "urdu";
}

function LearnPage() {
  const runLesson = useServerFn(buildLesson);
  const runQuiz = useServerFn(buildQuiz);
  const runVision = useServerFn(readImage);

  const [stage, setStage] = useState<Stage>("setup");
  const [activeTab, setActiveTab] = useState<"learn" | "history">("learn");
  const [source, setSource] = useState("");
  const [grade, setGrade] = useState(5);
  const [subject, setSubject] = useState("maths");
  const [language, setLanguage] = useState<Lang>("kashmiri");

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [graded, setGraded] = useState<Record<number, boolean>>({});
  const [scores, setScores] = useState<Record<string, { correct: number; total: number }>>({});

  const [loading, setLoading] = useState<null | "lesson" | "quiz" | "ocr" | "pdf">(null);
  const [pdfStatus, setPdfStatus] = useState("");
  const [extracted, setExtracted] = useState<ExtractedPage[]>([]);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [flagged, setFlagged] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const rtl = isRtl(language);

  const [packs, setPacks] = useState<DemoPack[]>([]);
  const [progress, setProgress] = useState<LessonProgress>({});
  const [history, setHistory] = useState<LessonHistoryItem[]>([]);
  const [reviewHistoryItem, setReviewHistoryItem] = useState<LessonHistoryItem | null>(null);
  const [activePackId, setActivePackId] = useState<string | null>(null);
  const [progressLanguage, setProgressLanguage] = useState<Lang>("kashmiri");
  const [syllabusTopic, setSyllabusTopic] = useState<TopicInfo | null>(null);
  const [syllabusOpen, setSyllabusOpen] = useState(false);

  useEffect(() => () => audioRef.current?.pause(), []);

  // Load progress and history from device storage (Capacitor Preferences + localStorage)
  useEffect(() => {
    let active = true;
    void loadLessonProgress().then((saved) => {
      if (active) setProgress((current) => ({ ...saved, ...current }));
    });
    void loadLessonHistory().then((savedHistory) => {
      if (active) setHistory(savedHistory);
    });

    // Cloud synchronization if user is authenticated with Supabase
    void (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;
        const { data: cloudSessions } = await supabase
          .from("lesson_sessions")
          .select("*")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false });

        if (cloudSessions && cloudSessions.length && active) {
          setHistory((prev) => {
            const map = new Map(prev.map((item) => [item.id, item]));
            for (const s of cloudSessions) {
              if (s.results && typeof s.results === "object" && Object.keys(s.results).length > 0) {
                const tally = s.results as Record<string, { correct: number; total: number }>;
                const total = Object.values(tally).reduce((a, b) => a + b.total, 0);
                const correct = Object.values(tally).reduce((a, b) => a + b.correct, 0);
                const id = s.id;
                if (!map.has(id)) {
                  const item: LessonHistoryItem = {
                    id,
                    lessonId: `cloud-${s.id}`,
                    title: s.title || "Lesson",
                    grade: s.grade,
                    subject: s.subject,
                    language: s.target_language,
                    completedAt: s.created_at,
                    score: {
                      correct,
                      total,
                      percentage: total ? Math.round((correct / total) * 100) : 0,
                    },
                    weakConcepts: (s.weak_concepts as string[]) || [],
                    conceptScores: tally,
                    quiz: Array.isArray(s.quiz) ? (s.quiz as any) : [],
                    source: s.source_text,
                  };
                  map.set(id, item);
                }
              }
            }
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
            );
          });
        }
      } catch {
        /* Best-effort cloud sync */
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Pre-generated demo lessons ship with the app so /learn works offline.
  useEffect(() => {
    let alive = true;
    fetch("/offline-lessons.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (alive && Array.isArray(json?.packs)) setPacks(json.packs as DemoPack[]);
      })
      .catch(() => {
        /* demo packs are optional */
      });
    return () => {
      alive = false;
    };
  }, []);

  function loadPack(pack: DemoPack) {
    audioRef.current?.pause();
    setSpeaking(null);
    setGrade(pack.grade);
    setSubject(pack.subject);
    setLanguage(pack.language);
    setSource(pack.source);
    setLesson(pack.lesson);
    setQuiz(pack.quiz);
    setAnswers({});
    setGraded({});
    setScores({});
    setSessionId(null);
    setActivePackId(pack.id);
    setProgressLanguage(pack.language);
    setStage("lesson");
    setActiveTab("learn");
    void persistSession(pack.lesson, pack.quiz);
    toast.success(`${pack.lesson.title} — ready`);
  }

  function handleSelectTopic(t: (typeof TOPICS)[number]) {
    setSubject(t.subject);
    setSource(t.text);

    // Look for matching progressive track
    const targetTrackId = t.trackId || t.label.toLowerCase();
    const trackPacks = packs
      .filter(
        (p) =>
          (p.trackId === targetTrackId ||
            p.id.startsWith(targetTrackId) ||
            p.label.toLowerCase().includes(t.label.toLowerCase())) &&
          p.language === language
      )
      .sort((a, b) => (a.trackOrder ?? 0) - (b.trackOrder ?? 0));

    if (trackPacks.length > 0) {
      // Find first uncompleted in track, or the first lesson
      const uncompleted = trackPacks.find((p) => !progress[p.id]);
      const targetPack = uncompleted || trackPacks[0];
      loadPack(targetPack);
    } else {
      setActivePackId(null);
    }
  }

  function handleOpenSyllabus(topic: TopicInfo) {
    setSyllabusTopic(topic);
    setSyllabusOpen(true);
  }

  function handleReteachFromHistory(item: LessonHistoryItem) {
    if (item.lesson) {
      setLesson(item.lesson as Lesson);
    }
    setGrade(item.grade);
    setSubject(item.subject);
    setLanguage(item.language as Lang);
    setProgressLanguage(item.language as Lang);
    setSource(item.source || item.title);
    setActivePackId(item.lessonId);
    void generateLesson(item.weakConcepts);
  }

  const weakConcepts = useMemo(
    () =>
      Object.entries(scores)
        .filter(([, s]) => s.total > 0 && s.correct / s.total < 0.5)
        .map(([c]) => c),
    [scores]
  );

  const answeredCount = useMemo(
    () => quiz.filter((_, i) => (answers[i] ?? "").trim().length > 0).length,
    [quiz, answers]
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
    if (source.trim().length < 10 && !weak?.length) {
      toast.error("Paste a paragraph, upload a page, or pick a topic first.");
      return;
    }
    setLoading("lesson");
    try {
      const next = await runLesson({
        data: { source: source.trim() || (lesson?.title ?? "Lesson"), grade, subject, language, weakConcepts: weak },
      });
      setLesson(next);

      // Check if source matches a ready-made pack
      const packMatch = packs.find(
        (p) =>
          p.language === language &&
          (source.toLowerCase().includes(p.label.toLowerCase()) ||
            p.lesson.title.toLowerCase().includes(next.title.toLowerCase()))
      );
      if (packMatch) {
        setActivePackId(packMatch.id);
      } else if (!weak?.length) {
        const slug = (next.title || "lesson").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
        setActivePackId(`custom-${slug}-g${grade}-${language}`);
      }

      setQuiz([]);
      setAnswers({});
      setGraded({});
      setStage("lesson");
      void persistSession(next);
      toast.success(weak?.length ? "Re-taught with a simpler explanation" : "Lesson ready");
    } catch (err) {
      // Seamless offline re-teaching fallback when AI is not configured
      if (weak?.length && lesson) {
        const reteachConcepts = weak.map((weakName) => {
          const original = lesson.concepts.find(
            (c) =>
              c.name_en.toLowerCase() === weakName.toLowerCase() ||
              weakName.toLowerCase().includes(c.name_en.toLowerCase())
          );
          if (original) {
            return {
              ...original,
              simplified_en: `Simpler breakdown: ${original.simplified_en}`,
              explanation_target: `آسان وَضاحَت: ${original.explanation_target}`,
            };
          }
          return {
            name_en: weakName,
            name_target: `${weakName} (آسان وَضاحَت)`,
            simplified_en: `Focus on the core idea of ${weakName}: it is a fundamental part of ${lesson.title}.`,
            explanation_target: `${weakName} چھُ اکھ اَہَم نُکتہٕ۔ اَتھ اَصٕل پٲٹھؠ سَمجھنہِ خٲطرٕ صوچِو۔`,
            example_title: `${weakName} Review`,
            example_en: `Take your time to understand ${weakName} before testing again.`,
            example_target: `دوبارٕ پرکھنہٕ برٛونٛہہ یہِ نُکتہٕ اَصٕل پٲٹھؠ صوچِو۔`,
            diagram: null,
          };
        });

        const reteachLesson: Lesson = {
          title: `Re-teaching: ${weak.join(", ")}`,
          objective: `Clear up weak concepts from ${lesson.title} with simpler explanations.`,
          prerequisites: ["Previous lesson attempt"],
          difficulty: "easy",
          concepts: reteachConcepts,
        };

        setLesson(reteachLesson);
        setQuiz([]);
        setAnswers({});
        setGraded({});
        setStage("lesson");
        toast.success(`Re-teaching ready: simplified explanation for ${weak.join(", ")}`);
        return;
      }
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
      setGraded({});
      setStage("quiz");
    } catch (err) {
      // Offline fallback: if quiz questions exist or weak concepts exist, generate targeted quiz
      if (lesson && quiz.length > 0) {
        const targetConcepts = easier && weakConcepts.length ? weakConcepts : lesson.concepts.map((c) => c.name_en);
        const filtered = quiz.filter((q) =>
          targetConcepts.some((tc) => tc.toLowerCase() === q.concept.toLowerCase())
        );
        if (filtered.length > 0) {
          setQuiz(filtered);
          setAnswers({});
          setGraded({});
          setStage("quiz");
          toast.success("Practice quiz ready!");
          return;
        }
      }
      toast.error(err instanceof Error ? err.message : "Could not build the quiz.");
    } finally {
      setLoading(null);
    }
  }

  function isCorrect(q: QuizQuestion, given: string) {
    const g = given.trim().toLowerCase();
    const expected = q.answer.trim().toLowerCase();
    if (!g) return false;
    return g === expected || (expected.length > 3 && (g.includes(expected) || expected.includes(g)));
  }

  function submitQuiz() {
    const unanswered = quiz.filter((_, i) => !(answers[i] ?? "").trim()).length;
    if (unanswered === quiz.length) {
      toast.error("Answer at least one question first.");
      return;
    }
    if (unanswered > 0) {
      toast.info(`${unanswered} question(s) left blank — counted as incorrect.`);
    }

    const tally: Record<string, { correct: number; total: number }> = {};
    const marks: Record<number, boolean> = {};
    quiz.forEach((q, i) => {
      const key = q.concept;
      tally[key] ??= { correct: 0, total: 0 };
      tally[key].total += 1;
      const ok = isCorrect(q, answers[i] ?? "");
      marks[i] = ok;
      if (ok) tally[key].correct += 1;
    });

    const correctCount = Object.values(marks).filter(Boolean).length;
    const totalCount = quiz.length;
    setGraded(marks);
    setScores(tally);
    setStage("report");

    // Determine lesson identifier for tracking
    const currentLessonId =
      activePackId ||
      `custom-${(lesson?.title || "lesson").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}-g${grade}-${language}`;

    // 1. Track ready-made & custom quiz completion in device storage (Capacitor Preferences + localStorage)
    setProgress((previous) =>
      saveLessonCompletion(previous, currentLessonId, correctCount, totalCount, language, {
        title: lesson?.title,
        grade,
        subject,
      })
    );

    const weak = Object.entries(tally)
      .filter(([, s]) => s.correct / s.total < 0.5)
      .map(([c]) => c);

    if (weak.length) {
      toast.info(`Weak concept(s): ${weak.join(", ")} — re-teaching is ready.`);
    }

    // 2. Save comprehensive history entry in device storage and state
    const historyEntry: LessonHistoryItem = {
      id: sessionId || `session-${Date.now()}`,
      lessonId: currentLessonId,
      title: lesson?.title || "Lesson",
      grade,
      subject,
      language,
      completedAt: new Date().toISOString(),
      score: {
        correct: correctCount,
        total: totalCount,
        percentage: totalCount ? Math.round((correctCount / totalCount) * 100) : 0,
      },
      weakConcepts: weak,
      conceptScores: tally,
      quiz: quiz.map((q, i) => ({
        concept: q.concept,
        type: q.type,
        question_en: q.question_en,
        question_target: q.question_target,
        options: q.options,
        answer: q.answer,
        answer_target: q.answer_target,
        userAnswer: answers[i] ?? "",
        isCorrect: marks[i] ?? false,
      })),
      lesson: lesson ?? undefined,
      source: source,
    };

    void saveLessonHistoryItem(historyEntry).then((updatedList) => {
      setHistory(updatedList);
    });

    if (lesson) void persistSession(lesson, quiz, tally, weak);
    toast.success(`Quiz recorded · ${correctCount}/${totalCount} correct`);
  }

  // Active track and sequential curriculum progression
  const visiblePacks = packs.filter((pack) => pack.language === progressLanguage);
  const completedCount = visiblePacks.filter((pack) => Boolean(progress[pack.id])).length;
  const currentPack = packs.find((p) => p.id === activePackId);

  // Group visible packs by sequential topic tracks
  const tracksMap = useMemo(() => {
    const map: Record<string, { id: string; title: string; packs: DemoPack[]; completed: number }> = {};
    for (const pack of visiblePacks) {
      const tid = pack.trackId || pack.id.split("-")[0] || "general";
      if (!map[tid]) {
        const topicDef = TOPICS.find((t) => t.trackId === tid);
        map[tid] = {
          id: tid,
          title:
            pack.trackTitle ||
            (topicDef ? `${topicDef.label} (${topicDef.kashmiriLabel || ""})` : tid),
          packs: [],
          completed: 0,
        };
      }
      map[tid].packs.push(pack);
      if (progress[pack.id]) map[tid].completed += 1;
    }
    for (const track of Object.values(map)) {
      track.packs.sort((a, b) => (a.trackOrder ?? 0) - (b.trackOrder ?? 0));
    }
    return map;
  }, [visiblePacks, progress]);

  // Current track ID
  const currentTrackId =
    currentPack?.trackId ||
    TOPICS.find((t) => activePackId?.startsWith(t.trackId))?.trackId ||
    null;

  // Find the NEXT lesson in the SAME TOPIC TRACK
  const nextTrackPack = useMemo(() => {
    if (!currentTrackId) {
      // If no track, default to the first uncompleted pack
      return visiblePacks.find((p) => !progress[p.id]) ?? null;
    }

    const currentTrack = tracksMap[currentTrackId];
    if (!currentTrack) return null;

    if (currentPack?.nextLessonId) {
      const explicitNext = currentTrack.packs.find((p) => p.id === currentPack.nextLessonId);
      if (explicitNext) return explicitNext;
    }

    const currentOrder = currentPack?.trackOrder ?? 0;
    // Sequential next lesson in this topic track (Lesson 1 -> Lesson 2 -> Lesson 3...)
    const nextInOrder = currentTrack.packs.find((p) => (p.trackOrder ?? 0) > currentOrder);
    if (nextInOrder) return nextInOrder;

    // Or any uncompleted lesson within the same topic track
    return currentTrack.packs.find((p) => !progress[p.id] && p.id !== activePackId) ?? null;
  }, [tracksMap, currentTrackId, currentPack, progress, activePackId, visiblePacks]);

  // Overall up next pack for setup view
  const overallNextPack = useMemo(() => {
    return nextTrackPack || visiblePacks.find((p) => !progress[p.id]) || null;
  }, [nextTrackPack, visiblePacks, progress]);

  function advanceToNextLesson() {
    // 1. If there is a next lesson in the SAME track, ALWAYS load that next lesson!
    if (nextTrackPack) {
      loadPack(nextTrackPack);
      toast.success(`Next in track: ${nextTrackPack.lesson.title}`);
      return;
    }

    // 2. If the current track is finished, find the first lesson of the next track
    const allTrackIds = Object.keys(tracksMap);
    const currentTrackIdx = allTrackIds.indexOf(currentTrackId || "");
    const nextTrackId = allTrackIds[(currentTrackIdx + 1) % allTrackIds.length];
    const nextTrack = tracksMap[nextTrackId];

    if (nextTrack && nextTrack.packs.length > 0) {
      const firstUnfinished = nextTrack.packs.find((p) => !progress[p.id]) || nextTrack.packs[0];
      loadPack(firstUnfinished);
      toast.success(`Module completed! Starting next topic: ${firstUnfinished.lesson.title}`);
      return;
    }

    setStage("setup");
    toast.success("Curriculum completed! Select a new topic.");
  }

  // Resume or review from history
  function handleContinueFromHistory(item: LessonHistoryItem) {
    if (item.lesson) {
      setLesson(item.lesson as Lesson);
      setGrade(item.grade);
      setSubject(item.subject);
      setLanguage(item.language as Lang);
      setProgressLanguage(item.language as Lang);
      setSource(item.source || "");
      setActivePackId(item.lessonId);
      setStage("lesson");
      setActiveTab("learn");
      toast.success(`Resumed: ${item.title}`);
      return;
    }

    // Look up pack
    const pack = packs.find((p) => p.id === item.lessonId);
    if (pack) {
      loadPack(pack);
      return;
    }

    setGrade(item.grade);
    setSubject(item.subject);
    setLanguage(item.language as Lang);
    setProgressLanguage(item.language as Lang);
    setSource(item.source || item.title);
    setActiveTab("learn");
    setStage("setup");
    toast.info(`Loaded topic for ${item.title}`);
  }

  function handleRetakeFromHistory(item: LessonHistoryItem) {
    handleContinueFromHistory(item);
    setTimeout(() => {
      setAnswers({});
      setGraded({});
      setStage("quiz");
    }, 150);
  }

  async function handleDeleteHistory(id: string) {
    const updated = await deleteLessonHistoryItem(id);
    setHistory(updated);
    toast.success("History record removed");
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

  async function onPdf(file: File) {
    setLoading("pdf");
    setPdfStatus("Opening PDF…");
    try {
      const { extractPdf } = await import("@/lib/pdf");
      const extraction = await extractPdf(file, (done, total) =>
        setPdfStatus(`Reading page ${done} of ${total}…`)
      );

      const pages: ExtractedPage[] = [];

      for (const page of extraction.pages) {
        let text = page.text.trim();
        let ocr = false;
        if (!text && page.imageData) {
          setPdfStatus(`Scanning page ${page.page} with OCR…`);
          ocr = true;
          try {
            const res = await runVision({ data: { imageData: page.imageData } });
            text = res.extracted.trim();
          } catch {
            /* skip unreadable page */
          }
        }
        if (text) {
          pages.push({
            id: `${file.name}-p${page.page}-${Date.now()}`,
            label: `Page ${page.page}${ocr ? " (OCR)" : ""}`,
            text,
            selected: true,
          });
        }
      }

      if (!pages.length) {
        toast.error("No readable text found in that PDF.");
        return;
      }
      setExtracted((prev) => [...prev, ...pages]);
      toast.success(`Extracted text from ${pages.length} page(s) — review below`);
    } catch {
      toast.error("Could not read that PDF.");
    } finally {
      setLoading(null);
      setPdfStatus("");
    }
  }

  function exportPdf() {
    if (!lesson) return;
    toast.info("Choose “Save as PDF” in the print dialog to store the lesson offline.");
    setTimeout(() => window.print(), 120);
  }

  function updatePage(id: string, patch: Partial<ExtractedPage>) {
    setExtracted((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function useSelectedText() {
    const chosen = extracted.filter((p) => p.selected && p.text.trim());
    if (!chosen.length) {
      toast.error("Select at least one page first.");
      return;
    }
    const combined = chosen.map((p) => p.text.trim()).join("\n\n");
    setSource((prev) => (prev ? `${prev}\n\n${combined}` : combined));
    toast.success(`Added ${chosen.length} page(s) to the lesson text`);
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
      setExtracted((prev) => [
        ...prev,
        {
          id: `${file.name}-${Date.now()}`,
          label: `${file.name} (OCR)`,
          text: res.extracted.trim(),
          selected: true,
        },
      ]);
      toast.success("Textbook page read — review below");
    } catch {
      toast.error("Could not read that page.");
    } finally {
      setLoading(null);
    }
  }

  const activeStep = stage === "setup" ? 0 : stage === "lesson" ? 4 : stage === "quiz" ? 6 : 8;

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
              Curriculum Tracks → simplified → localized → mother tongue
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
                    i <= activeStep ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
                {i < PIPELINE.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </li>
            ))}
          </ol>
        </div>

        {/* Sub Navigation: Explore vs History */}
        {stage === "setup" && (
          <div className="border-t border-border/60 bg-muted/20">
            <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-2">
              <Button
                variant={activeTab === "learn" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("learn")}
                className="gap-1.5 text-xs font-semibold"
              >
                <BookOpen className="h-3.5 w-3.5" /> Topic Curriculum Tracks
              </Button>
              <Button
                variant={activeTab === "history" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("history")}
                className="gap-1.5 text-xs font-semibold"
              >
                <History className="h-3.5 w-3.5" /> My History &amp; Quizzes
                {history.length > 0 && (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      activeTab === "history" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
                    }`}
                  >
                    {history.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5 pb-24">
        {stage === "setup" && activeTab === "history" && (
          <LessonHistoryView
            history={history}
            onContinue={handleContinueFromHistory}
            onReviewQuiz={(item) => setReviewHistoryItem(item)}
            onRetakeQuiz={handleRetakeFromHistory}
            onDelete={handleDeleteHistory}
            onStartNew={() => setActiveTab("learn")}
            onReteachWeak={handleReteachFromHistory}
          />
        )}

        {stage === "setup" && activeTab === "learn" && (
          <section className="space-y-6">
            {/* 1. Custom lesson generator & textbook scanner (FIRST) */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                    <BookOpen className="h-5 w-5 text-primary" /> Custom lesson generator &amp; textbook scanner
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Paste any textbook paragraph, or upload a textbook page below…
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  AI &amp; Offline Ready
                </span>
              </div>

              <textarea
                value={source}
                onChange={(e) => setSource(e.target.value)}
                rows={4}
                placeholder="Paste any textbook paragraph, or upload a textbook page below…"
                className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />

              <div className="flex flex-wrap items-center gap-2">
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
                <Button
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={loading === "ocr"}
                  className="gap-1.5 text-xs sm:text-sm font-medium"
                >
                  {loading === "ocr" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4 text-primary" />}
                  Upload textbook page
                </Button>

                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onPdf(f);
                    e.target.value = "";
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={loading === "pdf"}
                  className="gap-1.5 text-xs sm:text-sm font-medium"
                >
                  {loading === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4 text-primary" />}
                  Upload PDF
                </Button>

                {pdfStatus && <span className="text-xs text-muted-foreground">{pdfStatus}</span>}
                {source && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSource("")}
                    className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" /> Clear
                  </Button>
                )}
              </div>

              {/* Extracted text review & edit */}
              {extracted.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Extracted text · review &amp; edit
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setExtracted((prev) => {
                            const all = prev.every((p) => p.selected);
                            return prev.map((p) => ({ ...p, selected: !all }));
                          })
                        }
                        className="h-7 text-xs"
                      >
                        Select all / none
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExtracted([])}
                        className="h-7 text-xs text-muted-foreground"
                      >
                        Discard
                      </Button>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-3">
                    {extracted.map((p) => (
                      <li key={p.id} className="rounded-md border border-border bg-background p-2">
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 text-xs font-medium text-foreground">
                            <input
                              type="checkbox"
                              checked={p.selected}
                              onChange={(e) => updatePage(p.id, { selected: e.target.checked })}
                              className="h-4 w-4 accent-[hsl(var(--primary))]"
                            />
                            {p.label}
                          </label>
                          <button
                            onClick={() => setExtracted((prev) => prev.filter((x) => x.id !== p.id))}
                            aria-label={`Remove ${p.label}`}
                            className="rounded-md p-1 text-muted-foreground hover:bg-accent"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <textarea
                          value={p.text}
                          onChange={(e) => updatePage(p.id, { text: e.target.value })}
                          rows={3}
                          className="mt-2 w-full resize-y rounded-md border border-input bg-background p-2 text-xs leading-relaxed text-foreground outline-none focus:ring-2 focus:ring-ring"
                        />
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="sm"
                    onClick={useSelectedText}
                    className="mt-3 gap-1.5 text-xs font-semibold"
                  >
                    <Check className="h-3.5 w-3.5" /> Use selected text
                  </Button>
                </div>
              )}

              {/* Selectors: Grade, Subject, Mother tongue */}
              <div className="grid gap-3 pt-3 border-t border-border/60 sm:grid-cols-3">
                <label className="text-xs font-medium text-muted-foreground">
                  Grade
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"
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
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm capitalize text-foreground"
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
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"
                  >
                    {LANGS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <Button
                onClick={() => generateLesson()}
                disabled={loading === "lesson"}
                className="w-full min-h-[44px] gap-2 font-semibold"
              >
                {loading === "lesson" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Build custom lesson from text
              </Button>
            </div>

            {/* 2. Lessons & Curriculum Tracks (10 Topics) */}
            <section aria-label="Topic Curriculum Tracks" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                    <Layers className="h-5 w-5 text-primary" /> Topic Lessons &amp; Syllabus (10 Topics)
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Click any topic to view its syllabus and explore included lessons in {progressLanguage === "urdu" ? "Urdu" : "Kashmiri"}.
                  </p>
                </div>
                <div className="flex rounded-md border border-border p-1" role="group" aria-label="Lesson language">
                  {LANGS.map((lang) => (
                    <Button
                      key={lang.value}
                      variant={progressLanguage === lang.value ? "secondary" : "ghost"}
                      size="sm"
                      aria-pressed={progressLanguage === lang.value}
                      onClick={() => setProgressLanguage(lang.value)}
                      className="h-7 text-xs"
                    >
                      {lang.value === "urdu" ? "Urdu" : "Kashmiri"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Overall curriculum progress */}
              <div
                role="progressbar"
                aria-label={`${progressLanguage} lessons completed`}
                aria-valuemin={0}
                aria-valuemax={visiblePacks.length}
                aria-valuenow={completedCount}
                className="h-2 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full bg-primary transition-[width] duration-300"
                  style={{ width: `${visiblePacks.length ? (completedCount / visiblePacks.length) * 100 : 0}%` }}
                />
              </div>

              {/* Up Next in Track Hero Banner */}
              {overallNextPack && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5 shadow-sm">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      Up Next in {overallNextPack.trackTitle || "Curriculum"}
                    </span>
                    <p className="text-sm font-bold text-foreground">
                      {overallNextPack.trackOrder ? `Lesson ${overallNextPack.trackOrder}: ` : ""}
                      {overallNextPack.lesson.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Grade {overallNextPack.grade} · {overallNextPack.subject} · Part of structured topic track
                    </p>
                  </div>
                  <Button onClick={() => loadPack(overallNextPack)} size="sm" className="gap-1.5 font-semibold text-xs h-9">
                    <Play className="h-3.5 w-3.5" /> Start Next Lesson
                  </Button>
                </div>
              )}

              {/* 10 Topic Cards Grid */}
              <div className="grid gap-3.5 sm:grid-cols-2">
                {TOPICS.map((topic) => {
                  const trackData = tracksMap[topic.trackId];
                  const trackPacks = trackData?.packs || visiblePacks.filter((p) => p.trackId === topic.trackId);
                  const totalInTrack = trackPacks.length;
                  const completedInTrack = trackPacks.filter((p) => Boolean(progress[p.id])).length;
                  const isAllDone = totalInTrack > 0 && completedInTrack === totalInTrack;
                  const nextInTrack = trackPacks.find((p) => !progress[p.id]) || trackPacks[0];

                  return (
                    <div
                      key={topic.id}
                      className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary capitalize">
                            {topic.subject} · Grade {topic.grade}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isAllDone
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : completedInTrack > 0
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isAllDone
                              ? "Track Completed 🎉"
                              : completedInTrack > 0
                              ? `${completedInTrack}/${totalInTrack} Done`
                              : `${totalInTrack} Lessons`}
                          </span>
                        </div>

                        <h3 className="mt-2 text-base font-bold text-foreground group-hover:text-primary transition-colors">
                          {topic.label}
                          {topic.kashmiriLabel && (
                            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                              ({topic.kashmiriLabel})
                            </span>
                          )}
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {topic.description}
                        </p>

                        {/* Track mini progress */}
                        {totalInTrack > 0 && (
                          <div className="mt-3">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${(completedInTrack / totalInTrack) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons: View Syllabus & Start / Continue */}
                      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/60">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenSyllabus(topic)}
                          className="flex-1 gap-1 text-xs font-semibold"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-primary" /> View Syllabus ({totalInTrack})
                        </Button>
                        {nextInTrack && (
                          <Button
                            size="sm"
                            onClick={() => loadPack(nextInTrack)}
                            className="gap-1 text-xs font-semibold"
                          >
                            <Play className="h-3 w-3" />
                            {completedInTrack === 0 ? "Start" : isAllDone ? "Retake" : "Continue"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </section>
        )}

        {stage !== "setup" && lesson && (
          <section className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  {currentPack && (
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary mb-1">
                      {currentPack.trackTitle || "Curriculum Track"} · Part {currentPack.trackOrder} of {currentPack.totalInTrack}
                    </span>
                  )}
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
                  Curriculum tracks
                </button>
                <button
                  onClick={exportPdf}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold text-foreground hover:bg-accent"
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </button>
                {stage === "lesson" && (
                  <button
                    onClick={() => (quiz.length ? setStage("quiz") : generateQuiz(false))}
                    disabled={loading === "quiz"}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  >
                    {loading === "quiz" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {quiz.length ? "Start quiz" : "Generate quiz"}
                  </button>
                )}
                {stage === "report" && nextTrackPack && (
                  <button
                    onClick={advanceToNextLesson}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Next Lesson in Track <ArrowRight className="h-4 w-4" />
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

                    {grade > 7 && c.deep_dive_en?.trim() && (
                      <div className="mt-3 rounded-lg border-l-4 border-primary/60 bg-muted/40 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Deep dive</p>
                        <p className="mt-1 text-sm leading-relaxed text-foreground">{c.deep_dive_en}</p>
                      </div>
                    )}

                    {grade > 7 && c.formula?.trim() && (
                      <div className="mt-3 rounded-lg border border-border bg-background p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Key formula</p>
                        <p dir="ltr" className="mt-1 overflow-x-auto font-mono text-sm text-primary">
                          {c.formula}
                        </p>
                      </div>
                    )}

                    <p
                      dir={rtl ? "rtl" : "ltr"}
                      className={`mt-3 rounded-lg bg-muted/60 p-3 text-base leading-loose text-foreground ${
                        rtl ? "font-nastaliq" : ""
                      }`}
                    >
                      {c.explanation_target}
                    </p>

                    {grade > 7 && c.application_target?.trim() && (
                      <div className="mt-3 rounded-lg border border-border p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Real-world application
                        </p>
                        <p
                          dir={rtl ? "rtl" : "ltr"}
                          className={`mt-1 text-base leading-loose text-foreground ${rtl ? "font-nastaliq" : ""}`}
                        >
                          {c.application_target}
                        </p>
                      </div>
                    )}

                    {c.diagram && <ConceptDiagram diagram={c.diagram} rtl={rtl} />}

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

            {stage === "lesson" && (
              <LessonChat lesson={lesson} grade={grade} subject={subject} language={language} rtl={rtl} />
            )}

            {stage === "quiz" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">
                      {weakConcepts.length ? "Re-test on weak concepts" : "Practice quiz"}
                    </span>
                    <span className="text-muted-foreground">
                      {answeredCount} / {quiz.length} answered
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${quiz.length ? (answeredCount / quiz.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
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
              <div className="space-y-4">
                {/* Dedicated sequential Next Lesson in Track card */}
                {nextTrackPack ? (
                  <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="inline-block rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
                          Next in {nextTrackPack.trackTitle || currentTrackId || "Topic"} Track
                        </span>
                        <h3 className="mt-1 text-lg font-bold text-foreground">
                          {nextTrackPack.trackOrder ? `Lesson ${nextTrackPack.trackOrder}: ` : ""}
                          {nextTrackPack.lesson.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Stay focused on {nextTrackPack.trackTitle || "this topic"} and build mastery step by step.
                        </p>
                      </div>
                      <Button onClick={advanceToNextLesson} className="gap-2 font-bold min-h-[44px]">
                        Continue to Next Lesson <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10 p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="inline-block rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          🎉 Track Completed!
                        </span>
                        <h3 className="mt-1 text-lg font-bold text-foreground">
                          You've completed all lessons in {currentPack?.trackTitle || "this topic track"}!
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Ready for your next learning challenge? Continue to the next curriculum topic.
                        </p>
                      </div>
                      <Button onClick={advanceToNextLesson} className="gap-2 font-bold min-h-[44px]">
                        Start Next Topic Track <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div role="status" className="flex items-center gap-2 border-b border-border pb-3 text-sm font-semibold text-primary">
                  <CheckCircle2 className="h-4 w-4" /> Quiz recorded · {Object.values(graded).filter(Boolean).length} of {quiz.length} correct
                </div>

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

                {quiz.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground">Answer review</h3>
                    <ul className="mt-3 space-y-3">
                      {quiz.map((q, i) => {
                        const ok = graded[i];
                        const given = (answers[i] ?? "").trim();
                        return (
                          <li key={i} className="rounded-lg border border-border p-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-foreground">
                                {i + 1}. {q.question_en}
                              </p>
                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  ok ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                                }`}
                              >
                                {ok ? "Correct" : "Review"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Concept: {q.concept} · Your answer: {given || "—"}
                            </p>
                            {!ok && (
                              <p className="mt-1 text-xs text-foreground">
                                <span className="font-semibold">Correct answer:</span> {q.answer}
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground">
                    {weakConcepts.length ? "Weak concepts detected" : "No weak concepts — well done"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {weakConcepts.length
                      ? `You had trouble with: ${weakConcepts.join(", ")}. Click below to re-teach these weak concepts with simplified breakdowns and easier practice.`
                      : "You can re-run the quiz, continue to the next lesson in this track, or review your history."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={advanceToNextLesson} className="gap-2 font-bold">
                      {nextTrackPack ? `Next Lesson (${nextTrackPack.trackOrder ?? ""})` : "Next Topic"} <ArrowRight className="h-4 w-4" />
                    </Button>
                    {weakConcepts.length > 0 && (
                      <button
                        onClick={() => generateLesson(weakConcepts)}
                        disabled={loading === "lesson"}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-secondary text-secondary-foreground px-3 text-sm font-semibold hover:bg-secondary/80 disabled:opacity-60"
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
                    <button
                      onClick={() => {
                        setStage("setup");
                        setActiveTab("history");
                      }}
                      className="min-h-[44px] rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      View All History
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {lesson && (
          <LessonPrintView
            lesson={lesson}
            grade={grade}
            subject={subject}
            languageLabel={LANGS.find((l) => l.value === language)?.label ?? language}
            rtl={rtl}
            pages={extracted.filter((p) => p.selected && p.text.trim())}
          />
        )}
      </main>

      {/* Quiz review dialog for past history */}
      <QuizReviewDialog
        item={reviewHistoryItem}
        open={Boolean(reviewHistoryItem)}
        onOpenChange={(open) => !open && setReviewHistoryItem(null)}
        onContinueLesson={handleContinueFromHistory}
        onRetakeQuiz={handleRetakeFromHistory}
      />

      {/* Syllabus dialog for inspecting topic syllabus */}
      <SyllabusDialog
        topic={syllabusTopic}
        packs={visiblePacks}
        progress={progress}
        open={syllabusOpen}
        onOpenChange={setSyllabusOpen}
        onSelectLesson={loadPack}
      />
    </div>
  );
}
