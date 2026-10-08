// A day is identified by its local calendar date, `YYYY-MM-DD`. Never build
// one with toISOString(): that is UTC, so logging at 11pm in BST would file
// the session under tomorrow.

export type DayKey = string

export function toDayKey(date: Date): DayKey {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function fromDayKey(key: DayKey) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function todayKey() {
  return toDayKey(new Date())
}

export function shiftDay(key: DayKey, days: number) {
  const date = fromDayKey(key)
  date.setDate(date.getDate() + days)
  return toDayKey(date)
}

export function isToday(key: DayKey) {
  return key === todayKey()
}

// There is nothing to log tomorrow, so the forward chevron stops at today.
export function isFuture(key: DayKey) {
  return key > todayKey()
}
