import { useCallback, useEffect, useRef, useState } from 'react'
import {
  addSet,
  removeLoggedExercise,
  removeSet,
  updateSet,
  type LoggedExercise,
  type LoggedSet,
} from '@/lib/log'

const setFields = ['weight_kg', 'reps', 'duration_seconds'] as const
export type SetField = (typeof setFields)[number]

// Counting is not enough: deleting from the middle leaves gaps, and a count
// would hand the next row a position that already exists.
const nextPosition = (items: { position: number }[]) =>
  items.reduce((max, item) => Math.max(max, item.position + 1), 0)

// Owns the rows for one or more days plus every edit that can be made to
// them, so Home and History get identical behaviour from one place.
export function useLoggedExercises() {
  const [rows, setRows] = useState<LoggedExercise[]>([])
  const [error, setError] = useState<string | null>(null)
  const pendingWrites = useRef(
    new Map<string, { timer: ReturnType<typeof setTimeout>; write: () => Promise<void> }>(),
  )

  // There is no "finish" any more, so nothing else would ever flush these.
  // Cancelling on unmount would drop the last value typed before navigating.
  useEffect(() => {
    const pending = pendingWrites.current
    return () => {
      pending.forEach((entry) => {
        clearTimeout(entry.timer)
        void entry.write()
      })
      pending.clear()
    }
  }, [])

  const patchSet = useCallback(
    (exerciseId: string, setId: string, patch: Partial<LoggedSet>) =>
      setRows((current) =>
        current.map((exercise) =>
          exercise.id === exerciseId
            ? {
                ...exercise,
                sets: exercise.sets.map((set) => (set.id === setId ? { ...set, ...patch } : set)),
              }
            : exercise,
        ),
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

  const appendSet = useCallback(async (exercise: LoggedExercise) => {
    const last = exercise.sets.at(-1)
    try {
      const created = await addSet(
        exercise.id,
        nextPosition(exercise.sets),
        last?.weight_kg ?? null,
        last?.reps ?? null,
        last?.duration_seconds ?? null,
      )
      setRows((current) =>
        current.map((item) =>
          item.id === exercise.id ? { ...item, sets: [...item.sets, created] } : item,
        ),
      )
    } catch (cause) {
      setError((cause as Error).message)
    }
  }, [])

  const deleteSet = useCallback((exerciseId: string, setId: string) => {
    for (const field of setFields) {
      const entry = pendingWrites.current.get(`${setId}:${field}`)
      if (!entry) continue
      clearTimeout(entry.timer)
      pendingWrites.current.delete(`${setId}:${field}`)
    }

    setRows((current) =>
      current.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: exercise.sets.filter((set) => set.id !== setId) }
          : exercise,
      ),
    )
    removeSet(setId).catch((cause) => setError((cause as Error).message))
  }, [])

  const deleteExercise = useCallback((exerciseId: string) => {
    setRows((current) => {
      const doomed = current.find((item) => item.id === exerciseId)
      doomed?.sets.forEach((set) => {
        for (const field of setFields) {
          const entry = pendingWrites.current.get(`${set.id}:${field}`)
          if (!entry) continue
          clearTimeout(entry.timer)
          pendingWrites.current.delete(`${set.id}:${field}`)
        }
      })
      return current.filter((item) => item.id !== exerciseId)
    })
    removeLoggedExercise(exerciseId).catch((cause) => setError((cause as Error).message))
  }, [])

  return {
    rows,
    setRows,
    error,
    setError,
    editSet,
    appendSet,
    deleteSet,
    deleteExercise,
    nextPosition,
  }
}
