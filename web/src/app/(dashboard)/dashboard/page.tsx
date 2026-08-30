'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { 
  Trophy, 
  Flame, 
  Target, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Play,
  Sparkles,
  User,
  Send,
  HelpCircle,
  Award,
  ChevronRight,
  RefreshCw,
  Edit2
} from 'lucide-react'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import dynamic from 'next/dynamic'
import { checkAndGenerateMissions } from '@/components/missions/missionsGenerator'
import { recalculateCareerReadiness } from '@/components/readiness/readinessCalculator'
import { recordXpTransaction } from '@/components/training/statsHelper'

const LearningActivityChart = dynamic(
  () => import('@/components/LearningActivityChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-950/20 rounded-xl">
        <span className="text-xs text-slate-500 animate-pulse">Loading activity...</span>
      </div>
    )
  }
)


const activityData = [
  { day: 'Mon', hours: 0 },
  { day: 'Tue', hours: 0 },
  { day: 'Wed', hours: 0 },
  { day: 'Thu', hours: 0 },
  { day: 'Fri', hours: 0 },
  { day: 'Sat', hours: 0 },
  { day: 'Sun', hours: 0 },
]

type OnboardingMode = 'ai' | 'manual'

export default function DashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [streak, setStreak] = useState<number>(0)
  const [xp, setXp] = useState<number>(0)
  const [readiness, setReadiness] = useState<number>(0)
  const [overallProgress, setOverallProgress] = useState<number>(0)
  const [skillsMastered, setSkillsMastered] = useState<number>(0)
  const [weeklyHours, setWeeklyHours] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [hasRoadmap, setHasRoadmap] = useState(false)
  const [missions, setMissions] = useState<any[]>([])
  const [mistakes, setMistakes] = useState<any[]>([])
  const [activityData, setActivityData] = useState<any[]>([
    { day: 'Mon', hours: 0 },
    { day: 'Tue', hours: 0 },
    { day: 'Wed', hours: 0 },
    { day: 'Thu', hours: 0 },
    { day: 'Fri', hours: 0 },
    { day: 'Sat', hours: 0 },
    { day: 'Sun', hours: 0 },
  ])
  const [currentModule, setCurrentModule] = useState<any>(null)
  const [activeRoadmapId, setActiveRoadmapId] = useState<string | null>(null)

  // Onboarding Builder States
  const [builderMode, setBuilderMode] = useState<OnboardingMode>('ai')
  const [aiInput, setAiInput] = useState('')
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', content: 'Hi! Let\'s build your personalized career track. Tell me what role you want to achieve, your target timeline, weekly study budget, and experience level!' }
  ])
  const [generating, setGenerating] = useState(false)
  const [generatedRoadmap, setGeneratedRoadmap] = useState<any>(null)
  const [proposedRoadmap, setProposedRoadmap] = useState<any>(null)

  // Manual Questionnaire States
  const [manualStep, setManualStep] = useState(1)
  const [qCareer, setQCareer] = useState('')
  const [qCustomCareer, setQCustomCareer] = useState('')
  const [qObjective, setQObjective] = useState('')
  const [qLevel, setQLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [qSelectedSkills, setQSelectedSkills] = useState<string[]>([])
  const [qDeadline, setQDeadline] = useState('')
  const [qHours, setQHours] = useState(15)
  const [qPreference, setQPreference] = useState<string[]>([])
  const [qDifficulty, setQDifficulty] = useState('Challenging')
  const [qInterest, setQInterest] = useState('')
  const [qAdditional, setQAdditional] = useState('')

  const availableSkills = ['Python', 'SQL', 'Git', 'Data Structures', 'Statistics', 'Docker', 'React', 'HTML/CSS', 'AWS', 'TensorFlow', 'FastAPI']

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    const userId = session.user.id
    setUserId(userId)

    // Fetch all independent data concurrently in parallel
    const [
      profileRes,
      roadmapRes,
      streakRes,
      xpRes,
      readinessRes,
      skillsRes,
      userMissionsRes,
      mistakesRes,
      modulesRes
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('roadmaps').select('id').eq('user_id', userId).eq('status', 'active').single(),
      supabase.from('streaks').select('current_streak').eq('user_id', userId).single(),
      supabase.from('xp_transactions').select('amount, created_at').eq('user_id', userId),
      supabase.from('career_readiness').select('overall_score').eq('user_id', userId).single(),
      supabase.from('user_skills').select('id').eq('user_id', userId).eq('status', 'Mastered'),
      supabase.from('user_missions').select(`
        id,
        status,
        mission_id,
        daily_missions (
          title,
          description,
          xp_reward
        )
      `).eq('user_id', userId).limit(3),
      supabase.from('mistakes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('roadmap_modules').select('*').eq('user_id', userId).order('order_index', { ascending: true })
    ])

    // Hydrate profile data, inserting a new one if missing
    let profileData = profileRes.data
    if (!profileData) {
      // Dynamic profile creation to resolve foreign key violations for users created before trigger registration
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          auth_user_id: userId,
          full_name: session.user.user_metadata?.full_name || session.user.email,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
          email: session.user.email
        })
        .select()
        .single()
      
      if (newProfile) {
        profileData = newProfile
      }
    }
    
    if (profileData) {
      setProfile(profileData)
      setWeeklyHours(profileData.weekly_hours || 0)
    }

    // Check if they have an active roadmap
    if (roadmapRes.data) {
      setHasRoadmap(true)
      setActiveRoadmapId(roadmapRes.data.id)
    } else {
      setHasRoadmap(false)
      setActiveRoadmapId(null)
    }

    // Fetch and handle streak stats (insert if missing)
    let streakData = streakRes.data
    if (!streakData) {
      const { data: newStreak } = await supabase
        .from('streaks')
        .insert({ user_id: userId, current_streak: 0, longest_streak: 0 })
        .select('current_streak')
        .single()
      if (newStreak) streakData = newStreak
    }
    if (streakData) setStreak(streakData.current_streak)

    // Compute XP
    const xpData = xpRes.data
    if (xpData) setXp(xpData.reduce((sum, item) => sum + item.amount, 0))

    // Compute Readiness
    if (readinessRes.data) setReadiness(readinessRes.data.overall_score)

    // Compute Mastered Skills count
    if (skillsRes.data) setSkillsMastered(skillsRes.data.length)

    // Compute activityData based on xpData dynamically
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyHours: { [key: string]: number } = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    if (xpData) {
      xpData.forEach(tx => {
        if (tx.created_at) {
          const date = new Date(tx.created_at);
          const dayIndex = date.getDay();
          const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];
          const calculatedHours = tx.amount / 100;
          dailyHours[dayName] = (dailyHours[dayName] || 0) + calculatedHours;
        }
      });
    }
    const formattedActivity = daysOfWeek.map(day => ({
      day,
      hours: parseFloat(Math.min(8, dailyHours[day] || 0).toFixed(1))
    }));
    setActivityData(formattedActivity);

    // Hydrate current active roadmap module
    const modulesData = modulesRes.data
    let currentFocusModuleTitle = 'Core Fundamentals'
    if (modulesData && modulesData.length > 0) {
      const activeModules = roadmapRes.data
        ? modulesData.filter((m: any) => m.roadmap_id === roadmapRes.data.id)
        : modulesData
      const completed = activeModules.filter((m: any) => m.status === 'Completed').length
      const total = activeModules.length
      const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0
      setOverallProgress(progressPercent)
      
      const inProgress = activeModules.find((m: any) => m.status === 'In Progress')
      const targetMod = inProgress || activeModules[0]
      setCurrentModule(targetMod)
      if (targetMod) currentFocusModuleTitle = targetMod.title
    } else {
      setOverallProgress(0)
    }

    // Dynamic generation of missions
    const goal = profileData?.target_career || 'Fullstack Developer'
    const dynamicMissions = await checkAndGenerateMissions(userId, currentFocusModuleTitle, goal)
    setMissions(dynamicMissions)

    // Recalculate and update Career Readiness Index
    const readinessData = await recalculateCareerReadiness(userId)
    if (readinessData) {
      setReadiness(readinessData.overall_score)
    }

    // Hydrate mistake logbook
    if (mistakesRes.data) {
      setMistakes(mistakesRes.data)
    }

    setLoading(false)
  }

  // Conversational AI Mode Handler
  const handleAiSend = async () => {
    if (!aiInput.trim() || generating) return
    const userPrompt = aiInput
    setChatMessages(prev => [...prev, { role: 'user', content: userPrompt }])
    setAiInput('')
    setGenerating(true)

    try {
      const systemContext = `
        You are Abhyaas AI roadmap builder. Help the user build their study path.
        If details like target career, level, weekly hours, or target deadline are missing, ask single follow-up questions to gather them.
        Once you have enough details (specifically target career, study hours, level, deadline), output a formatted JSON block inside triple backticks (\`\`\`json ... \`\`\`) representing their custom roadmap.
        Format constraints:
        {
          "target_career": "AI Engineer",
          "duration": "5 Months",
          "weekly_hours": 15,
          "level": "Intermediate",
          "skills": [{"name": "Python", "status": "Mastered"}, {"name": "SQL", "status": "Mastered"}, {"name": "Statistics", "status": "55%"}],
          "phases": [
            {
              "title": "Phase 1: Foundations",
              "description": "Mathematics, python script structures.",
              "duration": "4 weeks",
              "milestone": "Foundations completion",
              "topics": ["Calculus", "Linear Algebra"],
              "projects": ["Linear Solver API"]
            }
          ]
        }
      `
      
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${systemContext}\n\nUser Chat History: ${JSON.stringify(chatMessages)}\n\nNew Input: ${userPrompt}` }),
      })

      const data = await res.json()
      if (res.ok) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }])

        // Look for JSON block in markdown
        const jsonMatch = data.response.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch && jsonMatch[1]) {
          try {
            const parsed = JSON.parse(jsonMatch[1])
            setProposedRoadmap(parsed)
          } catch (e) {
            console.error("Failed to parse proposed roadmap JSON", e)
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

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
    fetchUserData()
  }

  // Questionnaire Manual Mode Handler
  const generateManualRoadmap = async () => {
    setGenerating(true)
    try {
      const prompt = `
        Build a personalized learning path based on this questionnaire profile:
        - Target Career: ${qCareer === 'Other' ? qCustomCareer : qCareer}
        - Objective: ${qObjective}
        - Level: ${qLevel}
        - Current Skills: ${qSelectedSkills.join(', ')}
        - Deadline: ${qDeadline}
        - Weekly study budget: ${qHours} hours
        - Preferred Style: ${qPreference.join(', ')}
        - Difficulty: ${qDifficulty}
        - Areas: ${qInterest}
        - Additional: ${qAdditional}

        Respond ONLY with a JSON block inside triple backticks (\`\`\`json ... \`\`\`) in the exact format:
        {
          "target_career": "${qCareer === 'Other' ? qCustomCareer : qCareer}",
          "duration": "${qDeadline}",
          "weekly_hours": ${qHours},
          "level": "${qLevel}",
          "skills": [
            {"name": "Python", "status": "Mastered"},
            {"name": "SQL", "status": "Mastered"},
            {"name": "Statistics", "status": "55%"}
          ],
          "phases": [
            {
              "title": "Phase 1: Core Fundamentals",
              "description": "Probability and calculus foundations.",
              "duration": "4 weeks",
              "milestone": "Math milestone",
              "topics": ["Probability"],
              "projects": ["Linear API"]
            }
          ]
        }
      `
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()
      if (res.ok) {
        const jsonMatch = data.response.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch && jsonMatch[1]) {
          const parsed = JSON.parse(jsonMatch[1])
          setGeneratedRoadmap(parsed)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  // Save Roadmap to PostgreSQL
  const handleSaveRoadmap = async () => {
    if (!generatedRoadmap) return
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const userId = session.user.id

      // 1. Update Profile Career Target
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          target_career: generatedRoadmap.target_career,
          weekly_hours: generatedRoadmap.weekly_hours,
          experience_level: generatedRoadmap.level.toLowerCase()
        })
        .eq('id', userId)

      if (profileError) throw profileError

      // 2. Clear old active roadmaps
      const { error: archiveError } = await supabase
        .from('roadmaps')
        .update({ status: 'archived' })
        .eq('user_id', userId)

      if (archiveError) throw archiveError

      // 3. Create learning goal
      const { data: goalData, error: goalError } = await supabase
        .from('learning_goals')
        .insert({
          user_id: userId,
          goal_text: `Become a professional ${generatedRoadmap.target_career}`,
          target_role: generatedRoadmap.target_career,
          weekly_commitment: generatedRoadmap.weekly_hours,
          difficulty_preference: generatedRoadmap.level.toLowerCase()
        })
        .select()
        .single()

      if (goalError) throw goalError

      // 4. Create new roadmap
      const { data: rdData, error: rdError } = await supabase
        .from('roadmaps')
        .insert({
          user_id: userId,
          goal_id: goalData.id,
          title: `${generatedRoadmap.target_career} Learning Track`,
          description: `Custom curriculum for ${generatedRoadmap.target_career}`,
          target_role: generatedRoadmap.target_career,
          estimated_duration: generatedRoadmap.duration
        })
        .select()
        .single()

      if (rdError) throw rdError

      // 5. Insert modules
      const moduleInserts = generatedRoadmap.phases.map((phase: any, index: number) => ({
        roadmap_id: rdData.id,
        user_id: userId,
        title: phase.title,
        description: phase.description,
        order_index: index + 1,
        duration: phase.duration,
        milestone: phase.milestone,
        status: index === 0 ? 'In Progress' : 'Locked'
      }))

      const { error: moduleError } = await supabase
        .from('roadmap_modules')
        .insert(moduleInserts)

      if (moduleError) throw moduleError

      // 6. Initialize default readiness score
      const { error: readinessError } = await supabase
        .from('career_readiness')
        .insert({
          user_id: userId,
          skill_mastery: 20,
          assessment_score: 20,
          project_evidence: 10,
          consistency_score: 50,
          interview_readiness: 10,
          overall_score: 30
        })

      if (readinessError) throw readinessError

      // 7. Initialize default Projects
      const { error: projectsError } = await supabase
        .from('projects')
        .insert([
          { user_id: userId, title: 'House Price Prediction API', description: 'Build linear regression model and expose via FastAPI.', difficulty: 'Easy', status: 'Completed', score: 90 },
          { user_id: userId, title: 'Gradient Descent Optimization Module', description: 'Implement gradient updates manually from scratch in Python.', difficulty: 'Medium', status: 'In Progress' },
          { user_id: userId, title: 'Custom Neural Network from scratch', description: 'Build backpropagation and weights update loop manually.', difficulty: 'Hard', status: 'Not Started' }
        ])

      if (projectsError) throw projectsError

      // 8. Assign default Daily Missions
      const { data: dbMissions } = await supabase
        .from('daily_missions')
        .select('id')
      
      if (dbMissions && dbMissions.length > 0) {
        const userMissionInserts = dbMissions.map((m: any, idx: number) => ({
          user_id: userId,
          mission_id: m.id,
          status: idx === 1 ? 'claimed' : 'active'
        }))
        const { error: missionsError } = await supabase
          .from('user_missions')
          .insert(userMissionInserts)
        if (missionsError) throw missionsError
      }

      // Fetch fresh data
      await fetchUserData()
      setGeneratedRoadmap(null)
    } catch (err: any) {
      let errorMsg = ""
      if (err instanceof Error) {
        errorMsg = `${err.name}: ${err.message}\nStack: ${err.stack}`
      } else if (typeof err === 'object' && err !== null) {
        errorMsg = err.message || err.details || err.hint || JSON.stringify(err)
        if (errorMsg === '{}') {
          errorMsg = Object.keys(err).map(k => `${k}: ${err[k]}`).join(', ') || String(err)
        }
      } else {
        errorMsg = String(err)
      }
      console.error("Error saving roadmap detail string:", errorMsg)
      alert("Error saving roadmap: " + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const toggleSkill = (skill: string) => {
    setQSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const togglePreference = (pref: string) => {
    setQPreference(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-sm text-slate-500 animate-pulse">Loading dashboard modules...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-slate-200">
      
      {/* ONBOARDING ROADMAP BUILDER */}
      {!hasRoadmap ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="text-blue-500 animate-pulse" />
              Build Your Learning Path
            </h2>
            <p className="text-slate-400 text-sm">
              Tell us where you want to go, and we'll create your personalized learning journey.
            </p>
          </div>

          {/* Mode Toggles */}
          <div className="flex gap-2 bg-slate-950 p-1.5 rounded-2xl w-fit border border-slate-850">
            <button
              onClick={() => { setBuilderMode('ai'); setGeneratedRoadmap(null); }}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
                builderMode === 'ai' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ✨ AI Mode
            </button>
            <button
              onClick={() => { setBuilderMode('manual'); setManualStep(1); setGeneratedRoadmap(null); }}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
                builderMode === 'manual' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📝 Manual Mode
            </button>
          </div>

          {/* DYNAMIC ROADMAP PREVIEW MODAL */}
          {generatedRoadmap && (
            <div className="bg-slate-950 border border-blue-500/20 p-6 rounded-2xl space-y-6 animate-fade-in relative z-25">
              <div className="flex justify-between items-start border-b border-slate-850 pb-4">
                <div>
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">
                    Personalized Path Preview
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">Target Career: {generatedRoadmap.target_career}</h3>
                </div>
                <div className="text-right text-xs text-slate-500 space-y-1">
                  <p>Duration: <strong className="text-white">{generatedRoadmap.duration}</strong></p>
                  <p>Weekly budget: <strong className="text-white">{generatedRoadmap.weekly_hours} hrs</strong></p>
                  <p>Target difficulty: <strong className="text-white capitalize">{generatedRoadmap.level}</strong></p>
                </div>
              </div>

              {/* Skill gap preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Skill Gap Analysis</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedRoadmap.skills.map((s: any, idx: number) => (
                    <span key={idx} className="bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 text-slate-300">
                      {s.status === 'Mastered' ? '✓' : '⚠️'} {s.name} ({s.status})
                    </span>
                  ))}
                </div>
              </div>

              {/* Phases */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Roadmap Phases</h4>
                <div className="space-y-3">
                  {generatedRoadmap.phases.map((p: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-900/50 border border-slate-850 rounded-xl space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Phase {idx + 1}: {p.title}</span>
                        <span>{p.duration}</span>
                      </div>
                      <p className="text-xs text-slate-500">{p.description}</p>
                      <p className="text-[10px] text-blue-400 mt-1 font-semibold">Milestone: {p.milestone}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
                <button
                  onClick={() => setGeneratedRoadmap(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs transition border border-slate-700"
                >
                  Regenerate
                </button>
                <button
                  onClick={handleSaveRoadmap}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition shadow-lg shadow-blue-600/20 active:translate-y-[1px]"
                >
                  Save Roadmap & Start Path
                </button>
              </div>
            </div>
          )}

          {/* AI MODE VIEW */}
          {builderMode === 'ai' && !generatedRoadmap && (
            <div className="space-y-4 border border-slate-800 bg-slate-950/40 p-6 rounded-2xl min-h-[300px] flex flex-col justify-between">
              <div className="flex-1 overflow-y-auto space-y-4 max-h-64">
                {chatMessages.map((m, idx) => (
                  <div key={idx} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : ''}`}>
                    {m.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                        <User size={16} />
                      </div>
                    )}
                    <div className={`p-4 rounded-xl text-xs leading-relaxed max-w-md ${
                      m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900 border border-slate-850 text-slate-350'
                    }`}>
                      {m.role === 'user' ? (
                        m.content
                      ) : (
                        <MarkdownRenderer content={m.content} />
                      )}
                    </div>
                  </div>
                ))}
                {generating && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 animate-pulse">
                      <User size={16} />
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-500 flex items-center gap-1.5 animate-pulse">
                      Analyzing study goals...
                    </div>
                  </div>
                )}
              </div>

              {proposedRoadmap && (
                <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
                    <Sparkles size={14} className="animate-pulse" />
                    <span>Roadmap proposal ready for "{proposedRoadmap.target_career}" ({proposedRoadmap.duration})!</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setGeneratedRoadmap(proposedRoadmap)
                        setProposedRoadmap(null)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-[10px] md:text-xs transition shadow-md shadow-blue-650/15 cursor-pointer"
                    >
                      Create Roadmap
                    </button>
                    <button
                      onClick={() => setProposedRoadmap(null)}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 hover:text-white font-semibold px-4 py-2 rounded-lg text-[10px] md:text-xs transition cursor-pointer"
                    >
                      Continue Chat without Creating Roadmap
                    </button>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {chatMessages.length === 1 && (
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                  <button onClick={() => setAiInput('I want to become an AI Engineer in 5 months.')} className="border border-slate-800 px-3 py-1.5 rounded-lg hover:border-blue-500 transition hover:text-slate-300">
                    "Become AI Engineer in 5 months"
                  </button>
                  <button onClick={() => setAiInput('I want to switch to a DevOps role. I have 10 hours a week.')} className="border border-slate-800 px-3 py-1.5 rounded-lg hover:border-blue-500 transition hover:text-slate-300">
                    "Switch to DevOps"
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder="Type your study goal..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500"
                  onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                />
                <button 
                  onClick={handleAiSend}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 rounded-xl text-xs transition"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* MANUAL MODE VIEW */}
          {builderMode === 'manual' && !generatedRoadmap && (
            <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl space-y-6">
              
              <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-850 pb-3">
                <span>Step {manualStep} of 10</span>
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <span key={i} className={`w-3 h-1 rounded ${i + 1 <= manualStep ? 'bg-blue-500' : 'bg-slate-800'}`} />
                  ))}
                </div>
              </div>

              {manualStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-base">Question 1: What is your target career?</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {['Software Engineer', 'AI Engineer', 'ML Engineer', 'Data Scientist', 'Data Analyst', 'Cloud Engineer', 'Other'].map(r => (
                      <button
                        key={r}
                        onClick={() => setQCareer(r)}
                        className={`py-3 px-4 rounded-xl font-semibold border transition text-center ${
                          qCareer === r ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  {qCareer === 'Other' && (
                    <input 
                      type="text" 
                      placeholder="Specify your custom role target..." 
                      value={qCustomCareer}
                      onChange={e => setQCustomCareer(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs mt-2"
                    />
                  )}
                </div>
              )}

              {manualStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-base">Question 2: What do you want to achieve?</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['Get a job', 'Prepare for interviews', 'Learn a new skill', 'Build projects', 'Career switch'].map(o => (
                      <button
                        key={o}
                        onClick={() => setQObjective(o)}
                        className={`py-3 px-4 rounded-xl font-semibold border transition text-center ${
                          qObjective === o ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {manualStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-base">Question 3: What is your current experience level?</h3>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
                      <button
                        key={l}
                        onClick={() => setQLevel(l)}
                        className={`py-3 px-4 rounded-xl font-semibold border transition text-center capitalize ${
                          qLevel === l ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {manualStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-base">Question 4: What skills do you already know?</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSkills.map(s => (
                      <button
                        key={s}
                        onClick={() => toggleSkill(s)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                          qSelectedSkills.includes(s) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-850 text-slate-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {manualStep === 5 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-base">Question 5: What is your target deadline?</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {['1 Month', '3 Months', '5 Months', '6 Months', '1 Year'].map(d => (
                      <button
                        key={d}
                        onClick={() => setQDeadline(d)}
                        className={`py-3 px-4 rounded-xl font-semibold border transition text-center ${
                          qDeadline === d ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {manualStep === 6 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-base">Question 6: How many hours can you study per week?</h3>
                    <span className="text-blue-400 font-bold text-sm">{qHours} hours</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="40" 
                    value={qHours} 
                    onChange={e => setQHours(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              )}

              {manualStep === 7 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-base">Question 7: How do you prefer to learn?</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['Video Courses', 'Reading Theory', 'Practical Labs', 'Projects Portfolio', 'Mixed learning'].map(p => (
                      <button
                        key={p}
                        onClick={() => togglePreference(p)}
                        className={`py-3 px-4 rounded-xl font-semibold border transition text-center ${
                          qPreference.includes(p) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {manualStep === 8 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-base">Question 8: How difficult should your path be?</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {['Comfortable', 'Balanced', 'Challenging', 'Aggressive'].map(d => (
                      <button
                        key={d}
                        onClick={() => setQDifficulty(d)}
                        className={`py-3 px-4 rounded-xl font-semibold border transition text-center ${
                          qDifficulty === d ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {manualStep === 9 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-base">Question 9: What specific areas are you most interested in?</h3>
                  <input 
                    type="text" 
                    placeholder="e.g. Deep learning, MLOps pipeline, frontend component rendering..." 
                    value={qInterest}
                    onChange={e => setQInterest(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {manualStep === 10 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-base">Question 10: Anything else we should know? (Optional)</h3>
                  <textarea 
                    placeholder="Add details about your timelines, work commitments..." 
                    value={qAdditional}
                    onChange={e => setQAdditional(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 h-28 resize-none"
                  />
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex justify-between pt-4 border-t border-slate-850">
                <button
                  disabled={manualStep === 1}
                  onClick={() => setManualStep(prev => prev - 1)}
                  className="bg-slate-800 disabled:opacity-50 text-slate-400 font-semibold px-4 py-2 rounded-xl text-xs border border-slate-800 hover:text-white"
                >
                  Previous
                </button>
                {manualStep < 10 ? (
                  <button
                    onClick={() => setManualStep(prev => prev + 1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl text-xs transition"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={generateManualRoadmap}
                    disabled={generating}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-xl text-xs transition"
                  >
                    {generating ? 'Calibrating Path...' : 'Generate My Learning Path'}
                  </button>
                )}
              </div>

            </div>
          )}
        </div>
      ) : (
        /* NORMAL DASHBOARD DATA WHEN ROADMAP EXISTS */
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Good morning, {profile?.full_name || 'Learner'}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Your goal: <span className="text-blue-400 font-semibold">{profile?.target_career || 'Not Set'}</span> • {profile?.target_deadline ? '5 months remaining' : 'No deadline set'}
              </p>
            </div>
            
            <button 
              onClick={async () => {
                // Wipe roadmap to re-trigger onboarding flow
                setLoading(true)
                await supabase.from('roadmaps').delete().eq('user_id', profile.id)
                await fetchUserData()
              }}
              className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RefreshCw size={14} />
              Rebuild Learning Path
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Overall Progress</p>
              <p className="text-2xl font-bold text-white mt-1">{overallProgress}%</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Readiness Index</p>
              <p className="text-2xl font-bold text-white mt-1">{readiness}%</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${readiness}%` }} />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">XP Accumulated</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1 flex items-center gap-1">
                {xp.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 mt-3">Level {Math.floor(xp / 1000) + 1} Scholar</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Current Streak</p>
              <p className="text-2xl font-bold text-orange-400 mt-1 flex items-center gap-1">
                {streak} Days
              </p>
              <p className="text-[10px] text-slate-500 mt-3">Active learning streak</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Skills Mastered</p>
              <p className="text-2xl font-bold text-white mt-1">{skillsMastered}</p>
              <p className="text-[10px] text-slate-500 mt-3">Curriculum target</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Weekly Study</p>
              <p className="text-2xl font-bold text-white mt-1">{weeklyHours} hrs</p>
              <p className="text-[10px] text-slate-500 mt-3">Curriculum target pace</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Continue Learning */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-800/30 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
                <div className="space-y-2 relative z-10">
                  <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {currentModule?.status === 'Completed' ? 'Completed Module' : 'Current Module'}
                  </span>
                  <h2 className="text-2xl font-bold text-white">{currentModule?.title || 'No Active Module'}</h2>
                  <p className="text-slate-400 text-sm max-w-md">
                    {currentModule?.description || 'Build your study path and generate lessons using the onboarding questionnaire.'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                    <span className="flex items-center gap-1"><BookOpen size={14} /> {currentModule?.milestone || 'Ready to learn'}</span>
                    {currentModule?.duration && <span className="flex items-center gap-1"><Clock size={14} /> {currentModule.duration}</span>}
                  </div>
                </div>
                {hasRoadmap && (
                  <Link
                    href={
                      activeRoadmapId && currentModule?.id
                        ? `/tutor?roadmapId=${encodeURIComponent(activeRoadmapId)}&lessonId=${encodeURIComponent(currentModule.id)}`
                        : '/tutor'
                    }
                    className="relative z-10 shrink-0"
                  >
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:translate-y-[1px] transition w-full">
                      <Play size={16} fill="white" />
                      Continue Lesson
                    </button>
                  </Link>
                )}
              </div>

              {/* Activity Graph */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Learning Activity</h3>
                  <p className="text-xs text-slate-500">Weekly breakdown of hours spent</p>
                </div>
                <div className="h-64">
                  <LearningActivityChart data={activityData} />
                </div>
              </div>
            </div>

            {/* Right Column: Daily Missions */}
            <div className="space-y-6">
              
              {/* Today's Missions */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Today's Missions</h3>
                <div className="space-y-4">
                  {missions.length > 0 ? (
                    missions.map((m, idx) => {
                      const innerMission = m.daily_missions
                      const isCompleted = m.status === 'completed' || m.status === 'claimed'
                      const isClaimed = m.status === 'claimed'

                      return (
                        <div key={m.id || idx} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-semibold text-white">{innerMission?.title || 'Daily Mission'}</h4>
                              <p className="text-xs text-slate-500">{innerMission?.description || 'Complete daily objectives.'}</p>
                            </div>
                            <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-bold px-2 py-0.5 rounded-md">
                              +{innerMission?.xp_reward || 50} XP
                            </span>
                          </div>
                          <div className="flex justify-between items-center gap-4 text-xs">
                            <div className="flex-1 bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-1" style={{ width: isCompleted ? '100%' : '0%' }} />
                            </div>
                            <span className="text-slate-400">{isCompleted ? '1/1' : '0/1'}</span>
                            {isClaimed ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg font-medium cursor-default">
                                Claimed
                              </span>
                            ) : isCompleted ? (
                              <button 
                                onClick={() => claimXp(m.id)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg transition font-medium"
                              >
                                Claim XP
                              </button>
                            ) : (
                              <Link href={(() => {
                                const t = (innerMission?.title || '').toLowerCase()
                                if (t.includes('practice') || t.includes('tutor')) return '/tutor'
                                if (t.includes('training') || t.includes('mcq') || t.includes('debug')) return '/training'
                                if (t.includes('project')) return '/projects'
                                return '/roadmap'
                              })()}>
                                <button className="bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-lg transition font-medium">
                                  Start
                                </button>
                              </Link>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">No active daily missions.</p>
                  )}
                </div>
              </div>

              {/* Recent Mistakes summary */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Mistake Log Summary</h3>
                <div className="space-y-4">
                  {mistakes.length > 0 ? (
                    <div className="flex gap-3 text-sm">
                      <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-slate-200 font-semibold">{mistakes[0].error_type || 'Conceptual Error'}: {mistakes[0].question.substring(0, 50)}...</p>
                        <p className="text-xs text-slate-500 mt-0.5">{mistakes.length} total mistakes logged in your profile.</p>
                        <Link href="/mistakes">
                          <button className="text-blue-400 hover:underline text-xs font-semibold mt-2 flex items-center gap-1">
                            Start Revision Drill <ArrowRight size={12} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4">No logged mistakes. Outstanding work!</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  )
}
