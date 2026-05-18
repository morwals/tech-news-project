import { useState } from 'react';
import Feed from './pages/Feed';
import About from './pages/About';
import Member from './pages/Member';
import ForYou from './pages/ForYou';

function App() {
  const [currentPage, setCurrentPage] = useState('feed'); 
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Universal Navigation Header */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0', marginBottom: '32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          <h1 
            onClick={() => setCurrentPage('feed')}
            style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            ⚡ Signal
          </h1>
          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <button 
              onClick={() => setCurrentPage('feed')}
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                color: currentPage === 'feed' ? '#2563eb' : '#64748b', transition: 'color 0.2s'
              }}
            >
              Feed
            </button>
            <button 
              onClick={() => setCurrentPage('about')}
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                color: currentPage === 'about' ? '#2563eb' : '#64748b', transition: 'color 0.2s'
              }}
            >
              About
            </button>
            <button 
              onClick={() => setCurrentPage('foryou')}
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                color: currentPage === 'foryou' ? '#2563eb' : '#64748b', transition: 'color 0.2s'
              }}
            >
              For You
            </button>
            <button 
              onClick={() => setCurrentPage('member')}
              style={{ 
                background: currentPage === 'member' ? '#0f172a' : '#e2e8f0', 
                border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                color: currentPage === 'member' ? '#fff' : '#334155', 
                padding: '8px 16px', borderRadius: '6px', transition: 'all 0.2s'
              }}
            >
              Subscribe
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      {/* Main Container */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        {currentPage === 'feed' && <Feed apiUrl={apiUrl} />}
        {currentPage === 'foryou' && <ForYou apiUrl={apiUrl} setCurrentPage={setCurrentPage} />} {/* NEW */}
        {currentPage === 'about' && <About />}
        {currentPage === 'member' && <Member apiUrl={apiUrl} />}
      </main>
    </div>
  );
}

export default App;