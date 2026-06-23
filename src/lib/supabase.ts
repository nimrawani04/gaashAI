/*
 * KashmirBot — Supabase schema
 *
 * Run this SQL in your Supabase project's SQL editor before using the app.
 *
 * -- 1. Profile table linked to auth.users ----------------------------------
 * create table public.users (
 *   id uuid primary key references auth.users(id) on delete cascade,
 *   phone text,
 *   email text,
 *   preferred_language text not null default 'kashmiri',
 *   created_at timestamptz not null default now()
 * );
 *
 * -- 2. Chat sessions ---------------------------------------------------------
 * create table public.chat_sessions (
 *   id uuid primary key default gen_random_uuid(),
 *   user_id uuid not null references auth.users(id) on delete cascade,
 *   title text,
 *   created_at timestamptz not null default now()
 * );
 * create index chat_sessions_user_id_idx on public.chat_sessions(user_id, created_at desc);
 *
 * -- 3. Chat messages ---------------------------------------------------------
 * create table public.chat_messages (
 *   id uuid primary key default gen_random_uuid(),
 *   session_id uuid not null references public.chat_sessions(id) on delete cascade,
 *   role text not null check (role in ('user','assistant')),
 *   content text not null,
 *   is_rtl boolean not null default false,
 *   created_at timestamptz not null default now()
 * );
 * create index chat_messages_session_id_idx on public.chat_messages(session_id, created_at asc);
 *
 * -- 4. Grants (Supabase Data API needs these) -------------------------------
 * grant select, insert, update, delete on public.users          to authenticated;
 * grant select, insert, update, delete on public.chat_sessions  to authenticated;
 * grant select, insert, update, delete on public.chat_messages  to authenticated;
 * grant all on public.users, public.chat_sessions, public.chat_messages to service_role;
 *
 * -- 5. Row level security ---------------------------------------------------
 * alter table public.users         enable row level security;
 * alter table public.chat_sessions enable row level security;
 * alter table public.chat_messages enable row level security;
 *
 * create policy "users self read"   on public.users         for select to authenticated using (auth.uid() = id);
 * create policy "users self upsert" on public.users         for insert to authenticated with check (auth.uid() = id);
 * create policy "users self update" on public.users         for update to authenticated using (auth.uid() = id);
 *
 * create policy "sessions owner all" on public.chat_sessions
 *   for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
 *
 * create policy "messages via session" on public.chat_messages
 *   for all to authenticated
 *   using (exists (select 1 from public.chat_sessions s where s.id = session_id and s.user_id = auth.uid()))
 *   with check (exists (select 1 from public.chat_sessions s where s.id = session_id and s.user_id = auth.uid()));
 *
 * -- 6. Auto-create profile row on signup ------------------------------------
 * create or replace function public.handle_new_user()
 * returns trigger language plpgsql security definer set search_path = public as $$
 * begin
 *   insert into public.users (id, email, phone)
 *   values (new.id, new.email, new.phone)
 *   on conflict (id) do nothing;
 *   return new;
 * end $$;
 *
 * drop trigger if exists on_auth_user_created on auth.users;
 * create trigger on_auth_user_created
 *   after insert on auth.users
 *   for each row execute function public.handle_new_user();
 */

export { supabase } from "@/integrations/supabase/client";

export type ChatSession = {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
};

export type ChatMessageRow = {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  is_rtl: boolean;
  created_at: string;
};
