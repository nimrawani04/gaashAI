import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  GraduationCap,
  Award,
} from "lucide-react";
import type { LessonProgress } from "@/lib/lesson-progress";
import type { Lesson } from "@/lib/learn.functions";

export interface DemoPack {
  id: string;
  trackId?: string;
  trackTitle?: string;
  trackOrder?: number;
  totalInTrack?: number;
  nextLessonId?: string | null;
  label: string;
  grade: number;
  subject: string;
  language: "kashmiri" | "urdu";
  source: string;
  lesson: Lesson;
  quiz: any[];
}

export interface TopicInfo {
  id: string;
  trackId: string;
  label: string;
  kashmiriLabel?: string;
  subject: string;
  grade: number;
  description: string;
}

interface SyllabusDialogProps {
  topic: TopicInfo | null;
  packs: DemoPack[];
  progress: LessonProgress;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLesson: (pack: DemoPack) => void;
}

export function SyllabusDialog({
  topic,
  packs,
  progress,
  open,
  onOpenChange,
  onSelectLesson,
}: SyllabusDialogProps) {
  if (!topic) return null;

  // Filter packs for this topic and sort by trackOrder
  const trackPacks = packs
    .filter(
      (p) =>
        p.trackId === topic.trackId ||
        p.id.startsWith(topic.trackId) ||
        p.label.toLowerCase().includes(topic.label.toLowerCase())
    )
    .sort((a, b) => (a.trackOrder ?? 0) - (b.trackOrder ?? 0));

  const totalLessons = trackPacks.length;
  const completedLessons = trackPacks.filter((p) => Boolean(progress[p.id]));
  const completedCount = completedLessons.length;
  const pctCompleted = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isAllComplete = completedCount === totalLessons && totalLessons > 0;

  // Find next lesson to do
  const nextPack = trackPacks.find((p) => !progress[p.id]) || trackPacks[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary capitalize">
              {topic.subject} · Grade {topic.grade}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isAllComplete
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : completedCount > 0
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {completedCount} of {totalLessons} Completed ({pctCompleted}%)
            </span>
          </div>

          <DialogTitle className="mt-2 text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary shrink-0" />
            {topic.label} Syllabus
            {topic.kashmiriLabel && (
              <span className="text-sm font-normal text-muted-foreground mr-1">
                ({topic.kashmiriLabel})
              </span>
            )}
          </DialogTitle>

          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {topic.description}
          </DialogDescription>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${pctCompleted}%` }}
              />
            </div>
          </div>

          {/* Fast start or continue CTA */}
          {nextPack && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {completedCount === 0 ? "Begin Syllabus" : isAllComplete ? "Review Syllabus" : "Continue Where Left Off"}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  Lesson {nextPack.trackOrder ?? 1}: {nextPack.lesson.title}
                </p>
              </div>
              <Button
                onClick={() => {
                  onSelectLesson(nextPack);
                  onOpenChange(false);
                }}
                className="gap-1.5 font-semibold text-xs h-9"
              >
                <Play className="h-3.5 w-3.5" />
                {completedCount === 0 ? "Start Lesson 1" : isAllComplete ? "Re-take Final Quiz" : "Continue Lesson"}
              </Button>
            </div>
          )}
        </DialogHeader>

        {/* Detailed syllabus lesson list */}
        <div className="mt-4 space-y-3">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Layers className="h-4 w-4 text-primary" /> Lessons Included in this Topic ({totalLessons})
          </h4>

          {trackPacks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              No offline pack found for this language. You can build a custom lesson above.
            </div>
          ) : (
            <div className="space-y-2.5">
              {trackPacks.map((pack, idx) => {
                const order = pack.trackOrder ?? idx + 1;
                const record = progress[pack.id];
                const isCompleted = Boolean(record);
                const isNext = nextPack?.id === pack.id && !isAllComplete;

                return (
                  <div
                    key={pack.id}
                    className={`rounded-xl border p-3.5 transition-all ${
                      isNext
                        ? "border-primary/60 bg-primary/5 shadow-sm"
                        : isCompleted
                        ? "border-border bg-card/80"
                        : "border-border/70 bg-card/40"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isCompleted
                              ? "bg-emerald-500 text-white"
                              : isNext
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isCompleted ? "✓" : order}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-foreground">
                              Lesson {order}: {pack.lesson.title}
                            </span>
                            {isCompleted && (
                              <span className="rounded-full bg-emerald-500/15 px-2 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                Scored {record.correct}/{record.total} ({record.total ? Math.round((record.correct / record.total) * 100) : 0}%)
                              </span>
                            )}
                            {isNext && (
                              <span className="rounded-full bg-primary/15 px-2 py-0.2 text-[10px] font-bold text-primary">
                                Up Next
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            <span className="font-medium text-foreground">Objective:</span> {pack.lesson.objective}
                          </p>

                          {/* Concepts covered chips */}
                          {pack.lesson.concepts && pack.lesson.concepts.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {pack.lesson.concepts.map((c) => (
                                <span
                                  key={c.name_en}
                                  className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                                >
                                  {c.name_target ? `${c.name_en} (${c.name_target})` : c.name_en}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                        <Button
                          size="sm"
                          variant={isNext ? "default" : isCompleted ? "outline" : "secondary"}
                          onClick={() => {
                            onSelectLesson(pack);
                            onOpenChange(false);
                          }}
                          className="h-8 text-xs font-semibold gap-1"
                        >
                          {isCompleted ? (
                            <>
                              <RotateCcw className="h-3 w-3" /> Re-learn
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3" /> Start
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
