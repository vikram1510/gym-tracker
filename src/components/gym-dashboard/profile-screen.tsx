import { CalendarDays, ChevronRight, Settings, Timer, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function ProfileScreen() {
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
      <Button
        variant="outline"
        className="mt-4 h-12 w-full rounded-2xl"
        onClick={() => supabase.auth.signOut()}
      >
        Sign out
      </Button>
    </section>
  )
}
