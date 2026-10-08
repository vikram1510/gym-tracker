-- gym-tracker schema
-- Run in Supabase dashboard -> SQL Editor. Safe to run on an empty project.
--
-- Conventions:
--   weights are stored in kilograms; `profiles.units` only controls display
--   ordering is explicit via `position` (0-based); creation time is not order
--   totals are computed, never stored
--   a set counts once it has both a weight and reps -- or, for a timed
--     exercise, a duration; there is no done flag
--   a day is the only grouping. There is no workout, nothing to start and
--     nothing to finish: an exercise is logged against a date.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- profiles

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  rest_timer_seconds integer not null default 90 check (rest_timer_seconds > 0),
  units text not null default 'kg' check (units in ('kg', 'lb')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- --------------------------------------------------------------- exercises

-- Every user owns their own exercise list. There is no shared library: the
-- six below are copied into each new account so the picker is never empty.
-- `kind` decides how its sets are logged: weight x reps, reps alone, or
-- seconds.
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  kind text not null default 'weighted' check (kind in ('weighted', 'reps', 'time')),
  created_at timestamptz not null default now()
);

-- The uniqueness rule *is* the deduplication. "Leg press" and "leg press "
-- are the same exercise, so history never splits across spellings.
create unique index exercises_user_name_idx
  on public.exercises (user_id, lower(btrim(name)));

alter table public.exercises enable row level security;

create policy "own exercises" on public.exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- A profile and a starter exercise list are created on signup, so the app
-- never has to handle a logged-in user with neither.
create function public.handle_new_user()
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Logging an exercise goes through here, so a name typed twice resolves to
-- the same row instead of quietly forking the history. Runs as the caller,
-- so RLS still decides whose list is touched. The kind only applies when the
-- row is created: an exercise that already exists keeps the kind it has.
create function public.get_or_create_exercise(p_name text, p_kind text default 'weighted')
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

-- -------------------------------------------------------- logged exercises

-- One row per exercise per time you logged it. The same exercise twice in a
-- day is two rows, not one: a morning and an evening session read as two
-- entries, told apart by created_at.
--
-- `logged_on` has no default on purpose. The client sends its own local
-- date; a server-side default would be UTC, and a 10pm session in BST would
-- land on tomorrow.
create table public.logged_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  exercise_id uuid not null references public.exercises on delete restrict,
  logged_on date not null,
  position integer not null,
  created_at timestamptz not null default now()
);

create index logged_exercises_user_day_idx
  on public.logged_exercises (user_id, logged_on desc, position);

create index logged_exercises_exercise_idx
  on public.logged_exercises (exercise_id);

alter table public.logged_exercises enable row level security;

create policy "own logged exercises" on public.logged_exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- -------------------------------------------------------------------- sets

create table public.sets (
  id uuid primary key default gen_random_uuid(),
  logged_exercise_id uuid not null references public.logged_exercises on delete cascade,
  position integer not null,
  weight_kg numeric(6, 2) check (weight_kg >= 0),
  reps integer check (reps >= 0),
  duration_seconds integer check (duration_seconds >= 0),
  created_at timestamptz not null default now()
);

create index sets_logged_exercise_idx
  on public.sets (logged_exercise_id, position);

alter table public.sets enable row level security;

-- Ownership is inherited through the parent row rather than duplicating
-- user_id, so a set can never disagree with the exercise it belongs to.
create policy "own sets" on public.sets
  for all using (
    exists (
      select 1 from public.logged_exercises le
      where le.id = logged_exercise_id and le.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.logged_exercises le
      where le.id = logged_exercise_id and le.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------ set counting

-- "Did this set happen" depends on the exercise, and is asked in more than
-- one place below. One definition, so they can never drift apart.
create function public.set_counts(
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

-- --------------------------------------------------------------- summaries

-- Feeds the history screen. security_invoker means the view is read as the
-- calling user, so the policies above still apply.
--
-- Volume is weight-only: a timed set has no weight and contributes nothing,
-- so a day of nothing but planks genuinely reads 0 kg. logged_sets does
-- count them, or that day would read "0 sets".
create view public.day_summaries
with (security_invoker = true)
as
select
  le.user_id,
  le.logged_on,
  count(distinct le.id) as exercises,
  coalesce(
    sum(s.weight_kg * s.reps) filter (where s.weight_kg is not null and s.reps is not null),
    0
  ) as volume_kg,
  count(s.id) filter (
    where public.set_counts(e.kind, s.weight_kg, s.reps, s.duration_seconds)
  ) as logged_sets
from public.logged_exercises le
join public.exercises e on e.id = le.exercise_id
left join public.sets s on s.logged_exercise_id = le.id
group by le.user_id, le.logged_on;

-- Feeds the progress screen: one point per exercise per day, holding that
-- day's best set in each dimension. Which one is plotted depends on the
-- exercise's kind. Grouped by day rather than by logged_exercises row, so
-- training something twice in a day gives one point: the better of the two.
create view public.exercise_progress
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

-- --------------------------------------------------------- exercise lookup

-- The picker. Seeded exercises come back with times_used = 0, so they show
-- up but rank below anything actually trained.
create view public.exercise_suggestions
with (security_invoker = true)
as
select
  e.id,
  e.user_id,
  e.name,
  e.kind,
  count(le.id) as times_used,
  max(le.logged_on) as last_used_on
from public.exercises e
left join public.logged_exercises le on le.exercise_id = e.id
group by e.id;

-- The set you finished on last, per exercise, before a given day -- not the
-- heaviest. A function rather than a view because "before today" depends on
-- the caller's timezone: current_date here is UTC, which near midnight is
-- the wrong day. The client passes its own local date, so a day in progress
-- never matches itself.
create function public.exercise_last_sets(p_before date)
returns table (
  exercise_id uuid,
  performed_on date,
  weight_kg numeric,
  reps integer,
  duration_seconds integer
)
language sql
stable
set search_path = ''
as $$
  select distinct on (le.exercise_id)
    le.exercise_id,
    le.logged_on,
    s.weight_kg,
    s.reps,
    s.duration_seconds
  from public.logged_exercises le
  join public.exercises e on e.id = le.exercise_id
  join public.sets s on s.logged_exercise_id = le.id
  where le.user_id = auth.uid()
    and le.logged_on < p_before
    and public.set_counts(e.kind, s.weight_kg, s.reps, s.duration_seconds)
  order by le.exercise_id, le.logged_on desc, le.created_at desc, s.position desc;
$$;
