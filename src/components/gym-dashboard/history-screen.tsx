import { RotateCw } from 'lucide-react'
import ExerciseCard from '@/components/exercise-card/exercise-card'
import { useHistory } from '@/components/gym-dashboard/use-history'
import { Button } from '@/components/ui/button'
import { formatDayLabel, formatMonth, formatDayOfMonth, formatVolume } from '@/lib/format'

const dotColors = ['bg-primary', 'bg-accent', 'bg-secondary']

export default function HistoryScreen() {
  const {
    rows,
    days,
    loading,
    loadingMore,
    exhausted,
    error,
    reload,
    loadMore,
    editSet,
    appendSet,
    deleteSet,
    deleteExercise,
  } = useHistory()

  return (
    <section className="pt-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Your archive
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.06em]">History</h1>

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
      ) : days.length === 0 ? (
        <div className="mt-8 rounded-[1.75rem] border border-dashed border-border p-8 text-center">
          <p className="font-medium">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Every day you log collects here so you can look back at it.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {days.map((day) => (
            <div key={day.logged_on}>
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-muted">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {formatMonth(day.logged_on)}
                  </span>
                  <span className="font-semibold">{formatDayOfMonth(day.logged_on)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{formatDayLabel(day.logged_on)}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {day.logged_sets} {day.logged_sets === 1 ? 'set' : 'sets'} ·{' '}
                    {formatVolume(day.volume_kg)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-3">
                {rows
                  .filter((exercise) => exercise.logged_on === day.logged_on)
                  .map((exercise, index) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      dotColor={dotColors[index % dotColors.length]}
                      onEditSet={(setId, field, value) => editSet(exercise.id, setId, field, value)}
                      onAddSet={() => appendSet(exercise)}
                      onRemoveSet={(setId) => deleteSet(exercise.id, setId)}
                      onRemove={() => deleteExercise(exercise.id)}
                    />
                  ))}
              </div>
            </div>
          ))}

          {!exhausted && (
            <Button
              variant="outline"
              className="h-12 w-full rounded-2xl"
              disabled={loadingMore}
              onClick={loadMore}
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
