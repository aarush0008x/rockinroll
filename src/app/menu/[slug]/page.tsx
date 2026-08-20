'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import { Star, Flame, Clock, Check, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const slug = params?.slug as string

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAddons, setSelectedAddons] = useState<any[]>([])
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (slug) fetchProduct()
  }, [slug])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/menu/products/${slug}`)
      const json = await res.json()
      if (json.success) setProduct(json.data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="h-96 bg-neutral-200 rounded-3xl animate-pulse" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h2 className="text-xl font-bold">Product not found</h2>
        <button onClick={() => router.push('/menu')} className="mt-4 text-[#BE3144] font-bold underline">
          Back to menu
        </button>
      </div>
    )
  }

  const toggleAddon = (addon: any) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    )
  }

  const addonTotal = selectedAddons.reduce((acc, curr) => acc + curr.price, 0)
  const unitPrice = (product.discountPrice ?? product.price) + addonTotal
  const grandTotal = unitPrice * quantity

  const handleAddToCart = () => {
    addItem(product, selectedAddons, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const ingredients = JSON.parse(product.ingredients || '[]')
  const allergens = JSON.parse(product.allergens || '[]')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-[#BE3144]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Menu
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200/80 shadow-xl">
        <div className="lg:col-span-6 space-y-4">
          <div className="relative h-[340px] sm:h-[420px] rounded-3xl overflow-hidden bg-neutral-100 shadow-md">
            <img
              src={product.imageUrl || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow">
              <span className={`w-2.5 h-2.5 rounded-full ${product.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
              <span>{product.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#BE3144]">
                {product.category?.name}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-neutral-400 text-xs font-normal">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#22092C]">{product.name}</h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-4 text-xs font-bold text-neutral-700 pt-2 border-t border-neutral-100">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#BE3144]" /> {product.preparationTime} mins prep
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-[#F05941]" /> Spice Level {product.spiceLevel}/3
              </span>
            </div>

            {ingredients.length > 0 && (
              <div className="space-y-1 text-xs">
                <span className="font-bold text-neutral-700">Ingredients:</span>
                <div className="flex flex-wrap gap-1.5">
                  {ingredients.map((ing: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-[#F5F1EF] text-neutral-700 text-[11px] font-medium">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.addons && product.addons.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#22092C]">
                  Customize with Addons
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.addons.map((addon: any) => {
                    const isSelected = selectedAddons.some((a) => a.id === addon.id)
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between text-xs transition-all ${
                          isSelected
                            ? 'border-[#BE3144] bg-[#FFF8F5] text-[#BE3144] font-bold ring-1 ring-[#BE3144]'
                            : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                        }`}
                      >
                        <span>{addon.name}</span>
                        <span>+{formatPrice(addon.price)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center border border-neutral-300 rounded-2xl bg-[#F5F1EF] overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-neutral-700 hover:bg-neutral-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-black text-sm text-[#22092C]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-neutral-700 hover:bg-neutral-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right sm:text-left">
                <p className="text-[10px] text-neutral-400 font-bold uppercase">Total Price</p>
                <p className="text-xl font-black text-[#BE3144]">{formatPrice(grandTotal)}</p>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white hover:brightness-110 active:scale-95'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Add to Feast Bag
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
