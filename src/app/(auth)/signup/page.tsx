import { signUp, signInWithGoogle } from '@/app/auth/actions'

interface SignupPageProps {
  searchParams: Promise<{ error?: string; message?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error, message } = await searchParams

  if (message === 'check-email') {
    return (
      <div className="bg-[#2a2a3e] rounded-2xl p-8 shadow-xl border border-white/5 text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-white mb-2">Fast fertig!</h1>
        <p className="text-gray-400 text-sm">
          Wir haben dir eine Bestätigungs-E-Mail geschickt. Bitte klicke auf den Link darin, um dein Konto zu aktivieren.
        </p>
        <a href="/login" className="mt-6 inline-block text-orange-400 hover:text-orange-300 text-sm transition-colors">
          Zurück zum Login
        </a>
      </div>
    )
  }

  return (
    <div className="bg-[#2a2a3e] rounded-2xl p-8 shadow-xl border border-white/5">
      <h1 className="text-2xl font-bold text-white mb-2">Konto erstellen</h1>
      <p className="text-gray-400 text-sm mb-6">Speichere Deals und erhalte personalisierte Angebote.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={signUp} className="space-y-4">
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
            Passwort
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className="w-full px-4 py-2.5 bg-[#1e1e2e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
            placeholder="Mindestens 8 Zeichen"
          />
        </div>

        <div className="flex items-start gap-3">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            className="mt-0.5 w-4 h-4 accent-orange-500 cursor-pointer"
          />
          <label htmlFor="consent" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
            Ich stimme der Verarbeitung meiner E-Mail-Adresse gemäß der{' '}
            <a href="/datenschutz" className="text-orange-400 hover:text-orange-300 underline">
              Datenschutzerklärung
            </a>{' '}
            zu. Die Einwilligung kann jederzeit widerrufen werden.
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#2a2a3e]"
        >
          Konto erstellen
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-[#2a2a3e] px-3 text-gray-500">oder</span>
        </div>
      </div>

      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="w-full py-2.5 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#2a2a3e]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Mit Google registrieren
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Bereits ein Konto?{' '}
        <a href="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
          Jetzt anmelden
        </a>
      </p>
    </div>
  )
}
