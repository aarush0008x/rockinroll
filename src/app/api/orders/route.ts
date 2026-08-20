import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/security'
import { prisma } from '@/lib/db'
import { generateOrderShortCode, calculateTax, calculateDeliveryFee, calculateDiscount } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const orders = await prisma.order.findMany({
      where: { userId: auth.user.userId },
      include: {
        items: {
          include: {
            addons: true,
            product: true,
          },
        },
        payment: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const { items, addressId, couponCode, specialInstructions } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart cannot be empty' }, { status: 400 })
    }

    const productIds = items.map((i: any) => i.productId)
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { addons: true },
    })

    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    let subtotal = 0
    const validatedItems: any[] = []

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json({ success: false, error: `Product ${item.productId} not found` }, { status: 400 })
      }
      if (!product.isAvailable) {
        return NextResponse.json({ success: false, error: `${product.name} is currently sold out` }, { status: 400 })
      }

      const itemPrice = product.discountPrice ?? product.price
      let itemAddonTotal = 0
      const validatedAddons: any[] = []

      if (item.addons && Array.isArray(item.addons)) {
        const addonMap = new Map(product.addons.map((a) => [a.id, a]))
        for (const addonId of item.addons) {
          const addon = addonMap.get(addonId)
          if (addon) {
            itemAddonTotal += addon.price
            validatedAddons.push({
              addonId: addon.id,
              name: addon.name,
              price: addon.price,
            })
          }
        }
      }

      const lineTotal = (itemPrice + itemAddonTotal) * item.quantity
      subtotal += lineTotal

      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        addons: validatedAddons,
      })
    }

    let coupon = null
    let discountAmount = 0
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { id: couponCode.toUpperCase() } })
      if (coupon && coupon.isActive) {
        discountAmount = calculateDiscount(subtotal, coupon)
      }
    }

    const tax = calculateTax(subtotal - discountAmount)
    const deliveryFee = calculateDeliveryFee(subtotal)
    const grandTotal = Math.max(0, subtotal - discountAmount + tax + deliveryFee)
    const shortCode = generateOrderShortCode()

    const order = await prisma.order.create({
      data: {
        shortCode,
        userId: auth.user.userId,
        addressId: addressId || null,
        status: 'CONFIRMED',
        subtotal,
        tax,
        deliveryFee,
        discountAmount,
        grandTotal,
        couponId: coupon?.id || null,
        specialInstructions: specialInstructions || null,
        items: {
          create: validatedItems.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            addons: {
              create: i.addons.map((a: any) => ({
                addonId: a.addonId,
                name: a.name,
                price: a.price,
              })),
            },
          })),
        },
      },
      include: {
        items: { include: { addons: true } },
      },
    })

    return NextResponse.json({ success: true, data: order })
  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to create order' }, { status: 500 })
  }
}
