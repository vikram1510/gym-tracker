-- 001  exercise history
-- Applied: 2026-08-26
--
-- Adds the "last time you did this" lookup behind the workout screen. Read
-- only -- no table is altered and no data moves, so this is safe to run
-- against a live database and safe to run twice.

create index if not exists workout_exercises_name_idx
  on public.workout_exercises (lower(btrim(name)));

-- The heaviest completed set of the last finished session, per exercise.
-- Only finished workouts count, so a workout in progress never matches
-- itself and the client needs no "exclude current workout" filter.
create or replace view public.exercise_last_sets
with (security_invoker = true)
as
select distinct on (w.user_id, lower(btrim(we.name)))
  w.user_id,
  lower(btrim(we.name)) as name_key,
  we.name,
  w.id as workout_id,
  w.finished_at as performed_at,
  s.weight_kg,
  s.reps
from public.workouts w
join public.workout_exercises we on we.workout_id = w.id
join public.sets s on s.workout_exercise_id = we.id
where w.finished_at is not null
  and s.completed
  and s.weight_kg is not null
  and s.reps is not null
order by
  w.user_id, lower(btrim(we.name)),
  w.finished_at desc, s.weight_kg desc, s.reps desc;
