'use client'

import React from 'react'
import { Check, Clock, ChefHat, PackageCheck, Bike, Home, XCircle } from 'lucide-react'

const STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock, desc: 'We received your order' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: Check, desc: 'Kitchen acknowledged' },
  { key: 'PREPARING', label: 'Sizzling in Kitchen', icon: ChefHat, desc: 'Chef is rolling fresh' },
  { key: 'READY', label: 'Packed & Ready', icon: PackageCheck, desc: 'Waiting for rider pickup' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Bike, desc: 'Rider is on the way' },
  { key: 'DELIVERED', label: 'Delivered', icon: Home, desc: 'Enjoy your hot meal!' },
]

export function OrderTracker({ currentStatus }: { currentStatus: string }) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-center space-y-2">
        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h4 className="font-extrabold text-red-900 text-lg">Order Cancelled</h4>
        <p className="text-xs text-red-700">This order was cancelled. Any debited amount will be refunded to your source account.</p>
      </div>
    )
  }

  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus)
  const activeIdx = currentIndex >= 0 ? currentIndex : 0

  return (
    <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-black text-[#22092C]">Live Kitchen & Delivery Tracking</h3>
        <p className="text-xs text-neutral-500">Real-time status updates from our kitchen to your doorstep</p>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-6 bottom-6 w-1 bg-neutral-100 md:hidden" />
        <div className="hidden md:block absolute top-6 left-6 right-6 h-1 bg-neutral-100 -z-0" />
        
        <div
          className="hidden md:block absolute top-6 left-6 h-1 bg-gradient-to-r from-[#BE3144] to-[#F05941] transition-all duration-700 -z-0"
          style={{ width: `${(activeIdx / (STEPS.length - 1)) * 100}%` }}
        />

        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-6 gap-2 relative z-10">
          {STEPS.map((step, idx) => {
            const isCompleted = idx <= activeIdx
            const isCurrent = idx === activeIdx
            const Icon = step.icon

            return (
              <div
                key={step.key}
                className="flex md:flex-col items-center md:text-center gap-4 md:gap-2"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                    isCompleted
                      ? isCurrent
                        ? 'bg-gradient-to-tr from-[#BE3144] to-[#F05941] text-white ring-4 ring-[#F05941]/30 scale-110'
                        : 'bg-[#22092C] text-white'
                      : 'bg-[#F5F1EF] text-neutral-400 border border-neutral-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                </div>

                <div>
                  <h5
                    className={`text-xs font-black ${
                      isCurrent
                        ? 'text-[#BE3144]'
                        : isCompleted
                        ? 'text-[#22092C]'
                        : 'text-neutral-400'
                    }`}
                  >
                    {step.label}
                  </h5>
                  <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
