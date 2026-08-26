import { History } from 'lucide-react'
import { formatShortDate } from '@/components/gym-dashboard/format'
import type { LastPerformance as Performance } from '@/lib/workouts'

export default function LastPerformance({ performance }: { performance: Performance | null }) {
  if (!performance) {
    return <span className="text-xs text-muted-foreground">First time</span>
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <History className="size-3.5 shrink-0" />
      <span className="font-mono text-foreground">
        {performance.weight_kg} kg × {performance.reps}
      </span>
      <span>· {formatShortDate(performance.performed_at)}</span>
    </span>
  )
}
