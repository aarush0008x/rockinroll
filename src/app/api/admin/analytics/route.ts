import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/security'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const totalOrders = await prisma.order.count()
    const deliveredOrders = await prisma.order.count({ where: { status: 'DELIVERED' } })
    const pendingOrders = await prisma.order.count({ where: { status: { in: ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'] } } })
    const totalRevenue = await prisma.order.aggregate({
      where: { status: { not: 'CANCELLED' } },
      _sum: { grandTotal: true },
    })

    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } })

    const orders = await prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { createdAt: true, grandTotal: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const salesByDay: Record<string, { revenue: number; orders: number }> = {}
    orders.forEach((o) => {
      const day = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!salesByDay[day]) salesByDay[day] = { revenue: 0, orders: 0 }
      salesByDay[day].revenue += o.grandTotal
      salesByDay[day].orders += 1
    })

    const chartData = Object.entries(salesByDay).map(([day, val]) => ({
      day,
      revenue: Math.round(val.revenue),
      orders: val.orders,
    })).reverse()

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    })

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.grandTotal || 0,
        totalOrders,
        deliveredOrders,
        pendingOrders,
        totalCustomers,
        chartData,
        recentAuditLogs,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
