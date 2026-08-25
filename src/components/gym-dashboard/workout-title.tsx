import { useEffect, useRef, useState } from 'react'
import { Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function WorkoutTitle({
  name,
  onRename,
}: {
  name: string
  onRename: (name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) input.current?.select()
  }, [editing])

  const commit = () => {
    const next = draft.trim()
    if (next && next !== name) onRename(next)
    else setDraft(name)
    setEditing(false)
  }

  if (editing) {
    return (
      <Input
        ref={input}
        autoFocus
        aria-label="Workout name"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) commit()
          if (event.key === 'Escape') {
            setDraft(name)
            setEditing(false)
          }
        }}
        className="h-8 w-48 rounded-lg text-center font-semibold"
      />
    )
  }

  return (
    <button
      onClick={() => {
        setDraft(name)
        setEditing(true)
      }}
      className="group flex items-center gap-1.5 font-semibold"
      aria-label={`Rename workout, currently ${name}`}
    >
      {name}
      <Pencil className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  )
}
