import { RotateCw, TrendingDown, TrendingUp } from 'lucide-react'
import ProgressChart, { type ChartPoint } from '@/components/gym-dashboard/progress-chart'
import { useProgress } from '@/components/gym-dashboard/use-progress'
import { Button } from '@/components/ui/button'
import { formatDayLabel, formatSeconds } from '@/lib/format'
import type { ExerciseKind, ProgressPoint } from '@/lib/log'
import { cn } from '@/lib/utils'

// Each kind progresses along its own axis: heavier, longer, or more reps. All
// three are the best set of that day, so the line always means "your best".
const metrics: Record<
  ExerciseKind,
  { label: string; of: (point: ProgressPoint) => number | null; format: (value: number) => string }
> = {
  weighted: {
    label: 'Heaviest set',
    of: (point) => point.best_weight_kg,
    format: (value) => `${value} kg`,
  },
  reps: {
    label: 'Most reps',
    of: (point) => point.best_reps,
    format: (value) => `${value} reps`,
  },
  time: {
    label: 'Longest hold',
    of: (point) => point.best_seconds,
    format: (value) => formatSeconds(value),
  },
}

export default function ProgressScreen() {
  const { exercises, exercise, points, selected, setSelected, loading, error, reload } =
    useProgress()

  const metric = exercise ? metrics[exercise.kind] : null
  const series: ChartPoint[] = !metric
    ? []
    : points
        .map((point) => ({ point, value: metric.of(point) }))
        .filter((row): row is { point: ProgressPoint; value: number } => row.value !== null)
        .map(({ point, value }) => ({
          label: point.logged_on,
          value,
          caption: formatDayLabel(point.logged_on),
        }))

  const latest = series.at(-1)
  const first = series[0]
  const change = latest && first ? latest.value - first.value : 0

  return (
    <section className="pt-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Your numbers
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.06em]">Progress</h1>

      {error && (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
        >
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
            <RotateCw data-icon="inline-start" />
            {loading ? 'Retrying…' : 'Retry'}
          </Button>
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
      ) : exercises.length === 0 ? (
        <div className="mt-8 rounded-[1.75rem] border border-dashed border-border p-8 text-center">
          <p className="font-medium">Nothing to chart yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Log an exercise and its progress shows up here.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {exercises.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item.id)}
                aria-pressed={item.id === selected}
                className={cn(
                  'rounded-full border px-3 py-2 text-xs transition-colors',
                  item.id === selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted',
                )}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{metric?.label}</p>
                <p className="mt-1 text-3xl font-semibold">
                  {latest && metric ? metric.format(latest.value) : '—'}
                </p>
              </div>
              {series.length > 1 && change !== 0 && metric && (
                <span
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-1 font-mono text-xs',
                    change > 0 ? 'bg-accent/20 text-accent-foreground' : 'bg-muted',
                  )}
                >
                  {change > 0 ? (
                    <TrendingUp className="size-3.5" />
                  ) : (
                    <TrendingDown className="size-3.5" />
                  )}
                  {change > 0 ? '+' : ''}
                  {metric.format(change)}
                </span>
              )}
            </div>

            <div className="mt-6">
              {series.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No completed sets for this exercise yet.
                </p>
              ) : (
                <ProgressChart points={series} formatValue={metric!.format} />
              )}
            </div>

            {series.length === 1 && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                One session so far — log it again to see a trend.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  )
}
