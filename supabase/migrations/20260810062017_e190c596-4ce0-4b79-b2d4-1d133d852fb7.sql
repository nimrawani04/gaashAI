create extension if not exists vector with schema extensions;

do $$ begin
  create type public.app_role as enum ('admin','moderator','user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','moderator'))
$$;

drop policy if exists "read own roles" on public.user_roles;
create policy "read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));

-- Knowledge base -----------------------------------------------------------
create table if not exists public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content_kashmiri text not null default '',
  content_english text not null default '',
  category text not null default 'general',
  source text,
  embedding extensions.vector(384),
  created_at timestamptz not null default now()
);
grant select on public.knowledge_base to anon;
grant select, insert, update, delete on public.knowledge_base to authenticated;
grant all on public.knowledge_base to service_role;
alter table public.knowledge_base enable row level security;

drop policy if exists "kb readable by everyone" on public.knowledge_base;
create policy "kb readable by everyone" on public.knowledge_base for select using (true);
drop policy if exists "kb staff insert" on public.knowledge_base;
create policy "kb staff insert" on public.knowledge_base for insert to authenticated with check (public.is_staff(auth.uid()));
drop policy if exists "kb staff update" on public.knowledge_base;
create policy "kb staff update" on public.knowledge_base for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
drop policy if exists "kb staff delete" on public.knowledge_base;
create policy "kb staff delete" on public.knowledge_base for delete to authenticated using (public.is_staff(auth.uid()));

create index if not exists knowledge_base_embedding_idx
  on public.knowledge_base using ivfflat (embedding extensions.vector_cosine_ops) with (lists = 100);

create or replace function public.match_knowledge(
  query_embedding extensions.vector(384),
  match_threshold double precision default 0.3,
  match_count int default 5
)
returns table (id uuid, title text, content_kashmiri text, content_english text, category text, similarity double precision)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select kb.id, kb.title, kb.content_kashmiri, kb.content_english, kb.category,
         1 - (kb.embedding <=> query_embedding) as similarity
  from public.knowledge_base kb
  where kb.embedding is not null
    and 1 - (kb.embedding <=> query_embedding) > match_threshold
  order by kb.embedding <=> query_embedding
  limit match_count
$$;

grant execute on function public.match_knowledge(extensions.vector, double precision, int) to anon, authenticated, service_role;

-- Contributions -------------------------------------------------------------
create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  kashmiri_text text not null,
  english_meaning text not null,
  category text not null default 'greeting',
  submitted_by uuid references auth.users(id) on delete set null,
  submitted_by_name text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert on public.contributions to authenticated;
grant update, delete on public.contributions to authenticated;
grant all on public.contributions to service_role;
alter table public.contributions enable row level security;

drop policy if exists "contrib own or staff read" on public.contributions;
create policy "contrib own or staff read" on public.contributions
  for select to authenticated using (submitted_by = auth.uid() or public.is_staff(auth.uid()));
drop policy if exists "contrib insert own" on public.contributions;
create policy "contrib insert own" on public.contributions
  for insert to authenticated with check (submitted_by = auth.uid());
drop policy if exists "contrib staff update" on public.contributions;
create policy "contrib staff update" on public.contributions
  for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
drop policy if exists "contrib staff delete" on public.contributions;
create policy "contrib staff delete" on public.contributions
  for delete to authenticated using (public.is_staff(auth.uid()));

-- Feedback -------------------------------------------------------------------
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.chat_messages(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  rating smallint not null check (rating in (1, -1)),
  correction_text text,
  created_at timestamptz not null default now()
);
grant select, insert on public.feedback to authenticated;
grant all on public.feedback to service_role;
alter table public.feedback enable row level security;

drop policy if exists "feedback own or staff read" on public.feedback;
create policy "feedback own or staff read" on public.feedback
  for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));
drop policy if exists "feedback insert own" on public.feedback;
create policy "feedback insert own" on public.feedback
  for insert to authenticated with check (user_id = auth.uid());