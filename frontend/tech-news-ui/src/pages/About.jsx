import { GitBranch, Database, Bot, Shield, Rss } from 'lucide-react'

const stack = [
  {
    icon: <Rss size={16} className="text-orange-500" />,
    label: 'Data Sources',
    value: 'Hacker News · Dev.to · InfoQ · CISA KEV · OSV Database',
  },
  {
    icon: <Bot size={16} className="text-purple-500" />,
    label: 'AI Layer',
    value: 'Gemini 2.5 Flash · Gemini Embeddings (768-dim)',
  },
  {
    icon: <Database size={16} className="text-blue-500" />,
    label: 'Infrastructure',
    value: 'FastAPI · Supabase · pgvector · Celery + Redis',
  },
  {
    icon: <Shield size={16} className="text-red-500" />,
    label: 'Security Intel',
    value: 'Live CVE tracking via CISA KEV + OSV · Score-boosted alerts',
  },
]

function About() {
  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white font-extrabold text-xl shrink-0">
            S
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Sumit Kumar</h1>
            <p className="text-sm text-blue-600 font-semibold">Software Engineer</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Background
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Graduate of <span className="font-semibold text-slate-800">NIT Kurukshetra</span>.
              Specialized in defensive software architectures, backend infrastructure pipelines,
              and vector-native search systems.
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Project Mission
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Signal is a high-throughput automated intelligence filter. It aggregates technical
              news from multiple sources, applies deterministic pre-filtering, runs LLM
              summarization only on relevant content, and stores 768-dimensional embeddings for
              sub-second semantic search — all so you can stay current without the noise.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          System Architecture
        </h2>
        <div className="space-y-4">
          {stack.map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">{label}</p>
                <p className="text-sm text-slate-700">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          How the Pipeline Works
        </h2>
        <ol className="space-y-3">
          {[
            'Scraper collects stories from HN, RSS feeds, CISA, and OSV every run.',
            'Deterministic keyword engine pre-filters noise before hitting the LLM.',
            'Gemini 2.5 Flash summarizes each article into 3 signal-dense bullets.',
            'Gemini Embeddings convert the summary to a 768-dim vector stored in pgvector.',
            'Security alerts (CISA/OSV) are fast-tracked and score-boosted automatically.',
            'Your profile vector matches against the article index for the personalized feed.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
              <span className="shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 py-2">
        <GitBranch size={13} />
        <span>Open source — built with FastAPI, React, Supabase, and Gemini AI</span>
      </div>
    </div>
  )
}

export default About
