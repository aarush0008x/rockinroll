import React from 'react'
import Link from 'next/link'
import { Flame, Heart, Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#22092C] text-white border-t border-[#872341]/40 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#BE3144] to-[#F05941] flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-wider">
                ROCKIN<span className="text-[#F05941]">ROLL</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              India's premium roll revolution. Slow-marinated meats, artisanal parathas, and fiery handcrafted secret sauces.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#F05941] mb-4">Quick Bites</h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li><Link href="/menu" className="hover:text-white">Signature Rolls</Link></li>
              <li><Link href="/menu?category=classic-rolls" className="hover:text-white">Classic Kathi Rolls</Link></li>
              <li><Link href="/menu?category=fusion-bowls" className="hover:text-white">Roll-in-a-Bowl</Link></li>
              <li><Link href="/menu?veg=true" className="hover:text-white">Pure Veg Delights</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#F05941] mb-4">Portals</h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li><Link href="/dashboard" className="hover:text-white">Customer Dashboard</Link></li>
              <li><Link href="/staff" className="hover:text-white">Kitchen Display Portal</Link></li>
              <li><Link href="/delivery" className="hover:text-white">Rider Fleet Portal</Link></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs text-neutral-300">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#F05941] mb-4">Kitchen HQ</h4>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F05941]" /> CGC university, Mohali
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#F05941]" />
              <a href="tel:+919501714559" className="hover:text-white transition-colors">
                +91 95017 14559
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#F05941]" />
              <a href="mailto:support@rockinroll.in" className="hover:text-white transition-colors">
                support@rockinroll.in
              </a>
            </p>
            <p className="text-[11px] text-neutral-400 pt-2">
              🔥 Open Daily: 11:00 AM – 11:00 PM
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#872341]/30 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} RockinRoll Food Systems Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Handcrafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for midnight roll lovers
          </p>
        </div>
      </div>
    </footer>
  )
}
