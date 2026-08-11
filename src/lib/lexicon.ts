/**
 * Kashmiri ⇄ English lexicon + a normalization / matching pipeline.
 *
 *   User input → normalize → whitespace/case/punctuation → spelling variations
 *   → word & phrase match → sentence-level match → fallback
 *
 * This is a shared layer: the translator uses it for instant offline results
 * (and as a fallback when the AI is unavailable), and the chat surface uses it
 * to recognise common greetings/phrases so the bot never answers with
 * "I don't understand".
 */

export type LexKind = "word" | "phrase" | "sentence";

export interface LexEntry {
  /** Kashmiri in Perso-Arabic (Nastaliq) script. */
  ks: string;
  /** Roman transliteration for pronunciation + Roman-input matching. */
  roman: string;
  /** English meaning(s); the first is the primary translation. */
  en: string[];
  kind: LexKind;
  /** Optional extra Kashmiri spellings seen in the wild. */
  variants?: string[];
}

/* ------------------------------------------------------------------ */
/* Normalization                                                       */
/* ------------------------------------------------------------------ */

const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;

/** Kashmiri/Urdu letters that get typed interchangeably. */
const ARABIC_FOLD: [RegExp, string][] = [
  [/[\u0623\u0625\u0622\u0671]/g, "\u0627"], // أ إ آ ٱ → ا
  [/[\u06CC\u064A\u0649\u06D2]/g, "\u06CC"], // ي ى ے → ی
  [/[\u0643]/g, "\u06A9"], // ك → ک
  [/[\u0629]/g, "\u06C1"], // ة → ہ
  [/[\u0647\u06C1\u06C3]/g, "\u06C1"], // ه ہ ۃ → ہ
  [/[\u0624\u0648\u06C4\u06C6\u06C7]/g, "\u0648"], // ؤ ۆ ۇ → و
  [/[\u06BE]/g, "\u06C1"], // ھ → ہ (soft, helps loose matching)
];

/** Roman transliteration variations users type. */
const ROMAN_FOLD: [RegExp, string][] = [
  [/kh/g, "k"],
  [/gh/g, "g"],
  [/ph/g, "f"],
  [/sh/g, "s"],
  [/ch/g, "c"],
  [/th/g, "t"],
  [/dh/g, "d"],
  [/zh/g, "z"],
  [/aa+/g, "a"],
  [/ee+/g, "i"],
  [/oo+/g, "u"],
  [/ii+/g, "i"],
  [/uu+/g, "u"],
  [/y/g, "i"],
  [/w/g, "v"],
  [/q/g, "k"],
  [/(.)\1+/g, "$1"],
];

