import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn }    = useAuth()
  const navigate      = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError('Incorrect email or password.')
      setLoading(false)
    } else {
      navigate('/memories')
    }
  }

  return (
    <div className="min-h-screen bg-olive-800 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-display italic text-cream/60 text-lg mb-1">welcome back</p>
          <h1 className="font-display font-light text-cream text-4xl">A&amp;J Studios</h1>
          <div className="w-10 h-px bg-cream/20 mx-auto mt-5" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-olive-700/60 border border-olive-600 px-4 py-3
              font-body text-sm text-cream placeholder-cream/30
              focus:outline-none focus:border-cream/50 transition-colors rounded-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-olive-700/60 border border-olive-600 px-4 py-3
              font-body text-sm text-cream placeholder-cream/30
              focus:outline-none focus:border-cream/50 transition-colors rounded-sm"
          />

          {error && (
            <p className="text-red-400 text-xs font-body">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-cream text-olive-800 font-body
              tracking-[0.2em] uppercase text-sm
              hover:bg-cream/90 active:scale-[0.98] transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Enter'}
          </button>
        </form>

        {/* Back link */}
        <div className="text-center mt-8">
          <a href="/" className="text-cream/30 text-xs uppercase tracking-widest
            hover:text-cream/60 transition-colors font-body">
            ← Back to site
          </a>
        </div>
      </div>
    </div>
  )
}
