function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-4/5" />
        </div>
        <div className="h-6 bg-slate-200 rounded-full w-14 shrink-0" />
      </div>
      <div className="h-44 bg-slate-100 rounded-lg mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-slate-200 rounded w-16" />
        <div className="h-5 bg-slate-200 rounded w-20" />
        <div className="h-5 bg-slate-200 rounded w-14" />
      </div>
      <div className="flex gap-4 mb-4">
        <div className="h-3 bg-slate-100 rounded w-20" />
        <div className="h-3 bg-slate-100 rounded w-24" />
        <div className="h-3 bg-slate-100 rounded w-16" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-100 rounded w-full" />
        <div className="h-3.5 bg-slate-100 rounded w-11/12" />
        <div className="h-3.5 bg-slate-100 rounded w-4/5" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  )
}

export default SkeletonCard
