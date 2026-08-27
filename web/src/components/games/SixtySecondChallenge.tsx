'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Timer, Flame, Zap } from 'lucide-react'
import GameLayout from './GameLayout'
import GameHeader from './GameHeader'
import GameResultModal from './GameResultModal'
import { sprintQuestions, type SprintQuestion } from './gameData'

type Phase = 'start' | 'playing' | 'result'

const GAME_DURATION = 60
const POINTS_PER_CORRECT = 10
const STREAK_BONUS = 5
const XP_REWARD = 80

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

interface Props {
  onExit: () => void
}

export default function SixtySecondChallenge({ onExit }: Props) {
  const [phase, setPhase] = useState<Phase>('start')
  const [questions, setQuestions] = useState<SprintQuestion[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [timer, setTimer] = useState(GAME_DURATION)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showResult, setShowResult] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const endGame = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setPhase('result')
    setShowResult(true)
  }, [])

  const startGame = () => {
    const shuffled = shuffleArray(sprintQuestions)
    setQuestions(shuffled)
    setQuestionIndex(0)
    setTimer(GAME_DURATION)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setCorrect(0)
    setTotal(0)
    setFeedback(null)
    setShowResult(false)
    setPhase('playing')
  }

  // Timer countdown
  useEffect(() => {
    if (phase !== 'playing') return

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }
  }, [phase, endGame])

  const submitAnswer = (idx: number) => {
    if (phase !== 'playing') return
    const q = questions[questionIndex]
    const isCorrect = idx === q.correctIndex

    setTotal(prev => prev + 1)

    if (isCorrect) {
      const newStreak = streak + 1
      const streakBonus = Math.floor(newStreak / 3) * STREAK_BONUS
      setScore(prev => prev + POINTS_PER_CORRECT + streakBonus)
      setStreak(newStreak)
      setBestStreak(prev => Math.max(prev, newStreak))
      setCorrect(prev => prev + 1)
      setFeedback('correct')
    } else {
      setStreak(0)
      setFeedback('wrong')
    }

    // Brief flash, then next question
    setTimeout(() => {
      setFeedback(null)
      if (questionIndex + 1 >= questions.length) {
        // Reshuffle if we exhausted the pool
        setQuestions(shuffleArray(sprintQuestions))
        setQuestionIndex(0)
      } else {
        setQuestionIndex(prev => prev + 1)
      }
    }, 300)
  }

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  // ──────── START SCREEN ────────
  if (phase === 'start') {
    return (
      <GameLayout onExit={onExit}>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Timer className="mx-auto text-orange-500" size={48} />
            <h2 className="text-2xl font-extrabold text-white">60-Second Challenge</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Answer as many programming questions as you can in 60 seconds! Build streaks for bonus points. How high can you score?
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-sm text-slate-400">
            <p>⏱ Time: <span className="text-white font-semibold">60 seconds</span></p>
            <p>✅ Correct answer: <span className="text-white font-semibold">+{POINTS_PER_CORRECT} pts</span></p>
            <p>🔥 Streak bonus: <span className="text-white font-semibold">+{STREAK_BONUS} pts</span> every 3 correct in a row</p>
            <p>🏆 Reward: <span className="text-yellow-400 font-semibold">+{XP_REWARD} XP</span></p>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors text-lg"
          >
            Start Sprint!
          </button>
        </div>
      </GameLayout>
    )
  }

  // ──────── RESULT ────────
  if (phase === 'result') {
    return (
      <GameLayout onExit={onExit}>
        <GameResultModal
          isOpen={showResult}
          won={correct >= 5}
          title="Time's Up!"
          score={score}
          xpEarned={correct >= 5 ? XP_REWARD : Math.floor(XP_REWARD * (correct / 10))}
          stats={[
            { label: 'Correct Answers', value: `${correct} / ${total}` },
            { label: 'Accuracy', value: `${accuracy}%` },
            { label: 'Best Streak', value: bestStreak },
          ]}
          onRestart={() => setPhase('start')}
          onExit={onExit}
        />
      </GameLayout>
    )
  }

  // ──────── GAMEPLAY ────────
  const q = questions[questionIndex]
  if (!q) return null

  const timerPercent = (timer / GAME_DURATION) * 100
  const timerColor = timer > 30 ? 'bg-green-500' : timer > 10 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <GameLayout onExit={onExit}>
      {/* Big Timer Bar */}
      <div className="space-y-1">
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${timerColor} rounded-full transition-all duration-1000`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-mono font-extrabold ${timer <= 10 ? 'text-red-400' : 'text-white'}`}>
              {timer}s
            </span>
            {streak >= 3 && (
              <span className="flex items-center gap-1 text-orange-400 font-bold text-sm animate-pulse">
                <Flame size={16} /> {streak}x Streak!
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">Score: <span className="text-yellow-400 font-bold">{score}</span></span>
            <span className="text-slate-400">Streak: <span className="text-orange-400 font-bold">{streak}</span></span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className={`bg-slate-900 border rounded-2xl p-8 transition-colors duration-200 ${
        feedback === 'correct'
          ? 'border-green-500/50 bg-green-500/5'
          : feedback === 'wrong'
            ? 'border-red-500/50 bg-red-500/5'
            : 'border-slate-800'
      }`}>
        <p className="text-white font-bold text-lg text-center mb-6">
          {q.question}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => submitAnswer(idx)}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 p-4 rounded-xl text-sm font-medium transition-colors text-left active:scale-95"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex justify-center gap-6 text-xs text-slate-500">
        <span>Answered: {total}</span>
        <span>Correct: {correct}</span>
        <span>Accuracy: {accuracy}%</span>
      </div>
    </GameLayout>
  )
}
