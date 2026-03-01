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
    and password_hash = crypt(p_password, password_hash)
  limit 1;
$$;
