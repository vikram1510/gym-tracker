import { useEffect, useMemo, useState } from 'react'
import type { DayKey } from '@/lib/day'
import { fetchLastPerformances, type LastPerformance } from '@/lib/log'

export function useLastPerformance(before: DayKey) {
  const [byId, setById] = useState(new Map<string, LastPerformance>())

  useEffect(() => {
    let active = true
    fetchLastPerformances(before)
      .then((rows) => {
        if (active) setById(new Map(rows.map((row) => [row.exercise_id, row])))
      })
      .catch((cause) => console.error('Could not load previous sets', cause))
    return () => {
      active = false
    }
  }, [before])

  return useMemo(() => (exerciseId: string) => byId.get(exerciseId) ?? null, [byId])
}
