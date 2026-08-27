'use client'

import { Mail, Bot, ArrowRight } from 'lucide-react'

export default function ConfirmPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground font-sans transition-colors duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden text-center">
        {/* Glow effect */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="inline-flex p-4 bg-blue-600/10 border border-blue-500/20 rounded-full mb-6 text-blue-400">
          <Mail size={40} className="animate-bounce" />
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Check your email</h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          We have sent a verification link to your registered email address. Please click on the link to confirm your account and access your dashboard.
        </p>

        <a 
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-semibold hover:underline"
        >
          Back to Login
          <ArrowRight size={14} />
        </a>
      </div>
    </div>
  )
}
