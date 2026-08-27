'use client'

import { useState, useMemo } from 'react'
import { Search, FileText, AlertTriangle, BarChart3, Settings, Eye, Lightbulb } from 'lucide-react'
import GameLayout from './GameLayout'
import GameHeader from './GameHeader'
import GameResultModal from './GameResultModal'
import { mysteryScenarios, type MysteryScenario } from './gameData'

type Phase = 'start' | 'playing' | 'result'

const XP_REWARD = 140
const MAX_SCORE = 100
const HINT_PENALTY = 15
const CLUE_BONUS = 5

const CLUE_ICONS = {
  log: FileText,
  error: AlertTriangle,
  metric: BarChart3,
  config: Settings,
}

interface Props {
  onExit: () => void
}

export default function AIMystery({ onExit }: Props) {
  const [phase, setPhase] = useState<Phase>('start')
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [examinedClues, setExaminedClues] = useState<Set<number>>(new Set())
  const [activeClue, setActiveClue] = useState<number | null>(null)
  const [hintUsed, setHintUsed] = useState(false)
  const [selectedCause, setSelectedCause] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const scenario = mysteryScenarios[scenarioIndex]

  const startGame = () => {
    setScenarioIndex(Math.floor(Math.random() * mysteryScenarios.length))
    setExaminedClues(new Set())
    setActiveClue(null)
    setHintUsed(false)
    setSelectedCause(null)
    setSubmitted(false)
    setShowResult(false)
    setPhase('playing')
  }

  const examineClue = (idx: number) => {
    setExaminedClues(prev => new Set([...prev, idx]))
    setActiveClue(idx)
  }

  const useHint = () => {
    if (!hintUsed) setHintUsed(true)
  }

  const submitDiagnosis = () => {
    if (selectedCause === null) return
    setSubmitted(true)
  }

  const finishGame = () => {
    setPhase('result')
    setShowResult(true)
  }

  const isCorrect = selectedCause === scenario?.correctCauseIndex
  const cluesExamined = examinedClues.size
  const totalClues = scenario?.clues.length ?? 0

  const score = useMemo(() => {
    if (!isCorrect) return 0
    let s = MAX_SCORE
    if (hintUsed) s -= HINT_PENALTY
    // Bonus for examining all clues
    if (cluesExamined >= totalClues) s += CLUE_BONUS
    return Math.max(0, s)
  }, [isCorrect, hintUsed, cluesExamined, totalClues])

  // ──────── START SCREEN ────────
  if (phase === 'start') {
    return (
      <GameLayout onExit={onExit}>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Search className="mx-auto text-amber-500" size={48} />
            <h2 className="text-2xl font-extrabold text-white">AI Mystery</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              A production system has failed. Investigate the evidence — logs, errors, metrics, and configs — to identify the root cause. Think like a senior engineer!
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-sm text-slate-400">
            <p>🔍 Examine clues to gather evidence</p>
            <p>💡 One hint available (score penalty)</p>
            <p>🎯 Submit your diagnosis of the root cause</p>
            <p>🏆 Reward: <span className="text-yellow-400 font-semibold">+{XP_REWARD} XP</span></p>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors text-lg"
          >
            Start Investigation
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
          won={isCorrect}
          title={isCorrect ? 'Incident Resolved!' : 'Wrong Diagnosis'}
          score={score}
          maxScore={MAX_SCORE + CLUE_BONUS}
          xpEarned={isCorrect ? XP_REWARD : 0}
          stats={[
            { label: 'Clues Examined', value: `${cluesExamined} / ${totalClues}` },
            { label: 'Hint Used', value: hintUsed ? 'Yes (-15 pts)' : 'No' },
            { label: 'Diagnosis', value: isCorrect ? 'Correct ✅' : 'Incorrect ❌' },
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
        title={scenario.title}
        extra={
          <span className="text-xs text-slate-400">
            Clues: {cluesExamined}/{totalClues}
          </span>
        }
      />

      {/* Incident Description */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">
        <strong className="text-red-400">🚨 Incident Report:</strong> {scenario.description}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Evidence Panel */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Eye size={14} /> Evidence
            </h3>
            {!hintUsed && !submitted && (
              <button
                onClick={useHint}
                className="flex items-center gap-1 text-xs font-semibold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg hover:bg-yellow-500/20 transition-colors"
              >
                <Lightbulb size={12} /> Use Hint (-15 pts)
              </button>
            )}
          </div>

          {hintUsed && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-sm text-yellow-300">
              💡 {scenario.hint}
            </div>
          )}

          {/* Clue Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {scenario.clues.map((clue, idx) => {
              const Icon = CLUE_ICONS[clue.type]
              const examined = examinedClues.has(idx)
              const isActive = activeClue === idx

              return (
                <button
                  key={idx}
                  onClick={() => examineClue(idx)}
                  className={`text-left p-3 rounded-xl border text-sm transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : examined
                        ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <Icon size={14} />
                    {clue.label}
                    {examined && <span className="text-xs text-green-400">✓</span>}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active Clue Detail */}
          {activeClue !== null && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <h4 className="text-sm font-bold text-amber-400 mb-2">{scenario.clues[activeClue].label}</h4>
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed">
                {scenario.clues[activeClue].content}
              </pre>
            </div>
          )}
        </div>

        {/* Diagnosis Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
          <h3 className="text-sm font-bold text-slate-400 uppercase">Your Diagnosis</h3>

          <div className="space-y-2">
            {scenario.possibleCauses.map((cause, idx) => (
              <button
                key={idx}
                onClick={() => !submitted && setSelectedCause(idx)}
                disabled={submitted}
                className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-colors ${
                  submitted
                    ? idx === scenario.correctCauseIndex
                      ? 'bg-green-500/20 border-green-500/40 text-green-400'
                      : idx === selectedCause
                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                        : 'bg-slate-800/50 text-slate-500 border-slate-700/50'
                    : selectedCause === idx
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cause}
              </button>
            ))}
          </div>

          {!submitted ? (
            <button
              onClick={submitDiagnosis}
              disabled={selectedCause === null}
              className={`w-full font-bold py-2.5 rounded-xl transition-colors ${
                selectedCause !== null
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              Submit Diagnosis
            </button>
          ) : (
            <div className="space-y-3">
              <div className={`p-3 rounded-xl text-xs font-bold ${
                isCorrect
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {isCorrect ? '✅ Correct diagnosis!' : '❌ Wrong diagnosis'}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
                <strong className="text-slate-200">Root Cause:</strong> {scenario.explanation}
              </div>

              <button
                onClick={finishGame}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl transition-colors"
              >
                See Results
              </button>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  )
}
