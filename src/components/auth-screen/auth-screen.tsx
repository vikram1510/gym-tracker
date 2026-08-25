import { useState } from 'react'
import CheckInbox from '@/components/auth-screen/check-inbox'
import Logo from '@/components/auth-screen/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError(null)

    const address = email.trim()
    const { data, error: authError } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email: address, password })
        : await supabase.auth.signUp({ email: address, password })

    if (authError) setError(authError.message)
    else if (mode === 'signup' && !data.session) setAwaitingConfirmation(address)

    setPending(false)
  }

  if (awaitingConfirmation) {
    return (
      <CheckInbox
        email={awaitingConfirmation}
        onBack={() => {
          setAwaitingConfirmation(null)
          setMode('signin')
          setPassword('')
        }}
      />
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <div className="w-full max-w-sm">
        <Logo />

        <h1 className="mt-8 text-4xl font-semibold tracking-[-0.06em]">
          {mode === 'signin' ? 'Welcome back' : 'Get started'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === 'signin'
            ? 'Sign in to pick up where you left off.'
            : 'Create an account to start tracking.'}
        </p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
          <Input
            type="email"
            required
            autoComplete="email"
            aria-label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 rounded-xl px-4 text-sm"
          />
          <Input
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            aria-label="Password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-xl px-4 text-sm"
          />

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="mt-2 h-12 w-full rounded-xl">
            {pending ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
          }}
          className="mt-5 w-full text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === 'signin' ? 'No account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </div>
    </main>
  )
}
