create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.admin_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  unlock_delay_minutes integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.cohort_invites (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table public.admin_users enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.cohorts enable row level security;
alter table public.cohort_invites enable row level security;

alter table public.test_results
  add column if not exists cohort_id uuid references public.cohorts(id) on delete set null,
  add column if not exists invite_code text,
  add column if not exists unlock_at timestamptz,
  add column if not exists unlocked_at timestamptz;

create index if not exists test_results_cohort_id_idx
  on public.test_results (cohort_id);

create index if not exists test_results_unlock_at_idx
  on public.test_results (unlock_at);

create index if not exists test_results_invite_code_idx
  on public.test_results (invite_code);

create index if not exists cohort_invites_cohort_id_idx
  on public.cohort_invites (cohort_id);

drop policy if exists "public read for tests" on public.test_results;
