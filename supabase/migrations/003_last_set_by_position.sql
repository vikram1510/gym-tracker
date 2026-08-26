-- 003  last set, not heaviest set
-- Applied:
--
-- exercise_last_sets picked the heaviest set of the last finished session.
-- It now picks the last one by position -- the set you actually finished on,
-- which is what you want to see when deciding where to start today.
--
-- Column list is unchanged, so `create or replace` is enough.

create or replace view public.exercise_last_sets
with (security_invoker = true)
as
select distinct on (we.exercise_id)
  w.user_id,
  we.exercise_id,
  w.id as workout_id,
  w.finished_at as performed_at,
  s.weight_kg,
  s.reps
from public.workouts w
join public.workout_exercises we on we.workout_id = w.id
join public.sets s on s.workout_exercise_id = we.id
where w.finished_at is not null
  and s.weight_kg is not null
  and s.reps is not null
order by we.exercise_id, w.finished_at desc, s.position desc;
