import { useState, useEffect } from 'react'

function App() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    fetch(`${apiUrl}/api/news`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles)
        setLoading(false)
      })
      .catch(err => console.error("Failed to fetch news:", err))
  }, [])

  if (loading) {
    return (
      <div style={styles.center}>
        <h2 style={styles.loadingText}>Loading AI-Curated Tech News...</h2>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Daily Tech Feed</h1>
          <p style={styles.subtitle}>AI-curated insights from across the web</p>
        </header>

        {articles.map(article => (
          <div key={article.id} style={styles.card}>
            <div style={styles.cardTop}>
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                style={styles.link}
              >
                {article.title}
              </a>

              <span style={styles.badge}>
                {article.score}/10
              </span>
            </div>

            <p style={styles.source}>Source: {article.source}</p>

            <p style={styles.summary}>
              {article.summary}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f6f8fc',
    padding: '40px 16px',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  container: {
    maxWidth: '850px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    marginTop: '8px',
    color: '#666',
    fontSize: '14px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '18px 20px',
    marginBottom: '16px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
    border: '1px solid #eef0f4',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
  },
  link: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1d4ed8',
    textDecoration: 'none',
    lineHeight: '1.4',
  },
  badge: {
    background: '#e8f0ff',
    color: '#1d4ed8',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  source: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#888',
  },
  summary: {
    marginTop: '10px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#333',
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f6f8fc',
  },
  loadingText: {
    color: '#555',
  },
}

export default App