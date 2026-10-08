import { formatSeconds } from '@/lib/format'
import type { ExerciseKind, LoggedSet } from '@/lib/log'

const counts = (kind: ExerciseKind, set: LoggedSet) =>
  kind === 'time' ? set.duration_seconds !== null : set.weight_kg !== null && set.reps !== null

export function loggedSets(kind: ExerciseKind, sets: LoggedSet[]) {
  return sets.filter((set) => counts(kind, set))
}

// "60 × 8 · 60 × 8 · 65 × 6", or "30s · 30s · 45s" for a timed exercise.
// Blank sets are left out -- view mode shows what happened, not the empty
// rows you were about to fill in.
export function summariseSets(kind: ExerciseKind, sets: LoggedSet[]) {
  return loggedSets(kind, sets)
    .map((set) =>
      kind === 'time' ? formatSeconds(set.duration_seconds) : `${set.weight_kg} kg × ${set.reps}`,
    )
    .join(' · ')
}

export function setVolume(sets: LoggedSet[]) {
  return sets.reduce((total, set) => total + (set.weight_kg ?? 0) * (set.reps ?? 0), 0)
}
