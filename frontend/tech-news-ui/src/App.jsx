import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Feed from './pages/Feed'
import ForYou from './pages/ForYou'
import About from './pages/About'
import Member from './pages/Member'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Feed apiUrl={API_URL} />} />
        <Route path="/for-you" element={<ForYou apiUrl={API_URL} />} />
        <Route path="/about" element={<About />} />
        <Route path="/subscribe" element={<Member apiUrl={API_URL} />} />
      </Routes>
    </Layout>
  )
}

export default App
