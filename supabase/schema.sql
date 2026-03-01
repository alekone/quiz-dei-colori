create table if not exists public.test_results (
  id uuid primary key,
  email text not null,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  duration_ms integer,
  variant text,
  cohort text,
  cohort_id uuid references public.cohorts(id) on delete set null,
  referrer_id text,
  invite_code text,
  unlock_at timestamptz,
  unlocked_at timestamptz,
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

create policy "public delete for tests"
  on public.test_results
  for delete
  to anon
  using (true);

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

create extension if not exists pgcrypto;

create or replace function public.admin_authenticate(
  p_username text,
  p_password text
)
returns table (
  id uuid,
  username text,
  is_active boolean
)
language sql
security definer
set search_path = public
as $$
  select id, username, is_active
  from public.admin_users
  where username = lower(p_username)
    and password_hash = extensions.crypt(p_password, password_hash)
  limit 1;
$$;

create or replace function public.admin_create_user(
  p_username text,
  p_password text
)
returns table (
  id uuid,
  username text,
  is_active boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  insert into public.admin_users (username, password_hash)
  values (lower(p_username), extensions.crypt(p_password, extensions.gen_salt('bf')))
  returning id, username, is_active, created_at;
$$;

create or replace function public.admin_set_password(
  p_user_id uuid,
  p_password text
)
returns table (
  id uuid,
  username text,
  is_active boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  update public.admin_users
  set password_hash = extensions.crypt(p_password, extensions.gen_salt('bf'))
  where id = p_user_id
  returning id, username, is_active, created_at;
$$;
