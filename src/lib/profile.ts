import { supabase } from '@/lib/supabase'

export type Profile = {
  id: string
  display_name: string | null
  rest_timer_seconds: number
  units: 'kg' | 'lb'
  created_at: string
}

const shape = 'id, display_name, rest_timer_seconds, units, created_at'

// Accounts created before the signup trigger existed have no profile row, so
// one is written on first read rather than leaving the screen empty.
export async function fetchProfile() {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('profiles')
    .select(shape)
    .eq('id', auth.user.id)
    .maybeSingle()

  if (error) throw error
  if (data) return { profile: data as Profile, email: auth.user.email ?? '' }

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({ id: auth.user.id, display_name: auth.user.email?.split('@')[0] ?? null })
    .select(shape)
    .single()

  if (insertError) throw insertError
  return { profile: created as Profile, email: auth.user.email ?? '' }
}

export async function updateProfile(
  id: string,
  patch: Partial<Omit<Profile, 'id' | 'created_at'>>,
) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', id)
  if (error) throw error
}
