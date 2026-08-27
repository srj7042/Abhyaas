'use client'

import { ArrowLeft } from 'lucide-react'

interface GameLayoutProps {
  children: React.ReactNode
  onExit: () => void
}

export default function GameLayout({ children, onExit }: GameLayoutProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button
        onClick={onExit}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Gaming Arena
      </button>
      {children}
    </div>
  )
}
