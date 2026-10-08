import { useCallback, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useExerciseSuggestions } from '@/components/gym-dashboard/use-exercise-suggestions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ExerciseKind } from '@/lib/log'

export default function ExercisePicker({
  open,
  dayLabel,
  onClose,
  onPick,
}: {
  open: boolean
  dayLabel: string
  onClose: () => void
  onPick: (name: string, kind: ExerciseKind) => void
}) {
  const [name, setName] = useState('')
  const [newKind, setNewKind] = useState<ExerciseKind>('reps')
  const catalogue = useExerciseSuggestions(open)

  const suggestions = useMemo(() => {
    const query = name.trim().toLowerCase()
    return catalogue.filter((exercise) => exercise.name.toLowerCase().includes(query)).slice(0, 6)
  }, [catalogue, name])

  // A name already in the catalogue keeps its own kind: get_or_create_exercise
  // ignores the toggle for an existing row, so letting the toggle win here
  // would render reps boxes over a timed exercise until the next refetch. The
  // match rule mirrors the database's uniqueness index.
  const findInCatalogue = useCallback(
    (value: string) => {
      const query = value.trim().toLowerCase()
      if (!query) return null
      return catalogue.find((exercise) => exercise.name.trim().toLowerCase() === query) ?? null
    },
    [catalogue],
  )

  const matched = useMemo(() => findInCatalogue(name), [findInCatalogue, name])
  const kind = matched?.kind ?? newKind

  const submit = (value = name) => {
    const trimmed = value.trim()
    if (!trimmed) return
    onPick(trimmed, findInCatalogue(trimmed)?.kind ?? newKind)
    setName('')
    setNewKind('reps')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-primary/30 p-4 md:items-center">
      <div className="w-full max-w-md rounded-[1.75rem] border border-border bg-card p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Logging to {dayLabel}
            </p>
            <h2 className="mt-1 text-xl font-semibold">Add an exercise</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X />
          </Button>
        </div>

        <Input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229)
              submit()
          }}
          placeholder="e.g. Lat pulldown machine"
          className="mt-5 h-12 rounded-xl bg-background px-4 text-sm"
        />

        <div className="mt-3 flex gap-1 rounded-xl border border-border p-1">
          {(['reps', 'time'] as const).map((option) => (
            <button
              key={option}
              type="button"
              disabled={Boolean(matched)}
              aria-pressed={kind === option}
              onClick={() => setNewKind(option)}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-xs transition-colors disabled:opacity-60',
                kind === option
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground enabled:hover:bg-muted',
              )}
            >
              {option === 'reps' ? 'Weight × reps' : 'Time'}
            </button>
          ))}
        </div>

        {matched && (
          <p className="mt-2 text-xs text-muted-foreground">
            {matched.name} is already in your list, logged in{' '}
            {matched.kind === 'time' ? 'seconds' : 'weight × reps'}.
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => setName(exercise.name)}
              className="rounded-full border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
            >
              {exercise.name}
            </button>
          ))}
        </div>

        <Button onClick={() => submit()} disabled={!name.trim()} className="mt-5 w-full rounded-xl">
          Add to {dayLabel.toLowerCase()}
        </Button>
      </div>
    </div>
  )
}
