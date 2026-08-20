'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { formatPrice, calculateTax, calculateDeliveryFee } from '@/lib/utils'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, CheckCircle, Sparkles } from 'lucide-react'

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, clearCart, subtotal, couponCode, discountAmount, applyCoupon, removeCoupon } = useCart()
  const router = useRouter()
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      fetch('/api/coupons')
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setAvailableCoupons(json.data)
        })
        .catch(() => {})
    }
  }, [isOpen])

  if (!isOpen) return null

  const tax = calculateTax(subtotal - discountAmount)
  const deliveryFee = calculateDeliveryFee(subtotal)
  const grandTotal = Math.max(0, subtotal - discountAmount + tax + deliveryFee)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setCouponError('')
    setCouponSuccess('')
    if (!couponInput.trim()) return

    const res = await applyCoupon(couponInput.trim())
    if (res.success) {
      setCouponSuccess(`Coupon applied! ₹${res.discount} discount`)
      setCouponInput('')
    } else {
      setCouponError(res.error || 'Failed to apply coupon')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFF8F5] text-[#1A1A1A] shadow-2xl flex flex-col">
          
          <div className="p-6 bg-[#22092C] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#BE3144] text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Your Feast Bag</h2>
                <p className="text-xs text-[#F5F1EF]/70">{items.length} item{items.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 py-12">
                <div className="w-20 h-20 rounded-full bg-[#F5F1EF] flex items-center justify-center mb-4 text-[#BE3144]">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-[#22092C]">Your bag is empty!</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Hungry? Explore our delicious flame-grilled rolls and signature bowls!
                </p>
                <Link
                  href="/menu"
                  onClick={() => setIsOpen(false)}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-[#BE3144] text-white text-sm font-bold hover:bg-[#872341] transition-colors shadow-md"
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const addonTotal = item.addons.reduce((a, b) => a + b.price, 0)
                const unitPrice = item.price + addonTotal

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-sm border flex items-center justify-center ${
                            item.isVeg ? 'border-green-600' : 'border-red-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? 'bg-green-600' : 'bg-red-600'
                            }`}
                          />
                        </span>
                        <h4 className="font-bold text-sm text-[#22092C]">{item.name}</h4>
                      </div>
                      <span className="font-black text-sm text-[#BE3144]">
                        {formatPrice(unitPrice * item.quantity)}
                      </span>
                    </div>

                    {item.addons.length > 0 && (
                      <div className="text-[11px] text-neutral-500 bg-[#FFF8F5] p-2 rounded-lg space-y-0.5">
                        {item.addons.map((ad) => (
                          <div key={ad.id} className="flex justify-between">
                            <span>+ {ad.name}</span>
                            <span>{formatPrice(ad.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-neutral-300 rounded-xl bg-[#F5F1EF] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1 font-bold text-xs text-[#22092C]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-neutral-200 space-y-4">
              
              {couponCode ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Coupon `{couponCode}` applied! (-{formatPrice(discountAmount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Promo Code (e.g. CGC50)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="w-full pl-9 pr-3 py-2 text-xs uppercase font-bold tracking-wider rounded-xl border border-neutral-300 bg-white text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:border-[#BE3144]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#22092C] text-white text-xs font-bold rounded-xl hover:bg-[#872341] transition-colors"
                    >
                      Apply
                    </button>
                  </form>

                  {/* Available Coupons Pills */}
                  {availableCoupons.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">
                        Available Coupons:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {availableCoupons.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => applyCoupon(c.id)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-[10px] font-extrabold text-amber-900 flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                            <span>{c.id}</span>
                            <span className="text-neutral-500 font-normal">
                              ({c.discountType === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value}`})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}
              {couponSuccess && <p className="text-xs text-emerald-600 font-medium">{couponSuccess}</p>}

              <div className="space-y-1.5 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-neutral-800">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#22092C] pt-2 border-t border-neutral-200">
                  <span>To Pay</span>
                  <span className="text-[#BE3144]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/checkout')
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl hover:brightness-110 active:scale-[0.99] transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
