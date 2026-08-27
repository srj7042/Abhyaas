import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex transition-colors duration-200">
      {/* Subtle Mesh Glow Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.02] dark:bg-indigo-500/[0.04] rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/[0.01] dark:bg-purple-500/[0.03] rounded-full blur-[140px] pointer-events-none z-0" />

      <Sidebar />
      <div className="flex-1 flex flex-col pl-64 min-w-0 relative z-10">
        <TopBar />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
