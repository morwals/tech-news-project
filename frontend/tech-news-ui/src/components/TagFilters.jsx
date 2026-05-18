import clsx from 'clsx'

function TagFilters({ allTags, selectedTag, setSelectedTag }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
      {allTags.map(tag => {
        const isActive = selectedTag === tag
        return (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={clsx(
              'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all',
              isActive
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
            )}
          >
            {tag === 'All' ? 'All Topics' : `#${tag}`}
          </button>
        )
      })}
    </div>
  )
}

export default TagFilters
