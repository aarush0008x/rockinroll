'use client'

import React, { useState, useEffect } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { Search, Flame } from 'lucide-react'

export default function MenuPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [vegFilter, setVegFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/menu/categories')
      const json = await res.json()
      if (json.success) setCategories(json.data)
    } catch {}
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/menu/products')
      const json = await res.json()
      if (json.success) setProducts(json.data)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) return false
    if (vegFilter === 'VEG' && !p.isVeg) return false
    if (vegFilter === 'NON_VEG' && p.isVeg) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-[#BE3144]">Fresh From Tandoor</span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#22092C]">The RockinRoll Menu</h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-xl">
          Crafted rolls, rice bowls, and artisan coolers made with authentic recipes and premium ingredients.
        </p>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by roll name or ingredient (e.g. Butter Chicken, Paneer)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F5F1EF] border border-neutral-200 text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#BE3144] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setVegFilter('ALL')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                vegFilter === 'ALL'
                  ? 'bg-[#22092C] text-white'
                  : 'bg-[#F5F1EF] text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setVegFilter('VEG')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                vegFilter === 'VEG'
                  ? 'bg-green-700 text-white'
                  : 'bg-green-50 text-green-800 border border-green-200 hover:bg-green-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500" /> Pure Veg
            </button>
            <button
              onClick={() => setVegFilter('NON_VEG')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                vegFilter === 'NON_VEG'
                  ? 'bg-red-700 text-white'
                  : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" /> Non-Veg
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-neutral-100 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#BE3144] text-white shadow-md'
                : 'bg-[#FFF8F5] text-neutral-700 hover:bg-[#F5F1EF]'
            }`}
          >
            All Items ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#BE3144] text-white shadow-md'
                  : 'bg-[#FFF8F5] text-neutral-700 hover:bg-[#F5F1EF]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 bg-neutral-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 space-y-3">
          <Flame className="w-10 h-10 text-neutral-400 mx-auto" />
          <h3 className="text-lg font-bold text-[#22092C]">No matching delicious items found</h3>
          <p className="text-xs text-neutral-500">Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  )
}
