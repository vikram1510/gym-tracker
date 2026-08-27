import { useCallback, useEffect, useState } from 'react'
import { fetchActiveWorkouts, fetchFinishedWorkouts, type WorkoutSummary } from '@/lib/workouts'
import { withRetry } from '@/lib/retry'

export function useHomeData() {
  const [active, setActive] = useState<WorkoutSummary[]>([])
  const [recent, setRecent] = useState<WorkoutSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const [activeWorkouts, finished] = await withRetry(() =>
        Promise.all([fetchActiveWorkouts(), fetchFinishedWorkouts(3)]),
      )
      setActive(activeWorkouts)
      setRecent(finished)
    } catch (cause) {
      console.error(cause)
      setError("Couldn't load your workouts.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { active, recent, loading, error, reload: load }
}
