import { useCallback, useEffect, useState } from 'react'
import type { DayKey } from '@/lib/day'
import { addSet, fetchDay, getOrCreateExercise, logExercise, type ExerciseKind } from '@/lib/log'
import { useLoggedExercises } from '@/lib/use-logged-exercises'
import { withRetry } from '@/lib/retry'

export function useDay(day: DayKey) {
  const log = useLoggedExercises()
  const { setRows, setError, nextPosition } = log
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      setRows(await withRetry(() => fetchDay(day)))
    } catch (cause) {
      console.error(cause)
      setError("Couldn't load this day.")
    } finally {
      setLoading(false)
    }
  }, [day, setRows, setError])

  useEffect(() => {
    void load()
  }, [load])

  const addExercise = useCallback(
    async (name: string, kind: ExerciseKind) => {
      try {
        const exerciseId = await getOrCreateExercise(name, kind)
        const created = await logExercise(exerciseId, name, kind, day, nextPosition(log.rows))
        const seeded = await Promise.all(
          [0, 1, 2].map((position) => addSet(created.id, position, null, null, null)),
        )
        setRows((current) => [...current, { ...created, sets: seeded }])
      } catch (cause) {
        setError((cause as Error).message)
      }
    },
    [day, log.rows, nextPosition, setRows, setError],
  )

  return { ...log, loading, reload: load, addExercise }
}
