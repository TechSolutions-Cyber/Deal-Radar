import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#1e1e2e] flex items-center justify-center gap-6 px-6">
      <Link
        href="/cardmarket.html"
        className="flex-1 max-w-sm flex items-center justify-center rounded-2xl bg-orange-500 hover:bg-orange-400 text-white text-2xl font-bold py-20 transition-colors"
      >
        Card Market
      </Link>
      <Link
        href="/angebote"
        className="flex-1 max-w-sm flex items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-2xl font-bold py-20 transition-colors"
      >
        Angebote
      </Link>
    </main>
  )
}
