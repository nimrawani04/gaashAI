drop policy if exists "read own roles" on public.user_roles;
create policy "read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','moderator'))
$$;

create or replace function public.match_knowledge(
  query_embedding extensions.vector(384),
  match_threshold double precision default 0.3,
  match_count int default 5
)
returns table (id uuid, title text, content_kashmiri text, content_english text, category text, similarity double precision)
language sql
stable
security invoker
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

revoke execute on function public.has_role(uuid, public.app_role) from anon, public;
revoke execute on function public.is_staff(uuid) from anon, public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function public.is_staff(uuid) to authenticated, service_role;