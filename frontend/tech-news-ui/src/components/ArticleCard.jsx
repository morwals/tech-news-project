

function ArticleCard({ article }) {
  let bulletPoints;
  try {
    if (typeof article.summary === 'string' && article.summary.startsWith('[')) {
      bulletPoints = JSON.parse(article.summary);
    } else if (Array.isArray(article.summary)) {
      bulletPoints = article.summary;
    } else {
      bulletPoints = [article.summary];
    }
  } catch (e) {
    console.error(e)
    bulletPoints = [article.summary];
  }

  return (
    <div style={{ 
      backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '24px', 
      marginBottom: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', lineHeight: '1.4' }}>
          <a href={article.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#1e293b' }}>
            {article.title}
          </a>
        </h3>
        <span style={{ 
          backgroundColor: article.score >= 8 ? '#fef2f2' : '#f1f5f9', 
          color: article.score >= 8 ? '#dc2626' : '#475569',
          padding: '4px 12px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap'
        }}>
          Score: {article.score}/10
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {(article.tags || []).map(tag => (
           <span key={tag} style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
             #{tag}
           </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px', fontSize: '12px', color: '#94a3b8' }}>
        <span>📡 {article.source}</span>
        {article.published_at && (
          <span>📅 {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        )}
        <span>⏱️ {article.reading_time || 1} min read</span>
      </div>
      
      <ul style={{ paddingLeft: '20px', margin: 0, color: '#334155', lineHeight: '1.6', fontSize: '14px' }}>
        {bulletPoints.map((point, index) => (
          <li key={index} style={{ marginBottom: '8px' }}>{point}</li>
        ))}
      </ul>
      
      {article.similarity && (
        <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
          🎯 Semantic Match: {(article.similarity * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

export default ArticleCard;