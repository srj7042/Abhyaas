import { createClient } from '@/utils/supabase/client'

export interface UserDeckStats {
  attempts: number
  accuracy: number
}

// LocalStorage key template: `training_deck_stats_${userId}_${category}`
export const getLocalDeckStats = (userId: string, category: string): UserDeckStats => {
  if (typeof window === 'undefined') return { attempts: 0, accuracy: 0 }
  const raw = localStorage.getItem(`training_deck_stats_${userId}_${category}`)
  if (!raw) return { attempts: 0, accuracy: 0 }
  try {
    return JSON.parse(raw)
  } catch {
    return { attempts: 0, accuracy: 0 }
  }
}

export const saveLocalDeckStats = (
  userId: string,
  category: string,
  sessionScore: number,
  maxScore: number
) => {
  if (typeof window === 'undefined') return
  const current = getLocalDeckStats(userId, category)
  const currentTotalQuestions = current.attempts * 5 // Assume 5 questions per training session
  const currentCorrectAnswers = Math.round((current.accuracy / 100) * currentTotalQuestions)

  const newAttempts = current.attempts + 1
  const newTotalQuestions = newAttempts * 5
  const newCorrectAnswers = currentCorrectAnswers + sessionScore

  const newAccuracy = Math.round((newCorrectAnswers / newTotalQuestions) * 100)

  localStorage.setItem(
    `training_deck_stats_${userId}_${category}`,
    JSON.stringify({
      attempts: newAttempts,
      accuracy: Math.min(100, Math.max(0, newAccuracy))
    })
  )
}

// Record XP Transaction to Postgres via Supabase Client
export const recordXpTransaction = async (userId: string, amount: number, source: string) => {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('xp_transactions')
      .insert({
        user_id: userId,
        amount,
        source
      })
    return { data, error }
  } catch (err) {
    console.error('Error inserting XP transaction:', err)
    return { error: err }
  }
}

// Record Mistake to Postgres Mistakes Logbook via Supabase Client
export const recordMistake = async (
  userId: string,
  questionText: string,
  userAnswer: string,
  correctAnswer: string,
  errorType: string,
  explanation: string,
  recoveryAction: string
) => {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('mistakes')
      .insert({
        user_id: userId,
        question: questionText,
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        error_type: errorType,
        explanation,
        recovery_action: recoveryAction
      })
    return { data, error }
  } catch (err) {
    console.error('Error logging mistake:', err)
    return { error: err }
  }
}
