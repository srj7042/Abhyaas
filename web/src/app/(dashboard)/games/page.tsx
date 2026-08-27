'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Gamepad2, ArrowRight, Trophy } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import game components to avoid bloating the initial bundle
const CodeBattle = dynamic(() => import('@/components/games/CodeBattle'), { ssr: false })
const DebugDungeon = dynamic(() => import('@/components/games/DebugDungeon'), { ssr: false })
const ConceptQuest = dynamic(() => import('@/components/games/ConceptQuest'), { ssr: false })
const SixtySecondChallenge = dynamic(() => import('@/components/games/SixtySecondChallenge'), { ssr: false })
const SkillGraphQuest = dynamic(() => import('@/components/games/SkillGraphQuest'), { ssr: false })
const AIMystery = dynamic(() => import('@/components/games/AIMystery'), { ssr: false })

type GameId = 'code-battle' | 'debug-dungeon' | 'concept-quest' | 'sixty-second' | 'skill-graph' | 'ai-mystery'

const games: { id: GameId; title: string; desc: string; xp: number; diff: string }[] = [
  { id: 'code-battle', title: 'Code Battle', desc: 'Head-to-Head Duel against AI or PVP.', xp: 150, diff: 'Hard' },
  { id: 'debug-dungeon', title: 'Debug Dungeon', desc: 'RPG Bug Hunter. Squash bugs to clear floor 1.', xp: 100, diff: 'Medium' },
  { id: 'concept-quest', title: 'Concept Quest', desc: 'Defeat 5 conceptual bosses using active recall.', xp: 120, diff: 'Medium' },
  { id: 'sixty-second', title: '60-Second Challenge', desc: 'Timed vocabulary and formula sprint.', xp: 80, diff: 'Easy' },
  { id: 'skill-graph', title: 'Skill Graph Quest', desc: 'Explore new paths via nodes navigation.', xp: 90, diff: 'Easy' },
  { id: 'ai-mystery', title: 'AI Mystery', desc: 'Solve system incidents by looking at logs.', xp: 140, diff: 'Hard' },
]

const GAME_COMPONENTS: Record<GameId, React.ComponentType<{ onExit: () => void }>> = {
  'code-battle': CodeBattle,
  'debug-dungeon': DebugDungeon,
  'concept-quest': ConceptQuest,
  'sixty-second': SixtySecondChallenge,
  'skill-graph': SkillGraphQuest,
  'ai-mystery': AIMystery,
}

export default function GamesPage() {
  const supabase = createClient()
  const [xp, setXp] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeGame, setActiveGame] = useState<GameId | null>(null)

  useEffect(() => {
    const fetchXp = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase
          .from('xp_transactions')
          .select('amount')
          .eq('user_id', session.user.id)
        if (data) {
          const total = data.reduce((sum, item) => sum + item.amount, 0)
          setXp(total)
        }
      }
      setLoading(false)
    }
    fetchXp()
  }, [supabase])

  const calculateLevel = (totalXp: number) => {
    if (totalXp === 0) return 1
    return Math.floor(totalXp / 1000) + 1
  }

  const level = calculateLevel(xp)

  // If a game is active, render its component
  if (activeGame) {
    const GameComponent = GAME_COMPONENTS[activeGame]
    return <GameComponent onExit={() => setActiveGame(null)} />
  }

  // Otherwise render the arena overview
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Educational Gaming Arena</h1>
          <p className="text-slate-400 text-sm mt-1">Gamify your study sessions to reinforce engineering fundamentals.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <Trophy className="text-yellow-400" />
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">FLIGHT XP</p>
            <p className="text-sm font-bold text-white">
              {loading ? '...' : `Level ${level} (${xp.toLocaleString()} XP)`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((g) => (
          <div key={g.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-48 hover:border-blue-500/30 transition">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Gamepad2 size={18} className="text-blue-500" />
                {g.title}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{g.desc}</p>
            </div>
            <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-4 text-xs">
              <span className="text-yellow-400 font-bold bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">
                +{g.xp} XP
              </span>
              <button
                onClick={() => setActiveGame(g.id)}
                className="text-blue-400 flex items-center gap-1 hover:underline font-semibold"
              >
                Play Game <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
