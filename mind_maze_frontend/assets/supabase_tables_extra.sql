-- Additional tables for Mind Maze: quizzes, questions, answers

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
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quizzes' and policyname = 'Public read quizzes') then
    create policy "Public read quizzes"
    on public.quizzes
    for select
    to anon, authenticated
    using ( is_public = true );
  end if;
end$$;

-- Allow authenticated users to create/update
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quizzes' and policyname = 'Auth insert quizzes') then
    create policy "Auth insert quizzes"
    on public.quizzes
    for insert
    to authenticated
    with check ( true );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quizzes' and policyname = 'Auth update quizzes') then
    create policy "Auth update quizzes"
    on public.quizzes
    for update
    to authenticated
    using ( true )
    with check ( true );
  end if;
end$$;

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

-- Public read questions (restricted by frontend to public quizzes)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'questions' and policyname = 'Public read questions') then
    create policy "Public read questions"
    on public.questions
    for select
    to anon, authenticated
    using ( true );
  end if;
end$$;

-- Answers
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

-- Authenticated users manage their own answers
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'answers' and policyname = 'answers read by user') then
    create policy "answers read by user"
    on public.answers
    for select
    to authenticated
    using ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'answers' and policyname = 'answers insert by user') then
    create policy "answers insert by user"
    on public.answers
    for insert
    to authenticated
    with check ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'answers' and policyname = 'answers read by anon') then
    create policy "answers read by anon"
    on public.answers
    for select
    to anon
    using ( anon_id is not null );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'answers' and policyname = 'answers insert by anon') then
    create policy "answers insert by anon"
    on public.answers
    for insert
    to anon
    with check ( anon_id is not null );
  end if;
end$$;
