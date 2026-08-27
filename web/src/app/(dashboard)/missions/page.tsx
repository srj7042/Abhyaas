'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Target, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { checkAndGenerateMissions } from '@/components/missions/missionsGenerator'
import { recordXpTransaction } from '@/components/training/statsHelper'

interface UserMissionWithDetails {
  id: string
  status: string
  mission_id: string
  daily_missions: {
    title: string
    description: string
    xp_reward: number
  }
}

export default function MissionsPage() {
  const supabase = createClient()
  const [missions, setMissions] = useState<UserMissionWithDetails[]>([])
  const [streak, setStreak] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const fetchMissions = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    const uid = session.user.id
    setUserId(uid)

    // 1. Fetch Streak
    const { data: streakData } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', uid)
      .single()
    
    if (streakData) {
      setStreak(streakData.current_streak)
    }

    // 2. Fetch target career to personalize
    const { data: profile } = await supabase
      .from('profiles')
      .select('target_career')
      .eq('id', uid)
      .single()

    const career = profile?.target_career || 'Fullstack Developer'

    // 3. Fetch active module
    const { data: activeRoadmap } = await supabase
      .from('roadmaps')
      .select('id')
      .eq('user_id', uid)
      .eq('status', 'active')
      .single()

    let activeModTitle = 'Core Fundamentals'
    if (activeRoadmap) {
      const { data: activeModule } = await supabase
        .from('roadmap_modules')
        .select('title')
        .eq('roadmap_id', activeRoadmap.id)
        .eq('status', 'In Progress')
        .limit(1)
        .single()
      if (activeModule) {
        activeModTitle = activeModule.title
      }
    }

    // 4. Generate & fetch daily missions dynamically
    const list = await checkAndGenerateMissions(uid, activeModTitle, career)
    setMissions(list)
    setLoading(false)
  }

  useEffect(() => {
    fetchMissions()
  }, [supabase])

  const claimXp = async (userMissionId: string) => {
    if (!userId) return
    const target = missions.find(m => m.id === userMissionId)
    if (!target) return
    const xpReward = target.daily_missions?.xp_reward || 50
    const title = target.daily_missions?.title || 'Daily Mission'

    // Update status in Supabase user_missions to 'claimed'
    await supabase
      .from('user_missions')
      .update({ status: 'claimed' })
      .eq('id', userMissionId)

    // Insert into public.xp_transactions
    await recordXpTransaction(userId, xpReward, `Daily Mission: ${title}`)
    
    // Update local state
    setMissions(prev => prev.map(m => m.id === userMissionId ? { ...m, status: 'claimed' } : m))
    alert(`XP Claimed successfully! +${xpReward} XP added to transaction logs.`)
    fetchMissions()
  }

  const getStartLink = (title: string): string => {
    const t = title.toLowerCase()
    if (t.includes('practice') || t.includes('tutor')) return '/tutor'
    if (t.includes('training') || t.includes('mcq') || t.includes('debug')) return '/training'
    if (t.includes('project')) return '/projects'
    return '/roadmap'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-sm text-slate-500 animate-pulse">Loading daily missions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-slate-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Daily Missions Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Maintain your learning streak and accumulate scholar XP.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs text-orange-400 font-bold flex items-center gap-1.5 shrink-0">
          🔥 {streak} Day Streak
        </div>
      </div>

      {missions.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          {missions.map((m, idx) => {
            const innerMission = m.daily_missions
            const isCompleted = m.status === 'completed' || m.status === 'claimed'
            const isClaimed = m.status === 'claimed'

            return (
              <div key={m.id || idx} className="flex justify-between items-center p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex-wrap gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Target size={16} className="text-blue-500" />
                    {innerMission?.title || 'Daily Mission'}
                  </h4>
                  <p className="text-xs text-slate-500">{innerMission?.description || 'Learn and practice core concepts.'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-yellow-400 font-bold bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">
                    +{innerMission?.xp_reward || 50} XP
                  </span>
                  {isClaimed ? (
                    <span className="p-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs font-semibold">
                      Claimed
                    </span>
                  ) : isCompleted ? (
                    <button 
                      onClick={() => claimXp(m.id)}
                      className="bg-yellow-600 hover:bg-yellow-750 text-white text-xs font-semibold px-4 py-2 rounded-xl transition active:scale-95"
                    >
                      Claim XP
                    </button>
                  ) : (
                    <Link href={getStartLink(innerMission?.title || '')}>
                      <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition active:scale-95">
                        Start
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-3">
          <AlertCircle className="text-slate-500 mx-auto" size={32} />
          <h3 className="font-bold text-white">No Active Missions</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any daily missions assigned. Check settings to verify your career path target is configured properly!
          </p>
        </div>
      )}
    </div>
  )
}
