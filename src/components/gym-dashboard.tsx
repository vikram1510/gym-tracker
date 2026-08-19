import { useState } from 'react'
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  Home,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Settings,
  Timer,
  TrendingUp,
  UserRound,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const sessions = [
  { name: 'Upper body strength', date: 'Yesterday', duration: '52 min', volume: '8,420 lb' },
  { name: 'Lower body power', date: 'Mon, Jun 10', duration: '48 min', volume: '11,280 lb' },
  { name: 'Pull + core', date: 'Sat, Jun 8', duration: '41 min', volume: '7,940 lb' },
]

type Exercise = {
  name: string
  target: string
  last: string
  color: string
  sets: { weight: string; reps: string; done: boolean }[]
}
const starterExercises: Exercise[] = [
  {
    name: 'Barbell bench press',
    target: '4 sets × 8 reps',
    last: '175 lb × 8',
    color: 'bg-primary',
    sets: Array.from({ length: 4 }, () => ({ weight: '175', reps: '8', done: false })),
  },
  {
    name: 'Incline dumbbell press',
    target: '3 sets × 10 reps',
    last: '55 lb × 10',
    color: 'bg-accent',
    sets: Array.from({ length: 3 }, () => ({ weight: '55', reps: '10', done: false })),
  },
  {
    name: 'Cable lateral raise',
    target: '3 sets × 12 reps',
    last: '20 lb × 12',
    color: 'bg-secondary',
    sets: Array.from({ length: 3 }, () => ({ weight: '20', reps: '12', done: false })),
  },
]

