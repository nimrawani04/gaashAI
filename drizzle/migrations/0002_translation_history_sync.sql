create table public.translation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  direction text not null check (direction in ('en2ks','ks2en')),
  source text not null,
  translation text not null,
  roman text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, direction, source)
);
create index translation_history_user_idx on public.translation_history(user_id, created_at desc);

grant select, insert, update, delete on public.translation_history to authenticated;
grant all on public.translation_history to service_role;

alter table public.translation_history enable row level security;

create policy "Users read own translations" on public.translation_history
  for select to authenticated using (auth.uid() = user_id);
create policy "Users add own translations" on public.translation_history
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own translations" on public.translation_history
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own translations" on public.translation_history
  for delete to authenticated using (auth.uid() = user_id);