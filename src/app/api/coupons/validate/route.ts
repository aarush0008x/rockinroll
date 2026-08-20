import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateDiscount } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json()
    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code required' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: code.toUpperCase() },
    })

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ success: false, error: 'Invalid or expired coupon' }, { status: 404 })
    }

    if (subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { success: false, error: `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}` },
        { status: 400 }
      )
    }

    const discount = calculateDiscount(subtotal, coupon)
    return NextResponse.json({
      success: true,
      data: {
        code: coupon.id,
        discountType: coupon.discountType,
        value: coupon.value,
        discountAmount: discount,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
