import { useState } from 'react'
import { useNavigate } from 'react-router'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

// The recovery link signs the user in before they get here, so this screen
// only has to set the new password -- there is no token to hand over.
export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (password !== confirm) {
      setError("Those passwords don't match.")
      return
    }

    setPending(true)
    setError(null)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setPending(false)

    if (updateError) setError(updateError.message)
    else navigate('/', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <div className="w-full max-w-sm">
        <Logo />

        <h1 className="mt-8 text-4xl font-semibold tracking-[-0.06em]">Choose a password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick something new and you'll be signed straight in.
        </p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
          <Input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            aria-label="New password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-xl px-4 text-sm"
          />
          <Input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            aria-label="Confirm new password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className="h-12 rounded-xl px-4 text-sm"
          />

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="mt-2 h-12 w-full rounded-xl">
            {pending ? 'Saving…' : 'Save password'}
          </Button>
        </form>

        <button
          onClick={() => navigate('/', { replace: true })}
          className="mt-5 w-full text-sm text-muted-foreground hover:text-foreground"
        >
          Skip for now
        </button>
      </div>
    </main>
  )
}
