

function SearchBar({ searchQuery, setSearchQuery, handleSearch, isSearching, handleClearSearch }) {
  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Semantic Search (e.g., 'zero day exploits' or 'database scaling')..."
        style={{ 
          flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
          fontSize: '15px', backgroundColor: '#f8fafc', transition: 'border-color 0.2s',
          outline: 'none'
        }}
      />
      <button type="submit" style={{ 
        padding: '12px 24px', backgroundColor: '#0f172a', color: '#fff', 
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
      }}>
        Search Meaning
      </button>
      {isSearching && (
        <button type="button" onClick={handleClearSearch} style={{ 
          padding: '12px 20px', backgroundColor: '#e2e8f0', color: '#334155',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
        }}>
          Clear
        </button>
      )}
    </form>
  );
}

export default SearchBar;