'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Map, CheckCircle, Lock, Play, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function RoadmapPage() {
  const supabase = createClient()
  const [roadmap, setRoadmap] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoadmap = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      // Fetch active roadmap
      const { data: roadmapData } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single()

      if (roadmapData) {
        setRoadmap(roadmapData)

        // Fetch modules for this roadmap
        const { data: modulesData } = await supabase
          .from('roadmap_modules')
          .select('*')
          .eq('roadmap_id', roadmapData.id)
          .order('order_index', { ascending: true })

        if (modulesData) {
          setModules(modulesData)
        }
      }
      setLoading(false)
    }

    fetchRoadmap()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-sm text-slate-500 animate-pulse">Loading roadmap track...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-slate-200">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">My Learning Roadmap</h1>
        <p className="text-slate-400 text-sm mt-1">
          {roadmap 
            ? `Timeline path dynamically calibrated for: ${roadmap.target_role || 'Selected Career'}`
            : 'Timeline path'
          }
        </p>
      </div>

      {roadmap ? (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-8 relative">
          <div className="absolute left-[2.25rem] top-12 bottom-12 w-[2px] bg-slate-800" />
          
          {modules.map((step, idx) => (
            <div key={step.id || idx} className="flex gap-6 items-start relative z-10">
              {step.status === 'Completed' ? (
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shrink-0">
                  <CheckCircle size={14} />
                </div>
              ) : step.status === 'In Progress' ? (
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border-2 border-blue-500 flex items-center justify-center text-blue-500 shrink-0">
                  <Play size={14} fill="currentColor" className="ml-0.5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-slate-655 shrink-0">
                  <Lock size={14} />
                </div>
              )}
              
              <div className="flex-1 p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-base">{step.title}</h4>
                  {step.duration && <span className="text-[10px] text-slate-500 font-semibold uppercase">{step.duration}</span>}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500">
                  <span>Milestone: {step.milestone || 'None'}</span>
                  <span className={`font-semibold capitalize ${
                    step.status === 'Completed' ? 'text-emerald-400' : step.status === 'In Progress' ? 'text-blue-400' : 'text-slate-500'
                  }`}>
                    {step.status}
                  </span>
                </div>
                <div className="pt-2">
                  {step.status === 'Locked' ? (
                    <button
                      disabled
                      className="bg-slate-900 border border-slate-800 text-slate-600 font-semibold px-4 py-2 rounded-xl text-xs cursor-not-allowed"
                    >
                      Locked
                    </button>
                  ) : (
                    <Link
                      href={`/tutor?roadmapId=${encodeURIComponent(roadmap.id)}&lessonId=${encodeURIComponent(step.id)}`}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition"
                    >
                      <Play size={13} fill="white" />
                      {step.status === 'Completed' ? 'Review Lesson' : 'Continue Lesson'}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-3">
          <AlertCircle className="text-slate-500 mx-auto" size={32} />
          <h3 className="font-bold text-white">No Roadmap Generated</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have an active learning roadmap. Head over to the AI Learning Assistant to set your target goal and generate a path!
          </p>
        </div>
      )}
    </div>
  )
}
