'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface CartItemAddon {
  id: string
  name: string
  price: number
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  imageUrl?: string
  isVeg: boolean
  quantity: number
  addons: CartItemAddon[]
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  addItem: (product: any, selectedAddons?: CartItemAddon[], quantity?: number) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, qty: number) => void
  clearCart: () => void
  subtotal: number
  itemCount: number
  couponCode: string
  setCouponCode: (code: string) => void
  discountAmount: number
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string; discount?: number }>
  removeCoupon: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rockinroll_cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('rockinroll_cart', JSON.stringify(items))
    } catch {}
  }, [items])

  const subtotal = items.reduce((acc, item) => {
    const addonsTotal = item.addons.reduce((a, b) => a + b.price, 0)
    return acc + (item.price + addonsTotal) * item.quantity
  }, 0)

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

  const addItem = (product: any, selectedAddons: CartItemAddon[] = [], quantity: number = 1) => {
    const price = product.discountPrice ?? product.price
    const addonIds = selectedAddons.map((a) => a.id).sort().join('-')
    const cartId = `${product.id}-${addonIds || 'default'}`

    setItems((prev) => {
      const existing = prev.find((i) => i.id === cartId)
      if (existing) {
        return prev.map((i) => (i.id === cartId ? { ...i, quantity: i.quantity + quantity } : i))
      }
      return [
        ...prev,
        {
          id: cartId,
          productId: product.id,
          name: product.name,
          price,
          imageUrl: product.imageUrl,
          isVeg: product.isVeg,
          quantity,
          addons: selectedAddons,
        },
      ]
    })
    setIsOpen(true)
  }

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId))
  }

  const updateQuantity = (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(cartItemId)
    } else {
      setItems((prev) => prev.map((i) => (i.id === cartItemId ? { ...i, quantity: qty } : i)))
    }
  }

  const clearCart = () => {
    setItems([])
    setCouponCode('')
    setDiscountAmount(0)
    try {
      localStorage.removeItem('rockinroll_cart')
    } catch {}
  }

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      })
      const json = await res.json()
      if (json.success) {
        setCouponCode(json.data.code)
        setDiscountAmount(json.data.discountAmount)
        return { success: true, discount: json.data.discountAmount }
      }
      return { success: false, error: json.error }
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to apply coupon' }
    }
  }

  const removeCoupon = () => {
    setCouponCode('')
    setDiscountAmount(0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        couponCode,
        setCouponCode,
        discountAmount,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
