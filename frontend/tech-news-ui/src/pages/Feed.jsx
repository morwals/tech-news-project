import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import TagFilters from '../components/TagFilters';
import ArticleCard from '../components/ArticleCard';

function Feed({ apiUrl }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState(""); 
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch(`${apiUrl}/api/news`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setArticles(data.articles || []);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [apiUrl]);

  const handleClearSearch = () => {
    setLoading(true);
    setIsSearching(false);
    setSearchQuery("");
    setSelectedTag("All");
    fetch(`${apiUrl}/api/news`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setLoading(false);
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setIsSearching(true);
    setSelectedTag("All");

    fetch(`${apiUrl}/api/search?q=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setLoading(false);
      });
  };

  if (loading) return <h2 style={{ color: '#475569', textAlign: 'center', marginTop: '40px' }}>Syncing Intelligence Stream...</h2>;

  const allTags = ["All", ...new Set(articles.flatMap(article => article.tags || []))];
  const filteredArticles = selectedTag === "All" 
    ? articles 
    : articles.filter(article => article.tags && article.tags.includes(selectedTag));

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
      
      <h3 style={{ color: '#475569', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
        {isSearching ? `🔍 Semantic Matches for "${searchQuery}"` : "🔥 High-Signal Stream"}
      </h3>

      {filteredArticles.length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No matches found in this configuration window.</p>
      ) : (
        filteredArticles.map(article => <ArticleCard key={article.id} article={article} />)
      )}
    </div>
  );
}

export default Feed;