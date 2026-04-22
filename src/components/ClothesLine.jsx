import React from 'react'
import { motion } from 'framer-motion'
import { img } from 'framer-motion/client'


const PLACEHOLDERS = [
  { rotate: -4,  img: '/flowers.jpg' },
  { rotate:  2,  img: '/shoes.jpg', },
  { rotate: -2,  img: '/cake.jpg' },
  { rotate: 5,   img: '/hearts.jpg' },
  { rotate: -3,  img: '/rings.jpg' },
]

function Clothespin({ style }) {
  return (
    <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex flex-col items-center" style={style}>
      {/* Pin head */}
      <div className="w-5 h-3 rounded-t bg-amber-700 border-b-2 border-amber-900" />
      {/* Pin legs */}
      <div className="flex gap-1">
        <div className="w-2 h-4 rounded-b bg-amber-600" />
        <div className="w-2 h-4 rounded-b bg-amber-600" />
      </div>
    </div>
  )
}

function Polaroid({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: item.rotate }}
      whileInView={{ opacity: 1, y: 0, rotate: item.rotate }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.04 }}
      className="relative flex-shrink-0 cursor-default select-none"
      style={{ transformOrigin: 'top center' }}
    >
      <Clothespin />
      {/* Polaroid frame */}
      <div className="bg-white shadow-xl p-2 pb-7 w-28 md:w-36">
        {item.img ? (
         <img
    src={item.img}
    alt="Memory"
    className="w-full aspect-square object-cover"
  />
) : (
  <div
    className="w-full aspect-square flex items-center justify-center"
    style={{ background: item.bg }}
  >
    <span className="font-display text-white/60 text-2xl italic">
      {item.label}
    </span>
  </div>
)}
      </div>
    </motion.div>
  )
}

export default function Clothesline() {
  return (
    <section className="bg-white py-16 overflow-hidden">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}  
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center font-display text-2xl italic text-olive-500 mb-12"
      >
        a string of beautiful moments
      </motion.p>

      {/* Rope */}
      <div className="relative px-4 md:px-16">
        <div className="rope w-full absolute top-5 left-0 right-0" />

        {/* Polaroid row — horizontally scrollable on mobile */}
        <div className="flex gap-6 md:gap-10 justify-start md:justify-center
          overflow-x-auto pb-6 pt-8 px-6 md:px-0 no-scrollbar">
          {PLACEHOLDERS.map((item, i) => (
            <Polaroid key={i} item={item} index={i} />
          ))}
        </div>
      </div>

      {/* Hide scrollbar but keep scroll functional */}
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}
      </style>
    </section>
  )
}
