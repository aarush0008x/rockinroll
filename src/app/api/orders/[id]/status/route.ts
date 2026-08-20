import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/security'
import { prisma } from '@/lib/db'
import { sendOrderStatusEmail } from '@/lib/email'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireRole(req, ['STAFF', 'ADMIN', 'SUPER_ADMIN', 'DELIVERY_PARTNER'])
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const { status } = await req.json()

  const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ success: false, error: 'Invalid order status' }, { status: 400 })
  }

  try {
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { shortCode: id }],
      },
      include: {
        items: { include: { addons: true } },
        address: true,
        user: true,
      },
    })

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    const order = await prisma.order.update({
      where: { id: existingOrder.id },
      data: { status },
      include: {
        items: { include: { addons: true } },
        address: true,
        user: true,
      },
    })

    if (status === 'OUT_FOR_DELIVERY') {
      const existingDelivery = await prisma.delivery.findFirst({
        where: { orderId: existingOrder.id },
      })

      if (existingDelivery) {
        await prisma.delivery.update({
          where: { id: existingDelivery.id },
          data: {
            status: 'ON_THE_WAY',
            pickedUpAt: new Date(),
            ...(auth.user.role === 'DELIVERY_PARTNER' ? { deliveryPartnerId: auth.user.userId } : {}),
          },
        })
      } else {
        await prisma.delivery.create({
          data: {
            orderId: existingOrder.id,
            status: 'ON_THE_WAY',
            pickedUpAt: new Date(),
            deliveryPartnerId: auth.user.userId,
          },
        })
      }
    } else if (status === 'DELIVERED') {
      await prisma.delivery.updateMany({
        where: { orderId: existingOrder.id },
        data: { status: 'DELIVERED', deliveredAt: new Date() },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: auth.user.userId,
        action: 'ORDER_STATUS_UPDATED',
        details: JSON.stringify({
          orderId: existingOrder.id,
          shortCode: existingOrder.shortCode,
          newStatus: status,
          updatedBy: auth.user.role,
        }),
      },
    })

    // Trigger Brevo transactional email for the status update asynchronously
    sendOrderStatusEmail(order, status).catch((err) => {
      console.error('Failed to send status email:', err)
    })

    return NextResponse.json({ success: true, data: order })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
