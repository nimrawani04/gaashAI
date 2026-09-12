/**
 * Pre-generates a few complete lesson + quiz flows and writes them to
 * public/offline-lessons.json so the /learn demo works with no connectivity.
 * Run with: bun scripts/pregen-lessons.mjs
 */
import { writeFileSync } from "node:fs";

const KEY = process.env.LOVABLE_API_KEY;
if (!KEY) throw new Error("LOVABLE_API_KEY missing");

const LANG_LABEL = {
  kashmiri: "Kashmiri (کٲشُر) in Perso-Arabic Nastaliq script",
  urdu: "Urdu in Nastaliq script",
  hindi: "Hindi in Devanagari script",
  english: "simple English",
};

async function callAi(system, user) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Lovable-API-Key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (res.ok) {
      const json = await res.json();
      return String(json?.choices?.[0]?.message?.content ?? "").trim();
    }
    if (res.status !== 429) throw new Error(`AI failed ${res.status}: ${(await res.text()).slice(0, 200)}`);
    await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
  }
  throw new Error("AI rate limited");
}

function parseJson(raw, fallback) {
  const m = raw.match(/[[{][\s\S]*[\]}]/);
  if (!m) return fallback;
  try {
    return JSON.parse(m[0]);
  } catch {
    return fallback;
  }
}

function lessonSystem({ grade, subject, language }) {
  const advanced = grade > 7;
  return [
    "You are an adaptive pedagogical engine for Kashmiri government-school teachers.",
    `Target: Grade ${grade}, subject ${subject}, mother tongue: ${LANG_LABEL[language]}.`,
    "Work in this exact order for every concept: (1) extract the concept, (2) SIMPLIFY it in English to the target grade's reading and cognitive level, (3) attach a local Kashmir example, (4) only THEN render it in the mother tongue. Never translate raw textbook language.",
    advanced
      ? "Senior class: go deep. Fill 'deep_dive_en', 'formula' and 'application_target'. 'simplified_en' = 5-8 substantial sentences."
      : `Grade ${grade} rules: short sentences (max ${grade <= 4 ? 12 : 18} words), everyday vocabulary. 'simplified_en' = 2-4 sentences. Leave 'deep_dive_en', 'formula' and 'application_target' as empty strings.`,
    `Extract ${advanced ? "5 to 8" : "3 to 6"} core concepts, prerequisites, one learning objective, and a difficulty of easy | medium | hard.`,
    "Add a diagram ONLY when it genuinely helps. Set 'diagram' to null otherwise. A diagram has 3-6 nodes; every node label must also be in the mother tongue.",
    "Use real Kashmir examples (chinar, Dal lake, saffron, apple orchards, shikara, kangri) — never generic ones like pizza.",
    'Reply ONLY with compact JSON: {"title":"...","objective":"...","prerequisites":["..."],"difficulty":"easy|medium|hard","concepts":[{"name_en":"...","name_target":"...","simplified_en":"...","explanation_target":"...","deep_dive_en":"...","formula":"...","application_target":"...","example_title":"...","example_en":"...","example_target":"...","diagram":{"kind":"cycle|flow|parts","title_en":"...","title_target":"...","nodes":[{"label_en":"...","label_target":"...","note_target":"..."}]}}]}',
  ].join("\n\n");
}

function quizSystem({ grade, subject, language, perConcept }) {
  return [
    `You write Grade ${grade} ${subject} assessment questions in ${LANG_LABEL[language]}.`,
    `Write exactly ${perConcept} questions for EACH concept given by the user.`,
    "Mix question types: mcq, fill, short, numeric. At least one must be a word problem set in Kashmir.",
    'Reply ONLY with a compact JSON array: [{"concept":"exact concept name from the user list","type":"mcq|fill|short|numeric","question_en":"...","question_target":"...","options":["..."],"answer":"...","answer_target":"..."}]',
    "options must be 4 items for mcq and an empty array otherwise. 'answer' is the correct answer in English (for mcq it must exactly match one option).",
  ].join("\n\n");
}

const PACKS = [
  {
    id: "fractions-g5-ks",
    label: "Fractions · Grade 5 · Kashmiri",
    grade: 5,
    subject: "maths",
    language: "kashmiri",
    source:
      "Grade lesson on fractions: numerator, denominator, equivalent fractions and comparing fractions.",
  },
  {
    id: "water-cycle-g5-ks",
    label: "Water cycle · Grade 5 · Kashmiri",
    grade: 5,
    subject: "science",
    language: "kashmiri",
    source:
      "Grade lesson on the water cycle: evaporation, condensation, precipitation and collection.",
  },
  {
    id: "photosynthesis-g8-ks",
    label: "Photosynthesis · Grade 8 · Kashmiri",
    grade: 8,
    subject: "science",
    language: "kashmiri",
    source:
      "Grade lesson on photosynthesis: how green leaves make food using sunlight, water and carbon dioxide.",
  },
  {
    id: "environment-g6-ur",
    label: "Our environment · Grade 6 · Urdu",
    grade: 6,
    subject: "social",
    language: "urdu",
    source:
      "Grade lesson on our environment: land, water, plants, animals and how people depend on them.",
  },
];

const out = [];
for (const pack of PACKS) {
  process.stdout.write(`Generating ${pack.id}… `);
  const lessonRaw = await callAi(lessonSystem(pack), pack.source);
  const lesson = parseJson(lessonRaw, null);
  if (!lesson?.concepts?.length) {
    console.log("lesson failed, skipping");
    continue;
  }
  lesson.prerequisites ??= [];
  const concepts = lesson.concepts.slice(0, 6).map((c) => c.name_en);
  const quizRaw = await callAi(quizSystem({ ...pack, perConcept: 3 }), `Concepts:\n${concepts.join("\n")}`);
  const quiz = (parseJson(quizRaw, []) || []).map((q) => ({
    concept: String(q.concept ?? concepts[0]),
    type: ["mcq", "fill", "short", "numeric"].includes(q.type) ? q.type : "short",
    question_en: String(q.question_en ?? ""),
    question_target: String(q.question_target ?? ""),
    options: Array.isArray(q.options) ? q.options.map(String).slice(0, 4) : [],
    answer: String(q.answer ?? ""),
    answer_target: String(q.answer_target ?? ""),
  }));
  out.push({ ...pack, lesson, quiz });
  console.log(`ok (${lesson.concepts.length} concepts, ${quiz.length} questions)`);
}

if (!out.length) throw new Error("No packs generated");
writeFileSync(
  "public/offline-lessons.json",
  JSON.stringify({ version: Date.now(), packs: out }, null, 0),
);
console.log(`Wrote public/offline-lessons.json with ${out.length} packs`);
