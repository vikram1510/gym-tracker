import { Navigate, Route, Routes } from 'react-router'
import AuthScreen from '@/components/auth-screen/auth-screen'
import GymDashboard from '@/components/gym-dashboard/gym-dashboard'
import HistoryScreen from '@/components/gym-dashboard/history-screen'
import HomeScreen from '@/components/gym-dashboard/home-screen'
import ProfileScreen from '@/components/gym-dashboard/profile-screen'
import ProgressScreen from '@/components/gym-dashboard/progress-screen'
import MissingConfig from '@/components/missing-config'
import { supabaseConfigured } from '@/lib/supabase'
import { useSession } from '@/lib/use-session'

// The gate sits above the routes rather than inside them, so signing in on a
// deep link lands on that page instead of bouncing home -- the URL never
// changed, only what was rendered at it.
export default function App() {
  const { session, loading } = useSession()

  if (!supabaseConfigured) return <MissingConfig />
  if (loading) return <main className="min-h-screen bg-background" />
  if (!session) return <AuthScreen />

  return (
    <Routes>
      <Route element={<GymDashboard />}>
        <Route index element={<HomeScreen />} />
        <Route path="day/:date" element={<HomeScreen />} />
        <Route path="history" element={<HistoryScreen />} />
        <Route path="progress" element={<ProgressScreen />} />
        <Route path="profile" element={<ProfileScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
