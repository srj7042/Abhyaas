'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  User, 
  BookOpen, 
  Target, 
  Bell, 
  Shield, 
  Trash2, 
  Camera, 
  Check, 
  AlertTriangle,
  Mail,
  Compass
} from 'lucide-react'

type SettingsSection = 'profile' | 'preferences' | 'goal' | 'notifications' | 'security' | 'account'

const CAREER_GOALS = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Fullstack Engineer",
  "AI Engineer",
  "ML Engineer",
  "Data Scientist",
  "DevOps Engineer",
  "Mobile App Developer",
  "Cloud Architect",
  "Cybersecurity Analyst"
]

export default function SettingsPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<SettingsSection>('profile')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [showGoalNotification, setShowGoalNotification] = useState(false)
  
  // Profile / Form States (initialized to empty or initial default states, then hydrated from DB)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [targetCareer, setTargetCareer] = useState('')
  const [deadline, setDeadline] = useState('')
  const [weeklyHours, setWeeklyHours] = useState(10)
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [learningPreference, setLearningPreference] = useState('Interactive Labs')
  const [difficultyPreference, setDifficultyPreference] = useState('Standard')
  const [loading, setLoading] = useState(true)
  
  // Notification States
  const [dailyReminders, setDailyReminders] = useState(true)
  const [missionReminders, setMissionReminders] = useState(true)
  const [streakReminders, setStreakReminders] = useState(false)
  const [aiRecs, setAiRecs] = useState(true)
  const [weeklySummary, setWeeklySummary] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileData) {
        setFullName(profileData.full_name || '')
        setUsername(profileData.username || '')
        setEmail(profileData.email || '')
        setTargetCareer(profileData.target_career || '')
        setDeadline(profileData.target_deadline ? '5 Months' : '')
        setWeeklyHours(profileData.weekly_hours || 10)
        setExperienceLevel(profileData.experience_level || 'beginner')
        setLearningPreference(profileData.learning_preference || 'Interactive Labs')
      }
      setLoading(false)
    }

    fetchProfile()
  }, [supabase])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        username: username,
        email: email,
      })
      .eq('id', session.user.id)

    if (error) {
      alert("Error saving profile: " + error.message)
    } else {
      alert("Profile updated successfully!")
    }
  }

  const handlePreferencesSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase
      .from('profiles')
      .update({
        experience_level: experienceLevel,
        weekly_hours: weeklyHours,
        learning_preference: learningPreference,
      })
      .eq('id', session.user.id)

    if (error) {
      alert("Error saving preferences: " + error.message)
    } else {
      alert("Preferences saved successfully!")
    }
  }

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirmModal(true)
  }

  const handleGoalUpdate = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setRegenerating(true)
    try {
      // 1. Generate roadmap via Gemini
      const prompt = `
        Build a personalized learning path based on this profile:
        - Target Career: ${targetCareer}
        - Experience Level: ${experienceLevel}
        - Weekly study budget: ${weeklyHours} hours
        - Learning Preference: ${learningPreference}

        Respond ONLY with a JSON block inside triple backticks (\`\`\`json ... \`\`\`) in the exact format:
        {
          "target_career": "${targetCareer}",
          "duration": "5 Months",
          "weekly_hours": ${weeklyHours},
          "level": "${experienceLevel}",
          "skills": [
            {"name": "Skill 1", "status": "Mastered"},
            {"name": "Skill 2", "status": "30%"}
          ],
          "phases": [
            {
              "title": "Phase 1: Foundations",
              "description": "Short explanation of phase.",
              "duration": "4 weeks",
              "milestone": "Milestone description",
              "topics": ["Topic 1"],
              "projects": ["Project 1"]
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
      if (!res.ok) {
        throw new Error(data.error || 'Failed to communicate with AI')
      }

      const jsonMatch = data.response.match(/```json\s*([\s\S]*?)\s*```/)
      if (!jsonMatch || !jsonMatch[1]) {
        throw new Error('AI response did not contain a valid JSON roadmap block')
      }

      const generated = JSON.parse(jsonMatch[1])

      // 2. Database updates
      const userId = session.user.id

      // a. Update Profile Career Target
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          target_career: generated.target_career,
          weekly_hours: generated.weekly_hours,
          experience_level: generated.level.toLowerCase()
        })
        .eq('id', userId)

      if (profileError) throw profileError

      // b. Archive old roadmaps
      const { error: archiveError } = await supabase
        .from('roadmaps')
        .update({ status: 'archived' })
        .eq('user_id', userId)

      if (archiveError) throw archiveError

      // c. Create learning goal
      const { data: goalData, error: goalError } = await supabase
        .from('learning_goals')
        .insert({
          user_id: userId,
          goal_text: `Become a professional ${generated.target_career}`,
          target_role: generated.target_career,
          weekly_commitment: generated.weekly_hours,
          difficulty_preference: generated.level.toLowerCase()
        })
        .select()
        .single()

      if (goalError) throw goalError

      // d. Create new roadmap
      const { data: rdData, error: rdError } = await supabase
        .from('roadmaps')
        .insert({
          user_id: userId,
          goal_id: goalData.id,
          title: `${generated.target_career} Learning Track`,
          description: `Custom curriculum for ${generated.target_career}`,
          target_role: generated.target_career,
          estimated_duration: generated.duration
        })
        .select()
        .single()

      if (rdError) throw rdError

      // e. Insert modules
      const moduleInserts = generated.phases.map((phase: any, index: number) => ({
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

      setShowGoalNotification(true)
      setTimeout(() => setShowGoalNotification(false), 4000)

    } catch (err: any) {
      console.error('Goal update error:', err)
      alert("Failed to update goal: " + (err.message || err))
    } finally {
      setRegenerating(false)
    }
  }

  const handleDeleteAccount = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Cascade delete profile records
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', session.user.id)

    if (error) {
      alert("Error deleting account: " + error.message)
    } else {
      await supabase.auth.signOut()
      window.location.href = '/login'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-sm text-slate-500 animate-pulse">Loading settings panel...</span>
      </div>
    )
  }

  if (regenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-400 animate-pulse font-medium">Regenerating your personalized AI learning roadmap...</span>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'preferences', name: 'Learning Preferences', icon: BookOpen },
    { id: 'goal', name: 'Career Goal', icon: Target },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'account', name: 'Account', icon: Trash2 },
  ] as const

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-slate-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your personalized curriculum and dashboard parameters.</p>
      </div>

      {/* Main Settings Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[600px] shadow-2xl relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Local Sidebar */}
        <aside className="w-full md:w-64 bg-slate-950/40 border-r border-slate-800/80 p-6 flex flex-col gap-1 shrink-0 z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition text-left ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <Icon size={16} />
                {tab.name}
              </button>
            )
          })}
        </aside>

        {/* Content Panel */}
        <div className="flex-1 p-8 z-10 relative">
          
          {/* PROFILE VIEW */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="text-blue-500" /> Profile Details
              </h2>
              
              {/* Avatar Upload */}
              <div className="flex items-center gap-6 p-6 bg-slate-950/20 border border-slate-850 rounded-2xl">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-blue-600/20">
                    {username ? username.substring(0, 2).toUpperCase() : 'US'}
                  </div>
                  <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition border border-slate-900 active:translate-y-[1px]">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h4 className="font-bold text-white">Profile Picture</h4>
                  <p className="text-xs text-slate-500 mt-1">PNG or JPG. Max 2MB.</p>
                </div>
              </div>

              {/* Form inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Username</label>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-850">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 active:translate-y-[1px]">
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* PREFERENCES VIEW */}
          {activeTab === 'preferences' && (
            <form onSubmit={handlePreferencesSave} className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="text-blue-500" /> Learning Preferences
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Level selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Experience Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setExperienceLevel(lvl)}
                        className={`py-2.5 rounded-xl text-xs font-semibold capitalize transition ${
                          experienceLevel === lvl 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-950/50 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hours Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    <label>Weekly Study hours</label>
                    <span className="text-blue-400 font-bold">{weeklyHours} hrs</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="40" 
                    value={weeklyHours}
                    onChange={e => setWeeklyHours(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Learning Style */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Preferred Style</label>
                  <select 
                    value={learningPreference}
                    onChange={e => setLearningPreference(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 text-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Interactive Labs">Interactive Labs & Coding</option>
                    <option value="Theory & Concept Cards">Theory & Concept Cards</option>
                    <option value="Video Lectures & Code Along">Video Lectures & Code Along</option>
                  </select>
                </div>

                {/* Difficulty Style */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty preference</label>
                  <select 
                    value={difficultyPreference}
                    onChange={e => setDifficultyPreference(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 text-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Standard">Standard (Incremental)</option>
                    <option value="Challenging">Challenging (Steeper Curve)</option>
                    <option value="Research/Advanced">Research/Advanced (No Handholding)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-850">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 active:translate-y-[1px]">
                  Save Preferences
                </button>
              </div>
            </form>
          )}

          {/* CAREER GOAL VIEW */}
          {activeTab === 'goal' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="text-blue-500" /> Career Goal
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Visual Goal Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-blue-900/40 to-slate-950 border border-blue-500/20 p-6 rounded-2xl space-y-4 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
                  
                  <div className="space-y-2">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded">
                      Active Career Goal
                    </span>
                    <h3 className="text-3xl font-extrabold text-white mt-2">{targetCareer || 'None Set'}</h3>
                    <p className="text-sm text-slate-400">
                      {targetCareer ? `Goal: Become job-ready in ${deadline || '5 Months'}.` : 'Setup your goal below.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-4 text-xs">
                    <div>
                      <p className="text-slate-500 font-semibold uppercase">Deadline</p>
                      <p className="text-sm font-bold text-white mt-0.5">{deadline || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold uppercase">Commitment</p>
                      <p className="text-sm font-bold text-white mt-0.5">{weeklyHours} hrs/week</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold uppercase">Curriculum</p>
                      <p className="text-sm font-bold text-emerald-400 mt-0.5 capitalize">{experienceLevel}</p>
                    </div>
                  </div>
                </div>

                {/* Info Note */}
                <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl flex flex-col justify-center text-center space-y-3">
                  <Compass size={32} className="text-slate-500 mx-auto" />
                  <h4 className="font-bold text-slate-300">Unified Goal Consistency</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Changing your target career recalculates and regenerates your learning roadmap timeline and all AI learning assistant parameters.
                  </p>
                </div>
              </div>

              {/* Goal Update Form */}
              <form onSubmit={handleGoalSubmit} className="space-y-4 pt-4 border-t border-slate-850">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Career</label>
                    <select 
                      value={targetCareer} 
                      onChange={e => setTargetCareer(e.target.value)} 
                      className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
                    >
                      <option value="" disabled>Select Career Goal</option>
                      {(CAREER_GOALS.includes(targetCareer) ? CAREER_GOALS : (targetCareer ? [...CAREER_GOALS, targetCareer] : CAREER_GOALS)).map((g) => (
                        <option key={g} value={g} className="bg-slate-900 text-slate-200">
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Deadline</label>
                    <input 
                      type="text" 
                      value={deadline} 
                      onChange={e => setDeadline(e.target.value)} 
                      placeholder="e.g. 5 Months, 1 Year..."
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition" 
                    />
                  </div>
                </div>

                {showGoalNotification && (
                  <div className="p-4 bg-blue-950/40 border border-blue-800/30 rounded-xl text-blue-400 text-xs flex gap-2 items-center animate-pulse">
                    <Check size={16} />
                    Career goal changed. Personalized roadmap & tutor modules are being updated.
                  </div>
                )}

                <div className="flex justify-end">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 active:translate-y-[1px]">
                    Update Career Goal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* NOTIFICATIONS VIEW */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bell className="text-blue-500" /> Notification Toggles
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-950/20 border border-slate-850 rounded-2xl">
                  <div>
                    <h4 className="font-semibold text-white">Daily Learning Reminders</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Receive prompt check-ins to maintain streak consistency.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={dailyReminders} 
                    onChange={e => setDailyReminders(e.target.checked)} 
                    className="w-5 h-5 rounded border-slate-800 text-blue-600 focus:ring-blue-500" 
                  />
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-950/20 border border-slate-850 rounded-2xl">
                  <div>
                    <h4 className="font-semibold text-white">Daily Mission Alerts</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Alerts when daily scholar missions are loaded.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={missionReminders} 
                    onChange={e => setMissionReminders(e.target.checked)} 
                    className="w-5 h-5 rounded border-slate-800 text-blue-600 focus:ring-blue-500" 
                  />
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-950/20 border border-slate-850 rounded-2xl">
                  <div>
                    <h4 className="font-semibold text-white">Streak Reminders</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Warning alerts when streak is in danger of resetting.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={streakReminders} 
                    onChange={e => setStreakReminders(e.target.checked)} 
                    className="w-5 h-5 rounded border-slate-800 text-blue-600 focus:ring-blue-500" 
                  />
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-950/20 border border-slate-850 rounded-2xl">
                  <div>
                    <h4 className="font-semibold text-white">AI Recommendations</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Periodic emails about new course material or path revisions.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={aiRecs} 
                    onChange={e => setAiRecs(e.target.checked)} 
                    className="w-5 h-5 rounded border-slate-800 text-blue-600 focus:ring-blue-500" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECURITY VIEW */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="text-blue-500" /> Security Settings
              </h2>

              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-4">
                <h3 className="font-semibold text-white">Account Email status</h3>
                <div className="flex items-center gap-4 text-sm">
                  <Mail className="text-slate-500" />
                  <div>
                    <p className="text-slate-200">{email || 'Not logged in'}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded mt-1">
                      <Check size={10} /> Verified Account
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT & DANGER ZONE VIEW */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
                <Trash2 /> Danger Zone
              </h2>

              <div className="bg-red-950/10 border border-red-500/20 p-6 rounded-2xl space-y-4">
                <div className="flex gap-4 items-start">
                  <AlertTriangle className="text-red-500 mt-1 shrink-0" size={24} />
                  <div>
                    <h3 className="text-lg font-bold text-white">Delete Profile Account</h3>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                      Permanently delete your profile. Once confirmed, all learning data, roadmaps, progress records, assessments, mistakes logbook, projects, daily missions, and AI conversation history will be permanently deleted.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-red-500/10">
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-650 hover:bg-red-750 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition"
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 mb-2">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Are you absolutely sure?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This action is irreversible. All of your personalized learning tracks, masteries, streak details, assessments, and conversational logs will be deleted from our PostgreSQL server.
              </p>
            </div>
            
            <div className="flex gap-3 text-xs">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl transition border border-slate-700"
              >
                No, Keep Account
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-650 hover:bg-red-750 text-white font-bold py-3 rounded-xl transition"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Update Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-500 mb-2">
                <Target size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Regenerate Roadmap?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to change your career goal to <strong className="text-white">"{targetCareer}"</strong>? 
                This will regenerate and replace your current learning roadmap. Your existing progress will be archived.
              </p>
            </div>
            
            <div className="flex gap-3 text-xs">
              <button 
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl transition border border-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowConfirmModal(false)
                  handleGoalUpdate()
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition cursor-pointer"
              >
                Yes, Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
