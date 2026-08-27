'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Trophy, 
  TrendingUp, 
  PlusCircle, 
  MinusCircle, 
  CheckCircle,
  Briefcase,
  AlertCircle
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { recalculateCareerReadiness } from '@/components/readiness/readinessCalculator'

const CompetencyBreakdownChart = dynamic(
  () => import('@/components/CompetencyBreakdownChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-950/20 rounded-xl">
        <span className="text-xs text-slate-500 animate-pulse">Loading competency breakdown...</span>
      </div>
    )
  }
)

export default function ReadinessPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [readiness, setReadiness] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [improvements, setImprovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReadiness = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const userId = session.user.id

      // 1. Dynamic calculation of metrics
      const calculatedReadiness = await recalculateCareerReadiness(userId)
      setReadiness(calculatedReadiness)

      // 2. Fetch profile, transactions, and other info
      const [
        profileRes,
        xpRes,
        projectsRes,
        modulesRes
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('xp_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
        supabase.from('projects').select('title, status').eq('user_id', userId).eq('status', 'In Progress').limit(1),
        supabase.from('roadmap_modules').select('title, status').eq('user_id', userId).eq('status', 'Locked').order('order_index', { ascending: true }).limit(2)
      ])

      if (profileRes.data) {
        setProfile(profileRes.data)
      }

      if (xpRes.data) {
        setActivities(xpRes.data)
      }

      const projectsData = projectsRes.data
      const modulesData = modulesRes.data

      const derivedImprovements = []
      if (projectsData && projectsData.length > 0) {
        derivedImprovements.push(`Complete progress on project: ${projectsData[0].title}`)
      }
      if (modulesData) {
        modulesData.forEach((m: any) => {
          derivedImprovements.push(`Unlock upcoming roadmap module: ${m.title}`)
        });
      }
      if (derivedImprovements.length === 0) {
        derivedImprovements.push('Master more skills and complete active lessons to further build readiness metrics.')
      }
      setImprovements(derivedImprovements)

      setLoading(false)
    }

    fetchReadiness()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-sm text-slate-500 animate-pulse">Loading career readiness metrics...</span>
      </div>
    )
  }

  // Map database properties into Recharts Radar structure
  const radarData = [
    { subject: 'Skill Mastery', A: readiness?.skill_mastery || 0, fullMark: 100 },
    { subject: 'Assessments', A: readiness?.assessment_score || 0, fullMark: 100 },
    { subject: 'Project Evidence', A: readiness?.project_evidence || 0, fullMark: 100 },
    { subject: 'Consistency', A: readiness?.consistency_score || 0, fullMark: 100 },
    { subject: 'Interview Readiness', A: readiness?.interview_readiness || 0, fullMark: 100 },
  ]

  const overallScore = readiness?.overall_score || 0

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-slate-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Career Readiness</h1>
        <p className="text-slate-400 text-sm mt-1">
          Detailed metrics showing how prepared you are to secure a{' '}
          <span className="text-blue-400 font-semibold">{profile?.target_career || 'Target Role'}</span>.
        </p>
      </div>

      {readiness ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Core Readiness KPI & Radar Chart */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-8">
              {/* Circular Indicator */}
              <div className="relative w-36 h-36 flex items-center justify-center bg-blue-600/10 border-4 border-blue-500 rounded-full shrink-0 shadow-lg shadow-blue-500/10">
                <span className="text-4xl font-extrabold text-white">{overallScore}%</span>
              </div>
              
              <div className="space-y-2">
                <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Career Readiness Index</span>
                <h2 className="text-2xl font-bold text-white">
                  {overallScore > 75 ? 'Looking Strong!' : overallScore > 40 ? 'Making Progress' : 'Just Starting'}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {overallScore > 75 
                    ? "Your high consistency score and solid assessment metrics position you in the top tier of candidates. Focus on your Project Evidence score to maximize employment odds."
                    : "Establish a target goal and complete daily check-ins to build consistency metrics and unlock deep evaluation parameters."
                  }
                </p>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6">Competency Breakdown</h3>
              <div className="h-80 flex items-center justify-center">
                <CompetencyBreakdownChart data={radarData} username={profile?.username || 'Learner'} />
              </div>
            </div>

          </div>

          {/* Right Column: Improvements & Activity Logs */}
          <div className="space-y-6">
            {/* Actionable Recommendations */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Recommended Actions</h3>
              <div className="space-y-3">
                {improvements.map((imp, idx) => (
                  <div key={idx} className="flex gap-3 items-start text-sm">
                    <PlusCircle className="text-blue-500 shrink-0 mt-0.5" size={16} />
                    <span className="text-slate-350">{imp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent XP Activity Timeline */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Readiness Activities</h3>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((act) => (
                    <div key={act.id} className="flex justify-between items-start text-xs border-b border-slate-850 pb-2">
                      <div>
                        <p className="text-white font-semibold">{act.source}</p>
                        <p className="text-slate-500 mt-0.5">
                          {act.created_at ? new Date(act.created_at).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                      <span className="text-yellow-450 font-bold">+{act.amount} XP</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No recent activities found.</p>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
          <AlertCircle className="text-slate-500 mx-auto" size={32} />
          <p className="text-xs text-slate-500 mt-2">Error loading readiness index parameters.</p>
        </div>
      )}
    </div>
  )
}
