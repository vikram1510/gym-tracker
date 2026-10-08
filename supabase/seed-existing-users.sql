-- Gives every account that already exists what the signup trigger hands a new
-- one: a profile row and the starter exercise list.
--
-- Needed because `reset.sql` leaves `auth.users` alone. Those accounts never
-- fire `on_auth_user_created` again, so without this you sign in to an app
-- with no profile and an empty exercise picker.
--
-- Run after `schema.sql`. Harmless to run twice -- both inserts no-op on rows
-- that are already there.

insert into public.profiles (id, display_name)
select id, split_part(email, '@', 1)
from auth.users
on conflict (id) do nothing;

insert into public.exercises (user_id, name, kind)
select u.id, seed.name, seed.kind
from auth.users u
cross join (values
  ('Lat pulldown', 'reps'),
  ('Leg press', 'reps'),
  ('Seated row', 'reps'),
  ('Shoulder press', 'reps'),
  ('Plank', 'time')
) as seed(name, kind)
on conflict do nothing;
