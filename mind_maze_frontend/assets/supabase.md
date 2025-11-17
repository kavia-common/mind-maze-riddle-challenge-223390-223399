# Supabase Integration Notes (Mind Maze)

This app uses Supabase for:
- Auth (optional, via anon/public client)
- Persisting progress in `public.scores` (already defined in supabase.sql)
- Quizzes, Questions, Answers, Leaderboard (additional tables below)

Environment (no secrets hardcoded):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- Optional: REACT_APP_FRONTEND_URL for auth email redirects

Client creation:
- See src/lib/supabaseClient.js (gracefully degrades if env vars are missing)

Health utilities:
- src/lib/health.js

Progress/Score:
- src/lib/progressService.js
- src/context/ProgressContext.jsx
- src/lib/scoreService.js

New services:
- src/lib/quizService.js
- src/lib/questionService.js
- src/lib/answerService.js
- src/lib/leaderboardService.js

## SQL for New Tables

Run these in Supabase SQL editor to create the required tables and RLS policies.

```sql
-- Quizzes
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.quizzes enable row level security;

-- Publicly readable quizzes if is_public = true
create policy "Public read quizzes"
on public.quizzes
for select
to anon, authenticated
using ( is_public = true );

-- Allow authenticated users to create/update (optional; adjust as needed)
create policy "Auth insert quizzes"
on public.quizzes
for insert
to authenticated
with check ( true );

create policy "Auth update quizzes"
on public.quizzes
for update
to authenticated
using ( true )
with check ( true );

-- Questions
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  text text not null,
  answers_json jsonb not null default '[]'::jsonb,
  seconds integer not null default 30 check (seconds >= 5 and seconds <= 600),
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_questions_quiz on public.questions(quiz_id);
alter table public.questions enable row level security;

-- Public read questions for public quizzes
create policy "Public read questions"
on public.questions
for select
to anon, authenticated
using ( true );

-- Answers (attempt log)
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  anon_id text,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  answer_text text not null,
  is_correct boolean not null default false,
  created_at timestamptz not null default now(),
  constraint answers_user_or_anon check (
    (user_id is not null and anon_id is null) or
    (user_id is null and anon_id is not null)
  )
);

create index if not exists idx_answers_quiz on public.answers(quiz_id);
create index if not exists idx_answers_question on public.answers(question_id);
create index if not exists idx_answers_user on public.answers(user_id);
create index if not exists idx_answers_anon on public.answers(anon_id);

alter table public.answers enable row level security;

-- Policies:
-- Authenticated users manage their own answers
create policy "answers read by user"
on public.answers
for select
to authenticated
using ( auth.uid() = user_id );

create policy "answers insert by user"
on public.answers
for insert
to authenticated
with check ( auth.uid() = user_id );

-- Anonymous: allow insert/select when anon_id present (best-effort tracking)
create policy "answers read by anon"
on public.answers
for select
to anon
using ( anon_id is not null );

create policy "answers insert by anon"
on public.answers
for insert
to anon
with check ( anon_id is not null );
```

Notes:
- Leaderboard reads from `public.scores`. Ensure `scores` policies from supabase.sql are applied.
- Anonymous flows rely on an unguessable `anon_id` stored on-device (`getOrCreateDeviceId`).
- Adjust policies to your security model as needed.
