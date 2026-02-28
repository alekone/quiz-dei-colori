alter table public.test_results
  add column if not exists started_at timestamptz,
  add column if not exists duration_ms integer,
  add column if not exists variant text,
  add column if not exists cohort text;

drop policy if exists "public insert for tests" on public.test_results;
drop policy if exists "public read for tests" on public.test_results;
drop policy if exists "public delete for tests" on public.test_results;

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

create index if not exists test_results_created_at_idx
  on public.test_results (created_at desc);

create index if not exists test_results_variant_idx
  on public.test_results (variant);

create index if not exists test_results_cohort_idx
  on public.test_results (cohort);

create index if not exists test_results_cohort_created_at_idx
  on public.test_results (cohort, created_at desc);
