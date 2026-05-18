import { useState, useEffect, useCallback } from 'react'
import { Flame, AlertCircle, RefreshCw } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import TagFilters from '../components/TagFilters'
import ArticleCard from '../components/ArticleCard'
import { SkeletonList } from '../components/SkeletonCard'

function EmptyState({ isSearching, searchQuery }) {
  return (
    <div className="text-center py-16 px-4">
      <p className="text-slate-400 text-sm">
        {isSearching
          ? `No semantic matches for "${searchQuery}". Try a different query.`
          : 'No articles in this category yet.'}
      </p>
    </div>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertCircle size={32} className="text-slate-300" />
      <p className="text-slate-500 text-sm">Failed to load articles.</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  )
}

function Feed({ apiUrl }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedTag, setSelectedTag] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const fetchNews = useCallback(() => {
    setLoading(true)
    setError(false)
    fetch(`${apiUrl}/api/news`)
      .then(r => {
        if (!r.ok) throw new Error('Network error')
        return r.json()
      })
      .then(data => {
        setArticles(data.articles || [])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [apiUrl])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const handleSearch = e => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setLoading(true)
    setIsSearching(true)
    setSelectedTag('All')
    setError(false)

    fetch(`${apiUrl}/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
      .then(r => {
        if (!r.ok) throw new Error('Search failed')
        return r.json()
      })
      .then(data => {
        setArticles(data.articles || [])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearching(false)
    setSelectedTag('All')
    fetchNews()
  }

  if (loading) return <SkeletonList count={4} />
  if (error) return <ErrorState onRetry={isSearching ? handleClearSearch : fetchNews} />

  const allTags = ['All', ...new Set(articles.flatMap(a => a.tags || []))]
  const filtered =
    selectedTag === 'All' ? articles : articles.filter(a => a.tags?.includes(selectedTag))

  return (
    <div>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        isSearching={isSearching}
        handleClearSearch={handleClearSearch}
      />

      <TagFilters allTags={allTags} selectedTag={selectedTag} setSelectedTag={setSelectedTag} />

      <div className="flex items-center gap-2 mb-5">
        {isSearching ? (
          <>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
              Semantic matches for
            </span>
            <span className="text-xs font-bold text-slate-700">"{searchQuery}"</span>
          </>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 uppercase tracking-widest font-semibold">
            <Flame size={13} className="text-orange-400" />
            High-Signal Stream
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState isSearching={isSearching} searchQuery={searchQuery} />
      ) : (
        filtered.map(article => <ArticleCard key={article.id} article={article} />)
      )}
    </div>
  )
}

export default Feed
