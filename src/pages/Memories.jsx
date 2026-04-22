import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function Lightbox({ photo, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25 }}
        className="relative max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={photo.file_url} alt={photo.guest_name || 'Memory'}
          className="w-full max-h-[80vh] object-contain rounded-sm shadow-2xl" />
        {photo.guest_name && (
          <p className="text-center font-display italic text-cream/70 mt-3 text-lg">
            from {photo.guest_name}
          </p>
        )}
        <button onClick={onClose}
          className="absolute -top-4 -right-4 bg-white/10 text-cream w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-sm">
          ✕
        </button>
        <a href={photo.file_url} download target="_blank" rel="noreferrer"
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-cream/50 text-xs uppercase tracking-widest hover:text-cream transition-colors font-body">
          ↓ Download
        </a>
      </motion.div>
    </motion.div>
  )
}

function PhotoCard({ photo, onClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.35 }}
      className="relative group cursor-pointer bg-white shadow-md overflow-hidden rounded-sm"
      onClick={() => onClick(photo)}
    >
      <img
        src={photo.file_url}
        alt={photo.guest_name || 'Memory'}
        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-olive-900/0 group-hover:bg-olive-900/30 transition-colors duration-300" />
      {photo.guest_name && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-cream font-display italic text-sm">{photo.guest_name}</p>
        </div>
      )}
    </motion.div>
  )
}

// ─── ADD YOUR PHOTOS HERE ───────────────────────────────────────────────────
// 1. Drop your image files into /public/photos/
// 2. Add a line below for each one: { id, file_url, guest_name }
// guest_name is optional — set to '' to hide the label
const PHOTOS = [
  { id: 1,  file_url: '/photos/photo1.jpg',  guest_name: '' },
  { id: 2,  file_url: '/photos/photo2.jpg',  guest_name: '' },
  { id: 3,  file_url: '/photos/photo3.jpg',  guest_name: '' },
  { id: 4,  file_url: '/photos/photo4.jpg',  guest_name: '' },
  { id: 5,  file_url: '/photos/photo5.jpg',  guest_name: '' },
  { id: 6,  file_url: '/photos/photo6.jpg',  guest_name: '' },
  { id: 7,  file_url: '/photos/photo7.jpg',  guest_name: '' },
  { id: 8,  file_url: '/photos/photo8.jpg',  guest_name: '' },
  { id: 9,  file_url: '/photos/photo9.jpg',  guest_name: '' },
  { id: 10, file_url: '/photos/photo10.jpg', guest_name: '' },
  // keep adding...
]
// ────────────────────────────────────────────────────────────────────────────

export default function Memories() {
  const [photos]   = useState(PHOTOS)
  const [selected, setSelected] = useState(null)

  return (
    <div className="min-h-screen bg-cream">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-olive-800 px-5 py-4 flex items-center justify-between shadow-lg">
        <div>
          <p className="font-display text-cream text-lg">Our Memories</p>
          <p className="text-cream/40 text-xs font-body">
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 md:p-8">
        {photos.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-display italic text-olive-400 text-2xl mb-2">No photos yet</p>
            <p className="font-body text-olive-300 text-sm">Add some images to the PHOTOS array above!</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <AnimatePresence>
              {photos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} onClick={setSelected} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && <Lightbox photo={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

    </div>
  )
} 