import { useEffect, useState } from 'react'
import { fetchFinishedWorkouts, type WorkoutSummary } from '@/lib/workouts'

export function useHistory() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetchFinishedWorkouts()
      .then((next) => active && setWorkouts(next))
      .catch((cause) => active && setError(cause.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return { workouts, loading, error }
}
