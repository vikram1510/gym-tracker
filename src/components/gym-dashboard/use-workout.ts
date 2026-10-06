import { useCallback, useEffect, useRef, useState } from 'react'
import {
  addExercise,
  addSet,
  deleteWorkout,
  fetchWorkout,
  finishWorkout,
  getOrCreateExercise,
  removeExercise,
  removeSet,
  renameWorkout,
  updateSet,
  type ExerciseKind,
  type Workout,
  type WorkoutSet,
} from '@/lib/workouts'

const setFields = ['weight_kg', 'reps', 'duration_seconds'] as const
type SetField = (typeof setFields)[number]

// Counting is not enough: deleting from the middle leaves gaps, and a count
// would hand the next row a position that already exists.
const nextPosition = (items: { position: number }[]) =>
  items.reduce((max, item) => Math.max(max, item.position + 1), 0)

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
    (exerciseId: string, setId: string, field: SetField, value: number | null) => {
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
        nextPosition(exercise.sets),
        last?.weight_kg ?? null,
        last?.reps ?? null,
        last?.duration_seconds ?? null,
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

  const deleteExercise = useCallback(
    (workoutExerciseId: string) => {
      const doomed = workout?.workout_exercises.find((item) => item.id === workoutExerciseId)
      doomed?.sets.forEach((set) => {
        for (const field of setFields) {
          const entry = pendingWrites.current.get(`${set.id}:${field}`)
          if (!entry) continue
          clearTimeout(entry.timer)
          pendingWrites.current.delete(`${set.id}:${field}`)
        }
      })

      setWorkout((current) =>
        current
          ? {
              ...current,
              workout_exercises: current.workout_exercises.filter(
                (item) => item.id !== workoutExerciseId,
              ),
            }
          : current,
      )
      removeExercise(workoutExerciseId).catch((cause) => setError((cause as Error).message))
    },
    [workout],
  )

  const appendExercise = useCallback(
    async (name: string, kind: ExerciseKind) => {
      if (!workout) return
      try {
        const exerciseId = await getOrCreateExercise(name, kind)
        const created = await addExercise(
          workout.id,
          exerciseId,
          name,
          kind,
          nextPosition(workout.workout_exercises),
        )
        const seeded = await Promise.all(
          [0, 1, 2].map((position) => addSet(created.id, position, null, null, null)),
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

  // The mirror of finish: pending writes are dropped rather than flushed,
  // since the rows they would update are about to stop existing.
  const remove = useCallback(async () => {
    pendingWrites.current.forEach((entry) => clearTimeout(entry.timer))
    pendingWrites.current.clear()
    try {
      await deleteWorkout(workoutId)
      return true
    } catch (cause) {
      setError((cause as Error).message)
      return false
    }
  }, [workoutId])

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
    deleteExercise,
    appendExercise,
    rename,
    finish,
    remove,
  }
}
