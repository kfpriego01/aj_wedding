import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-olive-700 px-5 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        {/* Simple geometric mark */}
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-cream">
          <path d="M2 2h8v8H2zM12 2h8v8h-8zM2 12h8v8H2zM12 12h8v8h-8z"
            stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
        <span className="font-display text-cream text-lg tracking-widest font-medium uppercase">
          A&amp;J Studios
        </span>
      </div>

      {/* Couple-only link — subtle, not obvious to guests */}
      <Link
        to="/login"
        className="text-cream/40 text-xs hover:text-cream/80 transition-colors font-body tracking-widest uppercase"
        title="Couple's login"
      >
        ♥
      </Link>
    </nav>
  )
}
