'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Dumbbell, ArrowRight, BookOpen, AlertCircle, Award } from 'lucide-react'
import dynamic from 'next/dynamic'
import { getLocalDeckStats } from '@/components/training/statsHelper'
import { trainingChallenges } from '@/components/training/trainingData'

const TrainingSession = dynamic(() => import('@/components/training/TrainingSession'), { ssr: false })

type DeckCategory = 'coding' | 'mcqs' | 'sql' | 'debugging'

interface DeckType {
  category: DeckCategory
  title: string
  desc: string
  count: number
  accuracy: number
  attempts: number
}

export default function TrainingPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [careerGoal, setCareerGoal] = useState('Fullstack Developer')
  const [activeModule, setActiveModule] = useState('')
  const [activeDeck, setActiveDeck] = useState<DeckCategory | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [xp, setXp] = useState(0)

  // Initial Decks configuration
  const [decks, setDecks] = useState<DeckType[]>([
    { category: 'coding', title: 'Coding Problems', desc: 'Personalized coding tasks designed for your target skills.', count: 0, accuracy: 0, attempts: 0 },
    { category: 'mcqs', title: 'MCQs', desc: 'Concept testing and vocabulary check with explanations.', count: 0, accuracy: 0, attempts: 0 },
    { category: 'sql', title: 'SQL & Database Design', desc: 'Database optimization, querying, and schema challenges.', count: 0, accuracy: 0, attempts: 0 },
    { category: 'debugging', title: 'Debugging Scenarios', desc: 'Real-world incident simulation and code error models.', count: 0, accuracy: 0, attempts: 0 },
  ])

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const uid = session.user.id
      setUserId(uid)

      // Fetch user profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_career')
        .eq('id', uid)
        .single()
      if (profile?.target_career) {
        setCareerGoal(profile.target_career)
      }

      // Fetch active roadmap progress
      const { data: activeRoadmap } = await supabase
        .from('roadmaps')
        .select('id')
        .eq('user_id', uid)
        .eq('status', 'active')
        .single()

      if (activeRoadmap) {
        const { data: currentModule } = await supabase
          .from('roadmap_modules')
          .select('title')
          .eq('roadmap_id', activeRoadmap.id)
          .eq('status', 'In Progress')
          .order('order_index', { ascending: true })
          .limit(1)
          .single()

        if (currentModule) {
          setActiveModule(currentModule.title)
        }
      }

      // Fetch current XP transaction total
      const { data: xpData } = await supabase
        .from('xp_transactions')
        .select('amount')
        .eq('user_id', uid)
      if (xpData) {
        const total = xpData.reduce((sum, item) => sum + item.amount, 0)
        setXp(total)
      }

      // Calibrate total challenges count and pull localStorage attempts/accuracy stats
      const updatedDecks = decks.map(deck => {
        // Filter question pool count matching this category
        const availableCount = trainingChallenges.filter(c => c.category === deck.category).length
        const localStats = getLocalDeckStats(uid, deck.category)

        return {
          ...deck,
          count: availableCount,
          attempts: localStats.attempts,
          accuracy: localStats.accuracy
        }
      })

      setDecks(updatedDecks)
      setLoading(false)
    }

    fetchUserData()
  }, [supabase, activeDeck]) // Refetch and refresh stats when returning from active session

  const activeDeckConfig = useMemo(() => {
    if (!activeDeck) return null
    return decks.find(d => d.category === activeDeck)
  }, [activeDeck, decks])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-sm text-slate-500 animate-pulse">Calibrating personalized training decks...</span>
      </div>
    )
  }

  // Active Session View
  if (activeDeck && activeDeckConfig && userId) {
    return (
      <TrainingSession
        userId={userId}
        category={activeDeck}
        deckTitle={activeDeckConfig.title}
        careerGoal={careerGoal}
        currentRoadmapModule={activeModule}
        pastMistakes={[]} // Handled internally
        onExit={() => setActiveDeck(null)}
      />
    )
  }

  // Main Deck Dashboard
  return (
    <div className="space-y-8 max-w-5xl mx-auto text-slate-200">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Training Deck</h1>
          <p className="text-slate-400 text-sm mt-1">Strengthen your problem-solving metrics with active labs.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <Award className="text-yellow-400" />
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Scholar XP</p>
            <p className="text-sm font-bold text-white">
              {xp.toLocaleString()} XP
            </p>
          </div>
        </div>
      </div>

      {/* Target focus indicator banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3 text-xs text-blue-300">
        <BookOpen className="text-blue-400 shrink-0" size={18} />
        <div>
          <span className="font-bold text-white block">Personalized recommendations active:</span>
          <span>Targeting <strong className="text-white">{careerGoal}</strong> career path. Focus module: <strong className="text-white">{activeModule || 'Core Fundamentals'}</strong>.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decks.map((deck) => (
          <div key={deck.category} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-52 hover:border-blue-500/30 transition">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Dumbbell size={18} className="text-blue-500" />
                  {deck.title}
                </h3>
                <span className="text-[10px] font-semibold bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  {deck.count} challenges
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {deck.desc}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {deck.attempts > 0 
                  ? `✅ ${deck.attempts} completed attempts`
                  : '⏳ Ready to practice'
                }
              </p>
            </div>
            <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-4 text-xs">
              <span className="text-slate-400 font-medium">
                Accuracy rate:{' '}
                <strong className={deck.attempts > 0 ? 'text-white' : 'text-slate-600'}>
                  {deck.attempts > 0 ? `${deck.accuracy}%` : 'N/A'}
                </strong>
              </span>
              <button
                onClick={() => setActiveDeck(deck.category)}
                className="text-blue-400 flex items-center gap-1 hover:underline font-semibold"
              >
                Enter Deck <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
