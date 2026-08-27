'use client'

import { useState, useMemo } from 'react'
import { Network, Lock, Unlock, CheckCircle, X } from 'lucide-react'
import GameLayout from './GameLayout'
import GameHeader from './GameHeader'
import GameResultModal from './GameResultModal'
import { skillNodes, type SkillNode } from './gameData'

type Phase = 'start' | 'playing' | 'result'
type NodeStatus = 'locked' | 'unlocked' | 'completed'

const XP_REWARD = 90

interface Props {
  onExit: () => void
}

export default function SkillGraphQuest({ onExit }: Props) {
  const [phase, setPhase] = useState<Phase>('start')
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({})
  const [activeNode, setActiveNode] = useState<SkillNode | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answerLocked, setAnswerLocked] = useState(false)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const startGame = () => {
    // Initialize: root nodes (no dependencies) are unlocked, rest locked
    const statuses: Record<string, NodeStatus> = {}
    skillNodes.forEach(n => {
      statuses[n.id] = n.dependencies.length === 0 ? 'unlocked' : 'locked'
    })
    setNodeStatuses(statuses)
    setActiveNode(null)
    setSelectedAnswer(null)
    setAnswerLocked(false)
    setScore(0)
    setShowResult(false)
    setPhase('playing')
  }

  const completedCount = useMemo(() => {
    return Object.values(nodeStatuses).filter(s => s === 'completed').length
  }, [nodeStatuses])

  const handleNodeClick = (node: SkillNode) => {
    const status = nodeStatuses[node.id]
    if (status === 'locked' || status === 'completed') return
    setActiveNode(node)
    setSelectedAnswer(null)
    setAnswerLocked(false)
  }

  const submitAnswer = (idx: number) => {
    if (answerLocked || !activeNode) return
    setSelectedAnswer(idx)
    setAnswerLocked(true)

    if (idx === activeNode.challenge.correctIndex) {
      setScore(prev => prev + 15)
      // Mark node completed and unlock dependents
      setNodeStatuses(prev => {
        const next = { ...prev, [activeNode.id]: 'completed' as NodeStatus }
        // Unlock nodes whose dependencies are all completed
        skillNodes.forEach(n => {
          if (next[n.id] === 'locked') {
            const allDepsMet = n.dependencies.every(dep => next[dep] === 'completed')
            if (allDepsMet) {
              next[n.id] = 'unlocked'
            }
          }
        })
        return next
      })
    }
  }

  const closeChallenge = () => {
    setActiveNode(null)
    setSelectedAnswer(null)
    setAnswerLocked(false)

    // Check if all completed
    const updatedCompleted = Object.values(nodeStatuses).filter(s => s === 'completed').length
    // We need to re-check after the last submit since state update is batched
    const allCompleted = skillNodes.every(n => {
      return nodeStatuses[n.id] === 'completed' ||
        (n.id === activeNode?.id && selectedAnswer === activeNode?.challenge.correctIndex)
    })

    if (allCompleted) {
      setPhase('result')
      setShowResult(true)
    }
  }

  // Check if all nodes completed (for when challenge modal is already closed)
  const allDone = skillNodes.every(n => nodeStatuses[n.id] === 'completed')

  // ──────── START SCREEN ────────
  if (phase === 'start') {
    return (
      <GameLayout onExit={onExit}>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Network className="mx-auto text-cyan-500" size={48} />
            <h2 className="text-2xl font-extrabold text-white">Skill Graph Quest</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Navigate an interactive skill tree. Complete challenges at each node to unlock connected skills. Master all {skillNodes.length} nodes to win!
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-sm text-slate-400">
            <p>🔓 Start with root skills and unlock paths</p>
            <p>📝 Each node has a challenge question</p>
            <p>🌐 Nodes: <span className="text-white font-semibold">{skillNodes.length} skills</span></p>
            <p>🏆 Reward: <span className="text-yellow-400 font-semibold">+{XP_REWARD} XP</span></p>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-colors text-lg"
          >
            Start Exploring
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
          won={allDone}
          title={allDone ? 'Skill Tree Mastered!' : 'Keep Exploring!'}
          score={score}
          maxScore={skillNodes.length * 15}
          xpEarned={allDone ? XP_REWARD : 0}
          stats={[
            { label: 'Skills Completed', value: `${completedCount} / ${skillNodes.length}` },
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
        title="Skill Graph Quest"
        score={score}
        extra={
          <span className="text-xs text-slate-400">
            {completedCount}/{skillNodes.length} Skills
          </span>
        }
      />

      {/* Finish Button */}
      {allDone && (
        <div className="flex justify-center">
          <button
            onClick={() => { setPhase('result'); setShowResult(true) }}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-8 rounded-xl transition-colors"
          >
            🎉 Complete Quest!
          </button>
        </div>
      )}

      {/* Graph Visualization */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative" style={{ minHeight: 420 }}>
        {/* Connection Lines - SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: 420 }}>
          {skillNodes.map(node =>
            node.dependencies.map(depId => {
              const dep = skillNodes.find(n => n.id === depId)
              if (!dep) return null
              const bothCompleted = nodeStatuses[node.id] === 'completed' && nodeStatuses[depId] === 'completed'
              return (
                <line
                  key={`${depId}-${node.id}`}
                  x1={`${dep.x}%`} y1={`${dep.y}%`}
                  x2={`${node.x}%`} y2={`${node.y}%`}
                  stroke={bothCompleted ? 'rgb(34 211 238 / 0.5)' : 'rgb(51 65 85 / 0.5)'}
                  strokeWidth={2}
                  strokeDasharray={bothCompleted ? '0' : '6 4'}
                />
              )
            })
          )}
        </svg>

        {/* Nodes */}
        {skillNodes.map(node => {
          const status = nodeStatuses[node.id]
          const isActive = activeNode?.id === node.id

          let nodeClass = ''
          let icon = null
          if (status === 'completed') {
            nodeClass = 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 cursor-default'
            icon = <CheckCircle size={14} />
          } else if (status === 'unlocked') {
            nodeClass = 'bg-blue-500/20 border-blue-500/40 text-blue-400 cursor-pointer hover:bg-blue-500/30 hover:scale-110'
            icon = <Unlock size={14} />
          } else {
            nodeClass = 'bg-slate-800/60 border-slate-700/40 text-slate-600 cursor-not-allowed'
            icon = <Lock size={14} />
          }

          return (
            <button
              key={node.id}
              onClick={() => handleNodeClick(node)}
              disabled={status !== 'unlocked'}
              className={`absolute flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-bold transition-all duration-200 ${nodeClass} ${isActive ? 'ring-2 ring-blue-400' : ''}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                minWidth: 72,
              }}
            >
              {icon}
              <span>{node.label}</span>
            </button>
          )
        })}
      </div>

      {/* Challenge Modal */}
      {activeNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full mx-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{activeNode.label} Challenge</h3>
              <button onClick={closeChallenge} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <p className="text-slate-300 text-sm">{activeNode.challenge.question}</p>

            <div className="grid grid-cols-1 gap-2">
              {activeNode.challenge.options.map((opt, idx) => {
                let btnClass = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                if (answerLocked) {
                  if (idx === activeNode.challenge.correctIndex) {
                    btnClass = 'bg-green-500/20 border-green-500/40 text-green-400'
                  } else if (idx === selectedAnswer && idx !== activeNode.challenge.correctIndex) {
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
                <div className={`text-center p-3 rounded-xl text-sm font-bold ${
                  selectedAnswer === activeNode.challenge.correctIndex
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {selectedAnswer === activeNode.challenge.correctIndex
                    ? '✅ Skill unlocked! Connected skills are now available.'
                    : '❌ Incorrect. Try again later.'}
                </div>
                <button
                  onClick={closeChallenge}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl transition-colors"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </GameLayout>
  )
}
