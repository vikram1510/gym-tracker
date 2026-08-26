import { useEffect, useMemo, useState } from 'react'
import { fetchLastPerformances, type LastPerformance } from '@/lib/workouts'

export function useLastPerformance(exerciseIds: string[]) {
  const [byId, setById] = useState(new Map<string, LastPerformance>())
  const key = useMemo(
    () => [...new Set(exerciseIds)].filter(Boolean).sort().join('\n'),
    [exerciseIds],
  )

  useEffect(() => {
    if (!key) return
    let active = true
    fetchLastPerformances(key.split('\n'))
      .then((rows) => {
        if (active) setById(new Map(rows.map((row) => [row.exercise_id, row])))
      })
      .catch((cause) => console.error('Could not load previous sets', cause))
    return () => {
      active = false
    }
  }, [key])

  return useMemo(() => (exerciseId: string) => byId.get(exerciseId) ?? null, [byId])
}
