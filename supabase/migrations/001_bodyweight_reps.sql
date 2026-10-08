-- 001  bodyweight reps
-- Applied: 2026-10-08
--
-- A third way to log an exercise: reps with no weight, for pull-ups, press-ups
-- and dips.
--
-- The existing 'reps' kind is renamed to 'weighted', freeing 'reps' for the
-- new one. Without the rename you would have 'reps' meaning "weight x reps"
-- sitting beside a bodyweight kind that also has reps.

alter table public.exercises
  drop constraint if exists exercises_kind_check;

update public.exercises set kind = 'weighted' where kind = 'reps';

alter table public.exercises
  alter column kind set default 'weighted';

alter table public.exercises
  add constraint exercises_kind_check check (kind in ('weighted', 'reps', 'time'));

-- Bodyweight sets count on reps alone. Weight is left null and never written,
-- so they contribute nothing to volume -- same as timed sets.
create or replace function public.set_counts(
  p_kind text,
  p_weight_kg numeric,
  p_reps integer,
  p_duration_seconds integer
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when p_kind = 'time' then p_duration_seconds is not null
    when p_kind = 'reps' then p_reps is not null
    else p_weight_kg is not null and p_reps is not null
  end;
$$;

drop function if exists public.get_or_create_exercise(text, text);

create or replace function public.get_or_create_exercise(
  p_name text,
  p_kind text default 'weighted'
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.exercises (user_id, name, kind)
  values (auth.uid(), btrim(p_name), p_kind)
  on conflict (user_id, lower(btrim(name))) do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id
    from public.exercises
    where user_id = auth.uid()
      and lower(btrim(name)) = lower(btrim(p_name));
  end if;

  return v_id;
end;
$$;

-- A bodyweight exercise in the starter list, so the kind is discoverable.
-- New accounts only.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));

  insert into public.exercises (user_id, name, kind)
  values
    (new.id, 'Lat pulldown', 'weighted'),
    (new.id, 'Leg press', 'weighted'),
    (new.id, 'Seated row', 'weighted'),
    (new.id, 'Shoulder press', 'weighted'),
    (new.id, 'Pull-up', 'reps'),
    (new.id, 'Plank', 'time');

  return new;
end;
$$;
