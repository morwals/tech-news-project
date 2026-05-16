import { useState, useEffect } from 'react'

function App() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState("All") // New State for filtering

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

  if (loading) return <h2>Loading AI-Curated Tech News...</h2>

  // 1. Extract all unique tags from the articles
  const allTags = ["All", ...new Set(
    articles.flatMap(article => article.tags || [])
  )]

  // 2. Filter articles based on the selected tag
  const filteredArticles = selectedTag === "All" 
    ? articles 
    : articles.filter(article => article.tags && article.tags.includes(selectedTag))

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>Daily Tech Feed</h1>
      
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {allTags.map(tag => (
          <button 
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: selectedTag === tag ? '#0056b3' : '#eee',
              color: selectedTag === tag ? '#fff' : '#333'
            }}
          >
            {tag}
          </button>
        ))}
      </div>
      <hr style={{ marginBottom: '20px' }}/>
      
      
      {filteredArticles.map((article) => (
        <div key={article.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>
              <a href={article.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#0056b3' }}>
                {article.title}
              </a>
            </h3>
            <span style={{ backgroundColor: '#e9ecef', padding: '5px 10px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
              Score: {article.score}/10
            </span>
          </div>

          
          <div style={{ marginBottom: '10px' }}>
            {(article.tags || []).map(tag => (
               <span key={tag} style={{ fontSize: '12px', color: '#0056b3', marginRight: '8px' }}>#{tag}</span>
            ))}
          </div>
          
          <p style={{ fontSize: '12px', color: '#666', marginTop: 0 }}>Source: {article.source}</p>
          
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
            {article.summary}
          </div>
          
        </div>
      ))}
    </div>
  )
}

export default App