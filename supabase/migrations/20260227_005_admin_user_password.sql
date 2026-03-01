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
