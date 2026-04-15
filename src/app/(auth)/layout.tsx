export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1e1e2e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <span className="text-3xl" aria-hidden>📡</span>
            <span className="text-2xl font-bold">Deal Radar</span>
          </a>
        </div>
        {children}
      </div>
    </div>
  )
}
