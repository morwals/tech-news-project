import { useState } from 'react'
import { ExternalLink, Clock, Radio, Calendar, Target } from 'lucide-react'
import clsx from 'clsx'

function parseBullets(summary) {
  if (!summary) return ['No summary available.']
  try {
    if (typeof summary === 'string' && summary.trimStart().startsWith('[')) {
      const parsed = JSON.parse(summary)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // fall through to string split
  }
  if (Array.isArray(summary)) return summary
  return [summary]
}

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ScoreBadge({ score }) {
  const color =
    score >= 8
      ? 'bg-red-50 text-red-700 border border-red-200'
      : score >= 6
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : 'bg-slate-100 text-slate-500 border border-slate-200'

  return (
    <span className={clsx('shrink-0 px-2.5 py-1 rounded-full text-xs font-bold tabular-nums', color)}>
      {score}/10
    </span>
  )
}

function ArticleCard({ article }) {
  const [imgError, setImgError] = useState(false)
  const bullets = parseBullets(article.summary)

  return (
    <article className="bg-white border border-slate-200 rounded-xl p-6 mb-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* Title + Score */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h2 className="text-base font-bold text-slate-900 leading-snug">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors inline-flex items-start gap-1.5 group"
          >
            {article.title}
            <ExternalLink
              size={13}
              className="shrink-0 mt-0.5 text-slate-300 group-hover:text-blue-400 transition-colors"
            />
          </a>
        </h2>
        <ScoreBadge score={article.score} />
      </div>

      {/* Hero image */}
      {article.image_url && !imgError && (
        <img
          src={article.image_url}
          alt=""
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-48 object-cover rounded-lg mb-4 border border-slate-100"
        />
      )}

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {article.tags.map(tag => (
            <span
              key={tag}
              className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mb-4">
        <span className="flex items-center gap-1">
          <Radio size={11} />
          {article.source}
        </span>
        {article.published_at && (
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {formatDate(article.published_at)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {article.reading_time || 1} min read
        </span>
      </div>

      {/* Summary bullets */}
      <ul className="list-disc pl-4 space-y-1.5 text-sm text-slate-600 leading-relaxed">
        {bullets.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>

      {/* Semantic similarity */}
      {article.similarity != null && (
        <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-emerald-600">
          <Target size={12} />
          {(article.similarity * 100).toFixed(1)}% semantic match
        </div>
      )}
    </article>
  )
}

export default ArticleCard
