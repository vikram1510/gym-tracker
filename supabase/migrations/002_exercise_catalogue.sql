-- 002  exercise catalogue
-- Applied:
--
-- DESTRUCTIVE. Drops every workout, exercise and set. Run only because
-- there were no real users yet -- there is no backfill and no way back.
--
-- What changes:
--   * exercises become rows in a per-user catalogue, seeded with four on
--     signup, instead of free text repeated on every workout
--   * workout_exercises points at an exercise instead of storing its name,
--     so renaming one renames it everywhere
--   * sets lose `completed`; a set now counts once it has weight and reps
--   * workout_summaries.completed_sets is renamed logged_sets to match

begin;

drop view if exists public.exercise_last_sets;
drop view if exists public.exercise_suggestions;
drop view if exists public.workout_summaries;

drop index if exists public.workout_exercises_name_idx;

-- Order matters: workout_exercises references exercises on delete restrict,
-- so the child tables have to go first.
drop table if exists public.sets;
drop table if exists public.workout_exercises;
drop table if exists public.workouts;
drop table if exists public.exercises;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.get_or_create_exercise(text);

-- --------------------------------------------------------------- exercises

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create unique index exercises_user_name_idx
  on public.exercises (user_id, lower(btrim(name)));

alter table public.exercises enable row level security;

create policy "own exercises" on public.exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));

  insert into public.exercises (user_id, name)
  values
    (new.id, 'Lat pulldown'),
    (new.id, 'Leg press'),
    (new.id, 'Seated row'),
    (new.id, 'Shoulder press');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.get_or_create_exercise(p_name text)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.exercises (user_id, name)
  values (auth.uid(), btrim(p_name))
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

-- Existing accounts predate the seeding trigger, so give them the same four.
insert into public.exercises (user_id, name)
select u.id, seed.name
from auth.users u
cross join (
  values ('Lat pulldown'), ('Leg press'), ('Seated row'), ('Shoulder press')
) as seed(name)
on conflict do nothing;

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

create table public.sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises on delete cascade,
  position integer not null,
  weight_kg numeric(6, 2) check (weight_kg >= 0),
  reps integer check (reps >= 0),
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
  count(s.id) filter (where s.weight_kg is not null and s.reps is not null) as logged_sets
from public.workouts w
left join public.workout_exercises we on we.workout_id = w.id
left join public.sets s on s.workout_exercise_id = we.id
group by w.id;

create view public.exercise_suggestions
with (security_invoker = true)
as
select
  e.id,
  e.user_id,
  e.name,
  count(we.id) as times_used,
  max(w.started_at) as last_used_at
from public.exercises e
left join public.workout_exercises we on we.exercise_id = e.id
left join public.workouts w on w.id = we.workout_id
group by e.id;

create view public.exercise_last_sets
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
order by we.exercise_id, w.finished_at desc, s.weight_kg desc, s.reps desc;

commit;
