'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { FolderGit2, Check, ArrowRight, AlertCircle, X, Award, CheckCircle } from 'lucide-react'
import { checkAndGenerateProjects, updateProjectStatus, type ProjectType } from '@/components/projects/projectsGenerator'

export default function ProjectsPage() {
  const supabase = createClient()
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeProject, setActiveProject] = useState<ProjectType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [careerGoal, setCareerGoal] = useState('Fullstack Developer')

  const fetchProjects = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    const uid = session.user.id
    setUserId(uid)

    // Fetch user profile career goal
    const { data: profile } = await supabase
      .from('profiles')
      .select('target_career')
      .eq('id', uid)
      .single()
    
    const goal = profile?.target_career || 'Fullstack Developer'
    setCareerGoal(goal)

    // Check and generate dynamic projects
    const list = await checkAndGenerateProjects(uid, goal)
    setProjects(list)
    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [supabase])

  const handleStart = async (p: ProjectType) => {
    if (!userId) return
    setLoading(true)
    await updateProjectStatus(userId, p.id, 'In Progress')
    await fetchProjects()
  }

  const handleContinue = (p: ProjectType) => {
    setActiveProject(p)
  }

  const handleSubmitProject = async () => {
    if (!userId || !activeProject) return
    setSubmitting(true)
    await updateProjectStatus(userId, activeProject.id, 'Completed')
    setActiveProject(null)
    setSubmitting(false)
    await fetchProjects()
    alert(`🎉 Awesome work! You have completed: "${activeProject.title}" and earned +150 XP! Your career readiness score has been updated.`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-sm text-slate-500 animate-pulse">Loading projects portfolio...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-slate-200 relative">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Projects Panel</h1>
        <p className="text-slate-400 text-sm mt-1">Apply your core competencies to functional git portfolio deliverables.</p>
      </div>

      {/* Career path indicator */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3 text-xs text-blue-300">
        <FolderGit2 className="text-blue-400 shrink-0" size={18} />
        <div>
          <span className="font-bold text-white block">Personalized project assignments active:</span>
          <span>Targeting <strong className="text-white">{careerGoal}</strong> role. Finish assignments to build your profile evidence score.</span>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          {projects.map((p) => (
            <div key={p.id} className="flex justify-between items-center p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex-wrap gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <FolderGit2 size={16} className="text-blue-500" />
                  {p.title}
                </h4>
                <p className="text-[10px] text-slate-550 capitalize">Complexity: {p.difficulty}</p>
                {p.description && <p className="text-xs text-slate-400 mt-1 max-w-md">{p.description}</p>}
              </div>
              <div className="shrink-0">
                {p.status === 'Completed' ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                    <Check size={12} /> Complete
                  </span>
                ) : p.status === 'In Progress' ? (
                  <button 
                    onClick={() => handleContinue(p)}
                    className="bg-blue-600 hover:bg-blue-550 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1 active:scale-95"
                  >
                    Continue <ArrowRight size={12} />
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStart(p)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-800 text-xs font-semibold px-4 py-2 rounded-xl transition active:scale-95"
                  >
                    Start Project
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-3">
          <AlertCircle className="text-slate-500 mx-auto" size={32} />
          <h3 className="font-bold text-white">No Assigned Projects</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any projects assigned yet. Complete modules in your learning roadmap to unlock project assignments!
          </p>
        </div>
      )}

      {/* Project details / Continue workspace modal */}
      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full mx-4 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Project Workspace</h3>
              <button onClick={() => setActiveProject(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-bold text-white">{activeProject.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{activeProject.description}</p>
              
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2.5">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">Project Deliverables & Requirements:</span>
                <ul className="text-xs text-slate-350 space-y-1.5 list-disc pl-4">
                  <li>Structure the repository layout correctly.</li>
                  <li>Write high-quality codebase scripts.</li>
                  <li>Include custom validation testing specs.</li>
                  <li>Generate build dependencies reports.</li>
                </ul>
              </div>

              <div className="flex justify-between items-center bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-lg text-xs text-yellow-400 font-bold">
                <span className="flex items-center gap-1"><Award size={14} /> Completion Reward</span>
                <span>+150 XP</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitProject}
                disabled={submitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle size={16} />
                {submitting ? 'Submitting...' : 'Submit Project Code'}
              </button>
              <button
                onClick={() => setActiveProject(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
