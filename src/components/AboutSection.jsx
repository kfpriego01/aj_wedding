import React from 'react'
import { motion } from 'framer-motion'

// Decorative arch/curtain frame around the couple photo
function ArchFrame({ children }) {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Top crossbar */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-amber-700 rounded z-10" />

      {/* Left post */}
      <div className="absolute top-0 left-2 w-3 h-full bg-amber-700 rounded z-10" />
      {/* Right post */}
      <div className="absolute top-0 right-2 w-3 h-full bg-amber-700 rounded z-10" />

      {/* Left curtain */}
      <div
        className="absolute top-0 left-5 w-24 h-full z-10 opacity-90 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom right, #f5efe0, #ede0c8)',
          clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0 100%)',
        }}
      />
      {/* Right curtain */}
      <div
        className="absolute top-0 right-5 w-24 h-full z-10 opacity-90 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom left, #f5efe0, #ede0c8)',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 40% 100%)',
        }}
      />

      {/* Rose accent — top left */}
      <div className="absolute top-6 left-16 z-20 text-2xl">🌸</div>
      {/* Rose accent — top right */}
      <div className="absolute top-6 right-16 z-20 text-2xl">🌸</div>
      {/* Rose accent — bottom left */}
      <div className="absolute bottom-8 left-16 z-20 text-xl">🌸</div>
      {/* Rose accent — bottom right */}
      <div className="absolute bottom-8 right-16 z-20 text-xl">🌸</div>

      {/* Photo */}
      <div className="relative z-0 px-6 pt-3 pb-6">
        {children}
      </div>
    </div>
  )
}

// Film strip that scrolls horizontally — accepts real photos or placeholders
function FilmStrip() {
  // Replace these with real photo paths in public/ folder if you want
  // e.g. ['/film1.jpg', '/film2.jpg', ...]
const frames = [
  
  '/couple2.jpg',
  '/couple3.jpg',
    '/couple4.jpg',
      '/couple5.jpg',
        '/couple6.jpg',

]

  return (
    <div className="relative">
      {/* Film strip container */}
      <div
        className="flex items-center gap-0 overflow-x-auto no-scrollbar"
        style={{
          background: '#111',
          borderTop: '18px solid #111',
          borderBottom: '18px solid #111',
          padding: '0 8px',
        }}
      >
        {/* Sprocket holes top */}
        <div className="absolute top-0 left-0 right-0 h-4 flex items-center px-2 gap-4 pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="w-3 h-2.5 rounded-sm bg-amber-800/60 flex-shrink-0" />
          ))}
        </div>
        {/* Sprocket holes bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-4 flex items-center px-2 gap-4 pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="w-3 h-2.5 rounded-sm bg-amber-800/60 flex-shrink-0" />
          ))}
        </div>

        {/* Photo frames */}
        {frames.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-28 h-20 md:w-36 md:h-24 bg-gray-800 mx-1 overflow-hidden"
          >
            {src ? (
              <img src={src} alt={`Memory ${i + 1}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-3xl">
                🎞
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AboutSection() {
  const scrollToUpload = () => {
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="bg-amber-800 overflow-hidden">

      {/* ── Header bar ── */}
      <div className="px-6 py-5">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-body font-bold text-cream text-2xl md:text-3xl tracking-widest uppercase"
        >
          About Jelian &amp; Albert
        </motion.h2>
      </div>

      {/* ── Main content ── */}
      <div className="bg-cream flex flex-col md:flex-row gap-0 md:gap-8 items-stretch">

        {/* Left — couple photo with arch */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="md:w-1/2 py-8 px-4"
        >
          <ArchFrame>
            <img
              src="/couple2.jpg"
              alt="Jelian and Albert"
              className="w-full aspect-[3/4] object-cover object-top rounded-sm shadow-lg"
            />
          </ArchFrame>
        </motion.div>

        {/* Right — quote + upload CTA */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="md:w-1/2 flex flex-col justify-center items-center px-8 py-12 text-center gap-8"
        >
          {/* Quote */}
          <p
            className="text-olive-700 leading-relaxed max-w-xs"
            style={{
              fontFamily: '"Dancing Script", cursive',
              fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
            }}
          >
            "Be part of their love story — share your memorable moments with the newlyweds. Pictures with the bride and groom."
          </p>

          {/* Upload icon button */}
          <button
            onClick={scrollToUpload}
            className="group flex flex-col items-center gap-3"
          >
            <div className="w-28 h-28 border-4 border-dashed border-olive-500 rounded-xl
              flex items-center justify-center
              group-hover:border-olive-700 group-hover:bg-olive-50 transition-all duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-blush group-hover:text-olive-600 transition-colors"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <span className="font-body text-olive-500 text-xs uppercase tracking-widest
              group-hover:text-olive-700 transition-colors">
              Upload a Memory
            </span>
          </button>
        </motion.div>
      </div>

      {/* ── Film strip ── */}
      <div className="relative bg-cream pb-0">
        {/* "Bride & Groom" label */}
        <div className="text-right pr-6 pb-4">
          <p style={{ fontFamily: '"Dancing Script", cursive', fontSize: '2rem' }}
            className="text-amber-800 leading-none">
            Bride &amp;
          </p>
          <p className="font-black text-amber-900 text-3xl tracking-tight leading-none uppercase">
            GROOM
          </p>
        </div>
        <FilmStrip />
      </div>

    </section>
  )
}