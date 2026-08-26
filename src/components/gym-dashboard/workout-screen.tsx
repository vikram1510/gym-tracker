import { useMemo, useState } from 'react'
import { ArrowLeft, MoreHorizontal, Plus, Trash2, X } from 'lucide-react'
import { useWorkout } from '@/components/gym-dashboard/use-workout'
import { useExerciseSuggestions } from '@/components/gym-dashboard/use-exercise-suggestions'
import { useLastPerformance } from '@/components/gym-dashboard/use-last-performance'
import { formatDuration, formatTime } from '@/components/gym-dashboard/format'
import EditableText from '@/components/gym-dashboard/editable-text'
import LastPerformance from '@/components/gym-dashboard/last-performance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const dotColors = ['bg-primary', 'bg-accent', 'bg-secondary']

function toNumber(value: string) {
  if (value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export default function WorkoutScreen({
  workoutId,
  onBack,
}: {
  workoutId: string
  onBack: () => void
}) {
  const { workout, error, editSet, appendSet, deleteSet, appendExercise, rename, finish, remove } =
    useWorkout(workoutId)
  const [showPicker, setShowPicker] = useState(false)
  const [newName, setNewName] = useState('')
  const [finishing, setFinishing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const finished = Boolean(workout?.finished_at)

  const exerciseIds = useMemo(
    () => workout?.workout_exercises.map((exercise) => exercise.exercise_id) ?? [],
    [workout],
  )
  const lastPerformance = useLastPerformance(exerciseIds)
  const catalogue = useExerciseSuggestions(showPicker)

  const suggestions = useMemo(() => {
    const query = newName.trim().toLowerCase()
    const added = new Set(exerciseIds)
    return catalogue
      .filter((exercise) => !added.has(exercise.id))
      .filter((exercise) => exercise.name.toLowerCase().includes(query))
      .slice(0, 6)
  }, [catalogue, newName, exerciseIds])

  const submitExercise = (value = newName) => {
    const name = value.trim()
    if (!name) return
    appendExercise(name)
    setNewName('')
    setShowPicker(false)
  }

  const volume =
    workout?.workout_exercises.reduce(
      (total, exercise) =>
        total + exercise.sets.reduce((sum, set) => sum + (set.weight_kg ?? 0) * (set.reps ?? 0), 0),
      0,
    ) ?? 0

  return (
    <section className="pt-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft />
        </Button>
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {finished ? 'Completed' : 'In progress'}
          </p>
          {workout ? (
            <EditableText
              value={workout.name}
              label="Workout name"
              onSave={rename}
              className="font-semibold"
              inputClassName="w-48 text-center font-semibold"
            />
          ) : (
            <p className="font-semibold">—</p>
          )}
        </div>
        {finished ? (
          <span className="w-16" />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            disabled={finishing}
            onClick={async () => {
              setFinishing(true)
              await finish()
              onBack()
            }}
          >
            {finishing ? 'Finishing…' : 'Finish'}
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-8 rounded-[1.75rem] bg-primary p-5 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-foreground/60">
              {finished ? 'Duration' : 'Started'}
            </p>
            <p className="mt-1 font-mono text-3xl">
              {!workout
                ? '—'
                : finished
                  ? formatDuration(
                      (new Date(workout.finished_at!).getTime() -
                        new Date(workout.started_at).getTime()) /
                        1000,
                    )
                  : formatTime(workout.started_at)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-foreground/60">Volume</p>
            <p className="mt-1 font-mono text-xl">{volume.toLocaleString()} kg</p>
          </div>
        </div>
      </div>

      {!workout ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {workout.workout_exercises.map((exercise, exerciseIndex) => (
            <div key={exercise.id} className="rounded-[1.5rem] border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-1 size-3 rounded-full',
                    dotColors[exerciseIndex % dotColors.length],
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="font-semibold">{exercise.name}</h2>
                    <LastPerformance performance={lastPerformance(exercise.exercise_id)} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
                  </p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Exercise options">
                  <MoreHorizontal />
                </Button>
              </div>
              <div className="mt-5 flex flex-col gap-2">
                {exercise.sets.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className="flex min-h-12 items-center gap-2 rounded-xl border border-border bg-background px-3"
                  >
                    <span className="w-8 font-mono text-xs text-muted-foreground">
                      {setIndex + 1}
                    </span>
                    <span className="flex flex-1 items-center gap-1.5 text-sm">
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        aria-label={`${exercise.name} set ${setIndex + 1} weight`}
                        value={set.weight_kg ?? ''}
                        onChange={(event) =>
                          editSet(exercise.id, set.id, 'weight_kg', toNumber(event.target.value))
                        }
                        className="w-16 rounded-md bg-card px-2 text-right font-mono text-xs md:text-xs"
                      />
                      <span className="text-muted-foreground">kg ×</span>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        aria-label={`${exercise.name} set ${setIndex + 1} reps`}
                        value={set.reps ?? ''}
                        onChange={(event) =>
                          editSet(exercise.id, set.id, 'reps', toNumber(event.target.value))
                        }
                        className="w-12 rounded-md bg-card px-2 text-right font-mono text-xs md:text-xs"
                      />
                      <span className="text-muted-foreground">reps</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove set"
                      onClick={() => deleteSet(exercise.id, set.id)}
                    >
                      <X />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="mt-3 w-full rounded-xl"
                onClick={() => appendSet(exercise)}
              >
                <Plus data-icon="inline-start" />
                Add set
              </Button>
            </div>
          ))}

          {workout.workout_exercises.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nothing logged yet. Add your first exercise below.
            </p>
          )}

          <Button
            variant="outline"
            className="min-h-14 w-full rounded-2xl border-dashed"
            onClick={() => setShowPicker(true)}
          >
            <Plus data-icon="inline-start" />
            Add machine or exercise
          </Button>

          {confirmingDelete ? (
            <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="font-medium">Delete this workout?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Every exercise and set in it goes too. This can't be undone.
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="destructive"
                  disabled={deleting}
                  className="h-11 flex-1 rounded-xl"
                  onClick={async () => {
                    setDeleting(true)
                    if (await remove()) onBack()
                    else setDeleting(false)
                  }}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </Button>
                <Button
                  variant="outline"
                  disabled={deleting}
                  className="h-11 flex-1 rounded-xl"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="mt-4 h-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2 data-icon="inline-start" />
              Delete workout
            </Button>
          )}
        </div>
      )}

      {showPicker && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-primary/30 p-4 md:items-center">
          <div className="w-full max-w-md rounded-[1.75rem] border border-border bg-card p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Build your session
                </p>
                <h2 className="mt-1 text-xl font-semibold">Add a machine</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPicker(false)}
                aria-label="Close"
              >
                <X />
              </Button>
            </div>
            <Input
              autoFocus
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.nativeEvent.isComposing &&
                  event.keyCode !== 229
                )
                  submitExercise()
              }}
              placeholder="e.g. Lat pulldown machine"
              className="mt-5 h-12 rounded-xl bg-background px-4 text-sm"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => setNewName(exercise.name)}
                  className="rounded-full border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
                >
                  {exercise.name}
                </button>
              ))}
            </div>
            <Button
              onClick={() => submitExercise()}
              disabled={!newName.trim()}
              className="mt-5 w-full rounded-xl"
            >
              Add to workout
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
