import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

const MAX_SIZE_MB    = 50
const CLOUD_NAME     = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET  = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

// ── Rate limit config ────────────────────────────────────────────
const RATE_LIMIT_MAX    = 20
const RATE_LIMIT_WINDOW = 5 * 60 * 1000 // 30 minutes in ms
const RATE_LIMIT_KEY    = 'aj_upload_log'

function getRateLimitStatus() {
  try {
    const raw    = localStorage.getItem(RATE_LIMIT_KEY)
    const log    = raw ? JSON.parse(raw) : []
    const now    = Date.now()
    const recent = log.filter((ts) => now - ts < RATE_LIMIT_WINDOW)
    return {
      allowed:   recent.length < RATE_LIMIT_MAX,
      used:      recent.length,
      remaining: Math.max(0, RATE_LIMIT_MAX - recent.length),
      resetIn:   recent.length > 0
                   ? Math.ceil((RATE_LIMIT_WINDOW - (now - Math.min(...recent))) / 60000)
                   : 0,
      recent,
    }
  } catch {
    return { allowed: true, used: 0, remaining: RATE_LIMIT_MAX, resetIn: 0, recent: [] }
  }
}

function recordUploads(count) {
  try {
    const { recent } = getRateLimitStatus()
    const now        = Date.now()
    const timestamps = Array.from({ length: count }, () => now)
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify([...recent, ...timestamps]))
  } catch {}
}

// ── Helpers ──────────────────────────────────────────────────────
async function convertHeicIfNeeded(file) {
  if (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  ) {
    const heic2any = (await import('heic2any')).default
    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 1 })
    return new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' })
  }
  return file
}

async function uploadToCloudinary(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'images')

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Cloudinary upload failed')
  }
  const data = await res.json()
  return data.secure_url
}

