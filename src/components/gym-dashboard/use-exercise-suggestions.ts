import { useEffect, useState } from 'react'
import { fetchExerciseSuggestions, type ExerciseSuggestion } from '@/lib/workouts'

export function useExerciseSuggestions(enabled: boolean) {
  const [suggestions, setSuggestions] = useState<ExerciseSuggestion[]>([])

  useEffect(() => {
    if (!enabled) return
    let active = true
    fetchExerciseSuggestions()
      .then((next) => active && setSuggestions(next))
      .catch((cause) => console.error('Could not load exercises', cause))
    return () => {
      active = false
    }
  }, [enabled])

  return suggestions
}
