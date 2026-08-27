'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Bell, Flame, Trophy, Search, Sun, Moon } from 'lucide-react'

export function TopBar() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [streak, setStreak] = useState<number>(0)
  const [xp, setXp] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const fetchHeaderData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const userId = session.user.id

      // Fetch all independent data concurrently in parallel
      const [profileRes, streakRes, xpRes] = await Promise.all([
        supabase.from('profiles').select('username, target_career').eq('id', userId).single(),
        supabase.from('streaks').select('current_streak').eq('user_id', userId).single(),
        supabase.from('xp_transactions').select('amount').eq('user_id', userId)
      ])

      if (profileRes.data) {
        setProfile(profileRes.data)
      }

      if (streakRes.data) {
        setStreak(streakRes.data.current_streak)
      }

      if (xpRes.data) {
        const totalXp = xpRes.data.reduce((sum, item) => sum + item.amount, 0)
        setXp(totalXp)
      }

      setLoading(false)
    }

    fetchHeaderData()

    // Initialize Theme
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    const initialTheme = savedTheme || 'dark'
    setTheme(initialTheme)
    document.documentElement.setAttribute('data-theme', initialTheme)
  }, [supabase])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-slate-300 flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-200 select-none">
      {/* Search Input */}
      <div className="flex items-center gap-4 w-80">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input 
            type="text" 
            placeholder="Search learning path..." 
            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak Badge */}
        <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg text-orange-500 dark:text-orange-400 font-bold text-xs">
          <Flame size={14} className="fill-current" />
          {loading ? '...' : `${streak} Days`}
        </div>

        {/* XP Badge */}
        <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg text-yellow-600 dark:text-yellow-400 font-bold text-xs">
          <Trophy size={14} />
          {loading ? '...' : `${xp.toLocaleString()} XP`}
        </div>

        {/* Theme Toggle Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="p-2 hover:bg-slate-850 rounded-xl transition text-slate-400 hover:text-white cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Icon */}
        <button className="p-2 hover:bg-slate-850 rounded-xl relative transition text-slate-400 hover:text-white cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
        </button>

        {/* User Profile Avatar */}
        <Link href="/settings" className="flex items-center gap-3 border-l border-slate-800 pl-4 hover:opacity-80 transition cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
            {profile?.username ? profile.username.substring(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="hidden md:block select-none">
            <p className="text-xs font-semibold text-white leading-none">{profile?.username || 'User Profile'}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{profile?.target_career ? `${profile.target_career}` : 'AI Learning Path'}</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
