/** Kashmiri language pack: grammar, phrases and pronunciation (Perso-Arabic script). */

export type PackPhrase = { ks: string; roman: string; en: string };
export type PhraseGroup = { title: string; items: PackPhrase[] };
export type GrammarRule = { title: string; rule: string; examples: PackPhrase[] };
export type Sound = { letter: string; roman: string; sayLike: string; example: PackPhrase };

export const GRAMMAR: GrammarRule[] = [
  {
    title: "Word order: verb second (V2)",
    rule: "Kashmiri puts the main or helping verb in second position in a statement, like German. The subject usually comes first, then the verb, then the rest.",
    examples: [
      { ks: "بہٕ چھُس گَرٕ گَژھان", roman: "bɨ chus gar gatshaan", en: "I am going home" },
      { ks: "سُہ چھُ کِتاب پَران", roman: "su chu kitaab paraan", en: "He is reading a book" },
    ],
  },
  {
    title: "Pronouns",
    rule: "Personal pronouns change for person and number. Use تۄہؠ (tohi) for polite 'you' with elders and strangers.",
    examples: [
      { ks: "بہٕ", roman: "bɨ", en: "I" },
      { ks: "ژٕ", roman: "tsɨ", en: "you (informal)" },
      { ks: "تۄہؠ", roman: "tohi", en: "you (polite / plural)" },
      { ks: "سُہ / سۄ", roman: "su / so", en: "he / she" },
      { ks: "أسؠ", roman: "aessi", en: "we" },
    ],
  },
  {
    title: "The verb 'to be' agrees with the subject",
    rule: "چھُ (chu) is used for masculine, چھےٚ (che) for feminine, and it takes endings for person: چھُس (chus) 'I am' (m.), چھَس (chas) 'I am' (f.).",
    examples: [
      { ks: "بہٕ چھُس ٹھیک", roman: "bɨ chus theek", en: "I am fine (man speaking)" },
      { ks: "بہٕ چھَس ٹھیک", roman: "bɨ chas theek", en: "I am fine (woman speaking)" },
    ],
  },
  {
    title: "Gender and plural",
    rule: "Nouns are masculine or feminine. Adjectives and verbs agree. Many masculine nouns form plurals by changing the final vowel; feminine nouns often add ـہٕ.",
    examples: [
      { ks: "لۄکُٹ کوٗر", roman: "lokut koor", en: "small girl" },
      { ks: "لۄکُٹ لَڑکہٕ", roman: "lokut ladkɨ", en: "small boy" },
    ],
  },
  {
    title: "Postpositions, not prepositions",
    rule: "Words like 'in', 'on', 'to' come after the noun: منٛز (manz) in, پؠٹھ (peth) on, کُن (kun) towards.",
    examples: [
      { ks: "گَرس منٛز", roman: "garas manz", en: "in the house" },
      { ks: "میزس پؠٹھ", roman: "meezas peth", en: "on the table" },
    ],
  },
  {
    title: "Negation and questions",
    rule: "Add ـنہٕ (-na) to the verb to make it negative. Add ـا (-aa) or use کیٛاہ (kyaah) to ask a question.",
    examples: [
      { ks: "بہٕ چھُس نہٕ زانان", roman: "bɨ chus na zaanaan", en: "I don't know" },
      { ks: "ژٕ چھُکھا ٹھیک؟", roman: "tsɨ chukhaa theek?", en: "Are you fine?" },
    ],
  },
];

