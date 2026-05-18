import { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

function ForYou({ apiUrl, setCurrentPage }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Move function INSIDE useEffect to fix hoisting errors and missing dependencies
    const fetchPersonalizedNews = async (userId) => {
      console.log("🚀 Firing API call for user:", userId);
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/news/personalized?user_id=${userId}`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const data = await res.json();
        console.log("✅ API Response Data:", data);
        
        // Only update React state if the user hasn't clicked away to another tab
        if (isMounted) {
          setArticles(data.articles || []);
        }
      } catch (err) {
        console.error("❌ Failed to fetch personalized news:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // 2. Initial check on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      console.log("🔍 Initial Session Check:", session ? "User Found" : "No User");
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        fetchPersonalizedNews(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    // 3. The active listener (Catches changes across tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      console.log("🔄 Auth State Changed:", _event);
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        fetchPersonalizedNews(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    // Cleanup listener on unmount
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [apiUrl]); // apiUrl is now the only required dependency!

  if (loading) return <h2 style={{ color: '#475569', textAlign: 'center', marginTop: '40px' }}>Curating your intelligence feed...</h2>;

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '60px', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ color: '#0f172a', marginBottom: '12px' }}>🔒 Personalized Feed Locked</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Subscribe and set your engineering profile to unlock a feed mathematically matched to your stack.</p>
        <button 
          onClick={() => setCurrentPage('member')} 
          style={{ padding: '12px 24px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Go to Subscribe
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ color: '#2563eb', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🎯 For You
      </h3>
      <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        Articles semantically matched to your engineering profile.
      </p>

      {articles.length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px' }}>
          Your profile vector hasn't matched any recent articles yet. Make sure your bio in the Subscribe tab is detailed!
        </p>
      ) : (
        articles.map(article => <ArticleCard key={article.id} article={article} />)
      )}
    </div>
  );
}

export default ForYou;