export function hasArabicScript(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/** Strip punctuation, collapse whitespace, lowercase. */
export function normalizeBase(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\u200B-\u200F\u202A-\u202E]/g, "")
    .toLowerCase()
    .replace(/[.,!?؟۔;:'"“”‘’()[\]{}<>/\\|@#$%^&*_+=~`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Full normalization used for lookups (script-aware). */
export function normalize(text: string): string {
  let out = normalizeBase(text);
  if (hasArabicScript(out)) {
    out = out.replace(ARABIC_DIACRITICS, "");
    for (const [re, to] of ARABIC_FOLD) out = out.replace(re, to);
    return out.replace(/\s+/g, " ").trim();
  }
  out = out.replace(/[^a-z0-9\s]/g, "");
  for (const [re, to] of ROMAN_FOLD) out = out.replace(re, to);
  return out.replace(/\s+/g, " ").trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

/** 0..1 similarity. */
export function similarity(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  if (!max) return 0;
  return 1 - levenshtein(a, b) / max;
}

/* ------------------------------------------------------------------ */
/* Lexicon                                                             */
/* ------------------------------------------------------------------ */

export const LEXICON: LexEntry[] = [
  // ---------- Greetings & courtesy ----------
  { ks: "اَسلامُ علیکم", roman: "assalamu alaikum", en: ["hello", "peace be upon you", "greetings"], kind: "phrase", variants: ["السلام علیکم", "سلام"] },
  { ks: "وعلیکم اَسلام", roman: "walaikum assalam", en: ["hello back", "and peace be upon you too"], kind: "phrase" },
  { ks: "آداب", roman: "aadab", en: ["greetings", "respects"], kind: "word" },
  { ks: "شُکریہ", roman: "shukriya", en: ["thank you", "thanks"], kind: "word", variants: ["مہربانی"] },
  { ks: "بۆڈ شُکریہ", roman: "bod shukriya", en: ["thank you very much"], kind: "phrase" },
  { ks: "مہربانی", roman: "meharbani", en: ["please", "kindness"], kind: "word" },
  { ks: "معاف کٔرِو", roman: "maaf kariv", en: ["sorry", "excuse me", "forgive me"], kind: "phrase" },
  { ks: "خُدا حافظ", roman: "khuda hafiz", en: ["goodbye", "farewell"], kind: "phrase" },
  { ks: "پھر ملو", roman: "phir milav", en: ["see you again", "see you later"], kind: "phrase" },
  { ks: "خوش آمدید", roman: "khush aamdeed", en: ["welcome"], kind: "phrase" },
  { ks: "شُبہ صُبح", roman: "shubh subah", en: ["good morning"], kind: "phrase" },
  { ks: "شُبہ رات", roman: "shubh raath", en: ["good night"], kind: "phrase" },

  // ---------- Everyday questions ----------
  { ks: "تُہہٕ کِتھ پٲٹھؠ چھِو؟", roman: "tohe kith pathy chhiv", en: ["how are you?"], kind: "sentence", variants: ["کیتھ پاٹھی چھیو", "کیہو چھیو"] },
  { ks: "بہٕ چھُس ٹھیک", roman: "bi chhus theek", en: ["i am fine", "i am well"], kind: "sentence" },
  { ks: "تُہُنٛد ناو کیا چھُ؟", roman: "tohund naav kya chhu", en: ["what is your name?"], kind: "sentence", variants: ["ناو کیا چھ"] },
  { ks: "میٚون ناو چھُ", roman: "myon naav chhu", en: ["my name is"], kind: "phrase" },
  { ks: "کٲتؠ چھِو گژھان؟", roman: "katy chhiv gatshaan", en: ["where are you going?"], kind: "sentence" },
  { ks: "کٲتؠ چھُ؟", roman: "katy chhu", en: ["where is it?"], kind: "sentence" },
  { ks: "کیٔاہ چھُ؟", roman: "kyah chhu", en: ["what is it?"], kind: "sentence" },
  { ks: "کٔہ وقت چھُ؟", roman: "kah waqt chhu", en: ["what time is it?"], kind: "sentence" },
  { ks: "یہِ کیٚتھ چھُ؟", roman: "yi kyot chhu", en: ["how much is this?", "what is the price?"], kind: "sentence" },
  { ks: "کیازِ؟", roman: "kyazi", en: ["why?"], kind: "word" },
  { ks: "کۄس؟", roman: "kus", en: ["who?"], kind: "word" },
  { ks: "کر؟", roman: "kar", en: ["when?"], kind: "word" },
  { ks: "کِتھ کٔنؠ؟", roman: "kith kany", en: ["how?"], kind: "phrase" },
  { ks: "کٔتؠاہ؟", roman: "katyah", en: ["how many?", "how much?"], kind: "word" },
  { ks: "میٚ چھُ نہٕ پتہٕ", roman: "me chhu na pata", en: ["i don't know"], kind: "sentence" },
  { ks: "میٚ ژھُ سمج", roman: "me chhu samaj", en: ["i understand"], kind: "sentence" },
  { ks: "دوبارٕ ونیو", roman: "dobaar wanyav", en: ["say it again", "repeat please"], kind: "phrase" },
  { ks: "روزِتھ ونیو", roman: "rozith wanyav", en: ["speak slowly"], kind: "phrase" },
  { ks: "مدد کٔرِو", roman: "madad kariv", en: ["help me", "please help"], kind: "phrase" },

  // ---------- Pronouns & basics ----------
  { ks: "بہٕ", roman: "bi", en: ["i", "me"], kind: "word" },
  { ks: "أسؠ", roman: "asi", en: ["we", "us"], kind: "word" },
  { ks: "ژٕ", roman: "tsi", en: ["you (informal)"], kind: "word" },
  { ks: "تۄہؠ", roman: "tohy", en: ["you (formal/plural)"], kind: "word" },
  { ks: "سُہ", roman: "suh", en: ["he", "that (masc.)"], kind: "word" },
  { ks: "سٕ", roman: "sa", en: ["she"], kind: "word" },
  { ks: "تِم", roman: "tim", en: ["they"], kind: "word" },
  { ks: "یہِ", roman: "yi", en: ["this"], kind: "word" },
  { ks: "سُہ", roman: "su", en: ["that"], kind: "word" },
  { ks: "آ", roman: "aa", en: ["yes"], kind: "word" },
  { ks: "نہٕ", roman: "na", en: ["no", "not"], kind: "word" },
  { ks: "ٹھیک", roman: "theek", en: ["okay", "fine", "alright"], kind: "word" },
  { ks: "بہتر", roman: "behtar", en: ["better", "good"], kind: "word" },
  { ks: "جان", roman: "jaan", en: ["good", "nice", "well"], kind: "word" },
  { ks: "خراب", roman: "kharab", en: ["bad", "spoiled"], kind: "word" },
  { ks: "زیادٕ", roman: "ziyada", en: ["more", "a lot"], kind: "word" },
  { ks: "کم", roman: "kam", en: ["less", "few"], kind: "word" },
  { ks: "بۆڈ", roman: "bod", en: ["big", "large"], kind: "word" },
  { ks: "لۄکُٹ", roman: "lokut", en: ["small", "little"], kind: "word" },
  { ks: "نٔو", roman: "nav", en: ["new"], kind: "word" },
  { ks: "پرون", roman: "puron", en: ["old"], kind: "word" },

  // ---------- Family & people ----------
  { ks: "موج", roman: "moj", en: ["mother"], kind: "word", variants: ["ماجی"] },
  { ks: "مول", roman: "mol", en: ["father"], kind: "word" },
  { ks: "بۄے", roman: "boy", en: ["brother"], kind: "word" },
  { ks: "بێنؠ", roman: "beni", en: ["sister"], kind: "word", variants: ["بینی"] },
  { ks: "نێچُو", roman: "nechuv", en: ["son"], kind: "word", variants: ["نیچو"] },
  { ks: "کوٗر", roman: "koor", en: ["daughter", "girl"], kind: "word" },
  { ks: "شُر", roman: "shur", en: ["child", "kid"], kind: "word" },
  { ks: "زنانہٕ", roman: "zanaan", en: ["woman", "wife"], kind: "word" },
  { ks: "مرد", roman: "mard", en: ["man", "husband"], kind: "word" },
  { ks: "دوست", roman: "dost", en: ["friend"], kind: "word" },
  { ks: "استاد", roman: "ustaad", en: ["teacher"], kind: "word" },
  { ks: "ڈاکٹر", roman: "doctor", en: ["doctor"], kind: "word" },
  { ks: "طالِب علم", roman: "talib ilm", en: ["student"], kind: "word" },
  { ks: "پَڑوسی", roman: "parosi", en: ["neighbour"], kind: "word" },

  // ---------- Time ----------
  { ks: "اَز", roman: "az", en: ["today"], kind: "word" },
  { ks: "پگاہ", roman: "pagah", en: ["tomorrow", "morning"], kind: "word" },
  { ks: "راتھ", roman: "raath", en: ["yesterday", "night"], kind: "word" },
  { ks: "وُنؠ", roman: "wony", en: ["now"], kind: "word" },
  { ks: "پَتہٕ", roman: "pata", en: ["later", "after"], kind: "word" },
  { ks: "ہفتہٕ", roman: "hafta", en: ["week"], kind: "word" },
  { ks: "ریتھ", roman: "reth", en: ["month"], kind: "word" },
  { ks: "ؤری", roman: "wari", en: ["year"], kind: "word" },
  { ks: "دۄہ", roman: "doh", en: ["day"], kind: "word" },
  { ks: "گٲش", roman: "gaash", en: ["light", "daylight"], kind: "word" },
  { ks: "وقت", roman: "waqt", en: ["time"], kind: "word" },

  // ---------- Numbers ----------
  { ks: "اَکھ", roman: "akh", en: ["one", "1"], kind: "word" },
  { ks: "زٕ", roman: "zah", en: ["two", "2"], kind: "word" },
  { ks: "ترٛۍ", roman: "treh", en: ["three", "3"], kind: "word" },
  { ks: "ژور", roman: "tsor", en: ["four", "4"], kind: "word" },
  { ks: "پانٛژھ", roman: "paantsh", en: ["five", "5"], kind: "word" },
  { ks: "شیش", roman: "sheh", en: ["six", "6"], kind: "word" },
  { ks: "سَتھ", roman: "sath", en: ["seven", "7"], kind: "word" },
  { ks: "ٲٹھ", roman: "aeth", en: ["eight", "8"], kind: "word" },
  { ks: "نَو", roman: "nav", en: ["nine", "9"], kind: "word" },
  { ks: "دَہ", roman: "dah", en: ["ten", "10"], kind: "word" },
  { ks: "ژھۆہ", roman: "tshoh", en: ["twenty", "20"], kind: "word" },
  { ks: "ہَتھ", roman: "hath", en: ["hundred", "100"], kind: "word" },

  // ---------- Food & home ----------
  { ks: "بَتہٕ", roman: "batah", en: ["rice", "food", "meal"], kind: "word" },
  { ks: "تُجی", roman: "tsochi", en: ["bread", "kashmiri bread"], kind: "word", variants: ["ژۄچھ"] },
  { ks: "آب", roman: "aab", en: ["water"], kind: "word" },
  { ks: "چاۓ", roman: "chai", en: ["tea"], kind: "word" },
  { ks: "قہوٕ", roman: "kahwa", en: ["kahwa", "kashmiri green tea"], kind: "word" },
  { ks: "نوٗن چاۓ", roman: "noon chai", en: ["salt tea", "pink tea"], kind: "phrase" },
  { ks: "دۄد", roman: "dod", en: ["milk"], kind: "word" },
  { ks: "ماز", roman: "maaz", en: ["meat"], kind: "word" },
  { ks: "ہاکھ", roman: "haakh", en: ["collard greens", "kashmiri greens"], kind: "word" },
  { ks: "پھَل", roman: "phal", en: ["fruit"], kind: "word" },
  { ks: "تۄمُل", roman: "tomul", en: ["uncooked rice"], kind: "word" },
  { ks: "نوٗن", roman: "noon", en: ["salt"], kind: "word" },
  { ks: "گۄر", roman: "gour", en: ["sweet", "jaggery"], kind: "word" },
  { ks: "گَرٕ", roman: "gari", en: ["home", "house"], kind: "word" },
  { ks: "دَرٕ", roman: "dar", en: ["door", "window"], kind: "word" },
  { ks: "کوٗٹھ", roman: "kuth", en: ["room"], kind: "word" },
  { ks: "بۄچھ", roman: "bwachh", en: ["hunger"], kind: "word" },
  { ks: "میٚ چھِ بۄچھ", roman: "me chhi bwachh", en: ["i am hungry"], kind: "sentence" },
  { ks: "میٚ چھِ ترٛێش", roman: "me chhi tresh", en: ["i am thirsty"], kind: "sentence" },
  { ks: "بَتہٕ کھیو", roman: "batah khyav", en: ["eat food", "please eat"], kind: "phrase" },

  // ---------- Body & health ----------
  { ks: "صحت", roman: "sehat", en: ["health"], kind: "word" },
  { ks: "بیمار", roman: "bemaar", en: ["sick", "ill"], kind: "word" },
  { ks: "دَرد", roman: "dard", en: ["pain", "ache"], kind: "word" },
  { ks: "کَل", roman: "kal", en: ["head"], kind: "word" },
  { ks: "أتھ", roman: "ath", en: ["hand"], kind: "word" },
  { ks: "خۄر", roman: "khor", en: ["foot", "leg"], kind: "word" },
  { ks: "اَچھ", roman: "achh", en: ["eye"], kind: "word" },
  { ks: "دوا", roman: "dawa", en: ["medicine"], kind: "word" },
  { ks: "ہَسپتال", roman: "haspatal", en: ["hospital"], kind: "word" },
  { ks: "میٚ چھُ کلہٕ دَرد", roman: "me chhu kali dard", en: ["i have a headache"], kind: "sentence" },
  { ks: "میٚ چھُ بُخار", roman: "me chhu bukhar", en: ["i have a fever"], kind: "sentence" },
  { ks: "ڈاکٹر ہُنٛز ضرورت چھِ", roman: "doctor hunz zarurat chhi", en: ["i need a doctor"], kind: "sentence" },

  // ---------- Places, travel, weather ----------
  { ks: "شہر", roman: "shehar", en: ["city", "town"], kind: "word" },
  { ks: "گام", roman: "gaam", en: ["village"], kind: "word" },
  { ks: "بازار", roman: "bazaar", en: ["market"], kind: "word" },
  { ks: "سٕڑَک", roman: "sarak", en: ["road"], kind: "word" },
  { ks: "بس اَڈٕ", roman: "bus adda", en: ["bus stand"], kind: "phrase" },
  { ks: "ہوٲے اَڈٕ", roman: "hawai adda", en: ["airport"], kind: "phrase" },
  { ks: "ڈَل", roman: "dal", en: ["dal lake"], kind: "word" },
  { ks: "شِکارٕ", roman: "shikara", en: ["shikara boat"], kind: "word" },
  { ks: "کٲشِر", roman: "kaashur", en: ["kashmiri (language/person)"], kind: "word" },
  { ks: "کٔشیٖر", roman: "kasheer", en: ["kashmir"], kind: "word" },
  { ks: "سرینَگر", roman: "srinagar", en: ["srinagar"], kind: "word" },
  { ks: "ونہٕ", roman: "wan", en: ["forest"], kind: "word" },
  { ks: "کۄہ", roman: "koh", en: ["mountain"], kind: "word" },
  { ks: "دَریاو", roman: "daryaav", en: ["river"], kind: "word" },
  { ks: "شیٖن", roman: "sheen", en: ["snow"], kind: "word" },
  { ks: "رود", roman: "rood", en: ["rain"], kind: "word" },
  { ks: "ہوٚ", roman: "hav", en: ["wind", "air"], kind: "word" },
  { ks: "ٹھنٛڈ", roman: "thand", en: ["cold"], kind: "word" },
  { ks: "گَرٕم", roman: "garam", en: ["hot", "warm"], kind: "word" },
  { ks: "وَنٛدٕ", roman: "wandah", en: ["winter"], kind: "word" },
  { ks: "سونٛتھ", roman: "sonth", en: ["spring"], kind: "word" },
  { ks: "رَتھ", roman: "reth", en: ["moon"], kind: "word" },
  { ks: "اۄکھ", roman: "aftaab", en: ["sun"], kind: "word", variants: ["آفتاب"] },
  { ks: "اَز چھُ ٹھنٛڈ", roman: "az chhu thand", en: ["it is cold today"], kind: "sentence" },
  { ks: "رود چھُ پیوان", roman: "rood chhu pewaan", en: ["it is raining"], kind: "sentence" },

  // ---------- Work, money, school ----------
  { ks: "کٲم", roman: "kaam", en: ["work", "job"], kind: "word" },
  { ks: "روپَے", roman: "rupay", en: ["rupees", "money"], kind: "word" },
  { ks: "دوٗکان", roman: "dukaan", en: ["shop"], kind: "word" },
  { ks: "مَدرَسہ", roman: "madrasa", en: ["school"], kind: "word" },
  { ks: "سکوٗل", roman: "school", en: ["school"], kind: "word" },
  { ks: "کِتاب", roman: "kitaab", en: ["book"], kind: "word" },
  { ks: "پَرُن", roman: "parun", en: ["to read", "to study"], kind: "word" },
  { ks: "لیکھُن", roman: "lekhun", en: ["to write"], kind: "word" },
  { ks: "دفتَر", roman: "daftar", en: ["office"], kind: "word" },
  { ks: "بینک", roman: "bank", en: ["bank"], kind: "word" },

  // ---------- Common verbs ----------
  { ks: "گژھُن", roman: "gatshun", en: ["to go"], kind: "word" },
  { ks: "یُن", roman: "yun", en: ["to come"], kind: "word" },
  { ks: "کَرُن", roman: "karun", en: ["to do", "to make"], kind: "word" },
  { ks: "دِیُن", roman: "diyun", en: ["to give"], kind: "word" },
  { ks: "ہیُن", roman: "hyun", en: ["to take", "to buy"], kind: "word" },
  { ks: "کھیُن", roman: "khyun", en: ["to eat"], kind: "word" },
  { ks: "چیُن", roman: "chyun", en: ["to drink"], kind: "word" },
  { ks: "وَنُن", roman: "wanun", en: ["to say", "to tell"], kind: "word" },
  { ks: "بوزُن", roman: "bozun", en: ["to hear", "to listen"], kind: "word" },
  { ks: "وُچھُن", roman: "wuchhun", en: ["to see", "to look"], kind: "word" },
  { ks: "زانُن", roman: "zaanun", en: ["to know"], kind: "word" },
  { ks: "سوزُن", roman: "sozun", en: ["to send"], kind: "word" },
  { ks: "نیرُن", roman: "nerun", en: ["to leave", "to go out"], kind: "word" },
  { ks: "بیہُن", roman: "behun", en: ["to sit"], kind: "word" },
  { ks: "شونٛگُن", roman: "shongun", en: ["to sleep"], kind: "word" },
  { ks: "ہیچھُن", roman: "hechhun", en: ["to learn"], kind: "word" },
  { ks: "تھاوُن", roman: "thavun", en: ["to keep", "to put"], kind: "word" },

  // ---------- Useful sentences ----------
  { ks: "میٚ چھُ کٲشُر ہیچھان", roman: "me chhu kaashur hechhaan", en: ["i am learning kashmiri"], kind: "sentence" },
  { ks: "بہٕ چھُس سرینَگرٕ پؠٹھ", roman: "bi chhus srinagara pyath", en: ["i am from srinagar"], kind: "sentence" },
  { ks: "مہربانی کٔرِتھ یِیو", roman: "meharbani karith yiyiv", en: ["please come"], kind: "sentence" },
  { ks: "کیا حال چھُ؟", roman: "kya haal chhu", en: ["how is it going?", "what's up?"], kind: "sentence" },
  { ks: "میٚ ییٚژھان چھُ", roman: "me yechhaan chhu", en: ["i want"], kind: "phrase" },
  { ks: "میٚ چھُ نہٕ ییٚژھان", roman: "me chhu na yechhaan", en: ["i don't want"], kind: "phrase" },
  { ks: "أکِس مِنَٹَس", roman: "akis minatas", en: ["one minute", "just a moment"], kind: "phrase" },
  { ks: "کھۄدایَس حوالٕ", roman: "khodayas hawale", en: ["goodbye (god bless)"], kind: "phrase" },
  { ks: "بہٕ چھُس خۄش", roman: "bi chhus khush", en: ["i am happy"], kind: "sentence" },
  { ks: "یہِ چھُ سیٹھاہ جان", roman: "yi chhu sethah jaan", en: ["this is very good"], kind: "sentence" },
  { ks: "میٚانِس سٟتؠ ونیو", roman: "myanis saty wanyav", en: ["talk to me"], kind: "phrase" },
  { ks: "أکھ لَفظ ونیو", roman: "akh lafz wanyav", en: ["say one word"], kind: "phrase" },
];

/* ------------------------------------------------------------------ */
/* Indexes                                                             */
/* ------------------------------------------------------------------ */

type IndexRow = { key: string; entry: LexEntry; from: "ks" | "en" };

let INDEX: IndexRow[] | null = null;

function buildIndex(): IndexRow[] {
  if (INDEX) return INDEX;
  const rows: IndexRow[] = [];
  for (const entry of LEXICON) {
    rows.push({ key: normalize(entry.ks), entry, from: "ks" });
    rows.push({ key: normalize(entry.roman), entry, from: "ks" });
    for (const v of entry.variants ?? []) rows.push({ key: normalize(v), entry, from: "ks" });
    for (const meaning of entry.en) rows.push({ key: normalize(meaning), entry, from: "en" });
  }
  INDEX = rows.filter((r) => r.key.length > 0);
  return INDEX;
}

export interface LexMatch {
  entry: LexEntry;
  /** 1 = exact normalized match, lower = fuzzy. */
  score: number;
  matchedOn: "ks" | "en";
}

/**
 * Look up a normalized phrase. `side` is which side of the lexicon we search:
 * "ks" when the user typed Kashmiri, "en" when they typed English.
 */
export function lookup(text: string, side: "ks" | "en", minScore = 0.82): LexMatch | null {
  const key = normalize(text);
  if (!key) return null;
  const rows = buildIndex().filter((r) => r.from === side);

  for (const row of rows) if (row.key === key) return { entry: row.entry, score: 1, matchedOn: side };

  let best: LexMatch | null = null;
  for (const row of rows) {
    // Skip wildly different lengths — cheap guard before the edit distance.
    if (Math.abs(row.key.length - key.length) > Math.max(3, key.length * 0.5)) continue;
    const score = similarity(row.key, key);
    if (score >= minScore && (!best || score > best.score)) {
      best = { entry: row.entry, score, matchedOn: side };
    }
  }
  return best;
}

/** Which side of the lexicon should we search for this input? */
export function detectSide(text: string): "ks" | "en" {
  return hasArabicScript(text) ? "ks" : "en";
}

export interface OfflineTranslation {
  translation: string;
  roman: string;
  notes: string;
  /** true when every token/phrase was resolved from the lexicon. */
  complete: boolean;
}

/**
 * Sentence-level then word-level translation from the lexicon alone.
 * Used as an instant result and as a fallback if the AI call fails.
 */
export function translateOffline(
  text: string,
  direction: "en2ks" | "ks2en",
): OfflineTranslation | null {
  const side = direction === "en2ks" ? "en" : "ks";

  // 1) Whole-sentence / phrase match.
  const whole = lookup(text, side);
  if (whole && whole.score >= 0.9) {
    const e = whole.entry;
    return direction === "en2ks"
      ? { translation: e.ks, roman: e.roman, notes: `"${e.en[0]}" in Kashmiri.`, complete: true }
      : { translation: e.en[0], roman: e.roman, notes: `Kashmiri "${e.ks}".`, complete: true };
  }

  // 2) Word-by-word with a sliding 3→1 word window.
  const words = normalizeBase(text).split(" ").filter(Boolean);
  if (!words.length) return null;
  const outParts: string[] = [];
  const romanParts: string[] = [];
  let resolved = 0;
  let i = 0;
  while (i < words.length) {
    let matched: LexMatch | null = null;
    let span = 1;
    for (let w = Math.min(3, words.length - i); w >= 1; w--) {
      const candidate = words.slice(i, i + w).join(" ");
      const hit = lookup(candidate, side, 0.88);
      if (hit) {
        matched = hit;
        span = w;
        break;
      }
    }
    if (matched) {
      resolved += span;
      outParts.push(direction === "en2ks" ? matched.entry.ks : matched.entry.en[0]);
      romanParts.push(matched.entry.roman);
    } else {
      outParts.push(words[i]);
      romanParts.push(words[i]);
    }
    i += span;
  }

  const coverage = resolved / words.length;
  if (coverage === 0) return null;
  return {
    translation: outParts.join(" "),
    roman: romanParts.join(" "),
    notes:
      coverage === 1
        ? "Word-by-word from the built-in Kashmiri lexicon."
        : "Partly matched from the built-in lexicon — some words may need review.",
    complete: coverage === 1,
  };
}

/**
 * Chat-side helper: recognise a common phrase so the bot can answer
 * conversationally even when the backend is unreachable.
 */
export function localChatReply(text: string): string | null {
  const side = detectSide(text);
  const hit = lookup(text, side, 0.86);
  if (!hit) return null;
  const e = hit.entry;
  if (side === "ks") {
    // They spoke Kashmiri — reply in Kashmiri with a nudge to the meaning.
    return `${e.ks}\n\n(${e.en[0]})`;
  }
  return `${e.ks}\n\n${e.roman} — "${e.en[0]}"`;
}

export const LEXICON_SIZE = LEXICON.length;
