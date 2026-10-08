import { formatSeconds } from '@/lib/format'
import type { ExerciseKind, LoggedSet } from '@/lib/log'

// Mirrors the database's set_counts function. The two must agree, or a day
// shows one number of sets and its cards show another.
const counts = (kind: ExerciseKind, set: LoggedSet) => {
  if (kind === 'time') return set.duration_seconds !== null
  if (kind === 'reps') return set.reps !== null
  return set.weight_kg !== null && set.reps !== null
}

function loggedSets(kind: ExerciseKind, sets: LoggedSet[]) {
  return sets.filter((set) => counts(kind, set))
}

// One label per set, for the chips in view mode: "50 kg × 3", "12", "50s".
// Blank sets are left out -- view mode shows what happened, not the rows you
// were about to fill in.
export function setChips(kind: ExerciseKind, sets: LoggedSet[]) {
  return loggedSets(kind, sets).map((set) => {
    if (kind === 'time') return formatSeconds(set.duration_seconds)
    if (kind === 'reps') return `×${set.reps}`
    return `${set.weight_kg} kg × ${set.reps}`
  })
}

export function setVolume(sets: LoggedSet[]) {
  return sets.reduce((total, set) => total + (set.weight_kg ?? 0) * (set.reps ?? 0), 0)
}
