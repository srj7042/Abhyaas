'use client'

import { useState } from 'react'
import { Sword, Shield, Heart, Skull } from 'lucide-react'
import GameLayout from './GameLayout'
import GameHeader from './GameHeader'
import GameResultModal from './GameResultModal'
import { conceptBosses, type ConceptBoss } from './gameData'

type Phase = 'start' | 'playing' | 'result'

const PLAYER_MAX_HP = 100
const BOSS_ATTACK_DAMAGE = 25
const XP_REWARD = 120

interface Props {
  onExit: () => void
}

export default function ConceptQuest({ onExit }: Props) {
  const [phase, setPhase] = useState<Phase>('start')
  const [bossIndex, setBossIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP)
  const [bossHp, setBossHp] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answerLocked, setAnswerLocked] = useState(false)
  const [attackAnimation, setAttackAnimation] = useState<'player' | 'boss' | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [bossesDefeated, setBossesDefeated] = useState(0)

  const boss = conceptBosses[bossIndex]
  const question = boss?.questions[questionIndex]

  const startGame = () => {
    setBossIndex(0)
    setQuestionIndex(0)
    setPlayerHp(PLAYER_MAX_HP)
    setBossHp(conceptBosses[0].maxHp)
    setScore(0)
    setSelectedAnswer(null)
    setAnswerLocked(false)
    setShowResult(false)
    setBossesDefeated(0)
    setPhase('playing')
  }

  const submitAnswer = (idx: number) => {
    if (answerLocked) return
    setSelectedAnswer(idx)
    setAnswerLocked(true)

    if (idx === question.correctIndex) {
      // Player attacks boss
      setAttackAnimation('player')
      const newBossHp = Math.max(0, bossHp - question.damage)
      setBossHp(newBossHp)
      setScore(prev => prev + question.damage)
      setTimeout(() => setAttackAnimation(null), 600)
    } else {
      // Boss attacks player
      setAttackAnimation('boss')
      setPlayerHp(prev => Math.max(0, prev - BOSS_ATTACK_DAMAGE))
      setTimeout(() => setAttackAnimation(null), 600)
    }
  }

  const proceed = () => {
    // Player died
    if (playerHp <= 0) {
      setPhase('result')
      setShowResult(true)
      return
    }

    // Boss defeated
    const newBossHp = bossHp // current hp after the attack
    if (newBossHp <= 0) {
      const newDefeated = bossesDefeated + 1
      setBossesDefeated(newDefeated)

      if (bossIndex + 1 >= conceptBosses.length) {
        // All bosses defeated
        setPhase('result')
        setShowResult(true)
        return
      }

      // Next boss
      const nextBoss = conceptBosses[bossIndex + 1]
      setBossIndex(prev => prev + 1)
      setQuestionIndex(0)
      setBossHp(nextBoss.maxHp)
      setSelectedAnswer(null)
      setAnswerLocked(false)
      return
    }

    // Next question for same boss
    if (questionIndex + 1 < boss.questions.length) {
      setQuestionIndex(prev => prev + 1)
    } else {
      // Ran out of questions for this boss but boss not dead — boss wins
      setPhase('result')
      setShowResult(true)
      return
    }

    setSelectedAnswer(null)
    setAnswerLocked(false)
  }

  const allDefeated = bossesDefeated >= conceptBosses.length ||
    (bossIndex === conceptBosses.length - 1 && bossHp <= 0)
  const won = allDefeated && playerHp > 0

  // ──────── START SCREEN ────────
  if (phase === 'start') {
    return (
      <GameLayout onExit={onExit}>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Sword className="mx-auto text-purple-500" size={48} />
            <h2 className="text-2xl font-extrabold text-white">Concept Quest</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Battle {conceptBosses.length} engineering concept bosses using active recall. Answer correctly to deal damage. Wrong answers let the boss attack you!
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Bosses to Defeat</p>
            <div className="space-y-2">
              {conceptBosses.map((b, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-2xl">{b.emoji}</span>
                  <div>
                    <p className="text-white font-bold text-sm">{b.name}</p>
                    <p className="text-slate-500 text-xs">{b.title} — HP: {b.maxHp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-sm text-slate-400">
            <p>❤️ Your HP: <span className="text-white font-semibold">{PLAYER_MAX_HP}</span></p>
            <p>⚔️ Boss attack: <span className="text-white font-semibold">{BOSS_ATTACK_DAMAGE} damage</span> per wrong answer</p>
            <p>🏆 Reward: <span className="text-yellow-400 font-semibold">+{XP_REWARD} XP</span></p>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors text-lg"
          >
            Begin Quest
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
          won={won}
          title={won ? 'All Bosses Defeated!' : 'You were defeated...'}
          score={score}
          xpEarned={won ? XP_REWARD : 0}
          stats={[
            { label: 'Bosses Defeated', value: `${won ? conceptBosses.length : bossesDefeated} / ${conceptBosses.length}` },
            { label: 'HP Remaining', value: `${Math.max(0, playerHp)} / ${PLAYER_MAX_HP}` },
          ]}
          onRestart={() => setPhase('start')}
          onExit={onExit}
        />
      </GameLayout>
    )
  }

  // ──────── GAMEPLAY ────────
  if (!question) return null

  const bossHpPercent = (bossHp / boss.maxHp) * 100
  const playerHpPercent = (playerHp / PLAYER_MAX_HP) * 100

  return (
    <GameLayout onExit={onExit}>
      <GameHeader
        title={`Boss ${bossIndex + 1}: ${boss.name}`}
        score={score}
        extra={
          <span className="text-xs text-slate-400">
            Defeated: {bossesDefeated}/{conceptBosses.length}
          </span>
        }
      />

      {/* Battle Arena */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* HP Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Boss HP */}
          <div className={`space-y-2 ${attackAnimation === 'player' ? 'animate-pulse' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-red-400 flex items-center gap-1.5">
                <Skull size={14} /> {boss.emoji} {boss.name}
              </span>
              <span className="text-xs text-slate-400">{bossHp}/{boss.maxHp} HP</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500"
                style={{ width: `${bossHpPercent}%` }}
              />
            </div>
          </div>

          {/* Player HP */}
          <div className={`space-y-2 ${attackAnimation === 'boss' ? 'animate-pulse' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
                <Shield size={14} /> You
              </span>
              <span className="text-xs text-slate-400">{playerHp}/{PLAYER_MAX_HP} HP</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${playerHpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="space-y-4">
          <p className="text-white font-semibold text-center">
            {question.text}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.options.map((opt, idx) => {
              let btnClass = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              if (answerLocked) {
                if (idx === question.correctIndex) {
                  btnClass = 'bg-green-500/20 border-green-500/40 text-green-400'
                } else if (idx === selectedAnswer && idx !== question.correctIndex) {
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
        </div>

        {/* Feedback & Next */}
        {answerLocked && (
          <div className="space-y-3">
            <div className={`text-center p-3 rounded-xl text-sm font-bold ${
              selectedAnswer === question.correctIndex
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {selectedAnswer === question.correctIndex
                ? `⚔️ You dealt ${question.damage} damage!`
                : `💥 Boss attacks for ${BOSS_ATTACK_DAMAGE} damage!`}
            </div>
            <div className="flex justify-end">
              <button
                onClick={proceed}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-6 rounded-xl transition-colors"
              >
                {playerHp <= 0 || bossHp <= 0
                  ? bossHp <= 0 && bossIndex + 1 < conceptBosses.length
                    ? 'Next Boss →'
                    : 'See Results'
                  : 'Next Question →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  )
}
