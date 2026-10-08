-- Wipes everything this project owns so `schema.sql` can be run again on a
-- clean slate. Destructive: every workout, exercise and profile goes.
--
-- `auth.users` is deliberately untouched, so you stay signed in. That is also
-- the catch: the signup trigger only fires on signup, so an account that
-- already exists comes back with no profile and no exercises. Run
-- `seed-existing-users.sql` after `schema.sql` to give it both.
--
-- Run order:  reset.sql  ->  schema.sql  ->  seed-existing-users.sql
--
-- Drops are written to tolerate anything already being missing, so this is
-- safe on a half-built database and safe to run twice.

drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.get_or_create_exercise(text) cascade;
drop function if exists public.get_or_create_exercise(text, text) cascade;
drop function if exists public.exercise_last_sets(date) cascade;
drop function if exists public.set_counts(text, numeric, integer, integer) cascade;

drop view if exists public.day_summaries cascade;
drop view if exists public.workout_summaries cascade;
drop view if exists public.exercise_suggestions cascade;
drop view if exists public.exercise_last_sets cascade;

drop table if exists public.sets cascade;
drop table if exists public.logged_exercises cascade;
drop table if exists public.workout_exercises cascade;
drop table if exists public.workouts cascade;
drop table if exists public.exercises cascade;
drop table if exists public.profiles cascade;
