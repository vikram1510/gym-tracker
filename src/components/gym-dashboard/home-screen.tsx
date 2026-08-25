import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import {
  formatDay,
  formatDuration,
  formatTime,
  formatVolume,
} from '@/components/gym-dashboard/format'
import { randomQuote } from '@/components/gym-dashboard/quotes'
import { useHomeData } from '@/components/gym-dashboard/use-home-data'
import WorkoutCard from '@/components/gym-dashboard/workout-card'
import { Button } from '@/components/ui/button'

export default function HomeScreen({ onOpen }: { onOpen: (workoutId: string) => void }) {
  const { active, recent, loading, error } = useHomeData()
  const [quote] = useState(randomQuote)

  return (
    <>
      <section className="flex flex-col gap-5 pt-6 md:pt-12">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="size-2 rounded-full bg-accent" />
          {new Date().toLocaleDateString([], {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.06em] md:text-6xl">
          Build the body
          <br className="hidden md:block" /> you came for
        </h1>
        <p className="max-w-md text-pretty leading-6 text-muted-foreground">{quote}</p>
      </section>

      <section className="grid gap-4 pt-8 md:grid-cols-2">
        {active.map((workout) => (
          <WorkoutCard
            key={workout.id}
            label="In progress"
            title={workout.name}
            badge={`from ${formatTime(workout.started_at)}`}
            footerLabel="So far"
            footerValue={`${workout.completed_sets} ${workout.completed_sets === 1 ? 'set' : 'sets'} · ${formatVolume(workout.volume_kg)}`}
            actionLabel="Resume"
            onAction={() => onOpen(workout.id)}
          />
        ))}
      </section>

      <section className="pt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent sessions</h2>
          <Button variant="ghost" className="text-muted-foreground">
            View all <ChevronRight data-icon="inline-end" />
          </Button>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : recent.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-border p-8 text-center">
            <p className="font-medium">No sessions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Finish your first workout and it will show up here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-[1.75rem] border border-border bg-card px-5">
            {recent.map((workout) => (
              <button
                key={workout.id}
                onClick={() => onOpen(workout.id)}
                className="-mx-5 flex w-[calc(100%+2.5rem)] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <span className="size-3 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{workout.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDay(workout.started_at)} · {formatDuration(workout.duration_seconds)}
                  </p>
                </div>
                <span className="hidden font-mono text-xs text-muted-foreground sm:block">
                  {formatVolume(workout.volume_kg)}
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
