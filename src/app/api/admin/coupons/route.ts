import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/security'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const couponCreateSchema = z.object({
  id: z.string().min(2, 'Coupon code must be at least 2 characters').toUpperCase().trim(),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  value: z.number().positive('Discount value must be positive'),
  minOrderAmount: z.number().nonnegative().default(0),
  maxDiscount: z.number().positive().nullable().optional(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().nullable().optional(),
})

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { id: 'asc' },
    })
    return NextResponse.json({ success: true, data: coupons })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const parsed = couponCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { id, discountType, value, minOrderAmount, maxDiscount, isActive, expiresAt } = parsed.data

    const existing = await prisma.coupon.findUnique({ where: { id } })
    if (existing) {
      return NextResponse.json({ success: false, error: `Coupon code '${id}' already exists` }, { status: 409 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        id,
        discountType,
        value,
        minOrderAmount,
        maxDiscount: maxDiscount || null,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json({ success: true, data: coupon }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
