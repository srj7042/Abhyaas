'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react'

export default function MistakesPage() {
  const supabase = createClient()
  const [mistakes, setMistakes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMistakes = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      // Fetch logged mistakes from Postgres
      const { data: mistakesData } = await supabase
        .from('mistakes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (mistakesData) {
        setMistakes(mistakesData)
      }
      setLoading(false)
    }

    fetchMistakes()
  }, [supabase])

  const handleDrill = (mistakeId: string) => {
    alert("Starting recovery lab drill for mistake ID: " + mistakeId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-sm text-slate-500 animate-pulse">Loading mistake logbook...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-slate-200">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Mistake Logbook</h1>
        <p className="text-slate-400 text-sm mt-1">Review flagged assessment error models to run targeted recovery drills.</p>
      </div>

      {mistakes.length > 0 ? (
        <div className="space-y-4">
          {mistakes.map((m, idx) => (
            <div key={m.id || idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  {m.error_type || 'Error Model'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Recent'}
                </span>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-white text-base">{m.question}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                  <div>
                    <span className="text-red-400 font-semibold uppercase tracking-wider text-[9px]">Your Answer</span>
                    <p className="text-slate-350 mt-0.5">{m.user_answer || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[9px]">Correct Answer</span>
                    <p className="text-slate-350 mt-0.5">{m.correct_answer || 'N/A'}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  <strong>Explanation:</strong> {m.explanation}
                </p>
                {m.recovery_action && (
                  <p className="text-xs text-blue-400 font-medium leading-relaxed bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-lg">
                    💡 <strong>Recovery Recommendation:</strong> {m.recovery_action}
                  </p>
                )}
              </div>
              <div className="flex justify-end pt-2 border-t border-slate-800/50">
                <button 
                  onClick={() => handleDrill(m.id)}
                  className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold hover:underline"
                >
                  <RefreshCw size={12} />
                  Trigger Recovery Lab
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-3">
          <AlertCircle className="text-slate-500 mx-auto" size={32} />
          <h3 className="font-bold text-white">No Flagged Mistakes</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any mistakes recorded yet. Take assessments or complete quizzes in the training deck to fill the logbook!
          </p>
        </div>
      )}
    </div>
  )
}
