import AuthScreen from '@/components/auth-screen/auth-screen'
import GymDashboard from '@/components/gym-dashboard'
import MissingConfig from '@/components/missing-config'
import { supabaseConfigured } from '@/lib/supabase'
import { useSession } from '@/lib/use-session'

export default function App() {
  const { session, loading } = useSession()

  if (!supabaseConfigured) return <MissingConfig />
  if (loading) return <main className="min-h-screen bg-background" />
  if (!session) return <AuthScreen />
  return <GymDashboard />
}
