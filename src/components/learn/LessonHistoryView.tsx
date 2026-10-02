import { useState, useMemo } from "react";
import {
  History,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Filter,
  Play,
  RotateCcw,
  Search,
  Trash2,
  GraduationCap,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LessonHistoryItem } from "@/lib/lesson-progress";

interface LessonHistoryViewProps {
  history: LessonHistoryItem[];
  onContinue: (item: LessonHistoryItem) => void;
  onReviewQuiz: (item: LessonHistoryItem) => void;
  onRetakeQuiz: (item: LessonHistoryItem) => void;
  onDelete: (id: string) => void;
  onStartNew: () => void;
  onReteachWeak?: (item: LessonHistoryItem) => void;
}

export function LessonHistoryView({
  history,
  onContinue,
  onReviewQuiz,
  onRetakeQuiz,
  onDelete,
  onStartNew,
  onReteachWeak,
}: LessonHistoryViewProps) {
  const [langFilter, setLangFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return history.filter((item) => {
      if (langFilter !== "all" && item.language !== langFilter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        (item.weakConcepts && item.weakConcepts.some((c) => c.toLowerCase().includes(q)))
      );
    });
  }, [history, langFilter, query]);

  // Statistics
  const totalCount = history.length;
  const avgScore = totalCount
    ? Math.round(history.reduce((sum, h) => sum + h.score.percentage, 0) / totalCount)
    : 0;
  const masteredCount = history.filter((h) => h.score.percentage >= 80).length;

  // The latest completed item is the first one in the sorted history
  const lastLeftPlace = history.length > 0 ? history[0] : null;

  return (
    <div className="space-y-5">
      {/* Continue from last left place HERO CARD */}
      {lastLeftPlace && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
              <Play className="h-3 w-3 fill-current" /> Continue From Where You Left Off
            </span>
            <span className="text-xs text-muted-foreground">
              Last active: {new Date(lastLeftPlace.completedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-foreground">
                {lastLeftPlace.title}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="capitalize font-medium text-foreground">
                  {lastLeftPlace.subject} · Grade {lastLeftPlace.grade}
                </span>
                <span>•</span>
                <span>Language: {lastLeftPlace.language === "urdu" ? "Urdu" : "Kashmiri"}</span>
                <span>•</span>
                <span className="font-semibold text-foreground">
                  Marks: {lastLeftPlace.score.correct}/{lastLeftPlace.score.total} ({lastLeftPlace.score.percentage}%)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => onContinue(lastLeftPlace)}
                className="gap-2 font-semibold text-xs h-9 shadow-sm"
              >
                <Play className="h-4 w-4" /> Continue From Last Left Place
              </Button>
              <Button
                variant="outline"
                onClick={() => onReviewQuiz(lastLeftPlace)}
                className="gap-1.5 text-xs h-9"
              >
                <HelpCircle className="h-4 w-4" /> Review Quiz
              </Button>
              <Button
                variant="outline"
                onClick={() => onRetakeQuiz(lastLeftPlace)}
                className="gap-1.5 text-xs h-9"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Retest
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Quizzes</span>
            <History className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{totalCount}</p>
          <p className="text-xs text-muted-foreground">Lessons tested & recorded</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Marks / Mastery</span>
            <Award className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{avgScore}%</p>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${avgScore}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Mastered (80%+)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{masteredCount}</p>
          <p className="text-xs text-muted-foreground">
            {totalCount ? Math.round((masteredCount / totalCount) * 100) : 0}% of all completed
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
        <div className="flex flex-1 items-center gap-2 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by lesson title, subject, or concept…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <Button
            size="sm"
            variant={langFilter === "all" ? "secondary" : "ghost"}
            onClick={() => setLangFilter("all")}
            className="h-7 text-xs"
          >
            All
          </Button>
          <Button
            size="sm"
            variant={langFilter === "kashmiri" ? "secondary" : "ghost"}
            onClick={() => setLangFilter("kashmiri")}
            className="h-7 text-xs"
          >
            Kashmiri
          </Button>
          <Button
            size="sm"
            variant={langFilter === "urdu" ? "secondary" : "ghost"}
            onClick={() => setLangFilter("urdu")}
            className="h-7 text-xs"
          >
            Urdu
          </Button>
        </div>
      </div>

      {/* History List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isMastered = item.score.percentage >= 80;
            const isPassed = item.score.percentage >= 50;

            return (
              <div
                key={item.id}
                className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isMastered
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : isPassed
                            ? "bg-primary/15 text-primary"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        Marks: {item.score.correct}/{item.score.total} ({item.score.percentage}%)
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">
                        {item.subject} · Grade {item.grade}
                      </span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-foreground">
                        {item.language === "urdu" ? "Urdu" : "Kashmiri"}
                      </span>
                    </div>

                    <h3 className="mt-1.5 text-base font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      Completed on {new Date(item.completedAt).toLocaleDateString()} at{" "}
                      {new Date(item.completedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Actions for this history record */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => onContinue(item)}
                      className="h-8 gap-1 text-xs font-semibold"
                    >
                      <Play className="h-3 w-3" /> Continue
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReviewQuiz(item)}
                      className="h-8 gap-1 text-xs"
                    >
                      <HelpCircle className="h-3 w-3" /> Review Quiz
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRetakeQuiz(item)}
                      className="h-8 gap-1 text-xs"
                    >
                      <RotateCcw className="h-3 w-3" /> Retest
                    </Button>
                    <button
                      onClick={() => onDelete(item.id)}
                      title="Delete record"
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Weak concepts & re-teach button */}
                {item.weakConcepts && item.weakConcepts.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                      <span className="font-semibold">Weak concepts:</span>
                      {item.weakConcepts.map((c) => (
                        <span
                          key={c}
                          className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[11px]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                    {onReteachWeak && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReteachWeak(item)}
                        className="h-7 text-[11px] gap-1 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                      >
                        <Sparkles className="h-3 w-3" /> Re-teach in Kashmiri
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground opacity-60" />
          <h3 className="mt-3 text-base font-bold text-foreground">
            {history.length === 0 ? "No quiz history yet" : "No matching lessons found"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            {history.length === 0
              ? "Complete quizzes on lessons like Atoms, Water Cycle, or Fractions to automatically track your marks and progress."
              : "Try adjusting your search query or language filter."}
          </p>
          {history.length === 0 && (
            <Button onClick={onStartNew} className="mt-4 gap-2 font-semibold">
              <Sparkles className="h-4 w-4" /> Start a Lesson Now
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
