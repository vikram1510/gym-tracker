import { supabase } from '@/lib/supabase'

export type WorkoutSet = {
  id: string
  position: number
  weight_kg: number | null
  reps: number | null
}

export type WorkoutExercise = {
  id: string
  exercise_id: string
  name: string
  position: number
  sets: WorkoutSet[]
}

export type Workout = {
  id: string
  name: string
  started_at: string
  finished_at: string | null
  workout_exercises: WorkoutExercise[]
}

const exerciseShape =
  'id, position, exercise_id, exercises(name), sets(id, position, weight_kg, reps)'
const workoutShape = `id, name, started_at, finished_at, workout_exercises(${exerciseShape})`

type RawExercise = Omit<WorkoutExercise, 'name'> & { exercises: { name: string } | null }
type RawWorkout = Omit<Workout, 'workout_exercises'> & { workout_exercises: RawExercise[] }

function sortWorkout(workout: RawWorkout): Workout {
  const exercises = [...workout.workout_exercises]
    .sort((a, b) => a.position - b.position)
    .map(({ exercises, ...exercise }) => ({
      ...exercise,
      name: exercises?.name ?? 'Exercise',
      sets: [...exercise.sets].sort((a, b) => a.position - b.position),
    }))
  return { ...workout, workout_exercises: exercises }
}

export async function createWorkout(name: string) {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('workouts')
    .insert({ user_id: auth.user.id, name })
    .select(workoutShape)
    .single()

  if (error) throw error
  return sortWorkout(data as unknown as RawWorkout)
}

export async function fetchWorkout(id: string) {
  const { data, error } = await supabase.from('workouts').select(workoutShape).eq('id', id).single()
  if (error) throw error
  return sortWorkout(data as unknown as RawWorkout)
}

// Resolves a typed name to a catalogue row, creating it the first time. The
// database owns the dedupe, so "Leg press" and "leg press " land on one row.
export async function getOrCreateExercise(name: string) {
  const { data, error } = await supabase.rpc('get_or_create_exercise', { p_name: name })
  if (error) throw error
  return data as string
}

export async function addExercise(
  workoutId: string,
  exerciseId: string,
  name: string,
  position: number,
) {
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert({ workout_id: workoutId, exercise_id: exerciseId, position })
    .select('id, position, exercise_id, sets(id, position, weight_kg, reps)')
    .single()

  if (error) throw error
  return { ...(data as Omit<WorkoutExercise, 'name'>), name }
}

export async function addSet(
  workoutExerciseId: string,
  position: number,
  weightKg: number | null,
  reps: number | null,
) {
  const { data, error } = await supabase
    .from('sets')
    .insert({ workout_exercise_id: workoutExerciseId, position, weight_kg: weightKg, reps })
    .select('id, position, weight_kg, reps')
    .single()

  if (error) throw error
  return data as WorkoutSet
}

export async function updateSet(id: string, patch: Partial<Omit<WorkoutSet, 'id'>>) {
  const { error } = await supabase.from('sets').update(patch).eq('id', id)
  if (error) throw error
}

export async function removeSet(id: string) {
  const { error } = await supabase.from('sets').delete().eq('id', id)
  if (error) throw error
}

// Cascades to workout_exercises and sets. The catalogue is untouched -- the
// exercises stay, only this session's record of them goes.
export async function deleteWorkout(id: string) {
  const { error } = await supabase.from('workouts').delete().eq('id', id)
  if (error) throw error
}

export async function finishWorkout(id: string) {
  const { error } = await supabase
    .from('workouts')
    .update({ finished_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export type WorkoutSummary = {
  id: string
  name: string
  started_at: string
  finished_at: string | null
  duration_seconds: number | null
  volume_kg: number
  logged_sets: number
}

const summaryShape = 'id, name, started_at, finished_at, duration_seconds, volume_kg, logged_sets'

export async function fetchFinishedWorkouts(limit = 100) {
  const { data, error } = await supabase
    .from('workout_summaries')
    .select(summaryShape)
    .not('finished_at', 'is', null)
    .order('finished_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as WorkoutSummary[]
}

export async function fetchActiveWorkouts() {
  const { data, error } = await supabase
    .from('workout_summaries')
    .select(summaryShape)
    .is('finished_at', null)
    .order('started_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as WorkoutSummary[]
}

export async function renameWorkout(id: string, name: string) {
  const { error } = await supabase.from('workouts').update({ name }).eq('id', id)
  if (error) throw error
}

export type ExerciseSuggestion = {
  id: string
  name: string
  times_used: number
  last_used_at: string | null
}

export async function fetchExerciseSuggestions() {
  const { data, error } = await supabase
    .from('exercise_suggestions')
    .select('id, name, times_used, last_used_at')
    .order('times_used', { ascending: false })
    .order('last_used_at', { ascending: false, nullsFirst: false })
    .order('name')

  if (error) throw error
  return (data ?? []) as ExerciseSuggestion[]
}

export type LastPerformance = {
  exercise_id: string
  performed_at: string
  weight_kg: number
  reps: number
}

export async function fetchLastPerformances(exerciseIds: string[]) {
  const ids = [...new Set(exerciseIds)].filter(Boolean)
  if (ids.length === 0) return []

  const { data, error } = await supabase
    .from('exercise_last_sets')
    .select('exercise_id, performed_at, weight_kg, reps')
    .in('exercise_id', ids)

  if (error) throw error
  return (data ?? []) as LastPerformance[]
}
