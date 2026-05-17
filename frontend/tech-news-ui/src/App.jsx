import { useState, useEffect } from 'react'

function App() {
  const [articles, setArticles] = useState([])
  // loading is true by default, so we don't need to set it to true on the initial render
  const [loading, setLoading] = useState(true) 
  const [selectedTag, setSelectedTag] = useState("All")
  const [searchQuery, setSearchQuery] = useState("") 
  const [isSearching, setIsSearching] = useState(false)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // 1. Initial Load (Runs exactly once on mount)
  useEffect(() => {
    let isMounted = true // Good practice to prevent setting state if component unmounts

    fetch(`${apiUrl}/api/news`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setArticles(data.articles || [])
          setLoading(false)
        }
      })
      .catch(err => {
        console.error("Failed to fetch news:", err)
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [apiUrl])

  // 2. Manual Fetch for the "Clear" Button
  const handleClearSearch = () => {
    setLoading(true)
    setIsSearching(false)
    setSearchQuery("")
    setSelectedTag("All")

    fetch(`${apiUrl}/api/news`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || [])
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch news:", err)
        setLoading(false)
      })
  }

  // 3. Execute Semantic Search
  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setIsSearching(true)
    setSelectedTag("All") // Reset tags when searching

    fetch(`${apiUrl}/api/search?q=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || [])
        setLoading(false)
      })
      .catch(err => {
        console.error("Search failed:", err)
        setLoading(false)
      })
  }

  if (loading) return <h2>Loading AI Intelligence...</h2>

  const allTags = ["All", ...new Set(articles.flatMap(article => article.tags || []))]
  const filteredArticles = selectedTag === "All" 
    ? articles 
    : articles.filter(article => article.tags && article.tags.includes(selectedTag))

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>Daily Tech Feed</h1>
      
      {/* Semantic Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Semantic Search (e.g., 'how to scale databases' or 'zero day vulnerabilities')..."
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Search Meaning
        </button>
        {isSearching && (
          <button type="button" onClick={handleClearSearch} style={{ padding: '10px 20px', backgroundColor: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </form>
      
      {/* Tag Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {allTags.map(tag => (
          <button 
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
              backgroundColor: selectedTag === tag ? '#0056b3' : '#eee',
              color: selectedTag === tag ? '#fff' : '#333'
            }}
          >
            {tag}
          </button>
        ))}
      </div>
      <hr style={{ marginBottom: '20px' }}/>
      
      {/* Results Title */}
      <h3 style={{ color: '#555' }}>
        {isSearching ? `Semantic Results for "${searchQuery}"` : "Latest High-Signal Content"}
      </h3>

      {/* Article List */}
      {filteredArticles.length === 0 ? (
        <p>No articles found matching your criteria.</p>
      ) : (
         filteredArticles.map((article) => (
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
        
          {/* Updated Source & Reading Time Row */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                Source: <strong>{article.source}</strong>
              </p>
              {article.published_at && (
                <span style={{ fontSize: '12px', color: '#666' }}>
                  📅 {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              <span style={{ fontSize: '12px', color: '#666' }}>
                ⏱️ {article.reading_time || 1} min read
              </span>
            </div>
            
          {/* Safely render the summary as a list if it's an array or stringified array */}
          <div style={{ lineHeight: '1.6', marginTop: '10px' }}>
            {(() => {
              let bulletPoints;
              try {
                // If it is a stringified array from the database (e.g. '["point 1"]')
                if (typeof article.summary === 'string' && article.summary.startsWith('[')) {
                  bulletPoints = JSON.parse(article.summary);
                } 
                // If it's already an array
                else if (Array.isArray(article.summary)) {
                  bulletPoints = article.summary;
                }
                // If it's just a raw text string, wrap it in an array to map it
                else {
                  bulletPoints = [article.summary];
                }
                
                return (
                  <ul style={{ paddingLeft: '20px', margin: 0, color: '#444' }}>
                    {bulletPoints.map((point, index) => (
                      <li key={index} style={{ marginBottom: '8px' }}>{point}</li>
                    ))}
                  </ul>
                );
              } catch (e) {
                // Fallback if parsing fails
                console.error(e)
                return <div>{article.summary}</div>;
              }
            })()}
          </div>
            
            {article.similarity && (
                <p style={{ fontSize: '11px', color: 'green', marginTop: '10px' }}>
                  Match Strength: {(article.similarity * 100).toFixed(1)}%
                </p>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default App