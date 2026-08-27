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
