-- Glossary of verified educational terms
CREATE TABLE public.edu_glossary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_en text NOT NULL,
  term_ks text NOT NULL DEFAULT '',
  term_ur text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT 'general',
  grade_band text NOT NULL DEFAULT '3-8',
  verified boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.edu_glossary TO anon, authenticated;
GRANT ALL ON public.edu_glossary TO service_role;
ALTER TABLE public.edu_glossary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "glossary readable by everyone" ON public.edu_glossary FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "staff manage glossary" ON public.edu_glossary FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Curated local / cultural examples
CREATE TABLE public.local_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_key text NOT NULL,
  subject text NOT NULL DEFAULT 'general',
  grade_band text NOT NULL DEFAULT '3-8',
  region text NOT NULL DEFAULT 'Kashmir',
  title text NOT NULL,
  body_en text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.local_examples TO anon, authenticated;
GRANT ALL ON public.local_examples TO service_role;
ALTER TABLE public.local_examples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "examples readable by everyone" ON public.local_examples FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "staff manage examples" ON public.local_examples FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Lesson sessions owned by the teacher
CREATE TABLE public.lesson_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled lesson',
  grade int NOT NULL DEFAULT 5,
  subject text NOT NULL DEFAULT 'general',
  target_language text NOT NULL DEFAULT 'kashmiri',
  source_text text NOT NULL DEFAULT '',
  objective text NOT NULL DEFAULT '',
  prerequisites jsonb NOT NULL DEFAULT '[]'::jsonb,
  difficulty text NOT NULL DEFAULT 'medium',
  concepts jsonb NOT NULL DEFAULT '[]'::jsonb,
  quiz jsonb NOT NULL DEFAULT '[]'::jsonb,
  results jsonb NOT NULL DEFAULT '{}'::jsonb,
  weak_concepts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lesson_sessions_user_idx ON public.lesson_sessions(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_sessions TO authenticated;
GRANT ALL ON public.lesson_sessions TO service_role;
ALTER TABLE public.lesson_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lesson owner all" ON public.lesson_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Teacher corrections feedback loop
CREATE TABLE public.lesson_corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.lesson_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept text NOT NULL DEFAULT '',
  kind text NOT NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.lesson_corrections TO authenticated;
GRANT ALL ON public.lesson_corrections TO service_role;
ALTER TABLE public.lesson_corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "corrections insert own" ON public.lesson_corrections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "corrections read own or staff" ON public.lesson_corrections FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- Seed glossary
INSERT INTO public.edu_glossary (term_en, term_ks, term_ur, subject, grade_band) VALUES
('fraction','حِصہٕ (فریکشن)','کسر','maths','3-5'),
('numerator','ہٕریُم عدد','شمار کنندہ','maths','3-5'),
('denominator','بۄنیُم عدد','نسب نما','maths','3-5'),
('equivalent fractions','برابر حِصہٕ','مساوی کسریں','maths','3-6'),
('multiplication','ضرب','ضرب','maths','3-5'),
('division','تقسیم','تقسیم','maths','3-5'),
('gravity','کشش ثقل','کشش ثقل','science','5-8'),
('photosynthesis','ضیائی تالیف','ضیائی تالیف','science','6-8'),
('evaporation','بخارات بنُن','بخارات بننا','science','4-7'),
('condensation','ٹھنڈ گٔژھتھ آب بنُن','تکثیف','science','4-7'),
('precipitation','رود پیُن','بارش','science','4-7'),
('water cycle','آبی چکر','آبی دوران','science','4-7'),
('energy','توانائی','توانائی','science','5-8'),
('force','طاقت','قوت','science','5-8'),
('digestion','ہاضمہ','ہاضمہ','science','5-8'),
('ecosystem','ماحولیاتی نظام','ماحولیاتی نظام','science','6-8'),
('democracy','جمہوریت','جمہوریت','social','6-8'),
('climate','موسمی حال','آب و ہوا','social','5-8'),
('noun','اِسم','اسم','language','3-6'),
('verb','فِعل','فعل','language','3-6');

-- Seed local examples
INSERT INTO public.local_examples (concept_key, subject, grade_band, title, body_en) VALUES
('fraction','maths','3-5','Sharing apples','Four children share 2 apples from an orchard in Sopore equally — each child gets one half (1/2) of an apple.'),
('fraction','maths','3-6','Kashmiri bread','A round girda from the bakery is cut into 4 equal pieces for a family of four; each piece is 1/4 of the bread.'),
('equivalent fractions','maths','4-6','Walnut trays','Two trays of walnuts: 1 out of 2 rows filled equals 2 out of 4 smaller rows filled — the same amount.'),
('comparing fractions','maths','4-6','Saffron packets','A 1/2 kg packet of saffron rice is heavier than a 1/4 kg packet, so 1/2 is greater than 1/4.'),
('division','maths','3-5','Sharing walnuts','12 walnuts shared equally between 3 friends gives 4 walnuts each.'),
('water cycle','science','4-7','Dal Lake to snow','Sun heats Dal Lake water into vapour, clouds form over the Pir Panjal, and snow falls on Gulmarg before melting back into the Jhelum.'),
('evaporation','science','4-7','Drying phiran','A wet phiran hung in the courtyard on a sunny day dries because water turns into vapour.'),
('condensation','science','4-7','Kangri steam','Steam from noon chai touching a cold window turns back into water droplets.'),
('precipitation','science','4-7','Chillai Kalan snow','During Chillai Kalan, water in the clouds becomes so heavy that it falls as snow over the valley.'),
('photosynthesis','science','6-8','Chinar leaves','A chinar tree''s green leaves use sunlight, air and water from the soil to make their own food.'),
('gravity','science','5-8','Falling apple','An apple loosened in a Shopian orchard always falls down to the ground, never upwards.'),
('force','science','5-8','Shikara oar','Pushing water with a shikara oar moves the boat forward on Dal Lake.'),
('energy','science','5-8','Hangul and hay','A hangul deer gets energy from grass, just as a truck gets energy from fuel.'),
('ecosystem','science','6-8','Dachigam','In Dachigam forest, plants, hangul, birds and soil all depend on each other.'),
('climate','social','5-8','Valley seasons','Kashmir has cold snowy winters and mild summers because of its high mountains.');