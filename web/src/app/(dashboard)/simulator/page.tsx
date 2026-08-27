'use client'

import { useState, useEffect, useDeferredValue, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  GitCompare, 
  Clock, 
  Calendar, 
  Briefcase, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react'
import dynamic from 'next/dynamic'

const SimulationChart = dynamic(
  () => import('@/components/SimulationChart'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-950/20 rounded-xl">
        <span className="text-xs text-slate-500 animate-pulse">Loading simulation...</span>
      </div>
    )
  }
)


export default function SimulatorPage() {
  const supabase = createClient()
  const [hours, setHours] = useState(15)
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [intensity, setIntensity] = useState<'standard' | 'accelerated' | 'hardcore'>('standard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('weekly_hours, experience_level')
          .eq('id', session.user.id)
          .single()
        if (profileData) {
          if (profileData.weekly_hours) setHours(profileData.weekly_hours)
          if (profileData.experience_level) setDifficulty(profileData.experience_level as any)
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const deferredHours = useDeferredValue(hours)

  // Simple simulator calculations
  const calculateCompletionMonths = (h: number) => {
    let baseMonths = 5
    if (h > 15) baseMonths -= (h - 15) * 0.15
    if (h < 15) baseMonths += (15 - h) * 0.25
    if (difficulty === 'advanced') baseMonths += 1.5
    if (difficulty === 'beginner') baseMonths -= 1
    if (intensity === 'hardcore') baseMonths -= 0.8
    return Math.max(1.5, parseFloat(baseMonths.toFixed(1)))
  }

  const calculateReadinessScore = (h: number) => {
    let baseScore = 78
    if (h > 15) baseScore += (h - 15) * 0.8
    if (h < 15) baseScore -= (15 - h) * 1.5
    if (difficulty === 'advanced') baseScore += 5
    return Math.min(100, Math.max(20, Math.round(baseScore)))
  }

  const months = useMemo(() => calculateCompletionMonths(deferredHours), [deferredHours, difficulty, intensity])
  const readiness = useMemo(() => calculateReadinessScore(deferredHours), [deferredHours, difficulty])
  
  const risk = useMemo(() => {
    if (months > 6) return { label: 'High Risk', color: 'text-red-400 bg-red-500/10 border-red-500/20' }
    if (months > 4.5) return { label: 'Moderate Risk', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
    return { label: 'Low Risk', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
  }, [months])

  // Chart data showing completion times for different hours
  const simulationChartData = useMemo(() => {
    const hoursOptions = [5, 10, 15, 20, 25, 30]
    return hoursOptions.map(h => ({
      hours: h,
      months: calculateCompletionMonths(h)
    }))
  }, [difficulty, intensity])


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-sm text-slate-500 animate-pulse">Loading simulator track...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">What-If Learning Path Simulator</h1>
        <p className="text-slate-400 text-sm mt-1">
          Adjust study workload, deadline constraints, and difficulty parameters to instantly recalculate your target outcomes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold text-white mb-4">Parameters</h3>

          {/* Study Hours Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="text-slate-400 font-medium">Weekly Study Hours</label>
              <span className="text-blue-400 font-bold">{hours} hrs</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="40" 
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>5 hrs</span>
              <span>20 hrs</span>
              <span>40 hrs</span>
            </div>
          </div>

          {/* Difficulty Preference */}
          <div className="space-y-2">
            <label className="block text-sm text-slate-400 font-medium">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-2 rounded-xl text-xs font-semibold capitalize transition \${
                    difficulty === level 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Selector */}
          <div className="space-y-2">
            <label className="block text-sm text-slate-400 font-medium">Intensity Rate</label>
            <select
              value={intensity}
              onChange={(e: any) => setIntensity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="standard">Standard Pace</option>
              <option value="accelerated">Accelerated (Extra Assessments)</option>
              <option value="hardcore">Hardcore (Intense Projects)</option>
            </select>
          </div>

          <button className="w-full bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600 hover:text-white text-blue-400 font-semibold py-3 rounded-xl transition text-sm">
            Save Simulation Config
          </button>
        </div>

        {/* Results & Visualizations Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dynamic KPI Outputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                <Calendar size={14} /> Estimated Target
              </div>
              <p className="text-2xl font-bold text-white mt-2">{months} Months</p>
              <p className="text-[10px] text-slate-500 mt-1">To achieve AI Engineer</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                <TrendingUp size={14} /> Readiness Index
              </div>
              <p className="text-2xl font-bold text-emerald-400 mt-2">{readiness}%</p>
              <p className="text-[10px] text-slate-500 mt-1">Final target competency</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                <Clock size={14} /> Required Workload
              </div>
              <p className="text-2xl font-bold text-white mt-2">{(hours * 4.3).toFixed(0)} hrs</p>
              <p className="text-[10px] text-slate-500 mt-1">Estimated monthly commitment</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                <AlertTriangle size={14} /> Path Risk Level
              </div>
              <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border mt-2.5 \${risk.color}`}>
                {risk.label}
              </span>
            </div>
          </div>

          {/* Completion Schedule Chart */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Completion Curve (Workload vs Duration)</h3>
            <div className="h-64">
              <SimulationChart data={simulationChartData} />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
