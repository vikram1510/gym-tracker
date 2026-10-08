import { supabase } from '@/lib/supabase'
import type { DayKey } from '@/lib/day'

export type ExerciseKind = 'weighted' | 'reps' | 'time'

export type LoggedSet = {
  id: string
  position: number
  weight_kg: number | null
  reps: number | null
  duration_seconds: number | null
}

export type LoggedExercise = {
  id: string
  exercise_id: string
  name: string
  kind: ExerciseKind
  logged_on: DayKey
  position: number
  created_at: string
  sets: LoggedSet[]
}

export type DaySummary = {
  logged_on: DayKey
  exercises: number
  volume_kg: number
  logged_sets: number
}

const setShape = 'id, position, weight_kg, reps, duration_seconds'
const loggedExerciseShape = `id, exercise_id, logged_on, position, created_at, exercises(name, kind), sets(${setShape})`

type RawLoggedExercise = Omit<LoggedExercise, 'name' | 'kind'> & {
  exercises: { name: string; kind: ExerciseKind } | null
}

// Position orders what you dragged; created_at breaks ties, so a second go at
// the same exercise later in the day always lands after the first.
function sortLogged(rows: RawLoggedExercise[]): LoggedExercise[] {
  return [...rows]
    .sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at))
    .map(({ exercises, ...row }) => ({
      ...row,
      name: exercises?.name ?? 'Exercise',
      kind: exercises?.kind ?? 'weighted',
      sets: [...row.sets].sort((a, b) => a.position - b.position),
    }))
}

export async function fetchDay(day: DayKey) {
  const { data, error } = await supabase
    .from('logged_exercises')
    .select(loggedExerciseShape)
    .eq('logged_on', day)

  if (error) throw error
  return sortLogged((data ?? []) as unknown as RawLoggedExercise[])
}

// History pages by day rather than by row: ask the summary view which days
// exist, then pull those days whole.
export async function fetchDaySummaries(limit: number, before?: DayKey) {
  let query = supabase
    .from('day_summaries')
    .select('logged_on, exercises, volume_kg, logged_sets')
    .order('logged_on', { ascending: false })
    .limit(limit)

  if (before) query = query.lt('logged_on', before)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as DaySummary[]
}

export async function fetchDays(days: DayKey[]) {
  if (days.length === 0) return []

  const { data, error } = await supabase
    .from('logged_exercises')
    .select(loggedExerciseShape)
    .in('logged_on', days)

  if (error) throw error
  return sortLogged((data ?? []) as unknown as RawLoggedExercise[])
}

// Resolves a typed name to a catalogue row, creating it the first time. The
// database owns the dedupe, so "Leg press" and "leg press " land on one row.
export async function getOrCreateExercise(name: string, kind: ExerciseKind) {
  const { data, error } = await supabase.rpc('get_or_create_exercise', {
    p_name: name,
    p_kind: kind,
  })
  if (error) throw error
  return data as string
}

export async function logExercise(
  exerciseId: string,
  name: string,
  kind: ExerciseKind,
  day: DayKey,
  position: number,
) {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('logged_exercises')
    .insert({
      user_id: auth.user.id,
      exercise_id: exerciseId,
      logged_on: day,
      position,
    })
    .select(`id, exercise_id, logged_on, position, created_at, sets(${setShape})`)
    .single()

  if (error) throw error
  return { ...(data as Omit<LoggedExercise, 'name' | 'kind'>), name, kind }
}

// Cascades to this entry's sets. The catalogue row survives -- only this
// day's record of it goes.
export async function removeLoggedExercise(id: string) {
  const { error } = await supabase.from('logged_exercises').delete().eq('id', id)
  if (error) throw error
}

export async function addSet(
  loggedExerciseId: string,
  position: number,
  weightKg: number | null,
  reps: number | null,
  durationSeconds: number | null,
) {
  const { data, error } = await supabase
    .from('sets')
    .insert({
      logged_exercise_id: loggedExerciseId,
      position,
      weight_kg: weightKg,
      reps,
      duration_seconds: durationSeconds,
    })
    .select(setShape)
    .single()

  if (error) throw error
  return data as LoggedSet
}

export async function updateSet(id: string, patch: Partial<Omit<LoggedSet, 'id'>>) {
  const { error } = await supabase.from('sets').update(patch).eq('id', id)
  if (error) throw error
}

export async function removeSet(id: string) {
  const { error } = await supabase.from('sets').delete().eq('id', id)
  if (error) throw error
}

export type ExerciseSuggestion = {
  id: string
  name: string
  kind: ExerciseKind
  times_used: number
  last_used_on: DayKey | null
}

export async function fetchExerciseSuggestions() {
  const { data, error } = await supabase
    .from('exercise_suggestions')
    .select('id, name, kind, times_used, last_used_on')
    .order('times_used', { ascending: false })
    .order('last_used_on', { ascending: false, nullsFirst: false })
    .order('name')

  if (error) throw error
  return (data ?? []) as ExerciseSuggestion[]
}

export type ProgressPoint = {
  logged_on: DayKey
  best_weight_kg: number | null
  best_reps: number | null
  best_seconds: number | null
}

export async function fetchExerciseProgress(exerciseId: string) {
  const { data, error } = await supabase
    .from('exercise_progress')
    .select('logged_on, best_weight_kg, best_reps, best_seconds')
    .eq('exercise_id', exerciseId)
    .order('logged_on')

  if (error) throw error
  return (data ?? []) as ProgressPoint[]
}

export type LastPerformance = {
  exercise_id: string
  performed_on: DayKey
  weight_kg: number | null
  reps: number | null
  duration_seconds: number | null
}

// "Before" is the day being viewed, passed from the client: the database's
// current_date is UTC and would pick the wrong day near midnight. Looking at
// an older day shows what you did before *that* day, not before today.
export async function fetchLastPerformances(before: DayKey) {
  const { data, error } = await supabase.rpc('exercise_last_sets', { p_before: before })
  if (error) throw error
  return (data ?? []) as LastPerformance[]
}
