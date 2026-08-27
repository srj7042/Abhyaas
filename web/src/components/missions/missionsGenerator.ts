import { createClient } from '@/utils/supabase/client'

export interface UserMissionWithDetails {
  id: string
  status: string
  mission_id: string
  daily_missions: {
    title: string
    description: string
    xp_reward: number
  }
}

// Generate and insert personalized daily missions if none are active
export const checkAndGenerateMissions = async (
  userId: string,
  currentModuleTitle: string,
  careerGoal: string
): Promise<UserMissionWithDetails[]> => {
  const supabase = createClient()
  
  // 1. Fetch user's missions
  const { data: existingUserMissions } = await supabase
    .from('user_missions')
    .select(`
      id,
      status,
      mission_id,
      daily_missions (
        title,
        description,
        xp_reward
      )
    `)
    .eq('user_id', userId)

  // If the user already has active/completed missions, return them
  if (existingUserMissions && existingUserMissions.length > 0) {
    return existingUserMissions as unknown as UserMissionWithDetails[]
  }

  // 2. No user missions found, generate 3 personalized missions
  const focusTopic = currentModuleTitle || 'Core Engineering'
  
  const generatedMissions = [
    {
      title: `Practice Lesson: ${focusTopic}`,
      description: `Complete the active guided module for "${focusTopic}" in the AI Tutor.`,
      xp_reward: 100
    },
    {
      title: `Complete Training Deck`,
      description: `Test your skills in the Coding or MCQ Training Decks for "${focusTopic}".`,
      xp_reward: 80
    },
    {
      title: `Debug and Repair Code`,
      description: `Review your mistakes logbook and clear a code repair challenge.`,
      xp_reward: 70
    }
  ]

  const finalUserMissions: UserMissionWithDetails[] = []

  for (const m of generatedMissions) {
    // Check if the mission exists in the global pool first
    let missionId = ''
    const { data: existingGlobal } = await supabase
      .from('daily_missions')
      .select('id')
      .eq('title', m.title)
      .limit(1)
      .maybeSingle()

    if (existingGlobal) {
      missionId = existingGlobal.id
    } else {
      // Create new global mission
      const { data: newGlobal } = await supabase
        .from('daily_missions')
        .insert(m)
        .select('id')
        .single()
      if (newGlobal) {
        missionId = newGlobal.id
      }
    }

    if (missionId) {
      // Insert into user_missions
      const { data: newUserMission } = await supabase
        .from('user_missions')
        .insert({
          user_id: userId,
          mission_id: missionId,
          status: 'active'
        })
        .select(`
          id,
          status,
          mission_id,
          daily_missions (
            title,
            description,
            xp_reward
          )
        `)
        .single()

      if (newUserMission) {
        finalUserMissions.push(newUserMission as unknown as UserMissionWithDetails)
      }
    }
  }

  return finalUserMissions
}

// Complete a user mission matching a specific type
export const triggerMissionCompletion = async (userId: string, missionKeyword: string) => {
  const supabase = createClient()
  try {
    // Find active user missions
    const { data: activeMissions } = await supabase
      .from('user_missions')
      .select(`
        id,
        status,
        daily_missions (
          title
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')

    if (!activeMissions) return

    const targetMission = activeMissions.find(m => {
      const dm = m.daily_missions as any
      const title = Array.isArray(dm) ? dm[0]?.title : dm?.title
      return title?.toLowerCase().includes(missionKeyword.toLowerCase())
    })

    if (targetMission) {
      // Mark as completed
      await supabase
        .from('user_missions')
        .update({ status: 'completed' })
        .eq('id', targetMission.id)
    }
  } catch (err) {
    console.error('Failed to complete mission:', err)
  }
}
