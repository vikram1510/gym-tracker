import { useState } from 'react'
import { MailCheck } from 'lucide-react'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function CheckInbox({ email, onBack }: { email: string; onBack: () => void }) {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const resend = async () => {
    setResending(true)
    await supabase.auth.resend({ type: 'signup', email })
    setResending(false)
    setResent(true)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <div className="w-full max-w-sm">
        <Logo />
        <div className="mt-8 flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <MailCheck className="size-7" />
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.06em]">Check your inbox</h1>
        <p className="mt-3 leading-6 text-muted-foreground">
          We sent a confirmation link to{' '}
          <span className="font-medium text-foreground">{email}</span>. Click it to activate your
          account, then come back here to sign in.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Nothing yet? It can take a minute — check your spam folder too.
        </p>

        <Button
          variant="outline"
          disabled={resending || resent}
          onClick={resend}
          className="mt-6 h-12 w-full rounded-xl"
        >
          {resending ? 'Sending…' : resent ? 'Email resent' : 'Resend email'}
        </Button>
        <button
          onClick={onBack}
          className="mt-5 w-full text-sm text-muted-foreground hover:text-foreground"
        >
          Back to sign in
        </button>
      </div>
    </main>
  )
}
