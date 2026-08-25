import { BarChart3, Dumbbell, TrendingUp } from 'lucide-react'
import Stat from '@/components/gym-dashboard/stat'
import { cn } from '@/lib/utils'

export default function ProgressScreen() {
  return (
    <section className="pt-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Your numbers
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.06em]">Progress</h1>
      <div className="mt-8 rounded-[1.75rem] border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Weekly volume</p>
            <p className="mt-1 text-3xl font-semibold">
              42,680 <span className="font-mono text-xs font-normal text-accent">+12.4%</span>
            </p>
          </div>
          <BarChart3 className="text-accent" />
        </div>
        <div className="mt-8 flex h-36 items-end gap-3">
          {[36, 52, 44, 72, 60, 88, 76, 100].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col justify-end gap-2">
              <div
                className={cn('rounded-t-md bg-primary', i === 7 && 'bg-accent')}
                style={{ height: `${h}%` }}
              />
              <span className="text-center font-mono text-[10px] text-muted-foreground">
                W{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Stat label="Workouts" value="18" suffix="this month" icon={<TrendingUp />}>
          <p className="text-sm text-muted-foreground">4.5 avg / week</p>
        </Stat>
        <Stat label="Best lift" value="175" suffix="lb bench" icon={<Dumbbell />}>
          <p className="text-sm text-muted-foreground">+10 lb this month</p>
        </Stat>
      </div>
    </section>
  )
}
