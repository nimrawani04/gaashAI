import { createClient } from "@supabase/supabase-js";

export type DiagramNode = {
  label_en: string;
  label_target: string;
  note_target?: string;
};

/** A simple structured diagram the UI renders as SVG with mother-tongue labels. */
export type LessonDiagram = {
  kind: "cycle" | "flow" | "parts";
  title_en: string;
  title_target: string;
  nodes: DiagramNode[];
};

export type LessonConcept = {
  name_en: string;
  name_target: string;
  simplified_en: string;
  explanation_target: string;
  example_title: string;
  example_en: string;
  example_target: string;
  /** Advanced-grade extras. */
  deep_dive_en?: string;
  formula?: string;
  application_target?: string;
  diagram?: LessonDiagram | null;
};

export type Lesson = {
  title: string;
  objective: string;
  prerequisites: string[];
  difficulty: string;
  concepts: LessonConcept[];
};


export type QuizQuestion = {
  concept: string;
  type: "mcq" | "fill" | "short" | "numeric";
  question_en: string;
  question_target: string;
  options: string[];
  answer: string;
  answer_target: string;
};

const LANG_LABEL: Record<string, string> = {
  kashmiri: "Kashmiri (کٲشُر) in Perso-Arabic Nastaliq script",
  english: "simple English",
};

export function languageLabel(lang: string): string {
  return LANG_LABEL[lang] ?? LANG_LABEL.kashmiri;
}

function serverSupabase() {
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["SUPABASE_ANON_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_ANON_KEY"];
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** Verified subject terminology injected into the prompt so MT can't invent words. */
export async function fetchGlossary(subject: string, lang: string): Promise<string> {
  const db = serverSupabase();
  if (!db) return "";
  const { data } = await db
    .from("edu_glossary")
    .select("term_en, term_ks, term_ur, subject")
    .in("subject", [subject, "general"])
    .limit(60);
  if (!data?.length) return "";
  const col = lang === "urdu" ? "term_ur" : "term_ks";
  const lines = data
    .map((r: Record<string, string>) => `${r.term_en} = ${r[col]}`)
    .filter((l) => !l.endsWith("= "));
  if (!lines.length) return "";
  return `Verified glossary (use these exact target-language terms, never transliterate English):\n${lines.join("\n")}`;
}

/** Curated local/cultural examples the model must choose from instead of inventing. */
export async function fetchLocalExamples(subject: string, topic: string): Promise<string> {
  const db = serverSupabase();
  if (!db) return "";
  const { data } = await db
    .from("local_examples")
    .select("concept_key, title, body_en, subject")
    .in("subject", [subject, "general"])
    .limit(60);
  if (!data?.length) return "";
  const words = topic.toLowerCase();
  const sorted = [...data].sort((a: Record<string, string>, b: Record<string, string>) => {
    const score = (r: Record<string, string>) => (words.includes(r.concept_key.toLowerCase()) ? -1 : 0);
    return score(a) - score(b);
  });
  const lines = sorted
    .slice(0, 24)
    .map((r: Record<string, string>) => `[${r.concept_key}] ${r.title}: ${r.body_en}`);
  return `Curated local Kashmir examples — pick the closest one for each concept and adapt it to the grade. Do NOT invent generic examples (no pizza):\n${lines.join("\n")}`;
}

export async function callAi(system: string, user: string, key: string): Promise<string> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (res.status === 429) throw new Error("Too many requests — please try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted — please top up to continue.");
  if (!res.ok) throw new Error(`Lesson generation failed [${res.status}]`);
  const json = await res.json();
  return String(json?.choices?.[0]?.message?.content ?? "").trim();
}

export function parseJson<T>(raw: string, fallback: T): T {
  const match = raw.match(/[[{][\s\S]*[\]}]/);
  if (!match) return fallback;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return fallback;
  }
}
