export default function Stat({
  label,
  value,
  suffix,
  icon,
  children,
}: {
  label: string
  value: string
  suffix: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-5 rounded-[1.75rem] border border-border bg-card p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        <span className="text-accent">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-semibold tracking-[-0.06em]">{value}</span>
        <span className="pb-1 font-mono text-xs text-muted-foreground">{suffix}</span>
      </div>
      {children}
    </div>
  )
}
