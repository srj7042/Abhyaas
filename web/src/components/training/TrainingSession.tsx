'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, BookOpen, Lightbulb, Trophy, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { trainingChallenges, type TrainingChallenge } from './trainingData'
import { recordXpTransaction, recordMistake, saveLocalDeckStats } from './statsHelper'

interface Props {
  userId: string
  category: 'coding' | 'mcqs' | 'sql' | 'debugging'
  deckTitle: string
  careerGoal: string
  currentRoadmapModule: string
  pastMistakes: string[]
  onExit: () => void
}

const QUESTIONS_PER_SESSION = 5

export default function TrainingSession({
  userId,
  category,
  deckTitle,
  careerGoal,
  currentRoadmapModule,
  onExit,
}: Props) {
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start')
  const [sessionChallenges, setSessionChallenges] = useState<TrainingChallenge[]>([])
  const [index, setIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0) // correct answer count (0 to 5)
  const [showHint, setShowHint] = useState(false)
  const [loading, setLoading] = useState(false)

  // 1. Select and filter challenges dynamically
  useEffect(() => {
    // Filter pool by category
    let pool = trainingChallenges.filter(c => c.category === category)

    // Score how well each question matches user's roadmap/career/mistakes
    const scoredPool = pool.map(q => {
      let matchScore = 0

      // Match target career goal
      if (careerGoal && q.roles.includes(careerGoal)) {
        matchScore += 10
      }

      // Match current roadmap module title
      if (currentRoadmapModule) {
        const moduleWords = currentRoadmapModule.toLowerCase().split(/\s+/)
        const topicWords = q.topic.toLowerCase().split(/\s+/)
        const titleWords = q.title.toLowerCase().split(/\s+/)
        const hasModuleWordOverlap = moduleWords.some(w => 
          w.length > 3 && (topicWords.includes(w) || titleWords.includes(w))
        )
        if (hasModuleWordOverlap) {
          matchScore += 15
        }
      }

      return { challenge: q, score: matchScore }
    })

    // Sort by match score and shuffle slightly to avoid complete repetition
    const sorted = scoredPool
      .sort((a, b) => b.score - a.score)
      .map(item => item.challenge)

    // Pick top QUESTIONS_PER_SESSION
    setSessionChallenges(sorted.slice(0, QUESTIONS_PER_SESSION))
  }, [category, careerGoal, currentRoadmapModule])

  const startSession = () => {
    setIndex(0)
    setSelectedOption(null)
    setTextAnswer('')
    setIsAnswered(false)
    setScore(0)
    setShowHint(false)
    setPhase('playing')
  }

  const currentChallenge = sessionChallenges[index]

  const submitAnswer = async (answer: string) => {
    if (isAnswered) return
    setIsAnswered(true)

    const isCorrect = answer.trim().toLowerCase() === currentChallenge.correctAnswer.trim().toLowerCase()

    if (isCorrect) {
      setScore(prev => prev + 1)
    } else {
      // Log wrong answer as mistake in Supabase
      const displayUserAnswer = currentChallenge.options 
        ? currentChallenge.options[parseInt(answer) || 0] || answer 
        : answer

      const displayCorrectAnswer = currentChallenge.options
        ? currentChallenge.options[parseInt(currentChallenge.correctAnswer) || 0] || currentChallenge.correctAnswer
        : currentChallenge.correctAnswer

      await recordMistake(
        userId,
        currentChallenge.question,
        displayUserAnswer,
        displayCorrectAnswer,
        currentChallenge.topic,
        currentChallenge.explanation,
        `Complete more practice labs in the "${currentChallenge.topic}" deck.`
      )
    }
  }

  const handleNext = async () => {
    if (index + 1 >= sessionChallenges.length) {
      // Completed session
      setLoading(true)
      const earnedXp = score * 20 // 20 XP per correct answer, up to 100 XP
      
      // Save stats locally
      saveLocalDeckStats(userId, category, score, QUESTIONS_PER_SESSION)

      // Post XP transaction
      if (earnedXp > 0) {
        await recordXpTransaction(userId, earnedXp, `Training Deck - ${deckTitle}`)
      }

      setLoading(false)
      setPhase('result')
    } else {
      setIndex(prev => prev + 1)
      setSelectedOption(null)
      setTextAnswer('')
      setIsAnswered(false)
      setShowHint(false)
    }
  }

  // ────────── START SCREEN ──────────
  if (phase === 'start') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto space-y-6 text-slate-200">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Decks
        </button>

        <div className="text-center space-y-2">
          <BookOpen className="mx-auto text-blue-500" size={48} />
          <h2 className="text-2xl font-extrabold text-white">{deckTitle} Session</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Dynamic active learning sprint adapted for you. Solve matching skills to target your current learning goal: <strong className="text-slate-300">{careerGoal || 'Web Development'}</strong>.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs text-slate-400">
          <p className="font-bold text-white uppercase text-[10px] tracking-wider">Session Scope:</p>
          <p>🎯 Recommended Focus: <span className="text-white font-semibold">{currentRoadmapModule || 'Foundational Engineering'}</span></p>
          <p>📋 Challenges: <span className="text-white font-semibold">{QUESTIONS_PER_SESSION} active exercises</span></p>
          <p>🏆 XP Reward: <span className="text-yellow-400 font-semibold">+20 XP</span> per correct solution</p>
        </div>

        <button
          onClick={startSession}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors text-lg"
        >
          Begin Workout
        </button>
      </div>
    )
  }

  // ────────── RESULT SCREEN ──────────
  if (phase === 'result') {
    const accuracy = Math.round((score / QUESTIONS_PER_SESSION) * 100)
    const earnedXp = score * 20

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md mx-auto space-y-6 text-center text-slate-200">
        <div className="w-20 h-20 mx-auto rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center text-blue-400">
          <Trophy size={36} />
        </div>

        <div>
          <h3 className="text-2xl font-extrabold text-white">Deck Session Complete</h3>
          <p className="text-slate-400 text-sm mt-1">{deckTitle}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Score</span>
            <span className="text-white font-bold">{score} / {QUESTIONS_PER_SESSION}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Accuracy</span>
            <span className="text-white font-bold">{accuracy}%</span>
          </div>
          {earnedXp > 0 && (
            <div className="flex justify-between items-center text-sm border-t border-slate-800/80 pt-2.5">
              <span className="text-slate-400">XP Earned</span>
              <span className="text-yellow-400 font-bold">+{earnedXp} XP</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={startSession}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <RefreshCw size={16} /> Retry
          </button>
          <button
            onClick={onExit}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <ArrowLeft size={16} /> Arena
          </button>
        </div>
      </div>
    )
  }

  // ────────── GAMEPLAY SCREEN ──────────
  if (!currentChallenge) return null

  const isCorrect = currentChallenge.options
    ? selectedOption === currentChallenge.correctAnswer
    : textAnswer.trim().toLowerCase() === currentChallenge.correctAnswer.trim().toLowerCase()

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-slate-200">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="font-bold text-white text-lg">{deckTitle}</h2>
          <p className="text-xs text-slate-500">Exercise {index + 1} of {QUESTIONS_PER_SESSION} — {currentChallenge.topic}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase">
            {currentChallenge.difficulty}
          </span>
          <div className="text-xs text-slate-400 font-bold bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Score: {score}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-white text-base">{currentChallenge.title}</h3>
          {!isAnswered && (
            <button
              onClick={() => setShowHint(prev => !prev)}
              className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-yellow-500/20 transition-colors"
            >
              <Lightbulb size={12} /> {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          )}
        </div>

        <p className="text-sm text-slate-350 leading-relaxed">{currentChallenge.question}</p>

        {currentChallenge.codeSnippet && (
          <pre className="bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
            {currentChallenge.codeSnippet}
          </pre>
        )}

        {showHint && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-300">
            💡 <strong>Hint:</strong> {currentChallenge.hint}
          </div>
        )}

        {/* Options / Text Input */}
        {currentChallenge.options ? (
          <div className="grid grid-cols-1 gap-2.5">
            {currentChallenge.options.map((opt, idx) => {
              const strIdx = idx.toString()
              const isSelected = selectedOption === strIdx
              let btnClass = 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300'

              if (isAnswered) {
                if (strIdx === currentChallenge.correctAnswer) {
                  btnClass = 'bg-green-500/15 border-green-500/40 text-green-400'
                } else if (isSelected) {
                  btnClass = 'bg-red-500/15 border-red-500/40 text-red-400'
                } else {
                  btnClass = 'bg-slate-850/30 text-slate-500 border-slate-800/40'
                }
              } else if (isSelected) {
                btnClass = 'bg-blue-600/15 border-blue-500/40 text-blue-400'
              }

              return (
                <button
                  key={idx}
                  onClick={() => !isAnswered && setSelectedOption(strIdx)}
                  disabled={isAnswered}
                  className={`text-left p-4 rounded-xl border text-sm font-medium transition-colors ${btnClass}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={textAnswer}
              onChange={e => setTextAnswer(e.target.value)}
              disabled={isAnswered}
              placeholder="Type your answer here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        )}

        {/* Action Button */}
        {!isAnswered ? (
          <button
            onClick={() => submitAnswer(currentChallenge.options ? selectedOption || '' : textAnswer)}
            disabled={currentChallenge.options ? selectedOption === null : !textAnswer.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
          >
            Submit Answer
          </button>
        ) : (
          <div className="space-y-4 pt-2 border-t border-slate-800/60">
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${
              isCorrect
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {isCorrect ? (
                <>
                  <CheckCircle size={16} />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} />
                  <span>Incorrect. Mistake added to your Logbook.</span>
                </>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs text-slate-400">
              <strong className="text-slate-200">Explanation:</strong> {currentChallenge.explanation}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-xl transition-colors text-sm"
              >
                {index + 1 >= sessionChallenges.length ? 'See Session Summary' : 'Next Question'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
