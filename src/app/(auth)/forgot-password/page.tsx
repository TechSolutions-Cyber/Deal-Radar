import { resetPassword } from '@/app/auth/actions'

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string; message?: string }>
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { error, message } = await searchParams

  if (message === 'check-email') {
    return (
      <div className="bg-[#2a2a3e] rounded-2xl p-8 shadow-xl border border-white/5 text-center">
        <div className="text-5xl mb-4">📬</div>
        <h1 className="text-2xl font-bold text-white mb-2">E-Mail gesendet</h1>
        <p className="text-gray-400 text-sm">
          Falls diese E-Mail-Adresse registriert ist, haben wir dir einen Link zum Zurücksetzen des Passworts geschickt.
        </p>
        <a href="/login" className="mt-6 inline-block text-orange-400 hover:text-orange-300 text-sm transition-colors">
          Zurück zum Login
        </a>
      </div>
    )
  }

  return (
    <div className="bg-[#2a2a3e] rounded-2xl p-8 shadow-xl border border-white/5">
      <h1 className="text-2xl font-bold text-white mb-2">Passwort zurücksetzen</h1>
      <p className="text-gray-400 text-sm mb-6">
        Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link zum Zurücksetzen deines Passworts.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={resetPassword} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
            E-Mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full px-4 py-2.5 bg-[#1e1e2e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
            placeholder="deine@email.de"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#2a2a3e]"
        >
          Link senden
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <a href="/login" className="text-orange-400 hover:text-orange-300 transition-colors">
          ← Zurück zum Login
        </a>
      </p>
    </div>
  )
}
