import { useState } from 'react'
import { Check, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import LastPerformance from '@/components/exercise-card/last-performance'
import SetRow, { type SetField } from '@/components/exercise-card/set-row'
import { loggedSets, setVolume, summariseSets } from '@/components/exercise-card/summarise'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatTime, formatVolume } from '@/lib/format'
import type { LastPerformance as Performance, LoggedExercise } from '@/lib/log'
import { cn } from '@/lib/utils'

export default function ExerciseCard({
  exercise,
  dotColor,
  lastPerformance = null,
  alwaysEditing = false,
  onEditSet,
  onAddSet,
  onRemoveSet,
  onRemove,
}: {
  exercise: LoggedExercise
  dotColor: string
  lastPerformance?: Performance | null
  alwaysEditing?: boolean
  onEditSet: (setId: string, field: SetField, value: number | null) => void
  onAddSet: () => void
  onRemoveSet: (setId: string) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)
  const editing = alwaysEditing || open

  const done = loggedSets(exercise.kind, exercise.sets)
  const volume = setVolume(exercise.sets)

  const header = (
    <div className="flex items-start gap-3">
      <span className={cn('mt-1 size-3 shrink-0 rounded-full', dotColor)} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="font-semibold">{exercise.name}</h2>
          <span className="font-mono text-xs text-muted-foreground">
            {formatTime(exercise.created_at)}
          </span>
        </div>
        {editing ? (
          <div className="mt-1">
            <LastPerformance performance={lastPerformance} />
          </div>
        ) : (
          <p className="mt-1 truncate font-mono text-sm text-muted-foreground">
            {done.length > 0 ? summariseSets(exercise.kind, exercise.sets) : 'Nothing logged'}
          </p>
        )}
      </div>
    </div>
  )

  if (!editing) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label={`Edit ${exercise.name}`}
        className="w-full rounded-[1.5rem] border border-border bg-card p-5 text-left transition-colors hover:bg-muted/40"
      >
        {header}
        <div className="mt-3 flex items-center justify-between pl-6 text-xs text-muted-foreground">
          <span>
            {done.length} {done.length === 1 ? 'set' : 'sets'}
          </span>
          <span className="flex items-center gap-2 font-mono">
            {volume > 0 && formatVolume(volume)}
            <Pencil className="size-3.5" />
          </span>
        </div>
      </button>
    )
  }

  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">{header}</div>
        {!alwaysEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground"
            onClick={() => setOpen(false)}
          >
            <Check data-icon="inline-start" />
            Done
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`${exercise.name} options`}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto min-w-44">
            <DropdownMenuItem variant="destructive" onClick={onRemove}>
              <Trash2 />
              Delete exercise
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {exercise.sets.map((set, index) => (
          <SetRow
            key={set.id}
            exerciseName={exercise.name}
            kind={exercise.kind}
            set={set}
            index={index}
            onEdit={(field, value) => onEditSet(set.id, field, value)}
            onRemove={() => onRemoveSet(set.id)}
          />
        ))}
      </div>

      <Button variant="outline" className="mt-3 w-full rounded-xl" onClick={onAddSet}>
        <Plus data-icon="inline-start" />
        Add set
      </Button>
    </div>
  )
}
