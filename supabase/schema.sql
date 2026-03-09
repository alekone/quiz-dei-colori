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

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'test_results'
      and policyname = 'public insert for tests'
  ) then
    create policy "public insert for tests"
      on public.test_results
      for insert
      to anon
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'test_results'
      and policyname = 'public delete for tests'
  ) then
    create policy "public delete for tests"
      on public.test_results
      for delete
      to anon
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.quiz_questions') is not null then
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'quiz_questions'
        and policyname = 'public read quiz questions'
    ) then
      create policy "public read quiz questions"
        on public.quiz_questions
        for select
        to anon
        using (true);
    end if;
  end if;
end $$;

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

create table if not exists public.quiz_questions (
  id text primary key,
  text text not null,
  color text not null check (color in ('rosso', 'giallo', 'verde', 'blu')),
  position integer not null,
  is_short boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.admin_insert_question(
  p_text text,
  p_color text,
  p_is_short boolean default false,
  p_position integer default null
)
returns table (
  id text,
  text text,
  color text,
  "position" integer,
  is_short boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_position integer;
  v_id text;
begin
  if p_text is null or btrim(p_text) = '' then
    raise exception 'Testo non valido';
  end if;
  if p_color not in ('rosso', 'giallo', 'verde', 'blu') then
    raise exception 'Colore non valido';
  end if;

  if p_position is null then
    select coalesce(max(qq.position), 0) + 1
      into v_position
    from public.quiz_questions qq;
  else
    v_position := greatest(1, p_position);
    update public.quiz_questions qq
      set position = qq.position + 1,
          updated_at = now()
    where qq.position >= v_position;
  end if;

  v_id := 'q_' || replace(gen_random_uuid()::text, '-', '');

  insert into public.quiz_questions (id, text, color, position, is_short)
  values (v_id, p_text, p_color, v_position, coalesce(p_is_short, false));

  return query
    select qq.id, qq.text, qq.color, qq.position as "position", qq.is_short, qq.created_at, qq.updated_at
    from public.quiz_questions qq
    where qq.id = v_id;
end;
$$;

create or replace function public.admin_delete_question(
  p_id text
)
returns table (id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_position integer;
begin
  select qq.position into v_position
  from public.quiz_questions qq
  where qq.id = p_id;

  if v_position is null then
    return;
  end if;

  delete from public.quiz_questions
  where id = p_id;

  update public.quiz_questions qq
    set position = qq.position - 1,
        updated_at = now()
  where qq.position > v_position;

  return query select p_id;
end;
$$;

create index if not exists quiz_questions_position_idx
  on public.quiz_questions (position);

alter table public.admin_users enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.cohorts enable row level security;
alter table public.cohort_invites enable row level security;
alter table public.quiz_questions enable row level security;

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
