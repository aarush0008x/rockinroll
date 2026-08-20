import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyCashfreeWebhook } from '@/lib/payment'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-webhook-signature') || ''
    const timestamp = req.headers.get('x-webhook-timestamp') || ''

    if (process.env.NODE_ENV === 'production' && process.env.CASHFREE_WEBHOOK_SECRET) {
      const isValid = verifyCashfreeWebhook(rawBody, signature, timestamp)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const { data } = payload
    const orderShortCode = data?.order?.order_id
    const paymentStatus = data?.payment?.payment_status
    const cfPaymentId = data?.payment?.cf_payment_id?.toString()

    if (!orderShortCode) {
      return NextResponse.json({ error: 'Missing order reference' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { shortCode: orderShortCode },
      include: { payment: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (paymentStatus === 'SUCCESS') {
      await prisma.$transaction([
        prisma.payment.upsert({
          where: { orderId: order.id },
          update: {
            status: 'SUCCESS',
            cashfreePaymentId: cfPaymentId,
          },
          create: {
            orderId: order.id,
            userId: order.userId,
            gateway: 'CASHFREE',
            cashfreePaymentId: cfPaymentId,
            amount: order.grandTotal,
            status: 'SUCCESS',
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: { status: 'CONFIRMED' },
        }),
      ])
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'USER_DROPPED') {
      await prisma.payment.updateMany({
        where: { orderId: order.id },
        data: { status: 'FAILED' },
      })
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
