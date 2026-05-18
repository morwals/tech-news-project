import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

function Member({ apiUrl }) {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert("Check your email for the Magic Link!");
  };

  const handleSyncInterests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/profile/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, user_id: user.id })
      });
      if (res.ok) alert("Signals optimized! Your daily email will now target these topics.");
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (!user) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
        <h2>Join the Signal Network</h2>
        <p>Sign up to receive personalized daily engineering intelligence.</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
          <input type="email" placeholder="Your engineering email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Send Magic Link</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '12px' }}>
      <h2>Hello, {user.email}</h2>
      <p style={{ color: '#64748b' }}>Configure your intelligence profile to personalize your feed and emails.</p>
      
      <div style={{ marginTop: '24px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>What are you building or learning? (Be specific)</label>
        <textarea 
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="e.g. I am a backend engineer working with distributed Python systems and AWS serverless architecture..."
          style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}
        />
        <button 
          onClick={handleSyncInterests} 
          disabled={loading}
          style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? "Vectorizing..." : "Sync Intelligence Profile"}
        </button>
      </div>
      
      <button onClick={() => supabase.auth.signOut()} style={{ marginTop: '40px', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>Sign Out</button>
    </div>
  );
}

export default Member;