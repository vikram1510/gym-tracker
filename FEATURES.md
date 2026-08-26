# Features

Working list. Tick things off as they land. Anything deliberately not being
built goes in Parked with the reason, so it doesn't get re-litigated.

## In progress

_Nothing in flight._

## Up next

In priority order.

- [ ] **Built-in rest timer** — starts when a set is ticked, counts down `profiles.rest_timer_seconds`. Needs a decision on whether it survives navigating away.
- [ ] **Can't start a workout from Profile** — actually broader: the bottom nav is `md:hidden`, so on desktop there is no start button and no navigation at all beyond the header's profile icon. You can reach Profile and not get back. Needs a desktop nav, not just a button on Profile.
- [ ] **Weight progression graph per exercise** — needs a new view (every completed set per exercise over time, not just the last one) and a chart library; none is installed. Feeds the Progress screen, which is still `demo-data.ts`.
- [ ] **Google sign-in** — the code is a button and one `signInWithOAuth` call; the real work is dashboard-side (Google Cloud OAuth client, then Authentication → Providers in Supabase). Worth testing whether an existing email/password account with the same address links to it or ends up a second user.

## Done

- [x] **Delete an exercise** — from the `⋯` menu on the exercise card
- [x] **Routing** — a URL per screen, so deep links work and the OS swipe-back gesture navigates
- [x] **Delete a workout** — from the workout screen, behind an inline confirm
- [x] **History screen on real data** — finished workouts, newest first, rows open the workout
- [x] **Recent sessions capped at 3**, "View all" goes to History
- [x] **Exercise catalogue** — per-user `exercises` table, four seeded on signup, `get_or_create_exercise` RPC, picker ordered most-used first
- [x] **Last session per exercise** — last set of your previous finished session, shown beside the exercise name
- [x] **No more `completed` flag** — a set counts once it has weight and reps; tap-to-complete removed
- [x] **Auth** — email + password, confirmation email, check-your-inbox screen
- [x] **Workout screen** — add exercises, add/remove sets, weight and reps, tap to complete
- [x] **Editable workout names** — click to edit, defaults to `Workout Tuesday 25 Sep`
- [x] **Home screen** — in-progress workout cards, recent completed sessions
- [x] **Recent sessions auto-populate** when a workout is finished
- [x] **Completed sessions are clickable** — opens the workout read-only
- [x] **Profile** — real display name (editable), email, join year
- [x] **Exercise suggestions** — picker pills come from your own past exercise names
- [x] **Mobile** — workout card survives long names

## Backlog

Roughly in the order it's worth doing.

- [ ] **Rename and reorder exercises** — the `⋯` menu exists now and only holds Delete
- [ ] **Prefill sets from last session** — the data is already there, just not written into new sets
- [ ] **Editable rest timer** — Profile shows the real value but can't change it
- [ ] **Units kg/lb** — `profiles.units` is stored and displayed, no conversion anywhere
- [ ] **Reorder exercises and sets** — `position` columns exist, no UI drives them
- [ ] **Rename / merge exercises** — typos ("Leg pres") stick around forever once logged
- [ ] **`.env.example`** — referenced by `missing-config.tsx` and CLAUDE.md, doesn't exist
- [ ] **README** — still Vite starter boilerplate

## Parked

Considered and deliberately not doing yet.

- **Routines / templates** — no planned "Push day" to start a workout from
- **Home stat cards** — weekly volume, streak, milestone
