import { useState, useEffect } from 'react'
import { Mail, CheckCircle, Cpu, LogOut, User } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

function Member({ apiUrl }) {
  const [user, setUser] = useState(null)
  const [bio, setBio] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [synced, setSynced] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const [email, setEmail] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async e => {
    e.preventDefault()
    if (!supabase) return
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) setAuthError(error.message)
    else setMagicSent(true)
  }

  const handleSyncInterests = async () => {
    if (!bio.trim()) return
    setSyncing(true)
    setSynced(false)
    setSyncError(null)
    try {
      const res = await fetch(`${apiUrl}/api/profile/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, user_id: user.id }),
      })
      if (!res.ok) throw new Error('Sync failed')
      setSynced(true)
    } catch (err) {
      setSyncError('Failed to sync. Please try again.')
      console.error(err)
    } finally {
      setSyncing(false)
    }
  }

  const handleSignOut = () => supabase?.auth.signOut()

  if (!user) {
    return (
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Join Signal</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Get a daily digest of articles matched to your engineering stack, delivered to your inbox.
          </p>
        </div>

        {magicSent ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
            <CheckCircle size={28} className="text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-emerald-800">Check your inbox</p>
            <p className="text-xs text-emerald-600 mt-1">We sent a magic link to {email}</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
            >
              Send magic link
            </button>

            <p className="text-center text-xs text-slate-400">
              No password needed. We'll email you a sign-in link.
            </p>
          </form>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* User info header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
          <User size={18} className="text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
          <p className="text-xs text-slate-400">Signal member</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>

      {/* Profile editor */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Cpu size={16} className="text-blue-500" />
          <h2 className="text-sm font-bold text-slate-900">Intelligence profile</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Describe your stack and what you're working on. This gets vectorized and used to personalize your feed and daily digest.
        </p>

        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
          What are you building or learning?
        </label>
        <textarea
          value={bio}
          onChange={e => {
            setBio(e.target.value)
            setSynced(false)
          }}
          placeholder="e.g. I'm a backend engineer working with distributed Python systems, FastAPI, Redis queues, and AWS Lambda. Currently exploring vector databases and RAG pipelines."
          rows={5}
          className="w-full px-3.5 py-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
        />

        {syncError && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">{syncError}</p>
        )}

        {synced && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg mb-3">
            <CheckCircle size={13} />
            Profile vectorized — your feed will update shortly.
          </div>
        )}

        <button
          onClick={handleSyncInterests}
          disabled={syncing || !bio.trim()}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {syncing ? 'Vectorizing…' : 'Sync profile'}
        </button>
      </div>

      {/* What happens next */}
      <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">What happens next</p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-0.5">1.</span>
            Your bio is converted to a 768-dim vector via Gemini Embeddings.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-0.5">2.</span>
            Every day, your vector is matched against new articles in the database.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-0.5">3.</span>
            Your top 5 matches arrive in your inbox as a daily digest.
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Member