function HomeScreen({ onStart }: { onStart: () => void }) {
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
            <br className="hidden md:block" /> you came for.
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
function Stat({
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

function WorkoutScreen({ onBack }: { onBack: () => void }) {
  const [exercises, setExercises] = useState(starterExercises)
  const [showPicker, setShowPicker] = useState(false)
  const [newName, setNewName] = useState('')
  const toggleSet = (exerciseIndex: number, setIndex: number) =>
    setExercises((current) =>
      current.map((exercise, i) =>
        i === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, j) =>
                j === setIndex ? { ...set, done: !set.done } : set,
              ),
            }
          : exercise,
      ),
    )
  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps',
    value: string,
  ) =>
    setExercises((current) =>
      current.map((exercise, i) =>
        i === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, j) =>
                j === setIndex ? { ...set, [field]: value } : set,
              ),
            }
          : exercise,
      ),
    )
  const addExercise = () => {
    const name = newName.trim()
    if (!name) return
    setExercises((current) => [
      ...current,
      {
        name,
        target: '3 sets × 10 reps',
        last: 'New exercise',
        color: 'bg-accent',
        sets: Array.from({ length: 3 }, () => ({ weight: '0', reps: '10', done: false })),
      },
    ])
    setNewName('')
    setShowPicker(false)
  }
  return (
    <section className="pt-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft />
        </Button>
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            In progress
          </p>
          <h1 className="font-semibold">Push day</h1>
        </div>
        <Button variant="ghost" size="icon" aria-label="Pause">
          <Pause />
        </Button>
      </div>
      <div className="mt-8 rounded-[1.75rem] bg-primary p-5 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-foreground/60">Elapsed time</p>
            <p className="mt-1 font-mono text-3xl">24:18</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-foreground/60">Volume</p>
            <p className="mt-1 font-mono text-xl">4,820 lb</p>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-4">
        {exercises.map((ex, i) => (
          <div
            key={`${ex.name}-${i}`}
            className="rounded-[1.5rem] border border-border bg-card p-5"
          >
            <div className="flex items-start gap-3">
              <span className={cn('mt-1 size-3 rounded-full', ex.color)} />
              <div className="flex-1">
                <h2 className="font-semibold">{ex.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ex.target} · Last {ex.last}
                </p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Exercise options">
                <MoreHorizontal />
              </Button>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              {ex.sets.map((set, j) => (
                <div
                  key={j}
                  className={cn(
                    'flex min-h-12 items-center gap-2 rounded-xl border px-3 transition-colors',
                    set.done ? 'border-accent bg-accent/15' : 'border-border bg-background',
                  )}
                >
                  <button
                    onClick={() => toggleSet(i, j)}
                    className="flex flex-1 items-center gap-3 text-left"
                    aria-label={`${ex.name} set ${j + 1}`}
                  >
                    <span className="w-8 font-mono text-xs text-muted-foreground">{j + 1}</span>
                    <span className="flex flex-1 items-center gap-1.5 text-sm">
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        aria-label={`${ex.name} set ${j + 1} weight`}
                        value={set.weight}
                        onChange={(event) => updateSet(i, j, 'weight', event.target.value)}
                        className="w-16 rounded-md bg-card px-2 text-right font-mono text-xs md:text-xs"
                      />
                      <span className="text-muted-foreground">lb ×</span>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        aria-label={`${ex.name} set ${j + 1} reps`}
                        value={set.reps}
                        onChange={(event) => updateSet(i, j, 'reps', event.target.value)}
                        className="w-12 rounded-md bg-card px-2 text-right font-mono text-xs md:text-xs"
                      />
                      <span className="text-muted-foreground">reps</span>
                    </span>
                    {set.done ? (
                      <Check className="text-accent" />
                    ) : (
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        Tap to complete
                      </span>
                    )}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove set"
                    onClick={() =>
                      setExercises((current) =>
                        current.map((item, index) =>
                          index === i
                            ? { ...item, sets: item.sets.filter((_, setIndex) => setIndex !== j) }
                            : item,
                        ),
                      )
                    }
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-3 w-full rounded-xl"
              onClick={() =>
                setExercises((current) =>
                  current.map((item, index) =>
                    index === i
                      ? {
                          ...item,
                          sets: [
                            ...item.sets,
                            {
                              weight: item.sets.at(-1)?.weight ?? '0',
                              reps: item.sets.at(-1)?.reps ?? '10',
                              done: false,
                            },
                          ],
                        }
                      : item,
                  ),
                )
              }
            >
              <Plus data-icon="inline-start" />
              Add set
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          className="min-h-14 w-full rounded-2xl border-dashed"
          onClick={() => setShowPicker(true)}
        >
          <Plus data-icon="inline-start" />
          Add machine or exercise
        </Button>
      </div>
      {showPicker && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-primary/30 p-4 md:items-center">
          <div className="w-full max-w-md rounded-[1.75rem] border border-border bg-card p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Build your session
                </p>
                <h2 className="mt-1 text-xl font-semibold">Add a machine</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPicker(false)}
                aria-label="Close"
              >
                <X />
              </Button>
            </div>
            <Input
              autoFocus
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.nativeEvent.isComposing &&
                  event.keyCode !== 229
                )
                  addExercise()
              }}
              placeholder="e.g. Lat pulldown machine"
              className="mt-5 h-12 rounded-xl bg-background px-4 text-sm"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {['Lat pulldown', 'Leg press', 'Seated row', 'Shoulder press'].map((name) => (
                <button
                  key={name}
                  onClick={() => setNewName(name)}
                  className="rounded-full border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
                >
                  {name}
                </button>
              ))}
            </div>
            <Button
              onClick={addExercise}
              disabled={!newName.trim()}
              className="mt-5 w-full rounded-xl"
            >
              Add to workout
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

function ProgressScreen() {
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
function HistoryScreen() {
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
function ProfileScreen() {
  return (
    <section className="pt-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Your account
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.06em]">Profile</h1>
      <div className="mt-8 flex items-center gap-4 rounded-[1.5rem] border border-border bg-card p-5">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <UserRound />
        </div>
        <div>
          <p className="font-semibold">Alex Morgan</p>
          <p className="text-sm text-muted-foreground">Training since 2022</p>
        </div>
        <Button className="ml-auto" variant="ghost" size="icon" aria-label="Edit profile">
          <Settings />
        </Button>
      </div>
      <div className="mt-4 divide-y divide-border rounded-[1.5rem] border border-border bg-card px-5">
        <div className="flex items-center gap-4 py-5">
          <Timer className="text-muted-foreground" />
          <div className="flex-1">
            <p className="font-medium">Rest timer</p>
            <p className="text-sm text-muted-foreground">90 seconds between sets</p>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-4 py-5">
          <CalendarDays className="text-muted-foreground" />
          <div className="flex-1">
            <p className="font-medium">Training schedule</p>
            <p className="text-sm text-muted-foreground">4 days per week</p>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </div>
      </div>
    </section>
  )
}

export default function GymDashboard() {
  const [screen, setScreen] = useState('home')
  const [workout, setWorkout] = useState(false)
  const navigate = (next: string) => {
    setScreen(next)
    setWorkout(false)
  }
  return (
    <main className="min-h-screen bg-background pb-28 text-foreground md:pb-8">
      <div className="mx-auto min-h-screen max-w-6xl px-5 md:px-8 lg:px-12">
        <header className="flex items-center justify-between py-6 md:py-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Dumbbell className="size-5" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-tight">FORM / 01</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate('profile')}
            aria-label="Open profile"
          >
            <UserRound />
          </Button>
        </header>
        {workout ? (
          <WorkoutScreen onBack={() => setWorkout(false)} />
        ) : screen === 'home' ? (
          <HomeScreen onStart={() => setWorkout(true)} />
        ) : screen === 'progress' ? (
          <ProgressScreen />
        ) : screen === 'history' ? (
          <HistoryScreen />
        ) : (
          <ProfileScreen />
        )}
      </div>
      <nav
        className="fixed inset-x-4 bottom-4 z-10 mx-auto flex max-w-md items-center justify-around rounded-2xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur md:hidden"
        aria-label="Primary navigation"
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn('rounded-xl', screen === 'home' && 'bg-muted')}
          onClick={() => navigate('home')}
          aria-label="Home"
        >
          <Home />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn('rounded-xl', screen === 'history' && 'bg-muted')}
          onClick={() => navigate('history')}
          aria-label="History"
        >
          <CalendarDays />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="size-12 -translate-y-5 rounded-full border-4 border-background bg-accent text-accent-foreground shadow-md hover:bg-accent/90"
          onClick={() => setWorkout(true)}
          aria-label="Start workout"
        >
          <Plus />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn('rounded-xl', screen === 'progress' && 'bg-muted')}
          onClick={() => navigate('progress')}
          aria-label="Progress"
        >
          <TrendingUp />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn('rounded-xl', screen === 'profile' && 'bg-muted')}
          onClick={() => navigate('profile')}
          aria-label="Profile"
        >
          <UserRound />
        </Button>
      </nav>
    </main>
  )
}
