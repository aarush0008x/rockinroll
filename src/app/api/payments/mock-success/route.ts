import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/security'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { orderId } = await req.json()

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { shortCode: orderId }],
        userId: auth.user.userId,
      },
    })

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.payment.upsert({
        where: { orderId: order.id },
        update: { status: 'SUCCESS', cashfreePaymentId: `MOCK_${Date.now()}` },
        create: {
          orderId: order.id,
          userId: order.userId,
          gateway: 'CASHFREE',
          cashfreePaymentId: `MOCK_${Date.now()}`,
          amount: order.grandTotal,
          status: 'SUCCESS',
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED' },
      }),
    ])

    return NextResponse.json({ success: true, message: 'Payment simulated successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
