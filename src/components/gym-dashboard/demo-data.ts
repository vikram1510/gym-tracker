export type Exercise = {
  name: string
  target: string
  last: string
  color: string
  sets: { weight: string; reps: string; done: boolean }[]
}

export const sessions = [
  { name: 'Upper body strength', date: 'Yesterday', duration: '52 min', volume: '8,420 lb' },
  { name: 'Lower body power', date: 'Mon, Jun 10', duration: '48 min', volume: '11,280 lb' },
  { name: 'Pull + core', date: 'Sat, Jun 8', duration: '41 min', volume: '7,940 lb' },
]

export const starterExercises: Exercise[] = [
  {
    name: 'Barbell bench press',
    target: '4 sets × 8 reps',
    last: '175 lb × 8',
    color: 'bg-primary',
    sets: Array.from({ length: 4 }, () => ({ weight: '175', reps: '8', done: false })),
  },
  {
    name: 'Incline dumbbell press',
    target: '3 sets × 10 reps',
    last: '55 lb × 10',
    color: 'bg-accent',
    sets: Array.from({ length: 3 }, () => ({ weight: '55', reps: '10', done: false })),
  },
  {
    name: 'Cable lateral raise',
    target: '3 sets × 12 reps',
    last: '20 lb × 12',
    color: 'bg-secondary',
    sets: Array.from({ length: 3 }, () => ({ weight: '20', reps: '12', done: false })),
  },
]
