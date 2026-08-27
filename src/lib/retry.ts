// Transient failures happen -- a clock-skew rejection from PostgREST, a cold
// instance, a dropped connection. In a standalone PWA there is no reload
// button to fall back on, so one quiet retry beats showing an error.
export async function withRetry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 500) {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn()
    } catch (cause) {
      lastError = cause
      if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  throw lastError
}
