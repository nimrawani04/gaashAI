import { ConceptDiagram } from "@/components/learn/ConceptDiagram";
import type { Lesson } from "@/lib/learn.functions";

type SourcePage = { id: string; label: string; text: string };

type Props = {
  lesson: Lesson;
  grade: number;
  subject: string;
  languageLabel: string;
  rtl?: boolean;
  pages: SourcePage[];
};

/**
 * Offline study sheet. Hidden on screen, revealed by the print stylesheet so
 * "Export PDF" can use the browser's native print-to-PDF (keeps Nastaliq
 * fonts and the diagram SVGs intact).
 */
export function LessonPrintView({ lesson, grade, subject, languageLabel, rtl, pages }: Props) {
  return (
    <div className="lesson-print" aria-hidden="true">
      <header className="mb-4 border-b border-border pb-3">
        <h1 className="text-xl font-bold text-foreground">{lesson.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Grade {grade} · {subject} · {languageLabel} · {lesson.difficulty}
        </p>
        <p className="mt-2 text-sm text-foreground">
          <span className="font-semibold">Objective:</span> {lesson.objective}
        </p>
        {lesson.prerequisites.length > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-semibold">Prerequisites:</span> {lesson.prerequisites.join(", ")}
          </p>
        )}
      </header>

      {lesson.concepts.map((c, i) => (
        <article key={i} className="print-block mb-5 border-b border-border pb-4">
          <h2 className="text-base font-bold text-foreground">
            {i + 1}. {c.name_en}
            <span
              dir={rtl ? "rtl" : "ltr"}
              className={`ml-2 text-primary ${rtl ? "font-nastaliq" : ""}`}
            >
              {c.name_target}
            </span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{c.simplified_en}</p>

          {c.deep_dive_en?.trim() && (
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              <span className="font-semibold">Deep dive: </span>
              {c.deep_dive_en}
            </p>
          )}
          {c.formula?.trim() && (
            <p dir="ltr" className="mt-2 font-mono text-sm text-foreground">
              Formula: {c.formula}
            </p>
          )}

          <p
            dir={rtl ? "rtl" : "ltr"}
            className={`mt-2 text-base leading-loose text-foreground ${rtl ? "font-nastaliq" : ""}`}
          >
            {c.explanation_target}
          </p>

          {c.application_target?.trim() && (
            <p
              dir={rtl ? "rtl" : "ltr"}
              className={`mt-2 text-base leading-loose text-foreground ${rtl ? "font-nastaliq" : ""}`}
            >
              {c.application_target}
            </p>
          )}

          {c.diagram && <ConceptDiagram diagram={c.diagram} rtl={rtl} />}

          <div className="mt-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Local example · {c.example_title}
            </p>
            <p className="text-sm text-foreground">{c.example_en}</p>
            <p
              dir={rtl ? "rtl" : "ltr"}
              className={`text-base leading-loose text-foreground ${rtl ? "font-nastaliq" : ""}`}
            >
              {c.example_target}
            </p>
          </div>
        </article>
      ))}

      {pages.length > 0 && (
        <section className="print-page-break">
          <h2 className="mb-2 text-base font-bold text-foreground">Source pages</h2>
          {pages.map((p) => (
            <div key={p.id} className="print-block mb-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">{p.label}</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{p.text}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
