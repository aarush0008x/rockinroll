import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/security'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  try {
    const body = await req.json()
    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...(body.discountType !== undefined && { discountType: body.discountType }),
        ...(body.value !== undefined && { value: parseFloat(body.value) }),
        ...(body.minOrderAmount !== undefined && { minOrderAmount: parseFloat(body.minOrderAmount) }),
        ...(body.maxDiscount !== undefined && { maxDiscount: body.maxDiscount ? parseFloat(body.maxDiscount) : null }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
        ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  try {
    await prisma.coupon.delete({ where: { id } })
    return NextResponse.json({ success: true, message: `Coupon ${id} deleted` })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
