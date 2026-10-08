import { RotateCw, TrendingDown, TrendingUp } from 'lucide-react'
import ProgressChart, { type ChartPoint } from '@/components/gym-dashboard/progress-chart'
import { useProgress } from '@/components/gym-dashboard/use-progress'
import { Button } from '@/components/ui/button'
import { formatDayLabel, formatSeconds, formatVolume } from '@/lib/format'
import type { ExerciseKind, ProgressPoint } from '@/lib/log'
import { cn } from '@/lib/utils'

type Metric = {
  label: string
  of: (point: ProgressPoint) => number | null
  format: (value: number) => string
}

// Each kind progresses along its own axis. `best` is that day's best single
// set; `total` is how much of it you did. Both come from the view already
// deduplicated, so an exercise logged twice in a day is one point.
const metrics: Record<ExerciseKind, { best: Metric; total: Metric }> = {
  weighted: {
    best: {
      label: 'Heaviest set',
      of: (point) => point.best_weight_kg,
      format: (value) => `${value} kg`,
    },
    total: {
      label: 'Volume',
      of: (point) => point.total_volume_kg,
      format: formatVolume,
    },
  },
  reps: {
    best: {
      label: 'Most reps',
      of: (point) => point.best_reps,
      format: (value) => `${value} reps`,
    },
    total: {
      label: 'Total reps',
      of: (point) => point.total_reps,
      format: (value) => `${value} reps`,
    },
  },
  time: {
    best: {
      label: 'Longest hold',
      of: (point) => point.best_seconds,
      format: formatSeconds,
    },
    total: {
      label: 'Total time',
      of: (point) => point.total_seconds,
      format: formatSeconds,
    },
  },
}

function toSeries(points: ProgressPoint[], metric: Metric): ChartPoint[] {
  return points
    .map((point) => ({ point, value: metric.of(point) }))
    .filter((row): row is { point: ProgressPoint; value: number } => row.value !== null)
    .map(({ point, value }) => ({
      label: point.logged_on,
      value,
      caption: formatDayLabel(point.logged_on),
    }))
}

function MetricCard({ metric, series }: { metric: Metric; series: ChartPoint[] }) {
  const latest = series.at(-1)
  const change = latest && series[0] ? latest.value - series[0].value : 0

  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <p className="mt-1 text-3xl font-semibold">
            {latest ? metric.format(latest.value) : '—'}
          </p>
        </div>
        {series.length > 1 && change !== 0 && (
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
          <ProgressChart points={series} formatValue={metric.format} />
        )}
      </div>

      {series.length === 1 && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          One session so far — log it again to see a trend.
        </p>
      )}
    </div>
  )
}

export default function ProgressScreen() {
  const { exercises, exercise, points, selected, setSelected, loading, error, reload } =
    useProgress()

  const metric = exercise ? metrics[exercise.kind] : null

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

          {metric && (
            <div className="mt-6 flex flex-col gap-4">
              <MetricCard metric={metric.best} series={toSeries(points, metric.best)} />
              <MetricCard metric={metric.total} series={toSeries(points, metric.total)} />
            </div>
          )}
        </>
      )}
    </section>
  )
}
