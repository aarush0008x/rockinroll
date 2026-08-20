'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { formatPrice } from '@/lib/utils'
import { Truck, MapPin, CheckCircle, Phone, Navigation, RefreshCw, Plus, Clock, CheckCircle2 } from 'lucide-react'

export default function DeliveryPartnerPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'READY' | 'ON_ROAD' | 'DELIVERED'>('READY')
  const [creatingTest, setCreatingTest] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3500)
  }

  useEffect(() => {
    if (!user || (user.role !== 'DELIVERY_PARTNER' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      router.push('/auth/login?redirect=/delivery')
      return
    }
    fetchDeliveries()
    const timer = setInterval(fetchDeliveries, 6000)
    return () => clearInterval(timer)
  }, [user])

  const fetchDeliveries = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      const json = await res.json()
      if (json.success) {
        setOrders(json.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (orderId: string, status: string, shortCode: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (json.success) {
        showToast(`Delivery status for ${shortCode} updated to ${status}`)
        fetchDeliveries()
      }
    } catch {}
  }

  const handleCreateMockOrder = async () => {
    try {
      setCreatingTest(true)
      const res = await fetch('/api/orders/mock-create', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        // advance to READY so rider sees it immediately
        await fetch(`/api/orders/${json.data.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'READY' }),
        })
        showToast(`⚡ Test Order ${json.data.shortCode} ready for pickup!`)
        fetchDeliveries()
      }
    } finally {
      setCreatingTest(false)
    }
  }

  const readyOrders = orders.filter((o) => o.status === 'READY')
  const onRoadOrders = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY')
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED')

  const displayedOrders = activeTab === 'READY'
    ? readyOrders
    : activeTab === 'ON_ROAD'
    ? onRoadOrders
    : deliveredOrders

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast */}
      {feedback && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-2xl shadow-2xl bg-emerald-600 text-white text-xs font-black flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#22092C] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#BE3144] to-[#F05941] text-white shadow-lg">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Rider GPS Fleet Active
            </div>
            <h1 className="text-xl sm:text-2xl font-black">Rider Fleet Hub</h1>
            <p className="text-xs text-neutral-300">Fast delivery dispatch, customer location & drop-off confirmation</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleCreateMockOrder}
            disabled={creatingTest}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> {creatingTest ? 'Placing...' : '+ Create Ready Delivery'}
          </button>
          <button
            onClick={fetchDeliveries}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5"
            title="Refresh Deliveries"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm">
        <button
          onClick={() => setActiveTab('READY')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'READY'
              ? 'bg-[#BE3144] text-white shadow'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Ready for Pickup ({readyOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('ON_ROAD')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'ON_ROAD'
              ? 'bg-[#22092C] text-white shadow'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          On the Way ({onRoadOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('DELIVERED')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'DELIVERED'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Delivered Today ({deliveredOrders.length})
        </button>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="h-64 bg-neutral-200 rounded-3xl animate-pulse" />
      ) : displayedOrders.length === 0 ? (
        <div className="p-16 bg-white rounded-3xl border border-neutral-200 text-center space-y-3 shadow-sm">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-black text-[#22092C]">No Orders in This Stage</h3>
          <p className="text-xs text-neutral-500">Wait for kitchen dispatch or click below to spawn a ready delivery.</p>
          <button
            onClick={handleCreateMockOrder}
            className="px-6 py-2.5 bg-[#BE3144] hover:bg-[#872341] text-white text-xs font-black rounded-xl shadow transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Generate Ready Delivery
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((order) => {
            const isCOD = order.payment?.gateway === 'COD'
            const phone = order.address?.phone || order.user?.phone || '9876543210'
            const fullAddress = `${order.address?.houseFlatNo || ''}, ${order.address?.street || ''}, ${order.address?.area || ''}, ${order.address?.city || ''}`

            return (
              <div
                key={order.id}
                className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-md space-y-5 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <span className="font-black text-xl text-[#22092C]">{order.shortCode}</span>
                    <p className="text-xs text-neutral-500">
                      Items: {order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        isCOD
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {isCOD ? `COLLECT CASH: ${formatPrice(order.grandTotal)}` : 'PREPAID ONLINE (PAID)'}
                    </span>

                    <span className="px-3 py-1 bg-[#22092C] text-white rounded-full text-xs font-black uppercase">
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Customer & Address Details */}
                {order.address && (
                  <div className="p-4 bg-[#FFF8F5] rounded-2xl text-xs space-y-2 border border-neutral-200/70">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-[#22092C] flex items-center gap-1.5 text-sm">
                        <MapPin className="w-4 h-4 text-[#BE3144]" />
                        {order.address.name}
                      </p>
                      <a
                        href={`tel:${phone}`}
                        className="px-3 py-1.5 bg-[#22092C] text-white rounded-xl text-xs font-black flex items-center gap-1 hover:bg-[#872341]"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Customer ({phone})
                      </a>
                    </div>

                    <p className="text-neutral-700 font-medium">{fullAddress} - {order.address.pinCode}</p>
                    {order.address.landmark && (
                      <p className="text-neutral-500 font-medium">📍 Landmark: {order.address.landmark}</p>
                    )}

                    {order.specialInstructions && (
                      <p className="p-2 bg-amber-100 text-amber-900 rounded-xl font-bold text-xs mt-2">
                        ⚠️ Delivery Note: {order.specialInstructions}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-black rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4 text-blue-600" /> Open in Google Maps
                  </a>

                  {order.status === 'READY' && (
                    <button
                      onClick={() => handleUpdate(order.id, 'OUT_FOR_DELIVERY', order.shortCode)}
                      className="flex-1 py-3.5 bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white text-xs font-black rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Truck className="w-4 h-4" /> Picked Up & Start Delivery (ON THE WAY)
                    </button>
                  )}

                  {order.status === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => handleUpdate(order.id, 'DELIVERED', order.shortCode)}
                      className="flex-1 py-3.5 bg-emerald-600 text-white text-xs font-black rounded-2xl shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Confirm Drop-off & Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
