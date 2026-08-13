import { Routes, Route } from 'react-router-dom'
import AnalyticsRouteTracker from './components/AnalyticsRouteTracker.jsx'
import ClaimPendingReading from './components/ClaimPendingReading.jsx'
import ProfileSetupModal from './components/ProfileSetupModal.jsx'
import ReadingSidebar from './components/ReadingSidebar.jsx'
import HomePage from './pages/HomePage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ResultPage from './pages/ResultPage.jsx'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <AnalyticsRouteTracker />
      <ReadingSidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/result/:id" element={<ResultPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </main>
      <ProfileSetupModal />
      <ClaimPendingReading />
    </div>
  )
}

export default App
