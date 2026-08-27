import { createClient } from '@/utils/supabase/client'
import { getLocalDeckStats } from '../training/statsHelper'

export interface CareerReadinessData {
  skill_mastery: number
  assessment_score: number
  project_evidence: number
  consistency_score: number
  interview_readiness: number
  overall_score: number
}

export const recalculateCareerReadiness = async (userId: string): Promise<CareerReadinessData> => {
  const supabase = createClient()

  // 1. Fetch relevant user datasets in parallel
  const [
    skillsRes,
    projectsRes,
    modulesRes,
    streakRes,
    readinessRes
  ] = await Promise.all([
    supabase.from('user_skills').select('*').eq('user_id', userId),
    supabase.from('projects').select('*').eq('user_id', userId),
    supabase.from('roadmap_modules').select('*').eq('user_id', userId),
    supabase.from('streaks').select('current_streak').eq('user_id', userId).single(),
    supabase.from('career_readiness').select('*').eq('user_id', userId).single()
  ])

  // a. Skill Mastery Score
  const totalSkills = skillsRes.data || []
  const masteredSkills = totalSkills.filter(s => s.status === 'Mastered').length
  const totalModules = modulesRes.data || []
  const completedModules = totalModules.filter(m => m.status === 'Completed').length
  
  // Calculate based on mastered skills, fallback to completed roadmap modules ratio
  let skillMastery = totalSkills.length > 0 
    ? Math.round((masteredSkills / totalSkills.length) * 100)
    : totalModules.length > 0
      ? Math.round((completedModules / totalModules.length) * 100)
      : 30 // Fallback

  // b. Assessment Score
  // Calculate average accuracy from the 4 local training decks
  const categories = ['coding', 'mcqs', 'sql', 'debugging']
  let totalAccuracySum = 0
  let activeAttemptsDecks = 0
  categories.forEach(cat => {
    const stats = getLocalDeckStats(userId, cat)
    if (stats.attempts > 0) {
      totalAccuracySum += stats.accuracy
      activeAttemptsDecks++
    }
  })
  
  let assessmentScore = activeAttemptsDecks > 0
    ? Math.round(totalAccuracySum / activeAttemptsDecks)
    : 45 // Fallback

  // c. Project Evidence Score
  const totalProjects = projectsRes.data || []
  const completedProjects = totalProjects.filter(p => p.status === 'Completed').length
  let projectEvidence = totalProjects.length > 0
    ? Math.round((completedProjects / totalProjects.length) * 100)
    : 0

  // d. Consistency Score
  const currentStreak = streakRes.data?.current_streak || 0
  let consistencyScore = Math.min(100, Math.max(10, currentStreak * 20 + 20))

  // e. Interview Readiness Score
  // Correlated to completed roadmap modules progression
  let interviewReadiness = totalModules.length > 0
    ? Math.round((completedModules / totalModules.length) * 100)
    : 20

  // f. Overall Score (average of above metrics)
  const overallScore = Math.round(
    (skillMastery + assessmentScore + projectEvidence + consistencyScore + interviewReadiness) / 5
  )

  const finalReadiness: CareerReadinessData = {
    skill_mastery: skillMastery,
    assessment_score: assessmentScore,
    project_evidence: projectEvidence,
    consistency_score: consistencyScore,
    interview_readiness: interviewReadiness,
    overall_score: overallScore
  }

  // Write/Update Supabase database record
  if (readinessRes.data) {
    await supabase
      .from('career_readiness')
      .update(finalReadiness)
      .eq('id', readinessRes.data.id)
  } else {
    await supabase
      .from('career_readiness')
      .insert({
        user_id: userId,
        ...finalReadiness
      })
  }

  return finalReadiness
}
