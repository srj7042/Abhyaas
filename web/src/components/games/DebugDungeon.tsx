'use client'

import { useState } from 'react'
import { Bug, Heart, Shield, Lightbulb, ChevronDown } from 'lucide-react'
import GameLayout from './GameLayout'
import GameHeader from './GameHeader'
import GameResultModal from './GameResultModal'
import { dungeonFloors, type DungeonFloor } from './gameData'

type Phase = 'start' | 'playing' | 'result'

const MAX_HEALTH = 3
const MAX_HINTS = 2
const XP_REWARD = 100

interface Props {
  onExit: () => void
}

export default function DebugDungeon({ onExit }: Props) {
  const [phase, setPhase] = useState<Phase>('start')
  const [floorIndex, setFloorIndex] = useState(0)
  const [health, setHealth] = useState(MAX_HEALTH)
  const [hints, setHints] = useState(MAX_HINTS)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answerLocked, setAnswerLocked] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [shakeScreen, setShakeScreen] = useState(false)

  const currentFloor = dungeonFloors[floorIndex]
  const totalFloors = dungeonFloors.length

  const startGame = () => {
    setFloorIndex(0)
    setHealth(MAX_HEALTH)
    setHints(MAX_HINTS)
    setScore(0)
    setSelectedAnswer(null)
    setAnswerLocked(false)
    setShowHint(false)
    setShowResult(false)
    setPhase('playing')
  }

  const submitAnswer = (idx: number) => {
    if (answerLocked) return
    setSelectedAnswer(idx)
    setAnswerLocked(true)

    if (idx === currentFloor.correctIndex) {
      setScore(prev => prev + (showHint ? 15 : 25))
    } else {
      setHealth(prev => prev - 1)
      setShakeScreen(true)
      setTimeout(() => setShakeScreen(false), 500)
    }
  }

  const nextFloor = () => {
    // Check lose condition
    if (health <= 0) {
      setPhase('result')
      setShowResult(true)
      return
    }

    if (floorIndex + 1 >= totalFloors) {
      setPhase('result')
      setShowResult(true)
      return
    }

    setFloorIndex(prev => prev + 1)
    setSelectedAnswer(null)
    setAnswerLocked(false)
    setShowHint(false)
  }

  const useHint = () => {
    if (hints > 0 && !showHint) {
      setHints(prev => prev - 1)
      setShowHint(true)
    }
  }

  const won = health > 0 && floorIndex >= totalFloors - 1 && answerLocked && selectedAnswer === currentFloor?.correctIndex

  // ──────── START SCREEN ────────
  if (phase === 'start') {
    return (
      <GameLayout onExit={onExit}>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Bug className="mx-auto text-green-500" size={48} />
            <h2 className="text-2xl font-extrabold text-white">Debug Dungeon</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Descend through {totalFloors} floors of buggy code. Find and fix the bugs to survive. Wrong answers cost you health. Lose all hearts and the dungeon claims you!
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-sm text-slate-400">
            <p>❤️ Health: <span className="text-white font-semibold">{MAX_HEALTH} hearts</span></p>
            <p>💡 Hints: <span className="text-white font-semibold">{MAX_HINTS} available</span> (reduced score)</p>
            <p>🏰 Floors: <span className="text-white font-semibold">{totalFloors} levels</span></p>
            <p>🏆 Reward: <span className="text-yellow-400 font-semibold">+{XP_REWARD} XP</span></p>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors text-lg"
          >
            Enter the Dungeon
          </button>
        </div>
      </GameLayout>
    )
  }

  // ──────── RESULT ────────
  if (phase === 'result') {
    const floorsCleared = health > 0 ? totalFloors : floorIndex
    return (
      <GameLayout onExit={onExit}>
        <GameResultModal
          isOpen={showResult}
          won={health > 0 && floorsCleared >= totalFloors}
          title={health > 0 ? 'Dungeon Cleared!' : 'You fell in the dungeon...'}
          score={score}
          maxScore={totalFloors * 25}
          xpEarned={health > 0 && floorsCleared >= totalFloors ? XP_REWARD : 0}
          stats={[
            { label: 'Floors Cleared', value: `${floorsCleared} / ${totalFloors}` },
            { label: 'Health Remaining', value: `${Math.max(0, health)} ❤️` },
            { label: 'Hints Used', value: MAX_HINTS - hints },
          ]}
          onRestart={() => setPhase('start')}
          onExit={onExit}
        />
      </GameLayout>
    )
  }

  // ──────── GAMEPLAY ────────
  return (
    <GameLayout onExit={onExit}>
      <GameHeader
        title={`Floor ${currentFloor.floor} — ${currentFloor.title}`}
        score={score}
        difficulty={currentFloor.bugType}
        extra={
          <div className="flex items-center gap-1">
            {Array.from({ length: MAX_HEALTH }).map((_, i) => (
              <Heart
                key={i}
                size={18}
                className={i < health ? 'text-red-500 fill-red-500' : 'text-slate-700'}
              />
            ))}
          </div>
        }
      />

      <div className={`space-y-4 ${shakeScreen ? 'animate-pulse' : ''}`}>
        {/* Floor Progress */}
        <div className="flex gap-2">
          {dungeonFloors.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < floorIndex ? 'bg-green-500' : i === floorIndex ? 'bg-blue-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Code Display */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Bug size={14} className="text-red-400" />
              Buggy Code
            </span>
            {!answerLocked && hints > 0 && !showHint && (
              <button
                onClick={useHint}
                className="flex items-center gap-1 text-xs font-semibold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg hover:bg-yellow-500/20 transition-colors"
              >
                <Lightbulb size={12} /> Hint ({hints})
              </button>
            )}
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
            {currentFloor.code}
          </pre>

          {showHint && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-sm text-yellow-300">
              💡 {currentFloor.hint}
            </div>
          )}

          <p className="text-slate-300 text-sm font-medium">{currentFloor.question}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentFloor.options.map((opt, idx) => {
              let btnClass = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              if (answerLocked) {
                if (idx === currentFloor.correctIndex) {
                  btnClass = 'bg-green-500/20 border-green-500/40 text-green-400'
                } else if (idx === selectedAnswer && idx !== currentFloor.correctIndex) {
                  btnClass = 'bg-red-500/20 border-red-500/40 text-red-400'
                } else {
                  btnClass = 'bg-slate-800/50 text-slate-500 border-slate-700/50'
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => submitAnswer(idx)}
                  disabled={answerLocked}
                  className={`text-left p-3 rounded-xl border text-sm font-medium transition-colors ${btnClass}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          {answerLocked && (
            <div className="space-y-3">
              <div className={`p-3 rounded-xl text-sm ${
                selectedAnswer === currentFloor.correctIndex
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {selectedAnswer === currentFloor.correctIndex
                  ? '✅ Bug squashed!'
                  : '❌ Wrong fix! You took damage.'}
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
                <strong className="text-slate-200">Explanation:</strong> {currentFloor.explanation}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={nextFloor}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-xl transition-colors"
                >
                  {health <= 0
                    ? 'See Results'
                    : floorIndex + 1 >= totalFloors
                      ? 'Complete Dungeon'
                      : `Next Floor →`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  )
}