export const PHRASES: PhraseGroup[] = [
  {
    title: "Greetings",
    items: [
      { ks: "اَسلامُ علیکُم", roman: "asalaamu alaikum", en: "Hello (peace be upon you)" },
      { ks: "آداب", roman: "aadaab", en: "Respectful greeting" },
      { ks: "تۄہؠ کِتھ پٲٹھؠ چھِو؟", roman: "tohi kith paeth chiv?", en: "How are you? (polite)" },
      { ks: "بہٕ چھُس ٹھیک، شُکریہ", roman: "bɨ chus theek, shukriya", en: "I am fine, thank you" },
      { ks: "خُدا حافِظ", roman: "khudaa haafiz", en: "Goodbye" },
    ],
  },
  {
    title: "Everyday",
    items: [
      { ks: "توٚہہٕ کیٛاہ چھُ ناو؟", roman: "tuhund kyaah chu naav?", en: "What is your name?" },
      { ks: "میٲنۍ ناو چھُ…", roman: "myaen naav chu…", en: "My name is…" },
      { ks: "آ", roman: "aa", en: "Yes" },
      { ks: "نَہ", roman: "na", en: "No" },
      { ks: "مہربٲنی کٔرِتھ", roman: "meharbaeni karith", en: "Please" },
      { ks: "شُکریہ", roman: "shukriya", en: "Thank you" },
      { ks: "بہٕ چھُس نہٕ زانان", roman: "bɨ chus na zaanaan", en: "I don't know" },
    ],
  },
  {
    title: "Travel & market",
    items: [
      { ks: "یہِ کیٛاہ چھُ؟", roman: "yi kyaah chu?", en: "What is this?" },
      { ks: "یہِ کوٚتُر چھُ؟", roman: "yi kotur chu?", en: "How much is this?" },
      { ks: "بازار کؠتہِ چھُ؟", roman: "baazaar kati chu?", en: "Where is the market?" },
      { ks: "آب دِیِو", roman: "aab diyiv", en: "Please give water" },
      { ks: "واریاہ جان", roman: "vaaryaah jaan", en: "Very good" },
    ],
  },
  {
    title: "Classroom",
    items: [
      { ks: "بیٚیِہ وَنِو", roman: "beyi vaniv", en: "Please say it again" },
      { ks: "آہِستہ وَنِو", roman: "aahista vaniv", en: "Please speak slowly" },
      { ks: "بہٕ گوٚس نہٕ سمجھِتھ", roman: "bɨ gos na samjith", en: "I didn't understand" },
      { ks: "یہِ کٲشِرِس منٛز کِتھ پٲٹھؠ وَنَو؟", roman: "yi kaashiris manz kith paeth vanav?", en: "How do we say this in Kashmiri?" },
    ],
  },
];

export const SOUNDS: Sound[] = [
  { letter: "ٕ / ٔ", roman: "ɨ / ə", sayLike: "Short central vowel, like the 'u' in 'butter' said quickly", example: { ks: "بہٕ", roman: "bɨ", en: "I" } },
  { letter: "ٲ", roman: "ae", sayLike: "Long vowel between 'a' and 'e'", example: { ks: "کٲشُر", roman: "kaashur", en: "Kashmiri" } },
  { letter: "ۄ", roman: "o", sayLike: "Short 'o' as in 'pot'", example: { ks: "لۄکُٹ", roman: "lokut", en: "small" } },
  { letter: "وٗ", roman: "oo", sayLike: "Long rounded 'oo' as in 'food'", example: { ks: "کوٗر", roman: "koor", en: "girl / daughter" } },
  { letter: "ژ", roman: "ts", sayLike: "'ts' as in 'cats' — very common in Kashmiri", example: { ks: "ژٕ", roman: "tsɨ", en: "you" } },
  { letter: "ژھ", roman: "tsh", sayLike: "Breathy 'ts' with a puff of air", example: { ks: "ژھانُن", roman: "tshaanun", en: "to sift" } },
  { letter: "ؠ", roman: "ʲ (soft)", sayLike: "Softens (palatalises) the consonant before it, a light 'y' glide", example: { ks: "تۄہؠ", roman: "tohi", en: "you (polite)" } },
  { letter: "چھ", roman: "ch (aspirated)", sayLike: "'ch' with a puff of air, as in 'church' said strongly", example: { ks: "چھُ", roman: "chu", en: "is" } },
  { letter: "ٹ / ڈ", roman: "ṭ / ḍ", sayLike: "Tongue curled back to the roof of the mouth", example: { ks: "ٹھیک", roman: "theek", en: "fine / okay" } },
];
