'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { OrderTracker } from '@/components/OrderTracker'
import { formatPrice } from '@/lib/utils'
import { Bike, Phone, MapPin, RefreshCw } from 'lucide-react'

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params?.id as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      const json = await res.json()
      if (json.success) setOrder(json.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) fetchOrder()

    const interval = setInterval(fetchOrder, 10000)
    return () => clearInterval(interval)
  }, [orderId])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-80 bg-neutral-200 rounded-3xl animate-pulse" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-xl font-bold">Order not found</h2>
        <Link href="/menu" className="text-[#BE3144] font-bold underline text-xs">
          Explore Menu
        </Link>
      </div>
    )
  }

  const deliveryPartner = order.deliveries?.[0]?.deliveryPartner

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#22092C] text-white p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#BE3144] text-[10px] font-black uppercase tracking-wider">
              {order.status}
            </span>
            <span className="text-xs text-neutral-400">Order ID: {order.shortCode}</span>
          </div>
          <h1 className="text-2xl font-black text-white">Estimated Delivery: 25-30 Mins</h1>
        </div>

        <button
          onClick={fetchOrder}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Live Status
        </button>
      </div>

      <OrderTracker currentStatus={order.status} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#22092C] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#BE3144]" /> Delivery Destination
          </h3>
          {order.address ? (
            <div className="text-xs text-neutral-600 space-y-1">
              <p className="font-black text-[#22092C]">{order.address.name} ({order.address.phone})</p>
              <p>{order.address.houseFlatNo}, {order.address.street}, {order.address.area}, {order.address.city} - {order.address.pinCode}</p>
              {order.address.landmark && <p className="text-neutral-400">Landmark: {order.address.landmark}</p>}
            </div>
          ) : (
            <p className="text-xs text-neutral-500">Pick-up / Takeaway</p>
          )}

          {deliveryPartner && (
            <div className="mt-4 p-4 rounded-2xl bg-[#FFF8F5] border border-[#872341]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#BE3144] text-white flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-[#22092C]">{deliveryPartner.name}</h5>
                  <p className="text-[11px] text-neutral-500">Your RockinRoll Delivery Hero</p>
                </div>
              </div>
              {deliveryPartner.phone && (
                <a
                  href={`tel:${deliveryPartner.phone}`}
                  className="p-2 rounded-xl bg-white text-[#BE3144] shadow hover:bg-neutral-50"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#22092C]">Items in this Order</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-xs">
                <div>
                  <p className="font-bold text-[#22092C]">{item.quantity}x {item.name}</p>
                  {item.addons?.length > 0 && (
                    <p className="text-[11px] text-neutral-400">
                      {item.addons.map((a: any) => a.name).join(', ')}
                    </p>
                  )}
                </div>
                <span className="font-black text-neutral-800">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-100 flex justify-between text-sm font-black text-[#22092C]">
            <span>Paid Total</span>
            <span className="text-[#BE3144]">{formatPrice(order.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
