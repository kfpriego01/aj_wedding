import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

function Lightbox({ photo, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleDownload = async () => {
    try {
      const res = await fetch(photo.file_url)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = photo.guest_name ? `memory-${photo.guest_name}.jpg` : 'memory.jpg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }
  

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
        <button
          onClick={handleDownload}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-cream/50 text-xs uppercase tracking-widest hover:text-cream transition-colors font-body">
          ↓ Download
        </button>
      </motion.div>
    </motion.div>
  )
}

function PhotoCard({ photo, onClick, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    const { error } = await supabase.from('photos').delete().eq('id', photo.id)
    if (!error) onDelete(photo.id)
    setShowConfirm(false)
  }

  return (
    <>
      <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.35 }}
        className="relative group cursor-pointer bg-white shadow-md overflow-hidden rounded-sm"
        onClick={() => onClick(photo)}
      >
        <img src={photo.file_url} alt={photo.guest_name || 'Memory'}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-olive-900/0 group-hover:bg-olive-900/30 transition-colors duration-300" />
        {photo.guest_name && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-cream font-display italic text-sm">{photo.guest_name}</p>
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setShowConfirm(true) }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </motion.div>

      {/* Confirm dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25 }}
              className="bg-cream rounded-sm shadow-2xl p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-display text-olive-800 text-2xl mb-2">Delete photo?</p>
              <p className="font-body text-olive-500 text-sm mb-8">This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 border border-olive-300 text-olive-600 font-body text-xs uppercase tracking-widest hover:bg-olive-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-red-500 text-white font-body text-xs uppercase tracking-widest hover:bg-red-600 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function Memories() {
  const [photos,   setPhotos]  = useState([])
  const [loading,  setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const fetchPhotos = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) { console.error(error); setLoading(false); return }
    setPhotos(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchPhotos() }, [fetchPhotos])

  const handleDelete = (id) => setPhotos((prev) => prev.filter((p) => p.id !== id))
const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-cream">

      {/* Header */}
   <div className="sticky top-0 z-40 bg-olive-800 px-5 py-4 flex items-center justify-between shadow-lg">
  <div className="flex items-center gap-4">
    <button onClick={() => navigate('/')} className="text-cream/60 hover:text-cream transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <div>
      <p className="font-display text-cream text-lg">Our Memories</p>
      {!loading && <p className="text-cream/40 text-xs font-body">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>}
    </div>
  </div>
  <button onClick={fetchPhotos} className="text-cream/50 text-xs hover:text-cream transition-colors font-body">
    Refresh
  </button>
</div>

      {/* Grid */}
      <div className="p-4 md:p-8">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <p className="font-display italic text-olive-400 text-xl animate-pulse">Loading memories…</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-display italic text-olive-400 text-2xl mb-2">No photos yet</p>
            <p className="font-body text-olive-300 text-sm">Share the upload link with your guests!</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <AnimatePresence>
              {photos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} onClick={setSelected} onDelete={handleDelete} />
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