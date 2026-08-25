import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WorkoutCard({
  label,
  title,
  badge,
  footerLabel,
  footerValue,
  actionLabel,
  onAction,
}: {
  label: string
  title: string
  badge: string
  footerLabel: string
  footerValue: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground md:p-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-primary-foreground/60">{label}</p>
          <h2 className="mt-1 text-2xl font-semibold text-balance break-words">{title}</h2>
        </div>
        <span className="shrink-0 rounded-full bg-primary-foreground/10 px-3 py-1 font-mono text-xs">
          {badge}
        </span>
      </div>
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary-foreground/50">
            {footerLabel}
          </p>
          <p className="mt-1 truncate text-sm">{footerValue}</p>
        </div>
        <Button
          onClick={onAction}
          className="shrink-0 rounded-full bg-accent px-5 text-accent-foreground hover:bg-accent/90"
        >
          <Play data-icon="inline-start" fill="currentColor" />
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}
