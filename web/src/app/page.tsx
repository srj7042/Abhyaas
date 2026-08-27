import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground font-sans relative overflow-hidden transition-colors duration-200">
      {/* Glow effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl text-center space-y-6 relative z-10">
        <h1 className="text-5xl font-extrabold text-foreground tracking-tight leading-none sm:text-6xl">
          Welcome to <span className="text-blue-600">Abhyaas</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Your Personalized Learning Path Recommender. Master skills, track your progress, and achieve your dream career.
        </p>
        <div className="pt-4">
          <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-700 shadow-lg transition transform hover:-translate-y-1">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}
