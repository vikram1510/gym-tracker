import { useCallback, useEffect, useState } from 'react'
import {
  fetchExerciseProgress,
  fetchExerciseSuggestions,
  type ExerciseSuggestion,
  type ProgressPoint,
} from '@/lib/log'
import { withRetry } from '@/lib/retry'

export function useProgress() {
  const [exercises, setExercises] = useState<ExerciseSuggestion[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [points, setPoints] = useState<ProgressPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Only exercises you have actually trained: a seeded one with no sessions
  // has nothing to plot, and an empty chart is worse than no chart.
  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const all = await withRetry(() => fetchExerciseSuggestions())
      const trained = all.filter((exercise) => exercise.times_used > 0)
      setExercises(trained)
      setSelected((current) => current ?? trained[0]?.id ?? null)
    } catch (cause) {
      console.error(cause)
      setError("Couldn't load your exercises.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!selected) return
    let active = true
    fetchExerciseProgress(selected)
      .then((rows) => active && setPoints(rows))
      .catch((cause) => {
        console.error(cause)
        if (active) setError("Couldn't load that exercise's history.")
      })
    return () => {
      active = false
    }
  }, [selected])

  const exercise = exercises.find((item) => item.id === selected) ?? null

  return {
    exercises,
    exercise,
    points,
    selected,
    setSelected,
    loading,
    error,
    reload: load,
  }
}
