import { History } from 'lucide-react'
import { formatDayLabel, formatSeconds } from '@/lib/format'
import type { LastPerformance as Performance } from '@/lib/log'

export default function LastPerformance({ performance }: { performance: Performance | null }) {
  if (!performance) {
    return <span className="text-xs text-muted-foreground">First time</span>
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <History className="size-3.5 shrink-0" />
      <span className="font-mono text-foreground">
        {performance.duration_seconds !== null
          ? formatSeconds(performance.duration_seconds)
          : `${performance.weight_kg} kg × ${performance.reps}`}
      </span>
      <span>· {formatDayLabel(performance.performed_on)}</span>
    </span>
  )
}
