'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { ShoppingBag, Flame, Shield, Truck, ChefHat, LogOut, Menu, X } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount, setIsOpen } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-[#22092C]/95 backdrop-blur-md border-b border-[#872341]/40 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#BE3144] to-[#F05941] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-wider text-white group-hover:text-[#F05941] transition-colors">
                ROCKIN<span className="text-[#F05941]">ROLL</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#F5F1EF]/70 font-semibold -mt-1">
                Gourmet Kathi & Fusion
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-white hover:text-[#F05941] transition-colors">
              Home
            </Link>
            <Link href="/menu" className="text-[#F5F1EF]/90 hover:text-[#F05941] transition-colors flex items-center gap-1.5">
              <span>Explore Menu</span>
              <span className="px-2 py-0.5 text-[10px] bg-[#BE3144] rounded-full font-bold uppercase tracking-wider">Hot</span>
            </Link>
            <Link href="/#story" className="text-[#F5F1EF]/80 hover:text-[#F05941] transition-colors">
              Our Story
            </Link>
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className="text-[#F05941] hover:underline flex items-center gap-1">
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
            {user?.role === 'STAFF' && (
              <Link href="/staff" className="text-[#F05941] hover:underline flex items-center gap-1">
                <ChefHat className="w-4 h-4" /> Kitchen
              </Link>
            )}
            {user?.role === 'DELIVERY_PARTNER' && (
              <Link href="/delivery" className="text-[#F05941] hover:underline flex items-center gap-1">
                <Truck className="w-4 h-4" /> Rider Hub
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2.5 rounded-xl bg-[#872341]/60 hover:bg-[#872341] text-white transition-colors flex items-center gap-2 border border-[#BE3144]/30"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#F05941]" />
              <span className="hidden sm:inline text-xs font-bold">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F05941] text-white text-xs font-black rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-bounce">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10 text-sm font-semibold"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#BE3144] flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#22092C] border border-[#872341] rounded-2xl shadow-2xl py-2 z-50 text-sm animate-fade-in">
                    <div className="px-4 py-2 border-b border-[#872341]/50">
                      <p className="font-bold text-white truncate">{user.name}</p>
                      <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-[#872341] rounded-full text-white">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdown(false)}
                      className="block px-4 py-2 text-neutral-200 hover:bg-[#872341]/50 hover:text-white"
                    >
                      My Orders & Profile
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdown(false)}
                        className="block px-4 py-2 text-[#F05941] hover:bg-[#872341]/50 font-semibold"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    {user.role === 'STAFF' && (
                      <Link
                        href="/staff"
                        onClick={() => setUserDropdown(false)}
                        className="block px-4 py-2 text-[#F05941] hover:bg-[#872341]/50 font-semibold"
                      >
                        Kitchen Monitor
                      </Link>
                    )}
                    {user.role === 'DELIVERY_PARTNER' && (
                      <Link
                        href="/delivery"
                        onClick={() => setUserDropdown(false)}
                        className="block px-4 py-2 text-[#F05941] hover:bg-[#872341]/50 font-semibold"
                      >
                        Rider Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdown(false)
                        logout()
                      }}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-950/40 hover:text-red-300 flex items-center gap-2 border-t border-[#872341]/50 mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white text-sm font-bold shadow-md hover:brightness-110 transition-all"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#22092C] border-b border-[#872341] px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-neutral-200 hover:text-white font-medium py-2"
          >
            Home
          </Link>
          <Link
            href="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-neutral-200 hover:text-white font-medium py-2"
          >
            Explore Menu
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-neutral-200 hover:text-white font-medium py-2"
          >
            My Orders
          </Link>
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[#F05941] font-bold py-2"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
