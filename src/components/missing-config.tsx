export default function MissingConfig() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <div className="max-w-sm">
        <h1 className="text-2xl font-semibold tracking-[-0.04em]">Supabase not configured</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Copy <code className="font-mono">.env.example</code> to{' '}
          <code className="font-mono">.env.local</code>, fill in your project URL and publishable
          key, then restart the dev server.
        </p>
      </div>
    </main>
  )
}
