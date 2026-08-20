'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { formatPrice, calculateTax, calculateDeliveryFee } from '@/lib/utils'
import { MapPin, Plus, CreditCard, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, subtotal, discountAmount, couponCode, clearCart } = useCart()

  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CASHFREE' | 'COD'>('CASHFREE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [newAddr, setNewAddr] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    houseFlatNo: '',
    street: '',
    area: '',
    pinCode: '',
    landmark: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout')
      return
    }
    fetchAddresses()
  }, [user])

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses')
      const json = await res.json()
      if (json.success && json.data.length > 0) {
        setAddresses(json.data)
        const def = json.data.find((a: any) => a.isDefault) || json.data[0]
        setSelectedAddressId(def.id)
      } else {
        setShowNewAddress(true)
      }
    } catch {}
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddr),
      })
      const json = await res.json()
      if (json.success) {
        setAddresses((prev) => [json.data, ...prev])
        setSelectedAddressId(json.data.id)
        setShowNewAddress(false)
      }
    } catch {}
  }

  const tax = calculateTax(subtotal - discountAmount)
  const deliveryFee = calculateDeliveryFee(subtotal)
  const grandTotal = Math.max(0, subtotal - discountAmount + tax + deliveryFee)

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError('Your cart is empty')
      return
    }
    if (!selectedAddressId && !showNewAddress) {
      setError('Please select or add a delivery address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            addons: i.addons.map((a) => a.id),
          })),
          addressId: selectedAddressId,
          couponCode,
          specialInstructions,
        }),
      })

      const orderData = await orderRes.json()
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      const order = orderData.data

      if (paymentMethod === 'CASHFREE') {
        const payRes = await fetch('/api/payments/cashfree/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        })
        const payData = await payRes.json()

        if (!payData.success) {
          throw new Error(payData.error || 'Payment gateway initialization failed')
        }

        if (payData.data.isMock) {
          await fetch('/api/payments/mock-success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.id }),
          })
          clearCart()
          router.push(`/orders/${order.shortCode}`)
          return
        }

        clearCart()
        router.push(`/orders/${order.shortCode}`)
      } else {
        clearCart()
        router.push(`/orders/${order.shortCode}`)
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <button
          onClick={() => router.push('/menu')}
          className="px-6 py-2.5 bg-[#BE3144] text-white text-xs font-bold rounded-xl"
        >
          Explore Menu
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#22092C]">Secure Checkout</h1>
        <p className="text-xs text-neutral-500">Confirm delivery address and payment</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-xs font-bold">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#22092C] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#BE3144]" /> Delivery Address
              </h3>
              <button
                onClick={() => setShowNewAddress(!showNewAddress)}
                className="text-xs text-[#BE3144] font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>

            {!showNewAddress && (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-[#BE3144] bg-[#FFF8F5] ring-1 ring-[#BE3144]'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 text-[#BE3144] focus:ring-[#BE3144]"
                    />
                    <div className="text-xs space-y-0.5">
                      <p className="font-black text-[#22092C]">{addr.name} ({addr.phone})</p>
                      <p className="text-neutral-600">
                        {addr.houseFlatNo}, {addr.street}, {addr.area}, {addr.city} - {addr.pinCode}
                      </p>
                      {addr.landmark && <p className="text-neutral-400">Landmark: {addr.landmark}</p>}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {showNewAddress && (
              <form onSubmit={handleSaveAddress} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Recipient Name"
                    required
                    value={newAddr.name}
                    onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                    className="p-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-400 focus:ring-[#BE3144]"
                  />
                  <input
                    type="tel"
                    placeholder="10-digit Phone"
                    required
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="p-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-400 focus:ring-[#BE3144]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="House / Flat / Block No."
                  required
                  value={newAddr.houseFlatNo}
                  onChange={(e) => setNewAddr({ ...newAddr, houseFlatNo: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-400 focus:ring-[#BE3144]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Street / Road"
                    required
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="p-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-400 focus:ring-[#BE3144]"
                  />
                  <input
                    type="text"
                    placeholder="Area / Locality"
                    required
                    value={newAddr.area}
                    onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })}
                    className="p-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-400 focus:ring-[#BE3144]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="PIN Code"
                    required
                    value={newAddr.pinCode}
                    onChange={(e) => setNewAddr({ ...newAddr, pinCode: e.target.value })}
                    className="p-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-400 focus:ring-[#BE3144]"
                  />
                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={newAddr.landmark}
                    onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                    className="p-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-400 focus:ring-[#BE3144]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAddress(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#BE3144] text-white text-xs font-bold rounded-xl"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#22092C] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#BE3144]" /> Payment Option
            </h3>

            <div className="space-y-2">
              <label
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'CASHFREE'
                    ? 'border-[#BE3144] bg-[#FFF8F5] ring-1 ring-[#BE3144]'
                    : 'border-neutral-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'CASHFREE'}
                    onChange={() => setPaymentMethod('CASHFREE')}
                    className="text-[#BE3144] focus:ring-[#BE3144]"
                  />
                  <div>
                    <p className="text-xs font-black text-[#22092C]">Cashfree Payments (UPI / Cards / NetBanking)</p>
                    <p className="text-[11px] text-neutral-500">Fast, secure 1-click checkout</p>
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </label>

              <label
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-[#BE3144] bg-[#FFF8F5] ring-1 ring-[#BE3144]'
                    : 'border-neutral-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-[#BE3144] focus:ring-[#BE3144]"
                  />
                  <div>
                    <p className="text-xs font-black text-[#22092C]">Cash on Delivery (COD)</p>
                    <p className="text-[11px] text-neutral-500">Pay cash or UPI to rider upon arrival</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-2">
            <label className="text-xs font-bold text-neutral-700">Special Instructions for Kitchen / Rider</label>
            <textarea
              placeholder="e.g. Ring doorbell, less spicy, extra mint chutney packet..."
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full p-3 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-400 focus:ring-[#BE3144]"
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xl space-y-6 sticky top-28">
            <h3 className="text-base font-black text-[#22092C]">Order Summary</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#22092C]">{item.quantity}x {item.name}</p>
                    {item.addons.length > 0 && (
                      <p className="text-[11px] text-neutral-400">
                        {item.addons.map((a) => a.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-black text-neutral-800">
                    {formatPrice((item.price + item.addons.reduce((a, b) => a + b.price, 0)) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-neutral-600 border-t border-neutral-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#22092C] pt-2 border-t border-neutral-200">
                <span>Grand Total</span>
                <span className="text-[#BE3144]">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? 'Processing...' : `Pay ${formatPrice(grandTotal)} Now`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
