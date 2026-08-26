import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { formatDuration, formatMonth, formatVolume } from '@/components/gym-dashboard/format'
import { useHistory } from '@/components/gym-dashboard/use-history'

export default function HistoryScreen() {
  const navigate = useNavigate()
  const { workouts, loading, error } = useHistory()

  return (
    <section className="pt-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Your archive
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.06em]">History</h1>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
      ) : workouts.length === 0 ? (
        <div className="mt-8 rounded-[1.75rem] border border-dashed border-border p-8 text-center">
          <p className="font-medium">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Finished workouts collect here so you can look back at them.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {workouts.map((workout) => {
            const date = new Date(workout.finished_at ?? workout.started_at)
            return (
              <button
                key={workout.id}
                onClick={() => navigate(`/workout/${workout.id}`)}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-muted">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {formatMonth(date.toISOString())}
                  </span>
                  <span className="font-semibold">{date.getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{workout.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDuration(workout.duration_seconds)} · {formatVolume(workout.volume_kg)} ·{' '}
                    {workout.logged_sets} {workout.logged_sets === 1 ? 'set' : 'sets'}
                  </p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
