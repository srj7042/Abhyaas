'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Sparkles, AlertCircle } from 'lucide-react'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'

export default function AssistantPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<any[]>([
    { 
      role: 'assistant', 
      content: 'Hi! I am your AI Learning Assistant. Tell me your career goals (e.g., "I want to become an AI Engineer in 5 months") or ask me to analyze your skills, and I will generate a personalized roadmap!' 
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: p } = await supabase.from('profiles').select('username').eq('id', session.user.id).single()
        if (p?.username) {
          setMessages([
            {
              role: 'assistant',
              content: `Hi ${p.username}! I am your AI Learning Assistant. Tell me your career goals (e.g., "I want to become an AI Engineer in 5 months") or ask me to analyze your skills, and I will generate a personalized roadmap!`
            }
          ])
        }
      }
    }
    fetchUser()
  }, [supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input
    if (!prompt.trim() || loading) return

    setMessages(prev => [...prev, { role: 'user', content: prompt }])
    if (!textToSend) setInput('')
    
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to communicate with AI')
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err: any) {
      console.error('Chat Error:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    "I want to become an AI Engineer in 5 months",
    "I want to become a Backend Engineer",
    "Create a roadmap for machine learning",
    "Test my Python skills",
    "Find my skill gaps"
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-10rem)] flex flex-col justify-between text-slate-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="text-blue-500" />
          AI Learning Assistant
        </h1>
        <p className="text-slate-400 text-sm mt-1">Converse with the core recommender engine to tailor your roadmap dynamically using Google Gemini.</p>
      </div>

      {/* Suggestion Prompts */}
      {messages.length === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto w-full pt-4">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="text-left p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/30 rounded-xl text-xs text-slate-450 hover:text-slate-200 transition active:translate-y-[1px]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages Board */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-y-auto space-y-4 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                <Bot size={16} />
              </div>
            )}
            <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-2xl ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-650/10' 
                : 'bg-slate-950/60 text-slate-300 border border-slate-850'
            }`}>
              {m.role === 'user' ? (
                m.content
              ) : (
                <MarkdownRenderer content={m.content} />
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 animate-pulse">
              <Bot size={16} />
            </div>
            <div className="p-4 rounded-2xl text-sm bg-slate-950/60 text-slate-500 border border-slate-850 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-xs flex gap-2 items-center">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="I want to become an AI Engineer in 5 months..."
          disabled={loading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition disabled:opacity-50"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={() => handleSend()}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-850 text-white px-6 rounded-xl font-bold transition flex items-center gap-2 active:translate-y-[1px] shadow-lg shadow-blue-650/10"
        >
          <Send size={16} />
          Send
        </button>
      </div>
    </div>
  )
}
