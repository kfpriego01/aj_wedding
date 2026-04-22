import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Home    from './pages/Home'
import Login   from './pages/Login'
import Memories from './pages/Memories'

// Wraps private routes — redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-display text-xl text-olive-600 italic">Loading…</p>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/memories" element={
          <ProtectedRoute>
            <Memories />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
