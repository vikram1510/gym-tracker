import { useCallback, useEffect, useState } from 'react'
import { fetchFinishedWorkouts, type WorkoutSummary } from '@/lib/workouts'
import { withRetry } from '@/lib/retry'

export function useHistory() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      setWorkouts(await withRetry(() => fetchFinishedWorkouts()))
    } catch (cause) {
      console.error(cause)
      setError("Couldn't load your history.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { workouts, loading, error, reload: load }
}
