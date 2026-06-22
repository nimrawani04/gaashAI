
CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_sessions_user_id_idx ON public.chat_sessions(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_sessions TO authenticated;
GRANT ALL ON public.chat_sessions TO service_role;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions owner all" ON public.chat_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  is_rtl boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_session_id_idx ON public.chat_messages(session_id, created_at ASC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages via session" ON public.chat_messages
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));
