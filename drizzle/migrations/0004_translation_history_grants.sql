GRANT SELECT, INSERT, UPDATE, DELETE ON public.translation_history TO authenticated;
GRANT ALL ON public.translation_history TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_lesson_state TO authenticated;
GRANT ALL ON public.user_lesson_state TO service_role;