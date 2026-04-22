import React from 'react'
import { motion } from 'framer-motion'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Hero() {
  const scrollToUpload = () => {
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="min-h-screen flex flex-col md:flex-row pt-14">

      {/* ── Left / Top: text panel ── */}
      <div className="flex-1 flex flex-col justify-center items-start px-8 py-16 md:py-0 bg-cream">

        {/* Decorative script line */}
        <motion.p
          {...fadeUp(0.1)}
          className="font-display text-olive-500 italic text-lg mb-4 tracking-wide"
        >
          You are cordially invited to
        </motion.p>

        <motion.h1
          {...fadeUp(0.25)}
          className="font-display font-light text-olive-800 leading-none mb-6"
          style={{ fontSize: 'clamp(2.6rem, 8vw, 5rem)' }}
        >
          ALBERT<br />
          <span className="text-olive-500">&amp;</span>JELIAN<br />
          STUDIOS
        </motion.h1>

        <motion.p
          {...fadeUp(0.4)}
          className="font-body text-olive-600 tracking-[0.3em] uppercase text-sm mb-10"
        >
          Wedding Photography
        </motion.p>

        {/* Divider */}
        <motion.div
          {...fadeUp(0.5)}
          className="w-16 h-px bg-olive-300 mb-10"
        />

        <motion.p
          {...fadeUp(0.55)}
          className="font-body text-olive-500 text-sm mb-10 max-w-xs leading-relaxed"
        >
          Were you there? Share a photo from our special day and help us relive every beautiful moment.
        </motion.p>

        <motion.button
          {...fadeUp(0.65)}
          onClick={scrollToUpload}
          className="border border-olive-700 text-olive-700 font-body tracking-[0.2em] uppercase text-xs px-8 py-4 hover:bg-olive-700 hover:text-cream transition-all duration-300 active:scale-95"
        >
          Upload Memories
        </motion.button>
      </div>

      {/* ── Right / Bottom: couple photo ── */}
<div className="flex-1 relative overflow-hidden min-h-[60vw] md:min-h-0">
  <img
    src="/couple.jpg"
    alt="Albert and Jelian"
    className="absolute inset-0 w-full h-full object-cover"
    style={{ objectPosition: '70% center' }}
  />
  <div className="hidden md:block absolute inset-y-0 left-0 w-24
    bg-gradient-to-r from-cream to-transparent pointer-events-none" />
</div>

    </section>
  )
}
