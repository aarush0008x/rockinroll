'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import { Star, Flame, Plus, Check } from 'lucide-react'

export interface ProductProps {
  id: string
  name: string
  description: string
  price: number
  discountPrice?: number | null
  imageUrl?: string | null
  isVeg: boolean
  spiceLevel: number
  isBestSeller?: boolean
  isFeatured?: boolean
  isNewItem?: boolean
  rating: number
  reviewCount: number
  addons?: Array<{ id: string; name: string; price: number }>
}

export function ProductCard({ product }: { product: ProductProps }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [showAddonModal, setShowAddonModal] = useState(false)
  const [selectedAddons, setSelectedAddons] = useState<any[]>([])

  const handleQuickAdd = () => {
    if (product.addons && product.addons.length > 0) {
      setShowAddonModal(true)
      return
    }

    addItem(product, [], 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleConfirmAddons = () => {
    addItem(product, selectedAddons, 1)
    setShowAddonModal(false)
    setSelectedAddons([])
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const toggleAddon = (addon: any) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    )
  }

  return (
    <>
      <div className="bg-white rounded-3xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-neutral-100">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isBestSeller && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#BE3144] text-white shadow-md">
                Bestseller
              </span>
            )}
            {product.isNewItem && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F05941] text-white shadow-md">
                New
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow">
            <span
              className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${
                product.isVeg ? 'border-green-600' : 'border-red-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  product.isVeg ? 'bg-green-600' : 'bg-red-600'
                }`}
              />
            </span>
          </div>

          {product.spiceLevel > 0 && (
            <div className="absolute bottom-3 left-3 bg-[#22092C]/80 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px] text-white font-bold">
              {Array.from({ length: product.spiceLevel }).map((_, i) => (
                <Flame key={i} className="w-3 h-3 text-[#F05941] fill-[#F05941]" />
              ))}
              <span className="text-[10px] ml-0.5">
                {product.spiceLevel === 1 ? 'Mild' : product.spiceLevel === 2 ? 'Spicy' : 'Fiery'}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <Link href={`/menu/${product.id}`} className="hover:text-[#BE3144] transition-colors">
                <h3 className="font-extrabold text-base text-[#22092C] line-clamp-1">{product.name}</h3>
              </Link>
              <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            </div>

            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-[#22092C]">
                {formatPrice(product.discountPrice ?? product.price)}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-neutral-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <button
              onClick={handleQuickAdd}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all duration-200 shadow-sm ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#22092C] text-white hover:bg-[#872341] active:scale-95'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#F05941]" /> ADD
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showAddonModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-slide-up">
            <h3 className="text-lg font-black text-[#22092C]">Customize {product.name}</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Select your extra toppings and dips</p>

            <div className="my-4 space-y-2 max-h-60 overflow-y-auto">
              {product.addons?.map((addon) => {
                const isSelected = selectedAddons.some((a) => a.id === addon.id)
                return (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'border-[#BE3144] bg-[#FFF8F5] text-[#BE3144] font-bold'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span>{addon.name}</span>
                    <span>+{formatPrice(addon.price)}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddonModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddons}
                className="flex-1 py-2.5 rounded-xl bg-[#BE3144] text-white text-xs font-bold hover:bg-[#872341] shadow-md"
              >
                Add with Customizations
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
