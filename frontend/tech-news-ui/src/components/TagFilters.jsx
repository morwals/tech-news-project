

function TagFilters({ allTags, selectedTag, setSelectedTag }) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
      {allTags.map(tag => {
        const isActive = selectedTag === tag;
        return (
          <button 
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              padding: '6px 14px', borderRadius: '20px', border: '1px solid',
              borderColor: isActive ? '#3b82f6' : '#e2e8f0', cursor: 'pointer', 
              fontWeight: '600', fontSize: '13px', transition: 'all 0.2s',
              backgroundColor: isActive ? '#e0f2fe' : '#fff',
              color: isActive ? '#0369a1' : '#64748b'
            }}
          >
            {tag === "All" ? "🏷️ All Topics" : `#${tag}`}
          </button>
        );
      })}
    </div>
  );
}

export default TagFilters;