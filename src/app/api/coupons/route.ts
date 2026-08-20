import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      select: {
        id: true,
        discountType: true,
        value: true,
        minOrderAmount: true,
        maxDiscount: true,
      },
      orderBy: { minOrderAmount: 'asc' },
    })

    return NextResponse.json({ success: true, data: coupons })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
