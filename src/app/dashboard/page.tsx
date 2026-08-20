'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, LogOut, ArrowRight } from 'lucide-react'

export default function CustomerDashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/dashboard')
      return
    }
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const json = await res.json()
      if (json.success) setOrders(json.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-gradient-to-r from-[#22092C] to-[#351044] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#BE3144] to-[#F05941] flex items-center justify-center text-2xl font-black text-white shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">{user?.name}</h1>
            <p className="text-xs text-neutral-300">{user?.email} • {user?.phone || 'No phone registered'}</p>
            <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-[#872341] text-[10px] font-black uppercase tracking-wider">
              {user?.role} Account
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* RollPoints & Rewards Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-neutral-950 font-black text-[10px] uppercase tracking-wider">
              🪙 RollPoints™ Loyalty
            </span>
            <span className="text-xs font-bold text-neutral-600">100 pts = ₹50 OFF</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#22092C]">{user?.loyaltyPoints ?? 100}</span>
            <span className="text-xs font-extrabold text-amber-700">Available Points</span>
          </div>
          <p className="text-xs text-neutral-600">
            Earn 1 RollPoint for every ₹10 spent on authentic Kathi rolls and fusion bowls. Redeemable automatically on checkout!
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#BE3144]/10 to-[#F05941]/10 border-2 border-[#BE3144]/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-[#BE3144] text-white font-black text-[10px] uppercase tracking-wider">
              🎟️ Campus Referral Code
            </span>
            <span className="text-xs font-bold text-neutral-600">CGC Special</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white rounded-xl border border-neutral-300 font-mono font-black text-sm text-[#22092C] tracking-wider">
              {user?.referralCode || 'CGC50'}
            </div>
            <span className="text-xs font-bold text-[#BE3144]">Give ₹50, Get ₹50</span>
          </div>
          <p className="text-xs text-neutral-600">
            Friends get Flat ₹50 OFF with code <strong className="text-[#22092C]">CGC50</strong> on orders above ₹149!
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-black text-[#22092C]">Your Order History</h2>

        {loading ? (
          <div className="h-48 bg-neutral-200 rounded-3xl animate-pulse" />
        ) : orders.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-neutral-200 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-neutral-400 mx-auto" />
            <h4 className="font-bold text-[#22092C]">No orders placed yet</h4>
            <p className="text-xs text-neutral-500">Treat yourself to our signature rolls today!</p>
            <Link
              href="/menu"
              className="inline-block px-6 py-2.5 bg-[#BE3144] text-white text-xs font-bold rounded-xl shadow"
            >
              Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#22092C]">{order.shortCode}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-xs font-medium text-neutral-700">
                    {order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                  <span className="text-base font-black text-[#BE3144]">
                    {formatPrice(order.grandTotal)}
                  </span>
                  <Link
                    href={`/orders/${order.shortCode}`}
                    className="px-4 py-2 rounded-xl bg-[#22092C] hover:bg-[#872341] text-white text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
