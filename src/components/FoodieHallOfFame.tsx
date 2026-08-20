'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Star, Camera, CheckCircle2, Sparkles, Plus, X, UploadCloud, ImageIcon, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface ReviewItem {
  id: string
  rating: number
  comment: string
  imageUrl?: string
  pointsAwarded: boolean
  createdAt: string
  user: { name: string; phone?: string }
  product: { name: string; imageUrl?: string }
}

export function FoodieHallOfFame() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    productId: '',
    rating: 5,
    comment: '',
    imageUrl: '',
  })

  useEffect(() => {
    fetchReviews()
    fetchProducts()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/reviews?photos=true')
      const json = await res.json()
      if (json.success) {
        setReviews(json.data || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/menu/products')
      const json = await res.json()
      if (json.success && json.data.length > 0) {
        setProducts(json.data)
        setForm((f) => ({ ...f, productId: json.data[0].id }))
      }
    } catch {}
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()

      if (json.success && json.url) {
        setForm((prev) => ({ ...prev, imageUrl: json.url }))
      } else {
        alert(json.error || 'Failed to upload photo')
      }
    } catch {
      alert('Error uploading photo')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('Please log in to submit a photo review and claim your +5 RollPoints!')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        setToastMessage(json.message || '🎉 Review submitted! You earned +5 bonus RollPoints!')
        setShowUploadModal(false)
        setForm({ productId: products[0]?.id || '', rating: 5, comment: '', imageUrl: '' })
        fetchReviews()
        setTimeout(() => setToastMessage(null), 5000)
      } else {
        alert(json.error || 'Failed to submit review')
      }
    } catch {
      alert('Error submitting review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-[#22092C] text-white rounded-2xl shadow-2xl border border-amber-400/40 text-xs font-black flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-neutral-200">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BE3144]/10 text-[#BE3144] text-xs font-black uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5" /> Community Gallery
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#22092C] tracking-tight">
            Foodie Hall of Fame 📸
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl">
            Real photos from verified Kathi roll lovers. Upload your unboxing or bite photo after delivery to claim{' '}
            <strong className="text-[#BE3144] font-black">+5 Bonus RollPoints</strong> on every review!
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Upload Photo (+5 Pts)
        </button>
      </div>

      {/* Real Reviews Grid or Clean Empty State */}
      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-400">Loading community gallery...</div>
      ) : reviews.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-neutral-200/80 shadow-sm text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#BE3144]/10 to-[#F05941]/10 text-[#BE3144] flex items-center justify-center mx-auto text-2xl shadow-inner">
            📸
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#22092C]">Be the First in the Hall of Fame!</h3>
            <p className="text-xs text-neutral-500">
              Ordered a roll? Upload your hot roll photo to receive <strong>+5 bonus RollPoints</strong> added to your profile instantly!
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#22092C] hover:bg-[#872341] text-white text-xs font-bold transition-colors"
          >
            Post First Photo Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="group bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Photo */}
              <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
                {r.imageUrl ? (
                  <img
                    src={r.imageUrl}
                    alt={r.product?.name || 'Kathi Roll'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🌯</div>
                )}

                {/* Bonus points badge */}
                {r.pointsAwarded && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 font-extrabold text-[10px] flex items-center gap-1 border border-amber-400/40">
                    <Sparkles className="w-3 h-3 text-amber-400" /> +5 RollPoints
                  </div>
                )}

                {/* Product tag */}
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md text-[#22092C] font-black text-[11px] shadow-sm truncate block max-w-max">
                    {r.product?.name}
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-black text-neutral-800 ml-1.5">{r.rating}.0</span>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed line-clamp-3 italic">
                    "{r.comment}"
                  </p>
                </div>

                {/* Author info */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-[#22092C]">
                    <span>{r.user?.name || 'Verified Foodie'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-neutral-400 text-[10px]">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Review Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-neutral-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#BE3144] to-[#F05941] flex items-center justify-center text-white">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#22092C]">Upload Photo Review</h3>
                  <p className="text-[11px] text-neutral-500">Earn +5 bonus RollPoints automatically</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-extrabold text-neutral-700 uppercase text-[11px]">Select Kathi Roll</label>
                <select
                  required
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  className="w-full p-3 rounded-xl border border-neutral-300 font-bold text-[#1A1A1A] focus:ring-[#BE3144]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-neutral-700 uppercase text-[11px]">Star Rating</label>
                <div className="flex items-center gap-2 p-2 bg-[#FFF8F5] rounded-xl border border-neutral-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-black text-xs text-[#22092C] ml-2">{form.rating} out of 5 Stars</span>
                </div>
              </div>

              {/* 📸 Direct Click-to-Upload & Camera Picker */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-neutral-700 uppercase text-[11px]">
                  Upload Kathi Roll Photo (+5 Points)
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {form.imageUrl ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-emerald-500 group">
                    <img src={form.imageUrl} alt="Review upload" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/70 backdrop-blur-md rounded-lg text-white font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Photo Uploaded
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-neutral-300 hover:border-[#BE3144] rounded-2xl bg-[#FFF8F5]/60 hover:bg-[#FFF8F5] transition-colors cursor-pointer text-center space-y-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#BE3144]/10 text-[#BE3144] flex items-center justify-center mx-auto">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[#22092C]">
                        {uploadingImage ? 'Uploading image...' : 'Click to upload from device or camera'}
                      </p>
                      <p className="text-[10px] text-neutral-500">Supports JPG, PNG, WEBP from your phone or gallery</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-neutral-700 uppercase text-[11px]">Review Experience</label>
                <textarea
                  rows={3}
                  required
                  placeholder="How was the paratha crispiness, spice kick, and delivery speed?"
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  className="w-full p-3 rounded-xl border border-neutral-300 text-xs font-medium text-[#1A1A1A] focus:ring-[#BE3144]"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-amber-950">
                <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-[11px]">
                  <strong>Reward:</strong> <strong>+5 RollPoints</strong> will be automatically credited to your balance upon submission!
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-3 rounded-xl border border-neutral-300 font-bold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white font-black shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Post Review & Claim +5 Pts'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </section>
  )
}
