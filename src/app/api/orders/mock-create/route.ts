import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/security'
import { prisma } from '@/lib/db'
import { generateOrderShortCode } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ['STAFF', 'ADMIN', 'SUPER_ADMIN', 'DELIVERY_PARTNER', 'CUSTOMER'])
  if (auth instanceof NextResponse) return auth

  try {
    // Get sample customer and address
    let customer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
      include: { addresses: true },
    })

    if (!customer) {
      customer = await prisma.user.findFirst({
        include: { addresses: true },
      })
    }

    if (!customer) {
      return NextResponse.json({ success: false, error: 'No user found' }, { status: 400 })
    }

    let address = customer.addresses[0]
    if (!address) {
      address = await prisma.address.create({
        data: {
          userId: customer.id,
          name: customer.name,
          phone: customer.phone || '9501714559',
          houseFlatNo: 'Hostel Block B, Room 204',
          street: 'Landran Campus',
          area: 'CGC University',
          city: 'Mohali',
          state: 'Punjab',
          pinCode: '140307',
          landmark: 'Near Main Gate',
          isDefault: true,
        },
      })
    }

    // Get 2 random products
    const products = await prisma.product.findMany({
      take: 2,
      include: { addons: true },
    })

    if (products.length === 0) {
      return NextResponse.json({ success: false, error: 'No products available to order' }, { status: 400 })
    }

    const shortCode = generateOrderShortCode()
    let subtotal = 0
    const orderItemsData: any[] = []

    for (const p of products) {
      const price = p.discountPrice ?? p.price
      const qty = Math.floor(Math.random() * 2) + 1
      subtotal += price * qty
      orderItemsData.push({
        productId: p.id,
        name: p.name,
        price,
        quantity: qty,
        addons: p.addons.length > 0 ? {
          create: [{
            name: p.addons[0].name,
            price: p.addons[0].price,
          }],
        } : undefined,
      })
      if (p.addons.length > 0) {
        subtotal += p.addons[0].price * qty
      }
    }

    const tax = Math.round(subtotal * 0.05)
    const deliveryFee = subtotal > 300 ? 0 : 35
    const grandTotal = subtotal + tax + deliveryFee

    const sampleInstructions = [
      'Please make it extra spicy and ring the doorbell twice.',
      'Leave at door, no onion please in the roll.',
      'Deliver hot with extra mint dip packets.',
      'Late night craving, please pack cutlery!',
    ]
    const specialInstructions = sampleInstructions[Math.floor(Math.random() * sampleInstructions.length)]

    const order = await prisma.order.create({
      data: {
        shortCode,
        userId: customer.id,
        addressId: address.id,
        subtotal,
        discountAmount: 0,
        tax,
        deliveryFee,
        grandTotal,
        status: 'CONFIRMED',
        specialInstructions,
        items: {
          create: orderItemsData,
        },
        payment: {
          create: {
            userId: customer.id,
            gateway: 'CASHFREE',
            amount: grandTotal,
            status: 'COMPLETED',
          },
        },
      },
      include: {
        items: { include: { addons: true } },
        address: true,
        user: true,
        payment: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: auth.user.userId,
        action: 'MOCK_ORDER_GENERATED',
        details: JSON.stringify({ shortCode, grandTotal }),
      },
    })

    return NextResponse.json({ success: true, data: order })
  } catch (error: any) {
    console.error('Mock order create error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
