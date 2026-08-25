import { useCallback, useEffect, useState } from 'react'
import { fetchActiveWorkouts, fetchSummaries, type WorkoutSummary } from '@/lib/workouts'

export function useHomeData() {
  const [active, setActive] = useState<WorkoutSummary[]>([])
  const [recent, setRecent] = useState<WorkoutSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [activeWorkouts, summaries] = await Promise.all([
        fetchActiveWorkouts(),
        fetchSummaries(),
      ])
      setActive(activeWorkouts)
      setRecent(summaries.filter((summary) => summary.finished_at !== null))
    } catch (cause) {
      setError((cause as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { active, recent, loading, error, reload: load }
}
