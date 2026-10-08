import { fromDayKey, todayKey, type DayKey } from '@/lib/day'

export function formatDayLabel(key: DayKey) {
  const today = todayKey()
  if (key === today) return 'Today'

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (
    key ===
    `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`
  )
    return 'Yesterday'

  return fromDayKey(key).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function pad(value: number) {
  return `${value}`.padStart(2, '0')
}

export function formatMonth(key: DayKey) {
  return fromDayKey(key).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
}

export function formatDayOfMonth(key: DayKey) {
  return fromDayKey(key).getDate()
}

export function formatSeconds(seconds: number | null) {
  if (seconds === null) return '—'
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`
}

export function formatVolume(kg: number) {
  return `${Math.round(kg).toLocaleString()} kg`
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
