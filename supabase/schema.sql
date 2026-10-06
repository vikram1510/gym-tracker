-- gym-tracker schema
-- Run in Supabase dashboard -> SQL Editor. Safe to run on an empty project.
--
-- Conventions:
--   weights are stored in kilograms; `profiles.units` only controls display
--   ordering is explicit via `position` (0-based); creation time is not order
--   totals (volume, duration) are computed, never stored
--   a set counts once it has both a weight and reps -- or, for a timed
--     exercise, a duration; there is no done flag

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
-- five below are copied into each new account so the picker is never empty.
-- `kind` decides how its sets are logged: weight x reps, or seconds.
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  kind text not null default 'reps' check (kind in ('reps', 'time')),
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
    (new.id, 'Lat pulldown', 'reps'),
    (new.id, 'Leg press', 'reps'),
    (new.id, 'Seated row', 'reps'),
    (new.id, 'Shoulder press', 'reps'),
    (new.id, 'Plank', 'time');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Adding an exercise to a workout goes through here, so a name typed twice
-- resolves to the same row instead of quietly forking the history. Runs as
-- the caller, so RLS still decides whose list is touched.
create function public.get_or_create_exercise(p_name text, p_kind text default 'reps')
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

-- ---------------------------------------------------------------- workouts

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null default 'Workout',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  check (finished_at is null or finished_at >= started_at)
);

create index workouts_user_started_idx
  on public.workouts (user_id, started_at desc);

alter table public.workouts enable row level security;

create policy "own workouts" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------- workout_exercises

-- Points at the catalogue rather than storing a name, so renaming an
-- exercise renames it everywhere, past workouts included.
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts on delete cascade,
  exercise_id uuid not null references public.exercises on delete restrict,
  position integer not null,
  created_at timestamptz not null default now()
);

create index workout_exercises_workout_idx
  on public.workout_exercises (workout_id, position);

create index workout_exercises_exercise_idx
  on public.workout_exercises (exercise_id);

alter table public.workout_exercises enable row level security;

-- Ownership is inherited through the parent workout rather than duplicating
-- user_id, so a workout can never disagree with its own exercises.
create policy "own workout exercises" on public.workout_exercises
  for all using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------- sets

create table public.sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises on delete cascade,
  position integer not null,
  weight_kg numeric(6, 2) check (weight_kg >= 0),
  reps integer check (reps >= 0),
  duration_seconds integer check (duration_seconds >= 0),
  created_at timestamptz not null default now()
);

create index sets_exercise_idx
  on public.sets (workout_exercise_id, position);

alter table public.sets enable row level security;

create policy "own sets" on public.sets
  for all using (
    exists (
      select 1
      from public.workout_exercises we
      join public.workouts w on w.id = we.workout_id
      where we.id = workout_exercise_id and w.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.workout_exercises we
      join public.workouts w on w.id = we.workout_id
      where we.id = workout_exercise_id and w.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------ set counting

-- "Did this set happen" depends on the exercise, and is asked by both views
-- below. One definition, so the two can never drift apart.
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
    else p_weight_kg is not null and p_reps is not null
  end;
$$;

-- --------------------------------------------------------------- summaries

-- Feeds the history and progress screens. security_invoker means the view is
-- read as the calling user, so the policies above still apply.
create view public.workout_summaries
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
  count(we.id) as times_used,
  max(w.started_at) as last_used_at
from public.exercises e
left join public.workout_exercises we on we.exercise_id = e.id
left join public.workouts w on w.id = we.workout_id
group by e.id;

-- The last logged set of the last finished session, per exercise -- the set
-- you finished on, not the heaviest. Only finished workouts count, so a
-- workout in progress never matches itself.
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
