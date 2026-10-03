CREATE TABLE public.user_lesson_state (
  user_id uuid PRIMARY KEY,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_lesson_state TO authenticated;
GRANT ALL ON public.user_lesson_state TO service_role;
ALTER TABLE public.user_lesson_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lesson state owner all" ON public.user_lesson_state
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);