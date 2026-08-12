import { Routes, Route } from 'react-router-dom'
import ReadingSidebar from './components/ReadingSidebar.jsx'
import HomePage from './pages/HomePage.jsx'
import ResultPage from './pages/ResultPage.jsx'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <ReadingSidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/result/:id" element={<ResultPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
