'use client'

import { Timer, Trophy, Zap } from 'lucide-react'

interface GameHeaderProps {
  title: string
  score?: number
  timer?: number | null
  difficulty?: string
  extra?: React.ReactNode
}

export default function GameHeader({ title, score, timer, difficulty, extra }: GameHeaderProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
      <div className="flex items-center gap-4">
        {extra}
        {difficulty && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase">
            {difficulty}
          </span>
        )}
        {timer !== undefined && timer !== null && (
          <div className="flex items-center gap-1.5 text-sm font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-lg">
            <Timer size={14} />
            {formatTime(timer)}
          </div>
        )}
        {score !== undefined && (
          <div className="flex items-center gap-1.5 text-sm font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-lg">
            <Trophy size={14} />
            {score}
          </div>
        )}
      </div>
    </div>
  )
}
