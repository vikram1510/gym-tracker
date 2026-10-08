# Migrations

Numbered SQL files, run by hand in the Supabase dashboard → SQL Editor. There
is no migration tool — this folder is a log, not an engine. Nothing checks
what has been applied, so record it in the file header when you run it.

`../schema.sql` is the baseline: the whole schema as it should look on an
empty project. Everything numbered here happened after it.

**Numbering restarted.** The original `001`–`004` were deleted when workouts
were replaced by days — that change was destructive anyway, so the whole
database was rebuilt from `schema.sql` rather than migrated.

| File                      | What it does                                                  |
| ------------------------- | ------------------------------------------------------------- |
| `001_bodyweight_reps.sql` | Third exercise kind; renames the old `'reps'` to `'weighted'` |

**When the schema changes:**

1. Add the next numbered file with just the change
2. Fold the same change into `schema.sql` so a fresh project still gets it
3. Run the numbered file against the live database

Both places, every time — otherwise a new project and the live one drift.

Write changes so re-running them is harmless (`if not exists`,
`create or replace`), because nothing stops you running one twice.

## Rebuilding from scratch

Three files in `../`, in this order:

| File                      | What it does                                            |
| ------------------------- | ------------------------------------------------------- |
| `reset.sql`               | Drops everything. Leaves `auth.users`, so you stay in   |
| `schema.sql`              | Builds the whole schema fresh                           |
| `seed-existing-users.sql` | Profile + starter exercises for accounts that pre-exist |

The last one matters: the signup trigger only fires on signup, so an account
created before the reset would otherwise come back with no profile and an
empty exercise picker.
