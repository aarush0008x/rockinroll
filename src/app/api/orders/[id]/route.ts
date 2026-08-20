import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/security'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { shortCode: id }],
        ...(auth.user.role === 'CUSTOMER' ? { userId: auth.user.userId } : {}),
      },
      include: {
        items: {
          include: {
            addons: true,
            product: true,
          },
        },
        address: true,
        payment: true,
        deliveries: {
          include: {
            deliveryPartner: {
              select: { name: true, phone: true },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
