'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Bot, 
  Map, 
  Dumbbell, 
  GraduationCap, 
  GitCompare, 
  Gamepad2, 
  Target, 
  Network, 
  Briefcase, 
  BookX, 
  FolderGit2, 
  Settings,
  LogOut
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const navSections = [
  {
    title: 'LEARN',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'AI Assistant', href: '/assistant', icon: Bot },
      { name: 'Roadmap', href: '/roadmap', icon: Map },
      { name: 'Training', href: '/training', icon: Dumbbell },
      { name: 'AI Tutor', href: '/tutor', icon: GraduationCap },
    ]
  },
  {
    title: 'PROGRESS',
    items: [
      { name: 'Daily Missions', href: '/missions', icon: Target },
      { name: 'Career Readiness', href: '/readiness', icon: Briefcase },
      { name: 'Mistakes', href: '/mistakes', icon: BookX },
      { name: 'Projects', href: '/projects', icon: FolderGit2 },
    ]
  },
  {
    title: 'EXPLORE',
    items: [
      { name: 'Study Simulator', href: '/simulator', icon: GitCompare },
      { name: 'Games', href: '/games', icon: Gamepad2 },
      { name: 'Skill Constellation', href: '/constellation', icon: Network },
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { name: 'Settings', href: '/settings', icon: Settings },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-30 transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 select-none">
          <span className="w-2.5 h-6 bg-indigo-500 rounded-sm" />
          ABHYAAS
        </h2>
        <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1">AI Learning Platform</p>
      </div>
      
      {/* Grouped Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <nav className="space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="text-[10px] font-bold text-slate-500 tracking-wider mb-2 px-3">{section.title}</h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      className={`group relative flex items-center gap-3 pl-4 pr-3 py-2 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-indigo-600/10 text-indigo-400 font-medium' 
                          : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-md" />
                      )}
                      <item.icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
                      <span className="text-xs">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-950/20 border border-slate-800/40 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs select-none">
            U
          </div>
          <div className="flex-1 min-w-0 select-none">
            <p className="text-xs font-semibold text-white truncate">User Profile</p>
            <p className="text-[10px] text-slate-500 truncate">Settings & Session</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
