'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Swords, Bot, User, Zap } from 'lucide-react'
import GameLayout from './GameLayout'
import GameHeader from './GameHeader'
import GameResultModal from './GameResultModal'
import { codeChallenges, type CodeChallenge } from './gameData'

type Difficulty = 'easy' | 'medium' | 'hard'
type Phase = 'start' | 'playing' | 'result'

const DIFFICULTY_CONFIG = {
  easy:   { timeLimit: 45, aiSpeedMs: 120, label: 'Easy' },
  medium: { timeLimit: 30, aiSpeedMs: 80,  label: 'Medium' },
  hard:   { timeLimit: 20, aiSpeedMs: 50,  label: 'Hard' },
}

const XP_REWARD = 150
const ROUNDS = 5

function shuffleAndPick(arr: CodeChallenge[], count: number, diff: Difficulty): CodeChallenge[] {
  const filtered = arr.filter(c => c.difficulty === diff)
  const pool = filtered.length >= count ? filtered : arr
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

interface Props {
  onExit: () => void
}

export default function CodeBattle({ onExit }: Props) {
  const [phase, setPhase] = useState<Phase>('start')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [challenges, setChallenges] = useState<CodeChallenge[]>([])
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(0)
  const [aiProgress, setAiProgress] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answerLocked, setAnswerLocked] = useState(false)
  const [playerWonRound, setPlayerWonRound] = useState<boolean | null>(null)
  const [roundResults, setRoundResults] = useState<boolean[]>([])
  const [showResult, setShowResult] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const aiRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const config = DIFFICULTY_CONFIG[difficulty]
  const currentChallenge = challenges[round]

  const clearIntervals = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (aiRef.current) { clearInterval(aiRef.current); aiRef.current = null }
  }, [])

  const startGame = () => {
    const picked = shuffleAndPick(codeChallenges, ROUNDS, difficulty)
    setChallenges(picked)
    setRound(0)
    setScore(0)
    setRoundResults([])
    setShowResult(false)
    setPhase('playing')
  }

  // Start round timer & AI progress whenever round changes in playing phase
  useEffect(() => {
    if (phase !== 'playing' || !currentChallenge) return

    setTimer(config.timeLimit)
    setAiProgress(0)
    setSelectedAnswer(null)
    setAnswerLocked(false)
    setPlayerWonRound(null)

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // Time ran out — AI wins this round
          clearIntervals()
          setAnswerLocked(true)
          setPlayerWonRound(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    aiRef.current = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 100) {
          clearIntervals()
          setAnswerLocked(true)
          setPlayerWonRound(false)
          return 100
        }
        return prev + 1
      })
    }, config.aiSpeedMs)

    return clearIntervals
  }, [phase, round, currentChallenge, config.timeLimit, config.aiSpeedMs, clearIntervals])

  const submitAnswer = (idx: number) => {
    if (answerLocked) return
    clearIntervals()
    setSelectedAnswer(idx)
    setAnswerLocked(true)

    const correct = idx === currentChallenge.correctIndex
    setPlayerWonRound(correct)
    if (correct) {
      setScore(prev => prev + Math.max(10, timer * 3))
    }
  }

  const nextRound = () => {
    const results = [...roundResults, playerWonRound === true]
    setRoundResults(results)

    if (round + 1 >= challenges.length) {
      setPhase('result')
      setShowResult(true)
      setRoundResults(results)
    } else {
      setRound(prev => prev + 1)
    }
  }

  const totalWins = roundResults.filter(Boolean).length
  const won = totalWins >= Math.ceil(ROUNDS / 2)

  // ──────── START SCREEN ────────
  if (phase === 'start') {
    return (
      <GameLayout onExit={onExit}>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Swords className="mx-auto text-blue-500" size={48} />
            <h2 className="text-2xl font-extrabold text-white">Code Battle</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Race against an AI opponent to solve programming challenges. Answer correctly before the AI finishes to win each round. Best of {ROUNDS} wins!
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2.5 rounded-xl text-sm font-bold capitalize transition-colors ${
                    difficulty === d
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-sm text-slate-400">
            <p>⏱ Time limit: <span className="text-white font-semibold">{config.timeLimit}s</span> per round</p>
            <p>🤖 AI speed: <span className="text-white font-semibold">{config.label}</span></p>
            <p>🏆 Reward: <span className="text-yellow-400 font-semibold">+{XP_REWARD} XP</span></p>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors text-lg"
          >
            Start Battle
          </button>
        </div>
      </GameLayout>
    )
  }

  // ──────── RESULT SCREEN ────────
  if (phase === 'result') {
    return (
      <GameLayout onExit={onExit}>
        <GameResultModal
          isOpen={showResult}
          won={won}
          title="Code Battle Complete"
          score={score}
          xpEarned={won ? XP_REWARD : 0}
          stats={[
            { label: 'Rounds Won', value: `${totalWins} / ${ROUNDS}` },
            { label: 'Difficulty', value: config.label },
          ]}
          onRestart={() => { setPhase('start') }}
          onExit={onExit}
        />
      </GameLayout>
    )
  }

  // ──────── GAMEPLAY ────────
  if (!currentChallenge) return null

  return (
    <GameLayout onExit={onExit}>
      <GameHeader
        title={`Round ${round + 1} / ${ROUNDS}`}
        score={score}
        timer={timer}
        difficulty={config.label}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Player Side */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <User size={16} /> Your Challenge
          </div>

          <h3 className="text-lg font-bold text-white">{currentChallenge.title}</h3>
          <p className="text-slate-300 text-sm">{currentChallenge.description}</p>

          {currentChallenge.codeSnippet && (
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
              {currentChallenge.codeSnippet}
            </pre>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentChallenge.options.map((opt, idx) => {
              let btnClass = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              if (answerLocked) {
                if (idx === currentChallenge.correctIndex) {
                  btnClass = 'bg-green-500/20 border-green-500/40 text-green-400'
                } else if (idx === selectedAnswer && idx !== currentChallenge.correctIndex) {
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
            <div className="flex justify-end">
              <button
                onClick={nextRound}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-xl transition-colors"
              >
                {round + 1 >= ROUNDS ? 'See Results' : 'Next Round →'}
              </button>
            </div>
          )}
        </div>

        {/* AI Side */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <Bot size={16} /> AI Opponent
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>AI Progress</span>
              <span>{Math.min(100, aiProgress)}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-100"
                style={{ width: `${Math.min(100, aiProgress)}%` }}
              />
            </div>
          </div>

          {playerWonRound !== null && (
            <div className={`text-center p-3 rounded-xl text-sm font-bold ${
              playerWonRound
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {playerWonRound ? '✅ You won this round!' : '❌ AI wins this round'}
            </div>
          )}

          {/* Round Tracker */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Rounds</p>
            <div className="flex gap-2">
              {Array.from({ length: ROUNDS }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i < roundResults.length
                      ? roundResults[i]
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : i === round
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-600 border border-slate-700'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}
