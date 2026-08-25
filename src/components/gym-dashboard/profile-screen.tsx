import { ChevronRight, Timer, UserRound } from 'lucide-react'
import EditableText from '@/components/gym-dashboard/editable-text'
import { useProfile } from '@/components/gym-dashboard/use-profile'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function ProfileScreen() {
  const { profile, email, loading, error, rename } = useProfile()
  const name = profile?.display_name || email.split('@')[0] || 'Athlete'

  return (
    <section className="pt-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Your account
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.06em]">Profile</h1>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center gap-4 rounded-[1.5rem] border border-border bg-card p-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <UserRound />
        </div>
        <div className="min-w-0">
          {loading ? (
            <p className="font-semibold text-muted-foreground">Loading…</p>
          ) : (
            <EditableText
              value={name}
              label="Display name"
              onSave={rename}
              className="font-semibold"
              inputClassName="w-40 font-semibold"
            />
          )}
          <p className="mt-1 truncate text-sm text-muted-foreground">{email || '—'}</p>
          {profile && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Training since {new Date(profile.created_at).getFullYear()}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 divide-y divide-border rounded-[1.5rem] border border-border bg-card px-5">
        <div className="flex items-center gap-4 py-5">
          <Timer className="text-muted-foreground" />
          <div className="flex-1">
            <p className="font-medium">Rest timer</p>
            <p className="text-sm text-muted-foreground">
              {profile ? `${profile.rest_timer_seconds} seconds between sets` : '—'}
            </p>
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
