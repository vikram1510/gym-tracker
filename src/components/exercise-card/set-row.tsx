import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ExerciseKind, LoggedSet } from '@/lib/log'

export type SetField = 'weight_kg' | 'reps' | 'duration_seconds'

function toNumber(value: string) {
  if (value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const inputClass = 'rounded-md bg-card px-2 text-right font-mono text-xs md:text-xs'

export default function SetRow({
  exerciseName,
  kind,
  set,
  index,
  onEdit,
  onRemove,
}: {
  exerciseName: string
  kind: ExerciseKind
  set: LoggedSet
  index: number
  onEdit: (field: SetField, value: number | null) => void
  onRemove: () => void
}) {
  const label = `${exerciseName} set ${index + 1}`

  return (
    <div className="flex min-h-12 items-center gap-2 rounded-xl border border-border bg-background px-3">
      <span className="w-8 font-mono text-xs text-muted-foreground">{index + 1}</span>
      <span className="flex flex-1 items-center gap-1.5 text-sm">
        {kind === 'time' ? (
          <>
            <Input
              type="number"
              inputMode="numeric"
              min="0"
              aria-label={`${label} seconds`}
              value={set.duration_seconds ?? ''}
              onChange={(event) => onEdit('duration_seconds', toNumber(event.target.value))}
              className={`w-16 ${inputClass}`}
            />
            <span className="text-muted-foreground">sec</span>
          </>
        ) : (
          <>
            {kind === 'weighted' && (
              <>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  aria-label={`${label} weight`}
                  value={set.weight_kg ?? ''}
                  onChange={(event) => onEdit('weight_kg', toNumber(event.target.value))}
                  className={`w-16 ${inputClass}`}
                />
                <span className="text-muted-foreground">kg ×</span>
              </>
            )}
            <Input
              type="number"
              inputMode="numeric"
              min="0"
              aria-label={`${label} reps`}
              value={set.reps ?? ''}
              onChange={(event) => onEdit('reps', toNumber(event.target.value))}
              className={`w-12 ${inputClass}`}
            />
            <span className="text-muted-foreground">reps</span>
          </>
        )}
      </span>
      <Button variant="ghost" size="icon" aria-label="Remove set" onClick={onRemove}>
        <X />
      </Button>
    </div>
  )
}
