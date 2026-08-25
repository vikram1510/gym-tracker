import { Dumbbell } from 'lucide-react'

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Dumbbell className="size-5" />
      </div>
      <span className="font-mono text-sm font-semibold tracking-tight">FORM / 01</span>
    </div>
  )
}
