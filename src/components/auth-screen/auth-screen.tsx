import { useState } from 'react'
import CheckInbox from '@/components/auth-screen/check-inbox'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

type Mode = 'signin' | 'signup' | 'forgot'

const copy: Record<Mode, { title: string; blurb: string; action: string }> = {
  signin: {
    title: 'Welcome back',
    blurb: 'Sign in to pick up where you left off.',
    action: 'Sign in',
  },
  signup: {
    title: 'Get started',
    blurb: 'Create an account to start tracking.',
    action: 'Create account',
  },
  forgot: {
    title: 'Reset password',
    blurb: "Enter your email and we'll send you a link.",
    action: 'Send reset link',
  },
}

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<{ email: string; variant: 'signup' | 'recovery' } | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError(null)

    const address = email.trim()

    if (mode === 'forgot') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(address, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) setError(resetError.message)
      else setSent({ email: address, variant: 'recovery' })
      setPending(false)
      return
    }

    const { data, error: authError } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email: address, password })
        : await supabase.auth.signUp({
            email: address,
            password,
            options: { emailRedirectTo: window.location.origin },
          })

    if (authError) setError(authError.message)
    else if (mode === 'signup' && !data.session) setSent({ email: address, variant: 'signup' })

    setPending(false)
  }

  const backToSignIn = () => {
    setSent(null)
    setMode('signin')
    setPassword('')
    setError(null)
  }

  if (sent) {
    return <CheckInbox email={sent.email} variant={sent.variant} onBack={backToSignIn} />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <div className="w-full max-w-sm">
        <Logo />

        <h1 className="mt-8 text-4xl font-semibold tracking-[-0.06em]">{copy[mode].title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy[mode].blurb}</p>

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
          {mode !== 'forgot' && (
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
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="mt-2 h-12 w-full rounded-xl">
            {pending ? 'Working…' : copy[mode].action}
          </Button>
        </form>

        {mode === 'signin' && (
          <button
            onClick={() => {
              setMode('forgot')
              setError(null)
            }}
            className="mt-5 w-full text-sm text-muted-foreground hover:text-foreground"
          >
            Forgot your password?
          </button>
        )}

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
          }}
          className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === 'signin' ? 'No account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </div>
    </main>
  )
}
