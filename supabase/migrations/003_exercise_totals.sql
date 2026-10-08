-- 003  exercise totals
-- Applied: 2026-10-08
--
-- A second chart per exercise: how much you did that day, not just your best
-- set. Volume in kg for a weighted exercise, total reps for a bodyweight one,
-- total seconds for a timed one.
--
-- Where an exercise was logged twice in a day, the higher entry wins rather
-- than the two being added -- the same rule the best-set columns already use,
-- so both charts treat a double session the same way.

drop view if exists public.day_volume;

create or replace view public.exercise_progress
with (security_invoker = true)
as
with per_entry as (
  select
    le.user_id,
    le.exercise_id,
    le.logged_on,
    le.id,
    max(s.weight_kg) as best_weight_kg,
    max(s.reps) as best_reps,
    max(s.duration_seconds) as best_seconds,
    coalesce(
      sum(s.weight_kg * s.reps) filter (where s.weight_kg is not null and s.reps is not null),
      0
    ) as total_volume_kg,
    coalesce(sum(s.reps), 0) as total_reps,
    coalesce(sum(s.duration_seconds), 0) as total_seconds
  from public.logged_exercises le
  join public.exercises e on e.id = le.exercise_id
  join public.sets s on s.logged_exercise_id = le.id
  where public.set_counts(e.kind, s.weight_kg, s.reps, s.duration_seconds)
  group by le.user_id, le.exercise_id, le.logged_on, le.id
)
select
  user_id,
  exercise_id,
  logged_on,
  max(best_weight_kg) as best_weight_kg,
  max(best_reps) as best_reps,
  max(best_seconds) as best_seconds,
  max(total_volume_kg) as total_volume_kg,
  max(total_reps) as total_reps,
  max(total_seconds) as total_seconds
from per_entry
group by user_id, exercise_id, logged_on;
