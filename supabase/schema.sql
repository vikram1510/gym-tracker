-- gym-tracker schema
-- Run in Supabase dashboard -> SQL Editor. Safe to run on an empty project.
--
-- Conventions:
--   weights are stored in kilograms; `profiles.units` only controls display
--   ordering is explicit via `position` (0-based); creation time is not order
--   totals (volume, duration) are computed, never stored

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

-- A row is created automatically when someone signs up, so the app never has
-- to handle a logged-in user with no profile.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts on delete cascade,
  name text not null,
  position integer not null,
  created_at timestamptz not null default now()
);

create index workout_exercises_workout_idx
  on public.workout_exercises (workout_id, position);

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
  completed boolean not null default false,
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
  coalesce(sum(s.weight_kg * s.reps) filter (where s.completed), 0) as volume_kg,
  count(s.id) filter (where s.completed) as completed_sets
from public.workouts w
left join public.workout_exercises we on we.workout_id = w.id
left join public.sets s on s.workout_exercise_id = we.id
group by w.id;
