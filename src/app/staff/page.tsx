'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ChefHat, Check, RefreshCw, Plus, Clock, AlertTriangle, Flame, Phone, CheckCircle2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function StaffKitchenPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'ACTIVE' | 'READY' | 'ALL'>('ACTIVE')
  const [creatingTest, setCreatingTest] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3500)
  }

  useEffect(() => {
    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      router.push('/auth/login?redirect=/staff')
      return
    }
    fetchKitchenOrders()
    const timer = setInterval(fetchKitchenOrders, 5000)
    return () => clearInterval(timer)
  }, [user])

  const fetchKitchenOrders = async () => {
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

  const updateOrderStatus = async (orderId: string, newStatus: string, shortCode: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (json.success) {
        showToast(`Order ${shortCode} updated to ${newStatus}`)
        fetchKitchenOrders()
      }
    } catch {}
  }

  const handleCreateMockOrder = async () => {
    try {
      setCreatingTest(true)
      const res = await fetch('/api/orders/mock-create', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        showToast(`🔥 New Live Order ${json.data.shortCode} placed!`)
        fetchKitchenOrders()
      }
    } finally {
      setCreatingTest(false)
    }
  }

  // Filter orders - Include PENDING, PLACED, CONFIRMED, PREPARING in active kitchen prep
  const activeOrders = orders.filter((o) => ['PENDING', 'PLACED', 'CONFIRMED', 'PREPARING'].includes(o.status))
  const readyOrders = orders.filter((o) => o.status === 'READY')
  const allActiveOrders = orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status))

  const displayedOrders = activeFilter === 'ACTIVE'
    ? activeOrders
    : activeFilter === 'READY'
    ? readyOrders
    : allActiveOrders

  const getMinutesAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    return diff <= 0 ? 'Just now' : `${diff}m ago`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast */}
      {feedback && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-2xl shadow-2xl bg-emerald-600 text-white text-xs font-black flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#22092C] text-white p-6 sm:p-8 rounded-3xl shadow-xl gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#BE3144] to-[#F05941] text-white shadow-lg">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live KDS Sync Active
            </div>
            <h1 className="text-xl sm:text-2xl font-black">Kitchen Display Monitor</h1>
            <p className="text-xs text-neutral-300">Live order queue, prep timers & order advancement</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleCreateMockOrder}
            disabled={creatingTest}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> {creatingTest ? 'Placing...' : '+ Create Test Live Order'}
          </button>
          <button
            onClick={fetchKitchenOrders}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5"
            title="Refresh Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Tab Filters */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveFilter('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeFilter === 'ACTIVE'
              ? 'bg-[#22092C] text-white shadow'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-[#F05941]" />
          <span>In Kitchen Prep ({activeOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('READY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeFilter === 'READY'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Ready for Pickup ({readyOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'ALL'
              ? 'bg-neutral-800 text-white shadow'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          All Active Queue ({allActiveOrders.length})
        </button>
      </div>

      {/* Order Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-neutral-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="p-16 bg-white rounded-3xl border border-neutral-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#22092C]">Kitchen Queue Clear!</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              All received orders are prepared and dispatched. Click below to spawn a test customer order.
            </p>
          </div>
          <button
            onClick={handleCreateMockOrder}
            className="px-6 py-2.5 bg-[#BE3144] hover:bg-[#872341] text-white text-xs font-black rounded-xl shadow transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Generate Incoming Live Order
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedOrders.map((order) => {
            const isPendingOrConfirmed = ['PENDING', 'PLACED', 'CONFIRMED'].includes(order.status)
            const isPrep = order.status === 'PREPARING'
            const isReady = order.status === 'READY'

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-6 border-2 shadow-lg flex flex-col justify-between space-y-5 transition-all ${
                  isPendingOrConfirmed
                    ? 'border-amber-400 bg-amber-50/15'
                    : isPrep
                    ? 'border-[#BE3144] bg-[#FFF8F5]'
                    : isReady
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : 'border-neutral-200'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-xl text-[#22092C]">{order.shortCode}</span>
                      <p className="text-[11px] text-neutral-500 flex items-center gap-1 font-medium mt-0.5">
                        <Clock className="w-3 h-3 text-[#BE3144]" /> {getMinutesAgo(order.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isPendingOrConfirmed
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : isPrep
                          ? 'bg-[#BE3144] text-white'
                          : isReady
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="text-xs text-neutral-600 border-b border-neutral-100 pb-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#22092C]">{order.user?.name || 'Customer'}</p>
                      <p className="text-[11px] text-neutral-400">{order.user?.phone || 'No phone'}</p>
                    </div>
                    <span className="font-black text-xs text-[#BE3144]">{formatPrice(order.grandTotal)}</span>
                  </div>

                  {/* Special Note */}
                  {order.specialInstructions && (
                    <div className="p-3 bg-amber-100/80 border border-amber-200 rounded-2xl text-xs text-amber-950 font-bold flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                      <span>Note: {order.specialInstructions}</span>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="space-y-2.5">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/70">
                        <div className="flex justify-between items-center text-sm font-black text-[#22092C]">
                          <span className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#22092C] text-white text-xs flex items-center justify-center font-black">
                              {item.quantity}x
                            </span>
                            <span>{item.name}</span>
                          </span>
                        </div>

                        {item.addons?.length > 0 && (
                          <div className="mt-1.5 pl-8 space-y-0.5">
                            {item.addons.map((a: any) => (
                              <p key={a.id} className="text-xs font-bold text-[#BE3144]">
                                + {a.name}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Advancement Buttons */}
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  {isPendingOrConfirmed && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PREPARING', order.shortCode)}
                      className="w-full py-3.5 bg-gradient-to-r from-[#BE3144] to-[#F05941] hover:brightness-110 text-white text-xs font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Flame className="w-4 h-4" /> Start Rolling (PREPARING)
                    </button>
                  )}

                  {isPrep && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'READY', order.shortCode)}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Mark Packed & Ready for Rider
                    </button>
                  )}

                  {isReady && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY', order.shortCode)}
                      className="w-full py-3.5 bg-[#22092C] hover:bg-[#351044] text-white text-xs font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>Handed to Delivery Partner</span>
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/orders/${order.shortCode}`)}
                      className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl"
                    >
                      View Live Tracker
                    </button>
                    {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                      <button
                        onClick={() => {
                          if (confirm(`Cancel order ${order.shortCode}?`)) {
                            updateOrderStatus(order.id, 'CANCELLED', order.shortCode)
                          }
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl border border-red-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
