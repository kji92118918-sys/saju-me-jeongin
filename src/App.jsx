import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import ResultPage from './pages/ResultPage.jsx'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </div>
  )
}

export default App
