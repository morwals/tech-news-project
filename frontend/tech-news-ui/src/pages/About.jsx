

function About() {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '32px', borderRadius: '12px' }}>
      <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>Sumit Kumar</h2>
      <p style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#2563eb', fontWeight: '600' }}>Software Engineer</p>
      
      <div style={{ height: '1px', backgroundColor: '#e2e8f0', marginBottom: '24px' }}></div>
      
      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#334155', marginBottom: '12px' }}>Background & Education</h3>
      <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px', margin: '0 0 20px 0' }}>
        Graduate of the <strong>National Institute of Technology, Kurukshetra (NIT KKR)</strong>. 
        Specialized in creating defensive, highly data-accurate software architectures, backend infrastructure pipelines, and vector-native search engines.
      </p>

      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#334155', marginBottom: '12px' }}>Project Mission</h3>
      <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px', margin: 0 }}>
        This application acts as a high-signal automated intelligence filter. Built utilizing Python automated collectors, deterministic pattern-matching triage layers, 
        and 768-dimensional vector systems via PostgreSQL <code>pgvector</code> to provide real-time, context-aware indexing of dev ecosystems.
      </p>
    </div>
  );
}

export default About;