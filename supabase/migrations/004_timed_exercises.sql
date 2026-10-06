-- 004  timed exercises
-- Applied: 2026-10-06
--
-- Planks and holds are logged in seconds, not weight x reps. The kind lives
-- on the catalogue row rather than per workout: a plank is always a plank.
--
-- Volume is untouched -- a timed set has no weight, so it already contributes
-- nothing. logged_sets is not: without this, a session of only planks reads
-- "0 sets" in History.

alter table public.exercises
  add column if not exists kind text not null default 'reps';

alter table public.exercises
  drop constraint if exists exercises_kind_check;

alter table public.exercises
  add constraint exercises_kind_check check (kind in ('reps', 'time'));

alter table public.sets
  add column if not exists duration_seconds integer;

alter table public.sets
  drop constraint if exists sets_duration_seconds_check;

alter table public.sets
  add constraint sets_duration_seconds_check check (duration_seconds >= 0);

-- "Did this set happen" now depends on the exercise, and is asked in two
-- views. One definition, so the two can never drift apart.
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
    else p_weight_kg is not null and p_reps is not null
  end;
$$;

-- The old one-argument version has to go first. `create or replace` matches
-- on argument types, so adding a defaulted parameter would leave both behind
-- and every single-argument call would fail as ambiguous.
drop function if exists public.get_or_create_exercise(text);

create or replace function public.get_or_create_exercise(p_name text, p_kind text default 'reps')
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

-- A timed exercise in the starter list, so the feature is discoverable
-- without having to know it exists. New accounts only.
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
    (new.id, 'Lat pulldown', 'reps'),
    (new.id, 'Leg press', 'reps'),
    (new.id, 'Seated row', 'reps'),
    (new.id, 'Shoulder press', 'reps'),
    (new.id, 'Plank', 'time');

  return new;
end;
$$;

-- Column list is unchanged, so this one can be replaced in place.
create or replace view public.workout_summaries
with (security_invoker = true)
as
select
  w.id,
  w.user_id,
  w.name,
  w.started_at,
  w.finished_at,
  extract(epoch from (w.finished_at - w.started_at))::integer as duration_seconds,
  coalesce(
    sum(s.weight_kg * s.reps) filter (where s.weight_kg is not null and s.reps is not null),
    0
  ) as volume_kg,
  count(s.id) filter (
    where public.set_counts(e.kind, s.weight_kg, s.reps, s.duration_seconds)
  ) as logged_sets
from public.workouts w
left join public.workout_exercises we on we.workout_id = w.id
left join public.exercises e on e.id = we.exercise_id
left join public.sets s on s.workout_exercise_id = we.id
group by w.id;

-- These two gain columns, and `create or replace` can only append. Dropping
-- keeps the column order readable; views hold no data, so it costs nothing.
drop view if exists public.exercise_suggestions;

create view public.exercise_suggestions
with (security_invoker = true)
as
select
  e.id,
  e.user_id,
  e.name,
  e.kind,
  count(we.id) as times_used,
  max(w.started_at) as last_used_at
from public.exercises e
left join public.workout_exercises we on we.exercise_id = e.id
left join public.workouts w on w.id = we.workout_id
group by e.id;

drop view if exists public.exercise_last_sets;

create view public.exercise_last_sets
with (security_invoker = true)
as
select distinct on (we.exercise_id)
  w.user_id,
  we.exercise_id,
  w.id as workout_id,
  w.finished_at as performed_at,
  s.weight_kg,
  s.reps,
  s.duration_seconds
from public.workouts w
join public.workout_exercises we on we.workout_id = w.id
join public.exercises e on e.id = we.exercise_id
join public.sets s on s.workout_exercise_id = we.id
where w.finished_at is not null
  and public.set_counts(e.kind, s.weight_kg, s.reps, s.duration_seconds)
order by we.exercise_id, w.finished_at desc, s.position desc;
