import { useCallback, useEffect, useState } from 'react'
import { fetchProfile, updateProfile, type Profile } from '@/lib/profile'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetchProfile()
      .then((result) => {
        if (!active) return
        setProfile(result.profile)
        setEmail(result.email)
      })
      .catch((cause) => active && setError(cause.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const rename = useCallback(
    (displayName: string) => {
      if (!profile) return
      setProfile({ ...profile, display_name: displayName })
      updateProfile(profile.id, { display_name: displayName }).catch((cause) =>
        setError(cause.message),
      )
    },
    [profile],
  )

  return { profile, email, loading, error, rename }
}
