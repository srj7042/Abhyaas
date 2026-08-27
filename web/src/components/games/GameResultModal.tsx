'use client'

import { Trophy, RotateCcw, ArrowLeft, Star } from 'lucide-react'

interface GameResultModalProps {
  isOpen: boolean
  won: boolean
  title: string
  score: number
  maxScore?: number
  xpEarned: number
  stats?: { label: string; value: string | number }[]
  onRestart: () => void
  onExit: () => void
}

export default function GameResultModal({
  isOpen,
  won,
  title,
  score,
  maxScore,
  xpEarned,
  stats,
  onRestart,
  onExit,
}: GameResultModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Result Icon */}
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${won ? 'bg-green-500/20 border-2 border-green-500/40' : 'bg-red-500/20 border-2 border-red-500/40'}`}>
          {won ? (
            <Trophy className="text-green-400" size={36} />
          ) : (
            <Star className="text-red-400" size={36} />
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="text-2xl font-extrabold text-white">
            {won ? 'Victory!' : 'Defeated'}
          </h3>
          <p className="text-slate-400 text-sm mt-1">{title}</p>
        </div>

        {/* Score */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Score</span>
            <span className="text-white font-bold text-lg">{score}{maxScore ? ` / ${maxScore}` : ''}</span>
          </div>
          {stats?.map((s, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">{s.label}</span>
              <span className="text-slate-200 font-semibold text-sm">{s.value}</span>
            </div>
          ))}
        </div>

        {/* XP Reward */}
        {won && xpEarned > 0 && (
          <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold text-lg">
            <Trophy size={20} />
            +{xpEarned} XP Earned!
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <RotateCcw size={16} />
            Play Again
          </button>
          <button
            onClick={onExit}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <ArrowLeft size={16} />
            Arena
          </button>
        </div>
      </div>
    </div>
  )
}