// ── Component ────────────────────────────────────────────────────
export default function UploadSection() {
  // files = array of { file, preview, status: 'pending'|'uploading'|'done'|'error' }
  const [files,     setFiles]     = useState([])
  const [guestName, setGuestName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [status,    setStatus]    = useState(null)  // 'success' | 'rate_limited'
  const [dragOver,  setDragOver]  = useState(false)
  const [progress,  setProgress]  = useState({ done: 0, total: 0 })
  const inputRef = useRef()

  const rateLimitStatus = getRateLimitStatus()
  const { remaining, resetIn, used } = rateLimitStatus

  // ── Add files from picker/drop ───────────────────────────────
  const addFiles = async (rawFiles) => {
    setStatus(null)
    const { remaining: rem } = getRateLimitStatus()

    const incoming = Array.from(rawFiles).slice(0, rem) // respect limit

    if (incoming.length === 0) {
      setStatus('rate_limited')
      return
    }

    // Filter oversized
    const valid = incoming.filter((f) => {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) return false
      return true
    })

    // Convert HEIC and generate previews
    const prepared = await Promise.all(
      valid.map(async (raw) => {
        const converted = await convertHeicIfNeeded(raw)
        const preview   = await new Promise((res) => {
          const reader  = new FileReader()
          reader.onload = (e) => res(e.target.result)
          reader.readAsDataURL(converted)
        })
        return { file: converted, preview, status: 'pending', id: crypto.randomUUID() }
      })
    )

    setFiles((prev) => [...prev, ...prepared])
  }

  const onInputChange = (e) => addFiles(e.target.files)
  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id))

  // ── Upload all pending ───────────────────────────────────────
  const handleUpload = async () => {
    const pending = files.filter((f) => f.status === 'pending')
    if (pending.length === 0) return

    const { allowed, remaining: rem, resetIn: ri } = getRateLimitStatus()
    if (!allowed) { setStatus('rate_limited'); return }

    // Cap to remaining quota
    const toUpload = pending.slice(0, rem)
    setUploading(true)
    setProgress({ done: 0, total: toUpload.length })

    let successCount = 0

    for (const item of toUpload) {
      // Mark as uploading
      setFiles((prev) =>
        prev.map((f) => f.id === item.id ? { ...f, status: 'uploading' } : f)
      )

      try {
        const imageUrl = await uploadToCloudinary(item.file)
        await supabase
          .from('photos')
          .insert({ file_url: imageUrl, guest_name: guestName.trim() || null })

        setFiles((prev) =>
          prev.map((f) => f.id === item.id ? { ...f, status: 'done' } : f)
        )
        successCount++
      } catch (err) {
        console.error(err)
        setFiles((prev) =>
          prev.map((f) => f.id === item.id ? { ...f, status: 'error' } : f)
        )
      }

      setProgress((p) => ({ ...p, done: p.done + 1 }))
    }

    recordUploads(successCount)
    setUploading(false)

    if (successCount > 0) setStatus('success')
  }

  const reset = () => {
    setFiles([])
    setGuestName('')
    setStatus(null)
    setProgress({ done: 0, total: 0 })
    if (inputRef.current) inputRef.current.value = ''
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length

  return (
    <section id="upload" className="bg-cream py-20 px-6 md:px-16">
      <div className="max-w-lg mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="font-display italic text-olive-400 text-lg mb-2">share with us</p>
          <h2 className="font-display font-light text-olive-800 text-4xl md:text-5xl leading-tight">
            Your Memories
          </h2>
          <div className="w-12 h-px bg-olive-300 mx-auto mt-5" />
          {used > 0 && remaining > 0 && (
            <p className="font-body text-olive-400 text-xs mt-4">
              {remaining} upload{remaining !== 1 ? 's' : ''} remaining this hour
            </p>
          )}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── Rate limited ── */}
          {status === 'rate_limited' && files.length === 0 ? (
            <motion.div key="rate_limited" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-16 px-4">
              <div className="text-5xl mb-5">⏳</div>
              <p className="font-display text-2xl italic text-olive-700 mb-3">Upload limit reached</p>
              <p className="font-body text-olive-500 text-sm mb-2">You've shared {RATE_LIMIT_MAX} photos — thank you so much!</p>
              <p className="font-body text-olive-400 text-xs">You can upload more in {resetIn} minute{resetIn !== 1 ? 's' : ''}.</p>
            </motion.div>

          ) : status === 'success' && files.every((f) => f.status === 'done' || f.status === 'error') ? (
            /* ── Success ── */
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
              <div className="text-5xl mb-5">🤍</div>
              <p className="font-display text-3xl italic text-olive-700 mb-3">Thank you!</p>
              <p className="font-body text-olive-500 text-sm mb-2">
                {files.filter((f) => f.status === 'done').length} photo{files.filter((f) => f.status === 'done').length !== 1 ? 's' : ''} saved. We're so grateful you were there.
              </p>
              {remaining > 0 && (
                <p className="font-body text-olive-400 text-xs mb-8">
                  You can still share {remaining} more photo{remaining !== 1 ? 's' : ''}.
                </p>
              )}
              {remaining > 0 && (
                <button onClick={reset} className="text-olive-500 text-xs uppercase tracking-widest border-b border-olive-300 pb-0.5 hover:text-olive-700 transition-colors">
                  Upload more
                </button>
              )}
            </motion.div>

          ) : (
            /* ── Form ── */
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Drop zone — hidden once files are selected */}
              {files.length === 0 && (
                <div
                  className={`relative border-2 border-dashed rounded-sm mb-6 transition-colors cursor-pointer
                    ${dragOver ? 'border-olive-500 bg-olive-50' : 'border-olive-300 bg-white/60'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center py-14 select-none">
                    <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-olive-300 flex items-center justify-center mb-4 text-olive-400 text-2xl">+</div>
                    <p className="font-body text-olive-500 text-sm text-center">
                      Tap to choose photos<br />
                      <span className="text-olive-400 text-xs">or drag &amp; drop here</span>
                    </p>
                    <p className="text-olive-400 text-xs mt-2 font-medium">You can select multiple photos at once</p>
                    <p className="text-olive-300 text-xs mt-1">JPG, PNG, HEIC — up to {MAX_SIZE_MB} MB each</p>
                  </div>
                </div>
              )}

              {/* Photo preview grid */}
              {files.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <AnimatePresence>
                      {files.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative aspect-square rounded-sm overflow-hidden bg-olive-100"
                        >
                          <img src={item.preview} alt="" className="w-full h-full object-cover" />

                          {/* Status overlay */}
                          {item.status === 'uploading' && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                          {item.status === 'done' && (
                            <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                              <span className="text-white text-xl">✓</span>
                            </div>
                          )}
                          {item.status === 'error' && (
                            <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center">
                              <span className="text-white text-xl">✕</span>
                            </div>
                          )}

                          {/* Remove button — only on pending */}
                          {item.status === 'pending' && (
                            <button
                              onClick={() => removeFile(item.id)}
                              className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full text-xs flex items-center justify-center touch-manipulation"
                            >✕</button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Add more button */}
                    {!uploading && files.some((f) => f.status === 'pending') && remaining > files.filter(f => f.status === 'pending').length && (
                      <motion.button
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        onClick={() => inputRef.current?.click()}
                        className="aspect-square rounded-sm border-2 border-dashed border-olive-300
                          flex flex-col items-center justify-center text-olive-400 text-xs
                          hover:border-olive-500 hover:text-olive-600 transition-colors touch-manipulation"
                      >
                        <span className="text-2xl mb-1">+</span>
                        <span>Add more</span>
                      </motion.button>
                    )}
                  </div>

                  {/* Progress bar while uploading */}
                  {uploading && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-body text-olive-400 mb-1">
                        <span>Uploading…</span>
                        <span>{progress.done} / {progress.total}</span>
                      </div>
                      <div className="w-full h-1.5 bg-olive-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-olive-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-olive-400 text-xs font-body text-center">
                    {files.filter(f => f.status === 'pending').length} photo{files.filter(f => f.status === 'pending').length !== 1 ? 's' : ''} ready to upload
                  </p>
                </div>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                multiple
                className="hidden"
                onChange={onInputChange}
              />

              <input
                type="text"
                placeholder="Your name (optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                maxLength={60}
                className="w-full bg-white/70 border border-olive-200 px-4 py-3 mb-4
                  font-body text-sm text-olive-700 placeholder-olive-300
                  focus:outline-none focus:border-olive-500 transition-colors rounded-sm"
              />

              <button
                onClick={handleUpload}
                disabled={pendingCount === 0 || uploading}
                className={`w-full py-4 font-body tracking-[0.2em] uppercase text-sm
                  transition-all duration-300 active:scale-[0.98]
                  ${pendingCount > 0 && !uploading
                    ? 'bg-olive-700 text-cream hover:bg-olive-800'
                    : 'bg-olive-200 text-olive-400 cursor-not-allowed'
                  }`}
              >
                {uploading
                  ? `Uploading ${progress.done + 1} of ${progress.total}…`
                  : pendingCount > 0
                    ? `Share ${pendingCount} Photo${pendingCount !== 1 ? 's' : ''}`
                    : 'Share Memory'
                }
              </button>

              <p className="text-center text-olive-300 text-xs mt-4 font-body">
                Max {RATE_LIMIT_MAX} photos per hour
              </p>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  )
}