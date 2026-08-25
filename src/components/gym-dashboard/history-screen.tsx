import { ChevronRight } from 'lucide-react'
import { sessions } from '@/components/gym-dashboard/demo-data'

export default function HistoryScreen() {
  return (
    <section className="pt-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Your archive
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.06em]">History</h1>
      <div className="mt-8 flex flex-col gap-3">
        {sessions
          .concat([
            { name: 'Full body reset', date: 'Thu, Jun 6', duration: '36 min', volume: '5,610 lb' },
          ])
          .map((s, i) => (
            <div
              key={s.name}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex size-11 flex-col items-center justify-center rounded-xl bg-muted">
                <span className="font-mono text-[10px] text-muted-foreground">JUN</span>
                <span className="font-semibold">{13 - i * 2}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{s.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.duration} · {s.volume}
                </p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </div>
          ))}
      </div>
    </section>
  )
}
