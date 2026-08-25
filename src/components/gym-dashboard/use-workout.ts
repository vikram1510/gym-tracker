import { useCallback, useEffect, useRef, useState } from 'react'
import {
  addExercise,
  addSet,
  fetchWorkout,
  finishWorkout,
  removeSet,
  updateSet,
  type Workout,
  type WorkoutSet,
} from '@/lib/workouts'

export function useWorkout(workoutId: string) {
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pendingWrites = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    let active = true
    fetchWorkout(workoutId)
      .then((next) => active && setWorkout(next))
      .catch((cause) => active && setError(cause.message))
    return () => {
      active = false
    }
  }, [workoutId])

  useEffect(() => {
    const timers = pendingWrites.current
    return () => timers.forEach(clearTimeout)
  }, [])

  const patchSet = useCallback(
    (exerciseId: string, setId: string, patch: Partial<WorkoutSet>) =>
      setWorkout((current) =>
        current
          ? {
              ...current,
              workout_exercises: current.workout_exercises.map((exercise) =>
                exercise.id === exerciseId
                  ? {
                      ...exercise,
                      sets: exercise.sets.map((set) =>
                        set.id === setId ? { ...set, ...patch } : set,
                      ),
                    }
                  : exercise,
              ),
            }
          : current,
      ),
    [],
  )

  const toggleSet = useCallback(
    (exerciseId: string, set: WorkoutSet) => {
      const completed = !set.completed
      patchSet(exerciseId, set.id, { completed })
      updateSet(set.id, { completed }).catch((cause) => setError(cause.message))
    },
    [patchSet],
  )

  // Typing a weight fires on every keystroke, so the write trails the UI by a
  // beat rather than hitting the database per character.
  const editSet = useCallback(
    (exerciseId: string, setId: string, field: 'weight_kg' | 'reps', value: number | null) => {
      patchSet(exerciseId, setId, { [field]: value })

      const key = `${setId}:${field}`
      clearTimeout(pendingWrites.current.get(key))
      pendingWrites.current.set(
        key,
        setTimeout(() => {
          updateSet(setId, { [field]: value }).catch((cause) => setError(cause.message))
          pendingWrites.current.delete(key)
        }, 500),
      )
    },
    [patchSet],
  )

  const appendSet = useCallback(async (exercise: Workout['workout_exercises'][number]) => {
    const last = exercise.sets.at(-1)
    try {
      const created = await addSet(
        exercise.id,
        exercise.sets.length,
        last?.weight_kg ?? null,
        last?.reps ?? null,
      )
      setWorkout((current) =>
        current
          ? {
              ...current,
              workout_exercises: current.workout_exercises.map((item) =>
                item.id === exercise.id ? { ...item, sets: [...item.sets, created] } : item,
              ),
            }
          : current,
      )
    } catch (cause) {
      setError((cause as Error).message)
    }
  }, [])

  const deleteSet = useCallback(async (exerciseId: string, setId: string) => {
    setWorkout((current) =>
      current
        ? {
            ...current,
            workout_exercises: current.workout_exercises.map((exercise) =>
              exercise.id === exerciseId
                ? { ...exercise, sets: exercise.sets.filter((set) => set.id !== setId) }
                : exercise,
            ),
          }
        : current,
    )
    removeSet(setId).catch((cause) => setError((cause as Error).message))
  }, [])

  const appendExercise = useCallback(
    async (name: string) => {
      if (!workout) return
      try {
        const created = await addExercise(workout.id, name, workout.workout_exercises.length)
        const seeded = await Promise.all(
          [0, 1, 2].map((position) => addSet(created.id, position, null, null)),
        )
        setWorkout((current) =>
          current
            ? {
                ...current,
                workout_exercises: [...current.workout_exercises, { ...created, sets: seeded }],
              }
            : current,
        )
      } catch (cause) {
        setError((cause as Error).message)
      }
    },
    [workout],
  )

  const finish = useCallback(
    () => finishWorkout(workoutId).catch((cause) => setError(cause.message)),
    [workoutId],
  )

  return {
    workout,
    error,
    toggleSet,
    editSet,
    appendSet,
    deleteSet,
    appendExercise,
    finish,
  }
}
