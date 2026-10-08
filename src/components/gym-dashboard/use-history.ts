import { useCallback, useEffect, useState } from 'react'
import type { DayKey } from '@/lib/day'
import { fetchDays, fetchDaySummaries, type DaySummary } from '@/lib/log'
import { useLoggedExercises } from '@/lib/use-logged-exercises'
import { withRetry } from '@/lib/retry'

const pageSize = 14

export function useHistory() {
  const log = useLoggedExercises()
  const { setRows, setError } = log
  const [days, setDays] = useState<DaySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [exhausted, setExhausted] = useState(false)

  // Days first, then those days whole. Fetching every set in history on each
  // visit would grow without limit; a page of days will not.
  const fetchPage = useCallback(async (before?: DayKey) => {
    const summaries = await fetchDaySummaries(pageSize, before)
    const rows = await fetchDays(summaries.map((summary) => summary.logged_on))
    return { summaries, rows }
  }, [])

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const { summaries, rows } = await withRetry(() => fetchPage())
      setDays(summaries)
      setRows(rows)
      setExhausted(summaries.length < pageSize)
    } catch (cause) {
      console.error(cause)
      setError("Couldn't load your history.")
    } finally {
      setLoading(false)
    }
  }, [fetchPage, setRows, setError])

  useEffect(() => {
    void load()
  }, [load])

  const loadMore = useCallback(async () => {
    const oldest = days.at(-1)?.logged_on
    if (!oldest || loadingMore || exhausted) return

    setLoadingMore(true)
    try {
      const { summaries, rows } = await withRetry(() => fetchPage(oldest))
      setDays((current) => [...current, ...summaries])
      setRows((current) => [...current, ...rows])
      setExhausted(summaries.length < pageSize)
    } catch (cause) {
      console.error(cause)
      setError("Couldn't load more history.")
    } finally {
      setLoadingMore(false)
    }
  }, [days, exhausted, fetchPage, loadingMore, setRows, setError])

  return { ...log, days, loading, loadingMore, exhausted, reload: load, loadMore }
}
