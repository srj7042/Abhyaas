# Script to generate remaining page components
$AssistantPage = @"
'use client'

import { useState } from 'react'
import { Bot, Send, User } from 'lucide-react'

export default function AssistantPage() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: 'Hi user123! I can help you build and refine your learning path. Try asking "I want to become an AI Engineer in 5 months".' }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, { role: 'user', content: input }])
    setInput('')
    
    // Simulate AI typing response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Understood. Let me analyze that goal relative to your current skill profile and generate a recommended path...' }])
    }, 1000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col justify-between">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Learning Assistant</h1>
        <p className="text-slate-400 text-sm mt-1">Converse with the core recommender engine to tailor your roadmap.</p>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                <Bot size={16} />
              </div>
            )}
            <div className={`p-4 rounded-xl text-sm max-w-lg ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-350 border border-slate-850'}`}>
              {m.content}
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your learning goal..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}
"@
Set-Content -Path "web/src/app/(dashboard)/assistant/page.tsx" -Value $AssistantPage

$RoadmapPage = @"
'use client'

import { Map, CheckCircle, Lock, Play } from 'lucide-react'

export default function RoadmapPage() {
  const steps = [
    { title: 'Mathematics & Statistics Foundations', status: 'completed' },
    { title: 'Python Programming & Data Wrangling', status: 'completed' },
    { title: 'Linear Regression & Basic Optimization', status: 'in-progress' },
    { title: 'Neural Networks & Deep Learning Essentials', status: 'locked' },
    { title: 'MLOps & Pipeline Deployment', status: 'locked' },
  ]

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">My Learning Roadmap</h1>
        <p className="text-slate-400 text-sm mt-1">Timeline path dynamically calibrated for: AI Engineer.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-8 relative">
        <div className="absolute left-[2.25rem] top-12 bottom-12 w-[2px] bg-slate-800" />
        
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-6 items-start relative z-10">
            {step.status === 'completed' ? (
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle size={14} />
              </div>
            ) : step.status === 'in-progress' ? (
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border-2 border-blue-500 flex items-center justify-center text-blue-500 shrink-0">
                <Play size={14} fill="currentColor" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                <Lock size={14} />
              </div>
            )}
            
            <div className="flex-1 p-4 bg-slate-950/40 border border-slate-850 rounded-xl">
              <h4 className="font-bold text-white text-base">{step.title}</h4>
              <p className="text-xs text-slate-500 mt-1 capitalize">Status: {step.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
"@
Set-Content -Path "web/src/app/(dashboard)/roadmap/page.tsx" -Value $RoadmapPage

$TrainingPage = @"
'use client'

import { Dumbbell, ArrowRight } from 'lucide-react'

export default function TrainingPage() {
  const decks = [
    { title: 'Coding Problems', count: 42, accuracy: 88 },
    { title: 'Multiple Choice Questions (MCQs)', count: 120, accuracy: 76 },
    { title: 'SQL & Database Design', count: 35, accuracy: 65 },
    { title: 'Debugging Scenarios', count: 18, accuracy: 90 },
  ]

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Training Deck</h1>
        <p className="text-slate-400 text-sm mt-1">Strengthen your problem-solving metrics with active labs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decks.map((deck, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-44 hover:border-blue-500/30 transition">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Dumbbell size={18} className="text-blue-500" />
                {deck.title}
              </h3>
              <p className="text-xs text-slate-500 mt-2">{deck.count} total questions available</p>
            </div>
            <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-4 text-xs">
              <span className="text-slate-400">Accuracy rate: <strong className="text-white">{deck.accuracy}%</strong></span>
              <button className="text-blue-400 flex items-center gap-1 hover:underline">
                Enter Deck <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
"@
Set-Content -Path "web/src/app/(dashboard)/training/page.tsx" -Value $TrainingPage

$MissionsPage = @"
'use client'

import { Target, Check } from 'lucide-react'

export default function MissionsPage() {
  const missions = [
    { title: 'Solve 5 Python Problems', reward: '+50 XP', progress: '5/5', completed: true },
    { title: 'Complete 1 Core Assessment', reward: '+100 XP', progress: '0/1', completed: false },
    { title: 'Revise 5 Concept Cards', reward: '+50 XP', progress: '5/5', completed: true },
  ]

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Daily Missions Hub</h1>
        <p className="text-slate-400 text-sm mt-1">Maintain your learning streak and accumulate scholar XP.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        {missions.map((m, idx) => (
          <div key={idx} className="flex justify-between items-center p-4 bg-slate-950/40 border border-slate-850 rounded-xl">
            <div className="space-y-1">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Target size={16} className="text-blue-500" />
                {m.title}
              </h4>
              <p className="text-xs text-slate-500">Progress: {m.progress}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-yellow-400 font-bold bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">
                {m.reward}
              </span>
              {m.completed ? (
                <span className="p-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg">
                  <Check size={14} />
                </span>
              ) : (
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                  Start
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
"@
Set-Content -Path "web/src/app/(dashboard)/missions/page.tsx" -Value $MissionsPage

$ConstellationPage = @"
'use client'

import { Network } from 'lucide-react'

export default function ConstellationPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-10rem)] flex flex-col justify-between">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Knowledge Constellation</h1>
        <p className="text-slate-400 text-sm mt-1">Interactive skill map showing prerequisite relationships.</p>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-center items-center text-center p-8 space-y-3 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <Network size={48} className="text-blue-500 relative z-10 animate-pulse" />
        <div className="relative z-10 max-w-sm space-y-2">
          <h3 className="font-bold text-white text-lg">Interactive Skill Network</h3>
          <p className="text-xs text-slate-500">
            Render network graph representing your curriculum dependency mapping (Mathematics → Python → Machine Learning).
          </p>
        </div>
      </div>
    </div>
  )
}
"@
Set-Content -Path "web/src/app/(dashboard)/constellation/page.tsx" -Value $ConstellationPage

$MistakesPage = @"
'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function MistakesPage() {
  const mistakes = [
    { title: 'Incorrect SQL JOIN selection', error: 'Logical Flaw', details: 'Used LEFT JOIN instead of INNER JOIN during aggregation.', date: 'Today' },
    { title: 'Gradient update sign flip', error: 'Calculation Error', details: 'Added gradient values instead of subtracting during minimization steps.', date: '2 days ago' }
  ]

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Mistake Logbook</h1>
        <p className="text-slate-400 text-sm mt-1">Review flagged assessment error models to run targeted recovery drills.</p>
      </div>

      <div className="space-y-4">
        {mistakes.map((m, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                {m.error}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">{m.date}</span>
            </div>
            <div>
              <h4 className="font-bold text-white text-base">{m.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{m.details}</p>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-800/50">
              <button className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold hover:underline">
                <RefreshCw size={12} />
                Trigger Recovery Lab
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
"@
Set-Content -Path "web/src/app/(dashboard)/mistakes/page.tsx" -Value $MistakesPage

$ProjectsPage = @"
'use client'

import { FolderGit2, Check, ArrowRight } from 'lucide-react'

export default function ProjectsPage() {
  const projects = [
    { title: 'House Price Prediction API', status: 'completed', complexity: 'Easy' },
    { title: 'Gradient Descent Optimization Module', status: 'in-progress', complexity: 'Medium' },
    { title: 'Custom Neural Network from scratch', status: 'locked', complexity: 'Hard' },
  ]

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Projects Panel</h1>
        <p className="text-slate-400 text-sm mt-1">Apply your core competencies to functional git portfolio deliverables.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        {projects.map((p, idx) => (
          <div key={idx} className="flex justify-between items-center p-4 bg-slate-950/40 border border-slate-850 rounded-xl">
            <div className="space-y-1">
              <h4 className="font-bold text-white flex items-center gap-2">
                <FolderGit2 size={16} className="text-blue-400" />
                {p.title}
              </h4>
              <p className="text-[10px] text-slate-500">Complexity: {p.complexity}</p>
            </div>
            <div>
              {p.status === 'completed' ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  <Check size={12} /> Complete
                </span>
              ) : p.status === 'in-progress' ? (
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                  Continue <ArrowRight size={12} />
                </button>
              ) : (
                <span className="text-xs text-slate-600 font-bold bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded">
                  Locked
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
"@
Set-Content -Path "web/src/app/(dashboard)/projects/page.tsx" -Value $ProjectsPage

$SettingsPage = @"
'use client'

import { Settings, Shield, User, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Profile & Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure your personal, security, and curriculum preferences.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">
        
        {/* Profile Details */}
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User size={18} className="text-blue-500" />
            Profile Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase">Username</label>
              <input type="text" value="user123" disabled className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-sm text-slate-300 mt-1 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase">Target Goal</label>
              <input type="text" value="AI Engineer" disabled className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-sm text-slate-300 mt-1 cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
            <Trash2 size={18} />
            Danger Zone
          </h3>
          <p className="text-xs text-slate-400">Permanently delete your profile and completely erase all data records from PostgreSQL.</p>
          <button className="bg-red-650 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition">
            Delete Profile Account
          </button>
        </div>

      </div>
    </div>
  )
}
"@
Set-Content -Path "web/src/app/(dashboard)/settings/page.tsx" -Value $SettingsPage
