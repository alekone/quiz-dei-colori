alter table public.test_results
  add column if not exists referrer_id text;

create index if not exists test_results_referrer_id_idx
  on public.test_results (referrer_id);
