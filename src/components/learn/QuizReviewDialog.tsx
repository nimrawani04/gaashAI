import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Award, RotateCcw, BookOpen, AlertCircle } from "lucide-react";
import type { LessonHistoryItem } from "@/lib/lesson-progress";

interface QuizReviewDialogProps {
  item: LessonHistoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueLesson?: (item: LessonHistoryItem) => void;
  onRetakeQuiz?: (item: LessonHistoryItem) => void;
}

export function QuizReviewDialog({
  item,
  open,
  onOpenChange,
  onContinueLesson,
  onRetakeQuiz,
}: QuizReviewDialogProps) {
  if (!item) return null;

  const rtl = item.language === "kashmiri" || item.language === "urdu";
  const pct = item.score.percentage;
  const isMastered = pct >= 80;
  const isPassed = pct >= 50;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
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
              {pct}% Score · {item.score.correct} / {item.score.total} Correct
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Grade {item.grade} · {item.subject} · {item.language === "urdu" ? "Urdu" : "Kashmiri"}
            </span>
          </div>
          <DialogTitle className="mt-1 text-xl font-bold text-foreground">
            {item.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Completed on {new Date(item.completedAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        {/* Weak concepts banner if any */}
        {item.weakConcepts && item.weakConcepts.length > 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
              Concepts to Review
            </div>
            <p className="mt-1">
              Focus on improving: <span className="font-semibold">{item.weakConcepts.join(", ")}</span>
            </p>
          </div>
        )}

        {/* Questions list */}
        <div className="mt-2 space-y-4">
          <h4 className="text-sm font-bold text-foreground">Question-by-Question Review</h4>
          {item.quiz && item.quiz.length > 0 ? (
            item.quiz.map((q, idx) => {
              const ok = q.isCorrect ?? false;
              return (
                <div
                  key={idx}
                  className={`rounded-lg border p-3.5 transition-colors ${
                    ok
                      ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20"
                      : "border-destructive/30 bg-destructive/5 dark:bg-destructive/950/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {q.concept} · {q.type}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                        ok
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {ok ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" /> Incorrect
                        </>
                      )}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-foreground">{q.question_en}</p>
                  {q.question_target && (
                    <p
                      dir={rtl ? "rtl" : "ltr"}
                      className={`mt-1 text-sm text-muted-foreground ${rtl ? "font-nastaliq" : ""}`}
                    >
                      {q.question_target}
                    </p>
                  )}

                  {/* Answers breakdown */}
                  <div className="mt-3 space-y-1.5 rounded-md bg-background/60 p-2.5 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="min-w-24 font-semibold text-muted-foreground">Your answer:</span>
                      <span
                        className={`font-semibold ${
                          ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                        }`}
                      >
                        {q.userAnswer ? q.userAnswer : "Left blank"}
                      </span>
                    </div>
                    {!ok && (
                      <div className="flex items-start gap-2">
                        <span className="min-w-24 font-semibold text-emerald-600 dark:text-emerald-400">
                          Correct answer:
                        </span>
                        <span className="font-semibold text-foreground">
                          {q.answer}
                          {q.answer_target && ` (${q.answer_target})`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">Detailed quiz questions were not recorded for this session.</p>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {onRetakeQuiz && (
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onRetakeQuiz(item);
                }}
                className="gap-1.5"
              >
                <RotateCcw className="h-4 w-4" /> Retake Quiz
              </Button>
            )}
            {onContinueLesson && (
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onContinueLesson(item);
                }}
                className="gap-1.5"
              >
                <BookOpen className="h-4 w-4" /> Continue Lesson
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
