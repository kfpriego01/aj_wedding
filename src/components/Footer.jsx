import React from 'react'
export default function Footer() {
  return (
    <footer className="bg-olive-800 text-cream/60 py-10 px-6 text-center">
      <p className="font-display italic text-cream/80 text-xl mb-1">
        Albert &amp; Jelian
      </p>
      <p className="font-body text-xs tracking-widest uppercase text-cream/40 mb-6">
        Wedding Photography
      </p>
      <div className="w-8 h-px bg-cream/20 mx-auto mb-6" />
      <p className="font-body text-xs text-cream/30">
        © {new Date().getFullYear()} A&amp;J Studios. All rights reserved.
      </p>
    </footer>
  )
}
