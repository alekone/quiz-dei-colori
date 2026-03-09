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
    select coalesce(max(position), 0) + 1
      into v_position
    from public.quiz_questions;
  else
    v_position := greatest(1, p_position);
    update public.quiz_questions
      set position = position + 1,
          updated_at = now()
    where position >= v_position;
  end if;

  v_id := 'q_' || replace(gen_random_uuid()::text, '-', '');

  insert into public.quiz_questions (id, text, color, position, is_short)
  values (v_id, p_text, p_color, v_position, coalesce(p_is_short, false));

  return query
    select id, text, color, position as "position", is_short, created_at, updated_at
    from public.quiz_questions
    where id = v_id;
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
  select position into v_position
  from public.quiz_questions
  where id = p_id;

  if v_position is null then
    return;
  end if;

  delete from public.quiz_questions
  where id = p_id;

  update public.quiz_questions
    set position = position - 1,
        updated_at = now()
  where position > v_position;

  return query select p_id;
end;
$$;
