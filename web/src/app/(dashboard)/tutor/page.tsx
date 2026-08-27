'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  BookOpen, 
  HelpCircle, 
  FileText, 
  Briefcase, 
  Terminal, 
  Layers, 
  Compass, 
  Send,
  CheckCircle,
  Play,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { getFallbackContent, type GeneratedTutorContent } from '@/components/tutor/tutorContent'
import { recordXpTransaction } from '@/components/training/statsHelper'
import { triggerMissionCompletion } from '@/components/missions/missionsGenerator'
import { recalculateCareerReadiness } from '@/components/readiness/readinessCalculator'

type TutorMode = 'explain' | 'socratic' | 'exam' | 'interview' | 'debug' | 'revision' | 'mentor'

type TutorMessage = {
  role: 'user' | 'assistant'
  content: string
  moduleId: string
}

type Roadmap = {
  id: string
  title: string
  description: string | null
  target_role: string | null
  estimated_duration: string | null
  status: string | null
}

type RoadmapModule = {
  id: string
  roadmap_id: string
  user_id: string
  title: string
  description: string | null
  order_index: number
  duration: string | null
  milestone: string | null
  status: string | null
}

const modes = [
  { id: 'explain', name: 'Explain', icon: BookOpen },
  { id: 'socratic', name: 'Socratic', icon: HelpCircle },
  { id: 'exam', name: 'Exam', icon: FileText },
  { id: 'interview', name: 'Interview', icon: Briefcase },
  { id: 'debug', name: 'Debug', icon: Terminal },
  { id: 'revision', name: 'Revision', icon: Layers },
  { id: 'mentor', name: 'Mentor', icon: Compass },
] as const

export default function TutorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-sm text-slate-500 animate-pulse">Initializing tutor session...</span>
      </div>
    }>
      <TutorPageContent />
    </Suspense>
  )
}

function TutorPageContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedRoadmapId = searchParams.get('roadmapId')
  const requestedLessonId = searchParams.get('lessonId')
  const requestedLessonIndexParam = searchParams.get('lessonIndex') || searchParams.get('lesson') || ''
  const [activeMode, setActiveMode] = useState<TutorMode>('explain')
  const [input, setInput] = useState('')
  const [examStarted, setExamStarted] = useState(false)
  const [selectedExamOption, setSelectedExamOption] = useState<number | null>(null)
  const [examAnswered, setExamAnswered] = useState(false)
  
  const [userId, setUserId] = useState<string | null>(null)
  const [careerGoal, setCareerGoal] = useState('Fullstack Developer')
  
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null)
  const [roadmapModules, setRoadmapModules] = useState<RoadmapModule[]>([])
  const [activeModule, setActiveModule] = useState<RoadmapModule | null>(null)
  const [previousModule, setPreviousModule] = useState<RoadmapModule | null>(null)
  const [nextModule, setNextModule] = useState<RoadmapModule | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  const [content, setContent] = useState<GeneratedTutorContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [messages, setMessages] = useState<TutorMessage[]>([])
  
  const [flashcardFlipped, setFlashcardFlipped] = useState(false)

  const activeModuleIndex = activeModule
    ? roadmapModules.findIndex(module => module.id === activeModule.id)
    : -1
  const lessonNumber = activeModuleIndex >= 0 ? activeModuleIndex + 1 : activeModule?.order_index
  const completedBeforeActive = useMemo(
    () => activeModuleIndex >= 0
      ? roadmapModules.slice(0, activeModuleIndex).filter(module => module.status === 'Completed')
      : [],
    [activeModuleIndex, roadmapModules]
  )
  const initialAssistantMessage = useMemo(
    () => activeModule
      ? `You're continuing Lesson ${lessonNumber || activeModule.order_index}: "${activeModule.title}" from "${activeRoadmap?.title || 'your active roadmap'}". We'll build from ${completedBeforeActive.length ? completedBeforeActive.map(module => module.title).join(', ') : 'your current starting point'} and focus on ${activeModule.description || activeModule.title}.`
      : '',
    [activeModule, activeRoadmap, completedBeforeActive, lessonNumber]
  )

  const getTutorHref = (module: RoadmapModule | null) =>
    activeRoadmap?.id && module?.id
      ? `/tutor?roadmapId=${encodeURIComponent(activeRoadmap.id)}&lessonId=${encodeURIComponent(module.id)}`
      : '/tutor'
  const visibleMessages = activeModule
    ? messages.filter(message => message.moduleId === activeModule.id)
    : []

  // 1. Fetch user profile, active module, and next module
  useEffect(() => {
    const fetchRoadmapModule = async () => {
      setLoading(true)
      setLoadError(null)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }
      const uid = session.user.id
      setUserId(uid)

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_career')
        .eq('id', uid)
        .single()
      if (profile?.target_career) {
        setCareerGoal(profile.target_career)
      }

      const requestedLessonIndex = Number(requestedLessonIndexParam)

      const roadmapQuery = supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', uid)

      const { data: selectedRoadmap } = requestedRoadmapId
        ? await roadmapQuery.eq('id', requestedRoadmapId).maybeSingle()
        : await roadmapQuery.eq('status', 'active').maybeSingle()

      if (!selectedRoadmap) {
        setActiveRoadmap(null)
        setRoadmapModules([])
        setActiveModule(null)
        setPreviousModule(null)
        setNextModule(null)
        setContent(null)
        setLoadError(requestedRoadmapId ? 'Roadmap not found.' : 'No active roadmap found.')
        setLoading(false)
        return
      }

      setActiveRoadmap(selectedRoadmap)

      // Fetch all roadmap modules for the selected existing roadmap
      const { data: modules } = await supabase
        .from('roadmap_modules')
        .select('*')
        .eq('roadmap_id', selectedRoadmap.id)
        .eq('user_id', uid)
        .order('order_index', { ascending: true })

      if (!modules || modules.length === 0) {
        setRoadmapModules([])
        setActiveModule(null)
        setPreviousModule(null)
        setNextModule(null)
        setContent(null)
        setLoadError('This roadmap has no lessons yet.')
        setLoading(false)
        return
      }

      const typedModules = modules as RoadmapModule[]
      setRoadmapModules(typedModules)

      let current: RoadmapModule | undefined
      if (requestedLessonId) {
        current = typedModules.find(module => module.id === requestedLessonId)
        if (!current) {
          setActiveModule(null)
          setPreviousModule(null)
          setNextModule(null)
          setContent(null)
          setLoadError('Lesson not found for this roadmap.')
          setLoading(false)
          return
        }
      } else if (Number.isFinite(requestedLessonIndex) && requestedLessonIndex > 0) {
        current = typedModules.find(module => module.order_index === requestedLessonIndex) || typedModules[requestedLessonIndex - 1]
        if (!current) {
          setActiveModule(null)
          setPreviousModule(null)
          setNextModule(null)
          setContent(null)
          setLoadError('Lesson not found for this roadmap.')
          setLoading(false)
          return
        }
      } else {
        const inProgress = typedModules.find(module => module.status === 'In Progress')
        const firstAvailable = typedModules.find(module => module.status !== 'Locked')
        current = inProgress || firstAvailable || typedModules[0]
      }

      const selectedIndex = typedModules.findIndex(module => module.id === current.id)
      setActiveModule(current)
      setPreviousModule(selectedIndex > 0 ? typedModules[selectedIndex - 1] : null)
      setNextModule(selectedIndex >= 0 && selectedIndex < typedModules.length - 1 ? typedModules[selectedIndex + 1] : null)
      setLoading(false)
    }

    fetchRoadmapModule()
  }, [supabase, requestedRoadmapId, requestedLessonId, requestedLessonIndexParam])

  // 2. Generate content when active module changes
  useEffect(() => {
    if (!activeModule) return
    let cancelled = false

    const loadContent = async () => {
      setAiGenerating(true)
      const moduleTitle = activeModule.title
      const fallbackContent = getFallbackContent(moduleTitle, careerGoal)
      const cacheKey = `tutor-content:${activeRoadmap?.id || 'active'}:${activeModule.id}:${careerGoal}`

      const cachedContent = sessionStorage.getItem(cacheKey)
      if (cachedContent) {
        try {
          setContent(JSON.parse(cachedContent))
        } catch {
          setContent(fallbackContent)
        }
      } else {
        setContent(fallbackContent)
      }
      
      // Attempt to load from Gemini AI
      try {
        const previousContext = completedBeforeActive.map(module => module.title).join(', ') || 'No completed previous lessons yet'
        const prompt = `Generate educational study guide content for this existing roadmap lesson.
        Career goal: "${careerGoal}"
        Roadmap: "${activeRoadmap?.title || 'Active roadmap'}"
        Lesson ${lessonNumber || activeModule.order_index} of ${roadmapModules.length || 'the roadmap'}: "${moduleTitle}"
        Lesson description/content: "${activeModule.description || 'No description provided'}"
        Lesson milestone: "${activeModule.milestone || 'No milestone provided'}"
        Previous learning context: "${previousContext}"
        Return ONLY a JSON object (no markdown, no quotes, no extra text) with the following structure:
        {
          "explanation": "Clear explanation of the concept...",
          "analogy": "A relatable analogy to explain it...",
          "keyTakeaway": "Key operational takeaway about it...",
          "socraticProblem": "A conceptual problem for the student to solve...",
          "socraticGuidingQuestion": "A question to guide them to the answer without telling them...",
          "interviewQuestion": "A typical technical interview question about this...",
          "interviewDescription": "Detail on what a senior developer would look for...",
          "flashcardQuestion": "Short flashcard question...",
          "flashcardAnswer": "Short flashcard answer...",
          "mentorProjectFocus": "Project suggestion related to this..."
        }`

        const controller = new AbortController()
        const timeoutId = window.setTimeout(() => controller.abort(), 8000)
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
          signal: controller.signal
        })
        window.clearTimeout(timeoutId)
        const data = await res.json()
        if (!cancelled && data.response) {
          // Clean possible wrapper formats
          let cleanJson = data.response.trim()
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.substring(7, cleanJson.length - 3).trim()
          } else if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.substring(3, cleanJson.length - 3).trim()
          }
          const parsed = JSON.parse(cleanJson)
          sessionStorage.setItem(cacheKey, JSON.stringify(parsed))
          setContent(parsed)
          setAiGenerating(false)
          return
        }
      } catch (err) {
        console.warn('Gemini tutor generation failed, falling back to local database:', err)
      }

      if (!cancelled) {
        setAiGenerating(false)
      }
    }

    loadContent()
    return () => {
      cancelled = true
    }
  }, [activeModule, careerGoal, activeRoadmap, roadmapModules, lessonNumber, completedBeforeActive])

  // 3. Handle Complete Lesson action
  const handleCompleteLesson = async () => {
    if (!userId || !activeRoadmap || !activeModule || activeModule.status === 'Completed') return
    setCompleting(true)

    try {
      // a. Mark active module Completed in Supabase
      await supabase
        .from('roadmap_modules')
        .update({ status: 'Completed' })
        .eq('id', activeModule.id)
        .eq('roadmap_id', activeRoadmap.id)
        .eq('user_id', userId)

      // b. Unlock next module (set In Progress)
      if (nextModule && nextModule.status === 'Locked') {
        await supabase
          .from('roadmap_modules')
          .update({ status: 'In Progress' })
          .eq('id', nextModule.id)
          .eq('roadmap_id', activeRoadmap.id)
          .eq('user_id', userId)
      }

      // c. Award XP
      await recordXpTransaction(userId, 100, `Completed Lesson: ${activeModule.title}`)

      // d. Complete mission
      await triggerMissionCompletion(userId, 'practice')

      // e. Recalculate Career Readiness index
      await recalculateCareerReadiness(userId)

      alert(`🎉 Congratulations! You have completed: "${activeModule.title}" and earned +100 XP! The next module is now unlocked.`)
      router.push('/dashboard')
    } catch (err) {
      console.error('Error completing module:', err)
    } finally {
      setCompleting(false)
    }
  }

  // Handle messages in Socratic chat / Copilot
  const handleSendMessage = () => {
    if (!input.trim() || !activeModule) return
    const userMsg = input.trim()
    const moduleId = activeModule.id
    setMessages(prev => [...prev, { role: 'user', content: userMsg, moduleId }])
    setInput('')

    // Simulate AI response based on mode
    setTimeout(() => {
      let reply = 'I am analyzing that. Let me look at your current roadmap context to reply...'
      if (activeMode === 'socratic') {
        reply = `Good reasoning. Consider what components or design constraints in "${activeModule?.title}" apply here. How does that change your hypothesis?`
      } else if (activeMode === 'explain') {
        reply = `That is correct. In "${activeModule?.title}", this helps limit memory leaks and ensures optimized execution.`
      }
      setMessages(prev => [...prev, { role: 'assistant', content: reply, moduleId }])
    }, 1000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-sm text-slate-500 animate-pulse">Initializing tutor session...</span>
      </div>
    )
  }

  if (!activeModule || !content) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
        <h3 className="font-bold text-white text-lg">
          {loadError || 'No Active Lessons Available'}
        </h3>
        <p className="text-xs text-slate-500">
          {loadError
            ? 'Open your learning roadmap and choose an available lesson, or use the current active lesson from your dashboard.'
            : 'Go to your learning roadmap and start/generate a study path to populate the tutor console.'}
        </p>
        <Link href="/roadmap" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition">
          Open Learning Roadmap
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="space-y-1">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase">
            {activeRoadmap?.title || 'Active Study Path'}
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{activeModule.title}</h1>
          <p className="text-slate-400 text-xs mt-1">{activeModule.description}</p>
          <div className="flex flex-wrap items-center gap-2 pt-3 text-[10px] font-semibold uppercase">
            <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400">
              Lesson {lessonNumber || activeModule.order_index} of {roadmapModules.length}
            </span>
            <span className={`px-2 py-1 rounded border ${
              activeModule.status === 'Completed'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : activeModule.status === 'In Progress'
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              {activeModule.status}
            </span>
            {activeModule.milestone && (
              <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400">
                {activeModule.milestone}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 pt-2 max-w-2xl">
            Previous context: {completedBeforeActive.length
              ? completedBeforeActive.map(module => module.title).join(', ')
              : 'This is the first incomplete step in your current path.'}
          </p>
        </div>
        
        <button
          onClick={handleCompleteLesson}
          disabled={completing || activeModule.status === 'Completed'}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 active:scale-95 disabled:bg-slate-850 disabled:text-slate-600 shrink-0"
        >
          <CheckCircle size={16} />
          {completing ? 'Completing...' : activeModule.status === 'Completed' ? 'Lesson Completed' : 'Mark Lesson Completed'}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        {previousModule ? (
          <Link
            href={getTutorHref(previousModule)}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-2"
          >
            <ChevronLeft size={14} />
            Previous Lesson
          </Link>
        ) : (
          <span className="text-xs text-slate-600">Start of roadmap</span>
        )}

        {nextModule ? (
          <Link
            href={getTutorHref(nextModule)}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-2"
          >
            Next Lesson
            <ChevronRight size={14} />
          </Link>
        ) : (
          <span className="text-xs text-slate-600">End of roadmap</span>
        )}
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {modes.map((mode) => {
          const Icon = mode.icon
          const isActive = activeMode === mode.id
          return (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id)
                setExamStarted(false)
                setSelectedExamOption(null)
                setExamAnswered(false)
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={14} />
              {mode.name}
            </button>
          )
        })}
      </div>

      {/* Content Viewports based on Mode */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[380px] flex flex-col justify-between relative">
        {aiGenerating && (
          <div className="absolute inset-0 bg-slate-950/60 rounded-2xl flex items-center justify-center backdrop-blur-xs z-10">
            <span className="text-xs text-blue-400 flex items-center gap-2 animate-pulse">
              <Sparkles size={16} /> Generating personalized tutor content...
            </span>
          </div>
        )}

        {initialAssistantMessage && (
          <div className="mb-5 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl text-blue-200 text-xs leading-relaxed">
            {initialAssistantMessage}
          </div>
        )}

        {/* Explain Mode */}
        {activeMode === 'explain' && (
          <div className="space-y-6 flex-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="text-blue-500" size={18} />
              Explain Concept
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                <span className="text-[9px] text-blue-400 font-semibold uppercase tracking-wider">Concept Definition</span>
                <p className="text-slate-300 text-sm leading-relaxed">{content.explanation}</p>
              </div>

              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                <span className="text-[9px] text-purple-400 font-semibold uppercase tracking-wider">Analogy</span>
                <p className="text-slate-300 text-sm leading-relaxed">{content.analogy}</p>
              </div>

              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                <span className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider">Key Takeaway</span>
                <p className="text-slate-300 text-sm leading-relaxed"><strong>Important:</strong> {content.keyTakeaway}</p>
              </div>
            </div>
          </div>
        )}

        {/* Socratic Mode */}
        {activeMode === 'socratic' && (
          <div className="space-y-6 flex-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="text-blue-500" size={18} />
              Socratic Guided Dialogue
            </h3>
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-blue-300 text-xs">
              💡 The AI Tutor will guide you step-by-step to build critical logic instead of immediately showing answers.
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Problem</p>
                <p className="text-slate-200 text-sm font-semibold">{content.socraticProblem}</p>
              </div>
              
              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-1">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">AI Guiding Question</p>
                <p className="text-slate-300 text-xs leading-relaxed">{content.socraticGuidingQuestion}</p>
              </div>

              {/* Chat Thread */}
              {visibleMessages.map((m, i) => (
                <div key={i} className={`flex gap-3 text-xs ${m.role === 'user' ? 'justify-end' : ''}`}>
                  <div className={`p-3 rounded-xl max-w-md ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-300 border border-slate-850'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exam Mode */}
        {activeMode === 'exam' && (
          <div className="space-y-6 flex-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="text-blue-500" size={18} />
              Mini-Exam Quiz
            </h3>

            {!examStarted ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <p className="text-slate-450 text-xs max-w-sm text-center">
                  Take a quick module quiz on &quot;{activeModule.title}&quot; to verify your competency retention.
                </p>
                <button 
                  onClick={() => setExamStarted(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                  <Play size={14} fill="white" />
                  Start Flash Assessment
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex justify-between items-center text-xs border-b border-slate-850 pb-3 text-slate-550">
                  <span>Question 1 of 1</span>
                  <span className="text-amber-500 font-semibold">Active Assessment</span>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-white">{content.interviewQuestion}</h4>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      onClick={() => !examAnswered && setSelectedExamOption(0)}
                      disabled={examAnswered}
                      className={`text-left p-3.5 rounded-xl text-xs transition border ${
                        examAnswered
                          ? 'bg-green-500/10 border-green-500/20 text-green-400'
                          : selectedExamOption === 0
                            ? 'bg-blue-500/10 border-blue-500/35 text-blue-300'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      A. Relates directly to resolving the model and optimization tradeoffs correctly.
                    </button>
                    <button
                      onClick={() => !examAnswered && setSelectedExamOption(1)}
                      disabled={examAnswered}
                      className={`text-left p-3.5 rounded-xl text-xs transition border ${
                        examAnswered
                          ? 'bg-slate-950/20 border-slate-800 text-slate-500'
                          : selectedExamOption === 1
                            ? 'bg-blue-500/10 border-blue-500/35 text-blue-300'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      B. Represents an unstable approach that increases overfitting parameters.
                    </button>
                  </div>

                  {!examAnswered ? (
                    <button
                      onClick={() => selectedExamOption !== null && setExamAnswered(true)}
                      disabled={selectedExamOption === null}
                      className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-xl transition text-xs"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-semibold">
                        Correct answer selected! Lesson review score updated.
                      </div>
                      <p className="text-xs text-slate-400">{content.explanation}</p>
                      <button
                        onClick={() => {
                          setExamStarted(false)
                          setSelectedExamOption(null)
                          setExamAnswered(false)
                        }}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Reset Quiz
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interview Mode */}
        {activeMode === 'interview' && (
          <div className="space-y-6 flex-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="text-blue-500" size={18} />
              Technical Interview Simulator
            </h3>
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span className="font-semibold uppercase tracking-wider text-blue-400">Target Role: {careerGoal}</span>
                <span>Category: Technical Core</span>
              </div>
              <h4 className="text-sm font-bold text-white">Interview Question: {content.interviewQuestion}</h4>
              <p className="text-slate-300 text-xs leading-relaxed">{content.interviewDescription}</p>
            </div>

            <div className="space-y-3">
              {visibleMessages.map((m, i) => (
                <div key={i} className={`flex gap-3 text-xs ${m.role === 'user' ? 'justify-end' : ''}`}>
                  <div className={`p-3 rounded-xl max-w-md ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-300 border border-slate-850'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Mode */}
        {activeMode === 'debug' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal className="text-blue-500" size={18} />
                  Code Bug Hunter
                </h3>
                <p className="text-slate-450 text-xs mt-1">Paste code related to &quot;{activeModule.title}&quot; to review bugs.</p>
              </div>
              <textarea 
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-blue-500 h-60 resize-none placeholder-slate-700"
                placeholder="# Paste code here..."
              />
            </div>
            <div className="border border-slate-800 bg-slate-950/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center text-slate-500 space-y-3">
              <Terminal size={28} className="text-slate-655" />
              <div>
                <h4 className="font-semibold text-slate-400 text-sm">Waiting for Code</h4>
                <p className="text-[10px] text-slate-600 mt-1">Submit your exercise code inside the editor to analyze.</p>
              </div>
            </div>
          </div>
        )}

        {/* Revision Mode */}
        {activeMode === 'revision' && (
          <div className="space-y-6 flex-1 flex flex-col items-center">
            <div className="w-full">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="text-blue-500" size={18} />
                Flashcard Revision
              </h3>
            </div>
            <div 
              onClick={() => setFlashcardFlipped(prev => !prev)}
              className="w-96 max-w-full h-56 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between p-6 cursor-pointer shadow-lg hover:border-blue-500/30 transition text-center relative overflow-hidden active:scale-98"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.02] rounded-full blur-xl" />
              <span className="text-[9px] text-blue-400 font-semibold tracking-wider uppercase text-left">Active Recall</span>
              
              <p className="text-sm font-bold text-white flex-1 flex items-center justify-center px-4 leading-relaxed">
                {flashcardFlipped ? content.flashcardAnswer : content.flashcardQuestion}
              </p>
              
              <div className="text-center text-[10px] text-slate-550 uppercase tracking-widest font-semibold">
                Click card to {flashcardFlipped ? 'see question' : 'reveal answer'}
              </div>
            </div>
          </div>
        )}

        {/* Mentor Mode */}
        {activeMode === 'mentor' && (
          <div className="space-y-6 flex-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="text-blue-500" size={18} />
              Career Mentor
            </h3>
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
              <h4 className="font-semibold text-white text-sm">Recommended Project Focus</h4>
              <p className="text-slate-300 text-xs leading-relaxed">{content.mentorProjectFocus}</p>
            </div>
          </div>
        )}

        {/* Dynamic chat inputs */}
        {activeMode !== 'exam' && activeMode !== 'revision' && activeMode !== 'debug' && (
          <div className="mt-8 border-t border-slate-850 pt-4">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Ask the AI Tutor anything about "${activeModule.title}"...`}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-4 pr-12 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500 transition text-xs"
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition active:scale-95"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
