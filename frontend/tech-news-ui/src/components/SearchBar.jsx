import { Search, X } from 'lucide-react'

function SearchBar({ searchQuery, setSearchQuery, handleSearch, isSearching, handleClearSearch }) {
  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-6">
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Semantic search — e.g. 'zero-day exploits' or 'database sharding'…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      <button
        type="submit"
        className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
      >
        Search
      </button>

      {isSearching && (
        <button
          type="button"
          onClick={handleClearSearch}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
        >
          <X size={14} />
          Clear
        </button>
      )}
    </form>
  )
}

export default SearchBar
