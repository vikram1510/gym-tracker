import { supabase } from '@/lib/supabase'

export type WorkoutSet = {
  id: string
  position: number
  weight_kg: number | null
  reps: number | null
  completed: boolean
}

export type WorkoutExercise = {
  id: string
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

const workoutShape =
  'id, name, started_at, finished_at, workout_exercises(id, name, position, sets(id, position, weight_kg, reps, completed))'

function sortWorkout(workout: Workout): Workout {
  const exercises = [...workout.workout_exercises]
    .sort((a, b) => a.position - b.position)
    .map((exercise) => ({
      ...exercise,
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
  return sortWorkout(data as Workout)
}

export async function fetchWorkout(id: string) {
  const { data, error } = await supabase.from('workouts').select(workoutShape).eq('id', id).single()
  if (error) throw error
  return sortWorkout(data as Workout)
}

export async function addExercise(workoutId: string, name: string, position: number) {
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert({ workout_id: workoutId, name, position })
    .select('id, name, position, sets(id, position, weight_kg, reps, completed)')
    .single()

  if (error) throw error
  return data as WorkoutExercise
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
    .select('id, position, weight_kg, reps, completed')
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

export async function finishWorkout(id: string) {
  const { error } = await supabase
    .from('workouts')
    .update({ finished_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
