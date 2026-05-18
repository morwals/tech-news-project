import { useState, useEffect } from 'react'
import { Lock, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'
import { SkeletonList } from '../components/SkeletonCard'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

function ForYou({ apiUrl }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let isMounted = true

    const fetchPersonalized = async userId => {
      setLoading(true)
      try {
        const res = await fetch(`${apiUrl}/api/news/personalized?user_id=${userId}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (isMounted) setArticles(data.articles || [])
      } catch (err) {
        console.error('Personalized feed error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) fetchPersonalized(currentUser.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) fetchPersonalized(currentUser.id)
      else setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [apiUrl])

  if (loading) return <SkeletonList count={4} />

  if (!user) {
    return (
      <div className="flex flex-col items-center text-center py-16 px-4">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Lock size={24} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Personalized feed locked</h2>
        <p className="text-slate-500 text-sm max-w-xs mb-6 leading-relaxed">
          Subscribe and set your engineering profile to unlock a feed matched to your stack.
        </p>
        <button
          onClick={() => navigate('/subscribe')}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          Get started
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={14} className="text-blue-500" />
        <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
          For You
        </span>
      </div>
      <p className="text-sm text-slate-500 mb-6 pb-5 border-b border-slate-100">
        Articles semantically matched to your engineering profile.
      </p>

      {articles.length === 0 ? (
        <div className="text-center py-16 px-4">
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            No matches yet. Make sure your bio in the Subscribe tab describes your stack in detail.
          </p>
          <button
            onClick={() => navigate('/subscribe')}
            className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            Update profile
          </button>
        </div>
      ) : (
        articles.map(article => <ArticleCard key={article.id} article={article} />)
      )}
    </div>
  )
}

export default ForYou
