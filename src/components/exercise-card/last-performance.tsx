import { History } from 'lucide-react'
import { formatDayLabel, formatSeconds } from '@/lib/format'
import type { LastPerformance as Performance } from '@/lib/log'

// The row carries no kind, so the shape is read off whichever column was
// filled in -- which is exactly what set_counts guaranteed on the way in.
function describe(performance: Performance) {
  if (performance.duration_seconds !== null) return formatSeconds(performance.duration_seconds)
  if (performance.weight_kg === null) return `×${performance.reps}`
  return `${performance.weight_kg} kg × ${performance.reps}`
}

export default function LastPerformance({ performance }: { performance: Performance | null }) {
  if (!performance) {
    return <span className="text-xs text-muted-foreground">First time</span>
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <History className="size-3.5 shrink-0" />
      <span className="font-mono text-foreground">{describe(performance)}</span>
      <span>· {formatDayLabel(performance.performed_on)}</span>
    </span>
  )
}
