'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ChefHat, Check, RefreshCw, Plus, Clock, Package, Edit, Trash2, X, AlertCircle, AlertTriangle, Flame, Phone, CheckCircle2, Volume2, VolumeX, Printer } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function StaffKitchenPage() {
  const router = useRouter()
  const { user } = useAuth()
    const [staffTab, setStaffTab] = useState<'KDS' | 'INVENTORY'>('KDS')
  
  // Kitchen Inventory State
  const [inventoryList, setInventoryList] = useState<any[]>([])
  const [loadingInventory, setLoadingInventory] = useState(false)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false)
  const [editingInventoryItem, setEditingInventoryItem] = useState<any>(null)
  const [invForm, setInvForm] = useState({
    id: '',
    name: '',
    category: 'FLATBREADS',
    currentQty: 100,
    unit: 'pcs',
    minThreshold: 25,
    idealQty: 150,
  })

  const fetchInventory = async () => {
    try {
      setLoadingInventory(true)
      const res = await fetch('/api/admin/inventory')
      const json = await res.json()
      if (json.success) {
        setInventoryList(json.data)
        setLowStockCount(json.lowStockCount || 0)
      }
    } finally {
      setLoadingInventory(false)
    }
  }

  const handleUpdateStock = async (itemId: string, newQty: number, itemName: string) => {
    try {
      const res = await fetch(`/api/admin/inventory/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentQty: newQty }),
      })
      const json = await res.json()
      if (json.success) {
        showToast(`Stock updated for ${itemName}: ${newQty}`)
        fetchInventory()
      } else {
        showToast(json.error || 'Failed to update stock')
      }
    } catch {
      showToast('Error updating stock')
    }
  }

  const handleOpenAddInventory = () => {
    setEditingInventoryItem(null)
    setInvForm({
      id: '',
      name: '',
      category: 'FLATBREADS',
      currentQty: 100,
      unit: 'pcs',
      minThreshold: 25,
      idealQty: 150,
    })
    setShowAddInventoryModal(true)
  }

  const handleOpenEditInventory = (item: any) => {
    setEditingInventoryItem(item)
    setInvForm({
      id: item.id,
      name: item.name,
      category: item.category,
      currentQty: item.currentQty,
      unit: item.unit,
      minThreshold: item.minThreshold,
      idealQty: item.idealQty,
    })
    setShowAddInventoryModal(true)
  }

  const handleSaveInventoryForm = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingInventoryItem) {
        const res = await fetch(`/api/admin/inventory/${editingInventoryItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invForm),
        })
        const json = await res.json()
        if (json.success) {
          showToast(`"${invForm.name}" updated!`)
          setShowAddInventoryModal(false)
          fetchInventory()
        } else {
          showToast(json.error || 'Failed to update item')
        }
      } else {
        const res = await fetch('/api/admin/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: invForm.name,
            category: invForm.category,
            currentQty: parseFloat(invForm.currentQty as any) || 0,
            unit: invForm.unit,
            minThreshold: parseFloat(invForm.minThreshold as any) || 0,
            idealQty: parseFloat(invForm.idealQty as any) || 100,
          }),
        })
        const json = await res.json()
        if (json.success) {
          showToast(`"${invForm.name}" added to inventory!`)
          setShowAddInventoryModal(false)
          fetchInventory()
        } else {
          showToast(json.error || 'Failed to add item')
        }
      }
    } catch {
      showToast('Error saving inventory item')
    }
  }

  const handleDeleteInventory = async (itemId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from inventory?`)) return
    try {
      const res = await fetch(`/api/admin/inventory/${itemId}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        showToast(`"${name}" removed from inventory`)
        fetchInventory()
      } else {
        showToast(json.error || 'Failed to delete item')
      }
    } catch {
      showToast('Error deleting item')
    }
  }

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'ACTIVE' | 'READY' | 'ALL'>('ACTIVE')
  const [creatingTest, setCreatingTest] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [printingOrder, setPrintingOrder] = useState<any | null>(null)
  const previousPendingCount = useRef<number>(0)

  const showToast = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3500)
  }

  // Web Audio Kitchen Bell Synthesizer (Works reliably in all browsers)
  const playKitchenBell = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      // Primary Chime Tone
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime) // C6
      osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.6) // C5
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.6)

      // Echo bell strike
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator()
          const gain2 = ctx.createGain()
          osc2.type = 'sine'
          osc2.frequency.setValueAtTime(1318.5, ctx.currentTime) // E6
          gain2.gain.setValueAtTime(0.25, ctx.currentTime)
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
          osc2.connect(gain2)
          gain2.connect(ctx.destination)
          osc2.start()
          osc2.stop(ctx.currentTime + 0.5)
        } catch {}
      }, 150)
    } catch {}
  }

  useEffect(() => {
    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      router.push('/auth/login?redirect=/staff')
      return
    }
    fetchKitchenOrders()
    fetchInventory()
    const timer = setInterval(fetchKitchenOrders, 5000)
    return () => clearInterval(timer)
  }, [user])

  const fetchKitchenOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      const json = await res.json()
      if (json.success) {
        setOrders(json.data)
        
        // Count unacknowledged incoming orders
        const pendingOrders = json.data.filter((o: any) =>
          ['PENDING', 'PLACED', 'CONFIRMED'].includes(o.status)
        )

        // If new pending order arrived and sound enabled, ring the kitchen bell!
        if (pendingOrders.length > previousPendingCount.current && previousPendingCount.current >= 0) {
          if (soundEnabled) {
            playKitchenBell()
            showToast(`🔔 New Order Alert! (${pendingOrders.length} waiting)`)
          }
        }
        previousPendingCount.current = pendingOrders.length
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
    fetchInventory()
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
        if (soundEnabled) playKitchenBell()
        fetchKitchenOrders()
    fetchInventory()
      }
    } finally {
      setCreatingTest(false)
    }
  }

  const handlePrintKOT = (order: any) => {
    setPrintingOrder(order)
    setTimeout(() => {
      window.print()
    }, 150)
  }

  // Filter orders
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

      {/* Printable KOT Thermal Receipt (Hidden on screen, visible during window.print) */}
      {printingOrder && (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-4 text-xs font-mono">
          <div className="w-[80mm] max-w-full mx-auto space-y-2 border-b-2 border-black pb-2 text-center">
            <h2 className="text-base font-black tracking-wider">ROCKINROLL KITCHEN</h2>
            <p className="text-[10px]">CGC UNIVERSITY, MOHALI • HOT & FRESH</p>
            <p className="text-[11px] font-bold">KITCHEN ORDER TICKET (KOT)</p>
          </div>

          <div className="w-[80mm] max-w-full mx-auto py-2 border-b border-dashed border-black text-[11px] space-y-1">
            <div className="flex justify-between font-black text-sm">
              <span>ORDER: {printingOrder.shortCode}</span>
              <span>{printingOrder.orderType || 'DELIVERY'}</span>
            </div>
            <div className="flex justify-between">
              <span>Time: {new Date(printingOrder.createdAt).toLocaleTimeString()}</span>
              <span>Status: {printingOrder.status}</span>
            </div>
            <p className="font-bold">Customer: {printingOrder.user?.name} ({printingOrder.user?.phone || 'No Phone'})</p>
          </div>

          <div className="w-[80mm] max-w-full mx-auto py-2 border-b-2 border-black space-y-2">
            <p className="font-black text-[11px] uppercase tracking-wider">ITEMS TO PREPARE:</p>
            {printingOrder.items?.map((item: any, idx: number) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold text-xs">
                  <span>{item.quantity}x {item.name}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
                {item.addons?.length > 0 && (
                  <div className="pl-3 text-[10px] text-neutral-800">
                    {item.addons.map((a: any, aIdx: number) => (
                      <div key={aIdx}>+ {a.name}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {printingOrder.notes && (
            <div className="w-[80mm] max-w-full mx-auto py-2 border-b border-dashed border-black font-bold text-[10px]">
              ⚠️ Special Instructions: {printingOrder.notes}
            </div>
          )}

          <div className="w-[80mm] max-w-full mx-auto pt-2 flex justify-between font-black text-xs">
            <span>TOTAL AMOUNT:</span>
            <span>₹{printingOrder.grandTotal}</span>
          </div>
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
            <p className="text-xs text-neutral-300">Live order queue, audible chime & 1-click KOT thermal printing</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled)
              if (!soundEnabled) playKitchenBell()
            }}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
              soundEnabled
                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                : 'bg-white/10 text-neutral-400 hover:bg-white/20'
            }`}
            title="Toggle Kitchen Order Chime"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          <button
            onClick={playKitchenBell}
            className="px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold"
            title="Test Kitchen Sound"
          >
            🔔 Test Bell
          </button>

          <button
            onClick={handleCreateMockOrder}
            disabled={creatingTest}
            className="px-4 py-2.5 bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> {creatingTest ? 'Placing...' : '+ Mock Order'}
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
                    ? 'border-amber-400 bg-amber-50/15 animate-pulse'
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

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePrintKOT(order)}
                        className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                        title="Print Kitchen Order Ticket (KOT)"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

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
                  {order.notes && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-amber-900 font-bold">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                      <span>Note: {order.notes}</span>
                    </div>
                  )}

                  {/* Items list */}
                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#22092C]">
                            <span className="inline-block px-1.5 py-0.5 bg-[#BE3144] text-white rounded-md text-[10px] font-black mr-1.5">
                              {item.quantity}x
                            </span>
                            {item.name}
                          </span>
                          <span className="font-extrabold text-xs text-neutral-700">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>

                        {item.addons && item.addons.length > 0 && (
                          <div className="pl-6 space-y-0.5">
                            {item.addons.map((a: any) => (
                              <p key={a.id} className="text-[10px] font-semibold text-[#872341]">
                                + {a.name}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Advancement Action Buttons */}
                <div className="pt-2 border-t border-neutral-100 space-y-2">
                  {isPendingOrConfirmed && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PREPARING', order.shortCode)}
                      className="w-full py-3 bg-[#BE3144] hover:bg-[#872341] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center justify-center gap-2"
                    >
                      <Flame className="w-4 h-4" /> Start Preparing / On Grill
                    </button>
                  )}

                  {isPrep && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'READY', order.shortCode)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Mark Packed & Ready
                    </button>
                  )}

                  {isReady && (
                    <div className="text-center p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-extrabold flex items-center justify-center gap-1.5 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Ready in Dispatch Bay for Rider</span>
                    </div>
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
