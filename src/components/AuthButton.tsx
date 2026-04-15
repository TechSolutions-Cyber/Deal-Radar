import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'

export default async function AuthButton() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <a
          href="/dashboard"
          className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block"
          title={user.email}
        >
          {user.email?.split('@')[0]}
        </a>
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
          >
            Abmelden
          </button>
        </form>
      </div>
    )
  }

  return (
    <a
      href="/login"
      className="text-sm px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
    >
      Anmelden
    </a>
  )
}
