create table if not exists public.test_results (
  id uuid primary key,
  email text not null,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  duration_ms integer,
  variant text,
  cohort text,
  referrer_id text,
  answers jsonb not null,
  summary jsonb not null,
  question_count integer not null
);

alter table public.test_results enable row level security;

create policy "public insert for tests"
  on public.test_results
  for insert
  to anon
  with check (true);

create policy "public read for tests"
  on public.test_results
  for select
  to anon
  using (true);

create policy "public delete for tests"
  on public.test_results
  for delete
  to anon
  using (true);
