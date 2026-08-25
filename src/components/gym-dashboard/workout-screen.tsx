import { useState } from 'react'
import { ArrowLeft, Check, MoreHorizontal, Pause, Plus, X } from 'lucide-react'
import { starterExercises } from '@/components/gym-dashboard/demo-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function WorkoutScreen({ onBack }: { onBack: () => void }) {
  const [exercises, setExercises] = useState(starterExercises)
  const [showPicker, setShowPicker] = useState(false)
  const [newName, setNewName] = useState('')
  const toggleSet = (exerciseIndex: number, setIndex: number) =>
    setExercises((current) =>
      current.map((exercise, i) =>
        i === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, j) =>
                j === setIndex ? { ...set, done: !set.done } : set,
              ),
            }
          : exercise,
      ),
    )
  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps',
    value: string,
  ) =>
    setExercises((current) =>
      current.map((exercise, i) =>
        i === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, j) =>
                j === setIndex ? { ...set, [field]: value } : set,
              ),
            }
          : exercise,
      ),
    )
  const addExercise = () => {
    const name = newName.trim()
    if (!name) return
    setExercises((current) => [
      ...current,
      {
        name,
        target: '3 sets × 10 reps',
        last: 'New exercise',
        color: 'bg-accent',
        sets: Array.from({ length: 3 }, () => ({ weight: '0', reps: '10', done: false })),
      },
    ])
    setNewName('')
    setShowPicker(false)
  }
  return (
    <section className="pt-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft />
        </Button>
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            In progress
          </p>
          <h1 className="font-semibold">Push day</h1>
        </div>
        <Button variant="ghost" size="icon" aria-label="Pause">
          <Pause />
        </Button>
      </div>
      <div className="mt-8 rounded-[1.75rem] bg-primary p-5 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-foreground/60">Elapsed time</p>
            <p className="mt-1 font-mono text-3xl">24:18</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-foreground/60">Volume</p>
            <p className="mt-1 font-mono text-xl">4,820 lb</p>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-4">
        {exercises.map((ex, i) => (
          <div
            key={`${ex.name}-${i}`}
            className="rounded-[1.5rem] border border-border bg-card p-5"
          >
            <div className="flex items-start gap-3">
              <span className={cn('mt-1 size-3 rounded-full', ex.color)} />
              <div className="flex-1">
                <h2 className="font-semibold">{ex.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ex.target} · Last {ex.last}
                </p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Exercise options">
                <MoreHorizontal />
              </Button>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              {ex.sets.map((set, j) => (
                <div
                  key={j}
                  className={cn(
                    'flex min-h-12 items-center gap-2 rounded-xl border px-3 transition-colors',
                    set.done ? 'border-accent bg-accent/15' : 'border-border bg-background',
                  )}
                >
                  <button
                    onClick={() => toggleSet(i, j)}
                    className="flex flex-1 items-center gap-3 text-left"
                    aria-label={`${ex.name} set ${j + 1}`}
                  >
                    <span className="w-8 font-mono text-xs text-muted-foreground">{j + 1}</span>
                    <span className="flex flex-1 items-center gap-1.5 text-sm">
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        aria-label={`${ex.name} set ${j + 1} weight`}
                        value={set.weight}
                        onChange={(event) => updateSet(i, j, 'weight', event.target.value)}
                        className="w-16 rounded-md bg-card px-2 text-right font-mono text-xs md:text-xs"
                      />
                      <span className="text-muted-foreground">lb ×</span>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        aria-label={`${ex.name} set ${j + 1} reps`}
                        value={set.reps}
                        onChange={(event) => updateSet(i, j, 'reps', event.target.value)}
                        className="w-12 rounded-md bg-card px-2 text-right font-mono text-xs md:text-xs"
                      />
                      <span className="text-muted-foreground">reps</span>
                    </span>
                    {set.done ? (
                      <Check className="text-accent" />
                    ) : (
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        Tap to complete
                      </span>
                    )}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove set"
                    onClick={() =>
                      setExercises((current) =>
                        current.map((item, index) =>
                          index === i
                            ? { ...item, sets: item.sets.filter((_, setIndex) => setIndex !== j) }
                            : item,
                        ),
                      )
                    }
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-3 w-full rounded-xl"
              onClick={() =>
                setExercises((current) =>
                  current.map((item, index) =>
                    index === i
                      ? {
                          ...item,
                          sets: [
                            ...item.sets,
                            {
                              weight: item.sets.at(-1)?.weight ?? '0',
                              reps: item.sets.at(-1)?.reps ?? '10',
                              done: false,
                            },
                          ],
                        }
                      : item,
                  ),
                )
              }
            >
              <Plus data-icon="inline-start" />
              Add set
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          className="min-h-14 w-full rounded-2xl border-dashed"
          onClick={() => setShowPicker(true)}
        >
          <Plus data-icon="inline-start" />
          Add machine or exercise
        </Button>
      </div>
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
                  addExercise()
              }}
              placeholder="e.g. Lat pulldown machine"
              className="mt-5 h-12 rounded-xl bg-background px-4 text-sm"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {['Lat pulldown', 'Leg press', 'Seated row', 'Shoulder press'].map((name) => (
                <button
                  key={name}
                  onClick={() => setNewName(name)}
                  className="rounded-full border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
                >
                  {name}
                </button>
              ))}
            </div>
            <Button
              onClick={addExercise}
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
