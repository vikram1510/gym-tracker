import { useState } from 'react'
import { CalendarDays, Home, Plus, TrendingUp, UserRound } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { defaultWorkoutName } from '@/components/gym-dashboard/format'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { createWorkout } from '@/lib/workouts'
import { cn } from '@/lib/utils'

export default function GymDashboard() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [startError, setStartError] = useState<string | null>(null)

  const startWorkout = async () => {
    setStartError(null)
    try {
      const created = await createWorkout(defaultWorkoutName())
      navigate(`/workout/${created.id}`)
    } catch (cause) {
      setStartError((cause as Error).message)
    }
  }

  return (
    <main className="min-h-screen bg-background pb-28 text-foreground md:pb-8">
      <div className="mx-auto min-h-screen max-w-6xl px-5 md:px-8 lg:px-12">
        <header className="flex items-center justify-between py-6 md:py-8">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate('/profile')}
            aria-label="Open profile"
          >
            <UserRound />
          </Button>
        </header>
        {startError && (
          <p role="alert" className="text-sm text-destructive">
            {startError}
          </p>
        )}
        <Outlet />
      </div>
      <nav
        className="fixed inset-x-4 bottom-4 z-10 mx-auto flex max-w-md items-center justify-around rounded-2xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur md:hidden"
        aria-label="Primary navigation"
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn('rounded-xl', pathname === '/' && 'bg-muted')}
          onClick={() => navigate('/')}
          aria-label="Home"
        >
          <Home />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn('rounded-xl', pathname.startsWith('/history') && 'bg-muted')}
          onClick={() => navigate('/history')}
          aria-label="History"
        >
          <CalendarDays />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="size-12 -translate-y-5 rounded-full border-4 border-background bg-accent text-accent-foreground shadow-md hover:bg-accent/90"
          onClick={startWorkout}
          aria-label="Start workout"
        >
          <Plus />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn('rounded-xl', pathname.startsWith('/progress') && 'bg-muted')}
          onClick={() => navigate('/progress')}
          aria-label="Progress"
        >
          <TrendingUp />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn('rounded-xl', pathname.startsWith('/profile') && 'bg-muted')}
          onClick={() => navigate('/profile')}
          aria-label="Profile"
        >
          <UserRound />
        </Button>
      </nav>
    </main>
  )
}
