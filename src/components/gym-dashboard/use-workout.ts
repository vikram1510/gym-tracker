import { useCallback, useEffect, useRef, useState } from 'react'
import {
  addExercise,
  addSet,
  fetchWorkout,
  finishWorkout,
  getOrCreateExercise,
  removeSet,
  renameWorkout,
  updateSet,
  type Workout,
  type WorkoutSet,
} from '@/lib/workouts'

export function useWorkout(workoutId: string) {
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pendingWrites = useRef(
    new Map<string, { timer: ReturnType<typeof setTimeout>; write: () => Promise<void> }>(),
  )

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
    const pending = pendingWrites.current
    return () => pending.forEach((entry) => clearTimeout(entry.timer))
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

  // Typing a weight fires on every keystroke, so the write trails the UI by a
  // beat rather than hitting the database per character.
  const editSet = useCallback(
    (exerciseId: string, setId: string, field: 'weight_kg' | 'reps', value: number | null) => {
      patchSet(exerciseId, setId, { [field]: value })

      const key = `${setId}:${field}`
      clearTimeout(pendingWrites.current.get(key)?.timer)
      const write = async () => {
        pendingWrites.current.delete(key)
        await updateSet(setId, { [field]: value }).catch((cause) => setError(cause.message))
      }
      pendingWrites.current.set(key, { timer: setTimeout(write, 500), write })
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
        const exerciseId = await getOrCreateExercise(name)
        const created = await addExercise(
          workout.id,
          exerciseId,
          name,
          workout.workout_exercises.length,
        )
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

  const rename = useCallback(
    (name: string) => {
      setWorkout((current) => (current ? { ...current, name } : current))
      renameWorkout(workoutId, name).catch((cause) => setError(cause.message))
    },
    [workoutId],
  )

  // Anything still waiting on the debounce has to land before the workout is
  // closed, or the last weight typed is silently dropped.
  const finish = useCallback(async () => {
    const pending = [...pendingWrites.current.values()]
    pending.forEach((entry) => clearTimeout(entry.timer))
    await Promise.all(pending.map((entry) => entry.write()))
    await finishWorkout(workoutId).catch((cause) => setError(cause.message))
  }, [workoutId])

  return {
    workout,
    error,
    editSet,
    appendSet,
    deleteSet,
    appendExercise,
    rename,
    finish,
  }
}
