-- 002  exercise progress
-- Applied: 2026-10-08
--
-- Feeds the Progress screen: one point per exercise per day, holding that
-- day's best set in each dimension. Which one is plotted depends on the
-- exercise's kind -- heaviest weight, longest hold, or most reps.
--
-- Grouped by day rather than by logged_exercises row, so training the same
-- exercise twice in a day gives one point: the better of the two.

create or replace view public.exercise_progress
with (security_invoker = true)
as
select
  le.user_id,
  le.exercise_id,
  le.logged_on,
  max(s.weight_kg) as best_weight_kg,
  max(s.reps) as best_reps,
  max(s.duration_seconds) as best_seconds
from public.logged_exercises le
join public.exercises e on e.id = le.exercise_id
join public.sets s on s.logged_exercise_id = le.id
where public.set_counts(e.kind, s.weight_kg, s.reps, s.duration_seconds)
group by le.user_id, le.exercise_id, le.logged_on;
