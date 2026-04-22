import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

const MAX_SIZE_MB    = 50
const CLOUD_NAME     = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET  = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

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

export default function UploadSection() {
  const [preview,   setPreview]   = useState(null)
  const [file,      setFile]      = useState(null)
  const [guestName, setGuestName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [status,    setStatus]    = useState(null)
  const [errorMsg,  setErrorMsg]  = useState('')
  const [dragOver,  setDragOver]  = useState(false)
  const inputRef = useRef()

  const handleFile = async (raw) => {
    if (!raw) return
    setStatus(null)
    if (raw.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`File is too large. Max ${MAX_SIZE_MB} MB.`)
      setStatus('error')
      return
    }
    const converted = await convertHeicIfNeeded(raw)
    setFile(converted)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(converted)
  }

  const onInputChange = (e) => handleFile(e.target.files?.[0])
  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setStatus(null)
    try {
      const imageUrl = await uploadToCloudinary(file)
      const { error: dbError } = await supabase
        .from('photos')
        .insert({ file_url: imageUrl, guest_name: guestName.trim() || null })
      if (dbError) throw dbError
      setStatus('success')
      setPreview(null)
      setFile(null)
      setGuestName('')
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setStatus('error')
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setPreview(null); setFile(null); setStatus(null); setGuestName('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section id="upload" className="bg-cream py-20 px-6 md:px-16">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="font-display italic text-olive-400 text-lg mb-2">share with us</p>
          <h2 className="font-display font-light text-olive-800 text-4xl md:text-5xl leading-tight">Your Memories</h2>
          <div className="w-12 h-px bg-olive-300 mx-auto mt-5" />
        </motion.div>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
              <div className="text-5xl mb-5">🤍</div>
              <p className="font-display text-3xl italic text-olive-700 mb-3">Thank you!</p>
              <p className="font-body text-olive-500 text-sm mb-8">Your memory has been saved. We're so grateful you were there.</p>
              <button onClick={reset} className="text-olive-500 text-xs uppercase tracking-widest border-b border-olive-300 pb-0.5 hover:text-olive-700 transition-colors">Upload another</button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div
                className={`relative border-2 border-dashed rounded-sm mb-6 transition-colors cursor-pointer ${dragOver ? 'border-olive-500 bg-olive-50' : 'border-olive-300 bg-white/60'} ${preview ? 'border-solid border-olive-400' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => !preview && inputRef.current?.click()}
              >
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="w-full max-h-80 object-cover rounded-sm" />
                    <button onClick={(e) => { e.stopPropagation(); reset() }} className="absolute top-3 right-3 bg-black/50 text-white w-8 h-8 rounded-full text-sm flex items-center justify-center hover:bg-black/70 transition-colors">✕</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14 select-none">
                    <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-olive-300 flex items-center justify-center mb-4 text-olive-400 text-2xl">+</div>
                    <p className="font-body text-olive-500 text-sm text-center">Tap to choose a photo<br /><span className="text-olive-400 text-xs">or drag &amp; drop here</span></p>
                    <p className="text-olive-300 text-xs mt-3">JPG, PNG, HEIC — up to {MAX_SIZE_MB} MB</p>
                  </div>
                )}
              </div>

              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" capture="environment" className="hidden" onChange={onInputChange} />

              <input type="text" placeholder="Your name (optional)" value={guestName} onChange={(e) => setGuestName(e.target.value)} maxLength={60}
                className="w-full bg-white/70 border border-olive-200 px-4 py-3 mb-4 font-body text-sm text-olive-700 placeholder-olive-300 focus:outline-none focus:border-olive-500 transition-colors rounded-sm" />

              {status === 'error' && <p className="text-red-500 text-xs mb-4 font-body">{errorMsg}</p>}

              <button onClick={handleUpload} disabled={!file || uploading}
                className={`w-full py-4 font-body tracking-[0.2em] uppercase text-sm transition-all duration-300 active:scale-[0.98] ${file && !uploading ? 'bg-olive-700 text-cream hover:bg-olive-800' : 'bg-olive-200 text-olive-400 cursor-not-allowed'}`}>
                {uploading ? 'Uploading…' : 'Share Memory'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}