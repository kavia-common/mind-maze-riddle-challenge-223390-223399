-- Scores table for Mind Maze progress persistence
-- Run this in your Supabase project's SQL editor.

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  anon_id text,
  score integer not null default 0 check (score >= 0),
  level integer not null default 1 check (level >= 1),
  lives integer not null default 3 check (lives >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scores_user_or_anon check (
    (user_id is not null and anon_id is null) or
    (user_id is null and anon_id is not null)
  )
);

-- Unique constraints so we can upsert by either key
create unique index if not exists scores_user_id_unique on public.scores (user_id) where user_id is not null;
create unique index if not exists scores_anon_id_unique on public.scores (anon_id) where anon_id is not null;

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_scores_updated_at on public.scores;
create trigger trg_scores_updated_at
before update on public.scores
for each row execute function public.set_updated_at();

-- Row Level Security (RLS)
alter table public.scores enable row level security;

-- Policies:
-- Authenticated users can manage their own row
create policy "Allow read own by user_id"
on public.scores
for select
to authenticated
using ( auth.uid() = user_id );

create policy "Allow upsert own by user_id"
on public.scores
for insert
to authenticated
with check ( auth.uid() = user_id );

create policy "Allow update own by user_id"
on public.scores
for update
to authenticated
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

-- Anonymous users: allow anon_id-based access via anon key.
-- WARNING: This allows anyone with anon key to upsert/select by anon_id. Use unguessable anon_id stored on device.
create policy "Allow select by anon_id for anon"
on public.scores
for select
to anon
using ( anon_id is not null );

create policy "Allow insert/update by anon_id for anon"
on public.scores
for all
to anon
using ( anon_id is not null )
with check ( anon_id is not null );
