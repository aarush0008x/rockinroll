import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/security'
import { prisma } from '@/lib/db'
import { createCashfreeOrder } from '@/lib/payment'

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { orderId } = await req.json()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    })

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    if (order.userId !== auth.user.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'

    const cfOrder = await createCashfreeOrder({
      orderId: order.shortCode,
      orderAmount: order.grandTotal,
      customerId: order.user.id,
      customerName: order.user.name,
      customerEmail: order.user.email,
      customerPhone: order.user.phone || '9999999999',
      returnUrl: `${appUrl}/orders/${order.shortCode}?payment_status={payment_status}`,
      notifyUrl: `${appUrl}/api/payments/cashfree/webhook`,
    })

    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        cashfreeOrderId: cfOrder.cf_order_id,
        amount: order.grandTotal,
      },
      create: {
        orderId: order.id,
        userId: order.userId,
        gateway: 'CASHFREE',
        cashfreeOrderId: cfOrder.cf_order_id,
        amount: order.grandTotal,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        paymentSessionId: cfOrder.payment_session_id,
        orderId: order.id,
        shortCode: order.shortCode,
        isMock: cfOrder.is_mock || false,
      },
    })
  } catch (error: any) {
    console.error('Cashfree create session error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Payment initialization failed' }, { status: 500 })
  }
}
