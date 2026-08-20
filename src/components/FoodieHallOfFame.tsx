'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Camera, CheckCircle2, Sparkles, Plus, X, Heart, MessageSquare } from 'lucide-react'
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
  const [toastMessage, setToastMessage] = useState<string | null>(null)

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
      if (json.success && json.data.length > 0) {
        setReviews(json.data)
      } else {
        // Sample authentic foodie community reviews if DB is fresh
        setReviews([
          {
            id: 'sample-1',
            rating: 5,
            comment: 'Crispy whole-wheat paratha, extra juicy smoked chicken tikka and fiery kasundi mayo! Arrived piping hot in 22 mins.',
            imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
            pointsAwarded: true,
            createdAt: '2 hours ago',
            user: { name: 'Aarav Sharma' },
            product: { name: 'Classic Smoked Chicken Kathi Roll' },
          },
          {
            id: 'sample-2',
            rating: 5,
            comment: 'The Truffle Paneer Roll is unbeatable! Melt-in-mouth cottage cheese with melted cheese strings. Loved the packaging too!',
            imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
            pointsAwarded: true,
            createdAt: '5 hours ago',
            user: { name: 'Simran Kaur' },
            product: { name: 'Truffle Butter Paneer Kathi Roll' },
          },
          {
            id: 'sample-3',
            rating: 5,
            comment: 'CGC campus midnight craving sorted! Double egg bhurji with tandoori spices is my regular exam night fuel.',
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
            pointsAwarded: true,
            createdAt: 'Yesterday',
            user: { name: 'Rohan Verma' },
            product: { name: 'Double Egg Masala Roll' },
          },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/menu/products')
      const json = await res.json()
      if (json.success) {
        setProducts(json.data)
        if (json.data.length > 0) setForm((f) => ({ ...f, productId: json.data[0].id }))
      }
    } catch {}
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
            Real photos from real Kathi roll fanatics. Upload your roll unboxing photo after delivery to earn{' '}
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

      {/* Review Cards Grid */}
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
                <span className="text-neutral-400 text-[10px]">{r.createdAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                  <p className="text-[11px] text-neutral-500">Earn +5 bonus RollPoints instantly</p>
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

              <div className="space-y-1">
                <label className="font-extrabold text-neutral-700 uppercase text-[11px]">
                  Photo Image URL (Unboxing / Bite Shot)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/... or paste image link"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full p-3 rounded-xl border border-neutral-300 font-mono text-xs text-[#1A1A1A] focus:ring-[#BE3144]"
                />
                <p className="text-[10px] text-neutral-500">
                  💡 Tip: Uploading a photo qualifies you for the <strong>+5 bonus RollPoints</strong> reward!
                </p>
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
                  <strong>Reward:</strong> Upon submission, <strong>5 RollPoints</strong> will be automatically credited to your balance!
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
                  disabled={submitting}
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
