import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Lesson, QuizQuestion } from "@/lib/learn.server";

export type { Lesson, LessonConcept, QuizQuestion } from "@/lib/learn.server";

const LessonInput = z.object({
  source: z.string().min(10).max(12000),
  grade: z.number().int().min(1).max(12),
  subject: z.string().min(1).max(40),
  language: z.enum(["kashmiri", "urdu", "hindi", "english"]),
  /** Concepts the student is weak at — triggers a simpler re-teach. */
  weakConcepts: z.array(z.string().max(120)).max(10).optional(),
});

const QuizInput = z.object({
  concepts: z.array(z.string().min(1).max(160)).min(1).max(8),
  grade: z.number().int().min(1).max(12),
  subject: z.string().min(1).max(40),
  language: z.enum(["kashmiri", "urdu", "hindi", "english"]),
  perConcept: z.number().int().min(1).max(5).default(3),
  easier: z.boolean().optional(),
});

/**
 * Stage 1–5 of the adaptive pipeline in one grounded call:
 * concept extraction → grade-level simplification → local example selection
 * → mother-tongue adaptation using the verified glossary.
 */
export const buildLesson = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LessonInput.parse(input))
  .handler(async ({ data }): Promise<Lesson> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured.");

    const { callAi, parseJson, fetchGlossary, fetchLocalExamples, languageLabel } = await import(
      "@/lib/learn.server"
    );
    const [glossary, examples] = await Promise.all([
      fetchGlossary(data.subject, data.language),
      fetchLocalExamples(data.subject, data.source.slice(0, 400)),
    ]);

    const reteach = data.weakConcepts?.length
      ? `The student struggled with: ${data.weakConcepts.join(", ")}. Re-teach ONLY those concepts, one level simpler, with a different local example and shorter sentences.`
      : "";

    const system = [
      "You are an adaptive pedagogical engine for Kashmiri government-school teachers.",
      `Target: Grade ${data.grade}, subject ${data.subject}, mother tongue: ${languageLabel(data.language)}.`,
      "Work in this exact order for every concept: (1) extract the concept, (2) SIMPLIFY it in English to the target grade's reading and cognitive level, (3) attach a curated local example, (4) only THEN render it in the mother tongue. Never translate raw textbook language.",
      `Grade ${data.grade} rules: short sentences (max ${data.grade <= 4 ? 12 : 18} words), everyday vocabulary, concrete before abstract, no jargon without an explanation.`,
      "Extract 3 to 6 core concepts, the prerequisites the student must already know, one learning objective, and a difficulty of easy | medium | hard.",
      glossary,
      examples,
      reteach,
      'Reply ONLY with compact JSON: {"title":"...","objective":"...","prerequisites":["..."],"difficulty":"easy|medium|hard","concepts":[{"name_en":"...","name_target":"...","simplified_en":"...","explanation_target":"...","example_title":"...","example_en":"...","example_target":"..."}]}',
      "'simplified_en' = 2–4 simplified English sentences. 'explanation_target' = the same explanation in the mother tongue. 'example_target' = the local example in the mother tongue.",
    ]
      .filter(Boolean)
      .join("\n\n");

    const raw = await callAi(system, data.source, key);
    const lesson = parseJson<Lesson>(raw, {
      title: "",
      objective: "",
      prerequisites: [],
      difficulty: "medium",
      concepts: [],
    });
    if (!lesson.concepts?.length) throw new Error("Could not understand this lesson — try more text.");
    return {
      title: lesson.title || `Grade ${data.grade} ${data.subject} lesson`,
      objective: lesson.objective ?? "",
      prerequisites: Array.isArray(lesson.prerequisites) ? lesson.prerequisites.slice(0, 8) : [],
      difficulty: lesson.difficulty || "medium",
      concepts: lesson.concepts.slice(0, 6),
    };
  });

/** Stage 7: a quiz wired to the extracted concepts, so weakness maps to a concept. */
export const buildQuiz = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => QuizInput.parse(input))
  .handler(async ({ data }): Promise<QuizQuestion[]> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured.");

    const { callAi, parseJson, fetchLocalExamples, languageLabel } = await import(
      "@/lib/learn.server"
    );
    const examples = await fetchLocalExamples(data.subject, data.concepts.join(" "));

    const system = [
      `You write Grade ${data.grade} ${data.subject} assessment questions in ${languageLabel(data.language)}.`,
      `Write exactly ${data.perConcept} questions for EACH concept given by the user.`,
      data.easier ? "Make them noticeably easier than a standard grade-level question." : "",
      "Mix question types: mcq, fill, short, numeric. At least one question must be a word problem set in Kashmir using a local example.",
      examples,
      'Reply ONLY with a compact JSON array: [{"concept":"exact concept name from the user list","type":"mcq|fill|short|numeric","question_en":"...","question_target":"...","options":["..."],"answer":"...","answer_target":"..."}]',
      "options must be 4 items for mcq and an empty array otherwise. 'answer' is the correct answer in English (for mcq it must exactly match one option).",
    ]
      .filter(Boolean)
      .join("\n\n");

    const raw = await callAi(system, `Concepts:\n${data.concepts.join("\n")}`, key);
    const quiz = parseJson<QuizQuestion[]>(raw, []);
    if (!Array.isArray(quiz) || !quiz.length) throw new Error("Could not generate the quiz — try again.");
    return quiz.slice(0, 30).map((q) => ({
      concept: String(q.concept ?? data.concepts[0]),
      type: (["mcq", "fill", "short", "numeric"] as const).includes(q.type) ? q.type : "short",
      question_en: String(q.question_en ?? ""),
      question_target: String(q.question_target ?? ""),
      options: Array.isArray(q.options) ? q.options.map(String).slice(0, 4) : [],
      answer: String(q.answer ?? ""),
      answer_target: String(q.answer_target ?? ""),
    }));
  });
