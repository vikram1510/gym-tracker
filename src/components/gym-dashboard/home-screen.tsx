import { ChevronRight, Flame, MoreHorizontal, Play, TrendingUp } from 'lucide-react'
import { sessions } from '@/components/gym-dashboard/demo-data'
import Stat from '@/components/gym-dashboard/stat'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <>
      <section className="grid gap-6 pt-6 md:grid-cols-[1.1fr_0.9fr] md:items-end md:pt-12">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="size-2 rounded-full bg-accent" />
            Thursday, June 13
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-[-0.06em] md:text-6xl">
            Build the body
            <br className="hidden md:block" /> you came for
          </h1>
          <p className="max-w-md text-pretty leading-6 text-muted-foreground">
            Keep your momentum. Your next session is ready when you are.
          </p>
        </div>
        <div className="rounded-[2rem] bg-primary p-6 text-primary-foreground md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-primary-foreground/60">Today&apos;s focus</p>
              <h2 className="mt-1 text-2xl font-semibold">Push day</h2>
            </div>
            <span className="rounded-full bg-primary-foreground/10 px-3 py-1 font-mono text-xs">
              45–55 min
            </span>
          </div>
          <div className="mt-12 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary-foreground/50">
                Next up
              </p>
              <p className="mt-1 text-sm">Bench press · 4 × 8</p>
            </div>
            <Button
              onClick={onStart}
              className="rounded-full bg-accent px-5 text-accent-foreground hover:bg-accent/90"
            >
              <Play data-icon="inline-start" fill="currentColor" />
              Start workout
            </Button>
          </div>
        </div>
      </section>
      <section className="grid gap-4 py-8 md:grid-cols-3">
        <Stat label="This week" value="42,680" suffix="lb volume" icon={<TrendingUp />}>
          <div className="flex h-12 items-end gap-2">
            {[60, 78, 55, 92, 42, 0, 0].map((height, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-8 w-full items-end rounded-md bg-muted">
                  <div
                    className={cn('w-full rounded-md bg-primary', i === 4 && 'bg-accent')}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{'MTWTFSS'[i]}</span>
              </div>
            ))}
          </div>
        </Stat>
        <Stat
          label="Consistency"
          value="12"
          suffix="day streak"
          icon={<Flame fill="currentColor" />}
        >
          <p className="text-sm text-muted-foreground">You&apos;re in your strongest month yet.</p>
        </Stat>
        <Stat label="Next milestone" value="185" suffix="lb bench" icon={<TrendingUp />}>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>Current 175 lb</span>
              <span>80%</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-full w-4/5 rounded-full bg-accent" />
            </div>
          </div>
        </Stat>
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent sessions</h2>
          <Button variant="ghost" className="text-muted-foreground">
            View all <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
        <div className="divide-y divide-border rounded-[1.75rem] border border-border bg-card px-5">
          {sessions.map((s) => (
            <div key={s.name} className="flex items-center gap-4 py-4">
              <span className="size-3 rounded-full bg-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.date} · {s.duration}
                </p>
              </div>
              <span className="hidden font-mono text-xs text-muted-foreground sm:block">
                {s.volume}
              </span>
              <MoreHorizontal className="size-5 text-muted-foreground" />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
