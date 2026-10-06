# Migrations

Numbered SQL files, run by hand in the Supabase dashboard → SQL Editor. There
is no migration tool — this folder is a log, not an engine. Nothing checks
what has been applied, so record it in the file header when you run it.

`../schema.sql` is the baseline: the whole schema as it should look on an
empty project. Everything numbered here happened after it.

**When the schema changes:**

1. Add the next numbered file with just the change
2. Fold the same change into `schema.sql` so a fresh project still gets it
3. Run the numbered file against the live database

Both places, every time — otherwise a new project and the live one drift.

Write changes so re-running them is harmless (`if not exists`,
`create or replace`), because nothing stops you running one twice.

| File                           | What it does                                                   |
| ------------------------------ | -------------------------------------------------------------- |
| `001_exercise_last_sets.sql`   | Last-session weight/reps per exercise (index + view)           |
| `002_exercise_catalogue.sql`   | **Destructive.** Per-user `exercises` table, drops `completed` |
| `003_last_set_by_position.sql` | `exercise_last_sets` picks the last set, not the heaviest      |
| `004_timed_exercises.sql`      | `exercises.kind` + `sets.duration_seconds`; views count both   |

`002` supersedes `001` entirely — it drops and rebuilds those objects. If you
never ran `001`, skip it and run `002` alone.
