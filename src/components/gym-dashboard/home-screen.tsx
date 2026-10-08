import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, RotateCw } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import ExerciseCard from '@/components/exercise-card/exercise-card'
import ExercisePicker from '@/components/gym-dashboard/exercise-picker'
import { useDay } from '@/components/gym-dashboard/use-day'
import { useLastPerformance } from '@/components/gym-dashboard/use-last-performance'
import { Button } from '@/components/ui/button'
import { isFuture, isToday, shiftDay, todayKey } from '@/lib/day'
import { formatDayLabel, formatVolume } from '@/lib/format'
import { setVolume } from '@/components/exercise-card/summarise'

const dotColors = ['bg-primary', 'bg-accent', 'bg-secondary']

export default function HomeScreen() {
  const navigate = useNavigate()
  const { date } = useParams()
  const [params, setParams] = useSearchParams()
  const day = date ?? todayKey()

  const {
    rows,
    loading,
    error,
    reload,
    editSet,
    appendSet,
    deleteSet,
    deleteExercise,
    addExercise,
  } = useDay(day)
  const lastPerformance = useLastPerformance(day)
  const [pickerFallback, setPickerFallback] = useState(false)

  // The nav's + button opens the sheet through the URL, so it can target the
  // day on screen without the layout having to know which one that is -- and
  // back closes the sheet rather than leaving the page.
  const pickerOpen = params.has('add') || pickerFallback
  const closePicker = () => {
    setPickerFallback(false)
    if (params.has('add')) {
      params.delete('add')
      setParams(params, { replace: true })
    }
  }

  const goTo = (next: string) => navigate(isToday(next) ? '/' : `/day/${next}`)
  const volume = rows.reduce((total, exercise) => total + setVolume(exercise.sets), 0)

  return (
    <section className="pt-6 md:pt-10">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous day"
          onClick={() => goTo(shiftDay(day, -1))}
        >
          <ChevronLeft />
        </Button>

        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
            {formatDayLabel(day)}
          </h1>
          {volume > 0 && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">{formatVolume(volume)}</p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Next day"
          disabled={isFuture(shiftDay(day, 1))}
          onClick={() => goTo(shiftDay(day, 1))}
        >
          <ChevronRight />
        </Button>
      </div>

      {!isToday(day) && (
        <div className="mt-2 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => goTo(todayKey())}
          >
            Back to today
          </Button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
        >
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
            <RotateCw data-icon="inline-start" />
            {loading ? 'Retrying…' : 'Retry'}
          </Button>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-border p-8 text-center">
            <p className="font-medium">Nothing logged {isToday(day) ? 'today' : 'this day'}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add an exercise and it will show up here.
            </p>
          </div>
        ) : (
          rows.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              dotColor={dotColors[index % dotColors.length]}
              lastPerformance={lastPerformance(exercise.exercise_id)}
              alwaysEditing
              onEditSet={(setId, field, value) => editSet(exercise.id, setId, field, value)}
              onAddSet={() => appendSet(exercise)}
              onRemoveSet={(setId) => deleteSet(exercise.id, setId)}
              onRemove={() => deleteExercise(exercise.id)}
            />
          ))
        )}

        {/* The nav's + does this on mobile; that nav is md:hidden, so desktop
            needs its own button or there is no way to log anything. */}
        <Button
          variant="outline"
          className="hidden min-h-14 w-full rounded-2xl border-dashed md:flex"
          onClick={() => setPickerFallback(true)}
        >
          <Plus data-icon="inline-start" />
          Add exercise
        </Button>
      </div>

      <ExercisePicker
        open={pickerOpen}
        dayLabel={formatDayLabel(day)}
        onClose={closePicker}
        onPick={(name, kind) => void addExercise(name, kind)}
      />
    </section>
  )
}
