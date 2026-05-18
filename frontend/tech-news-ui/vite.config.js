import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const MOCK_ARTICLES = [
  {
    id: 1,
    title: "🚨 CVE-2025-4427: Critical RCE in Ivanti Connect Secure — Actively Exploited",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2025-4427",
    score: 10,
    tags: ["Security", "Zero-Day"],
    source: "CISA KEV",
    published_at: "2025-05-17T10:00:00Z",
    reading_time: 3,
    summary: [
      "A critical RCE vulnerability allows unauthenticated attackers to gain full system control via a malformed HTTP request.",
      "CISA added to KEV catalog — federal agencies must patch by May 24, 2025.",
      "Ivanti released patch 22.7R2.6; no workaround exists, upgrade is mandatory."
    ]
  },
  {
    id: 2,
    title: "Postgres 17.2 Ships Major Query Planner Improvements and Logical Replication Fixes",
    url: "https://www.postgresql.org/about/news/",
    score: 8,
    tags: ["System Design", "Python"],
    source: "Dev.to",
    published_at: "2025-05-16T08:00:00Z",
    reading_time: 5,
    image_url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
    summary: [
      "Query planner now handles multi-dimensional statistics 40% more accurately, reducing poor plan selection on complex joins.",
      "Logical replication slots can now survive minor version upgrades without manual intervention.",
      "New pg_stat_io view exposes block-level I/O statistics per backend type for fine-grained performance analysis."
    ]
  },
  {
    id: 3,
    title: "Building a Production-Grade RAG Pipeline with LangChain and pgvector",
    url: "https://news.ycombinator.com",
    score: 7,
    tags: ["Python", "System Design", "AWS"],
    source: "Hacker News",
    published_at: "2025-05-15T14:00:00Z",
    reading_time: 8,
    summary: [
      "Chunking strategy matters: 512-token overlapping chunks outperform fixed splits by 23% on retrieval benchmarks.",
      "Hybrid search combining BM25 keyword match with cosine similarity beats pure vector search for technical queries.",
      "Cache embedding calls with Redis to cut costs by ~60% on repeated document ingestion."
    ]
  },
  {
    id: 4,
    title: "React 19 Compiler Reduces Bundle Size by 30% in Real-World Benchmarks",
    url: "https://react.dev",
    score: 6,
    tags: ["React", "Web Development"],
    source: "Dev.to",
    published_at: "2025-05-14T09:00:00Z",
    reading_time: 4,
    summary: [
      "The React Compiler automatically memoizes components and hooks, eliminating most manual useMemo/useCallback calls.",
      "Real-world apps saw 25–35% reduction in re-renders with zero code changes after enabling the compiler.",
      "Compiler ships stable in React 19.1; enable via babel plugin with 'react-compiler' preset."
    ]
  },
  {
    id: 5,
    title: "AWS Lambda Cold Start Times Drop 50% with New SnapStart for Python Runtimes",
    url: "https://aws.amazon.com/blogs/aws",
    score: 8,
    tags: ["AWS", "Python"],
    source: "InfoQ",
    published_at: "2025-05-13T11:00:00Z",
    reading_time: 6,
    summary: [
      "SnapStart for Python snapshots the initialized execution environment, eliminating JVM-equivalent cold start overhead.",
      "Benchmarks show p99 cold starts dropping from 1.2s to under 200ms for typical FastAPI Lambda handlers.",
      "Requires Lambda runtime python3.13+ and is available in all commercial AWS regions from May 2025."
    ]
  }
]

function mockApiPlugin() {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use('/api/news', (req, res, next) => {
        if (req.url === '/' || req.url === '') {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(JSON.stringify({ articles: MOCK_ARTICLES }))
        } else {
          next()
        }
      })
      server.middlewares.use('/api/search', (req, res) => {
        const q = new URL(req.url, 'http://localhost').searchParams.get('q') || ''
        const results = MOCK_ARTICLES
          .filter(a => a.title.toLowerCase().includes(q.toLowerCase()) || a.tags.join(' ').toLowerCase().includes(q.toLowerCase()))
          .map(a => ({ ...a, similarity: 0.85 + Math.random() * 0.14 }))
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ articles: results }))
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), mockApiPlugin()],
})
