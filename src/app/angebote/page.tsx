import AuthButton from '@/components/AuthButton'
import HomeClient from '@/components/HomeClient'

export default function AngebotePage() {
  return (
    <main className="min-h-screen bg-[#1e1e2e]">
      <header className="sticky top-0 z-20 bg-[#1e1e2e]/95 backdrop-blur-sm border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>📡</span>
            <span className="text-xl font-bold text-white">Deal Radar</span>
          </div>
          <AuthButton />
        </div>
      </header>
      <HomeClient />
    </main>
  )
}
