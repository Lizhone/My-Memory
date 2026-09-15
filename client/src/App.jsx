import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import AddMemoryPage from './pages/AddMemoryPage'
import AskAIPage from './pages/AskAIPage'
import AllMemoriesPage from './pages/AllMemoriesPage'
import MemoryDetailsPage from './pages/MemoryDetailsPage'
import RemindersPage from './pages/RemindersPage'
import './index.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-very-light">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-blue text-white font-bold mb-4">
              M
            </div>
          </div>
          <h2 className="text-2xl font-bold text-dark-navy mb-2">My Memory</h2>
          <div className="flex gap-2 justify-center">
            <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} />
        <Route path="/add-memory" element={isAuthenticated ? <AddMemoryPage /> : <Navigate to="/login" replace />} />
        <Route path="/ask-ai" element={isAuthenticated ? <AskAIPage /> : <Navigate to="/login" replace />} />
        <Route path="/memories" element={isAuthenticated ? <AllMemoriesPage /> : <Navigate to="/login" replace />} />
        <Route path="/memory/:id" element={isAuthenticated ? <MemoryDetailsPage /> : <Navigate to="/login" replace />} />
        <Route path="/reminders" element={isAuthenticated ? <RemindersPage /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
