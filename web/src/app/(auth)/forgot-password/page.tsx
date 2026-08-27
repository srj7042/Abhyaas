'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Mail, Bot, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setMessage("Check your email for the password recovery link!")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground font-sans transition-colors duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl mb-3 text-blue-500">
            <Bot size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Forgot Password</h1>
          <p className="text-slate-400 text-sm mt-2">Recover your Abhyaas profile</p>
        </div>

        <form onSubmit={handleResetRequest} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" 
                placeholder="you@example.com"
                required 
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/30 rounded-xl text-emerald-400 text-sm">
              {message}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 active:translate-y-[1px] disabled:opacity-50"
          >
            {loading ? 'Sending Request...' : 'Send Recovery Link'}
          </button>
        </form>

        <div className="text-center mt-6 relative z-10">
          <a href="/login" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white font-semibold transition">
            <ArrowLeft size={12} />
            Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}
