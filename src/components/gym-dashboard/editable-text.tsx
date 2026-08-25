import { useEffect, useRef, useState } from 'react'
import { Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function EditableText({
  value,
  label,
  onSave,
  className,
  inputClassName,
}: {
  value: string
  label: string
  onSave: (value: string) => void
  className?: string
  inputClassName?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) input.current?.select()
  }, [editing])

  const commit = () => {
    const next = draft.trim()
    if (next && next !== value) onSave(next)
    else setDraft(value)
    setEditing(false)
  }

  if (editing) {
    return (
      <Input
        ref={input}
        autoFocus
        aria-label={label}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) commit()
          if (event.key === 'Escape') {
            setDraft(value)
            setEditing(false)
          }
        }}
        className={cn('h-8 rounded-lg', inputClassName)}
      />
    )
  }

  return (
    <button
      onClick={() => {
        setDraft(value)
        setEditing(true)
      }}
      className={cn(
        '-mx-2 flex items-center gap-1.5 rounded-lg px-2 py-1 decoration-dotted underline-offset-4 transition-colors hover:bg-muted hover:underline',
        className,
      )}
      aria-label={`${label}, currently ${value}`}
    >
      <span className="truncate">{value}</span>
      <Pencil className="size-3.5 shrink-0 text-muted-foreground" />
    </button>
  )
}
