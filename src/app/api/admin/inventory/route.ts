import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/security'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    let items = await prisma.inventoryItem.findMany({
      orderBy: { currentQty: 'asc' },
    })

    // Seed default items if empty
    if (items.length === 0) {
      await prisma.inventoryItem.createMany({
        data: [
          { name: 'Rumali Roti Dough Portions', category: 'FLATBREADS', currentQty: 120, unit: 'pcs', minThreshold: 30, idealQty: 150 },
          { name: 'Whole Wheat Paratha Base', category: 'FLATBREADS', currentQty: 85, unit: 'pcs', minThreshold: 25, idealQty: 100 },
          { name: 'Marinated Paneer Tikka', category: 'PROTEINS', currentQty: 14.5, unit: 'kg', minThreshold: 5, idealQty: 20 },
          { name: 'Smoked Tandoori Chicken Tikka', category: 'PROTEINS', currentQty: 18.2, unit: 'kg', minThreshold: 6, idealQty: 25 },
          { name: 'Kasundi Mustard Mayo', category: 'SAUCES', currentQty: 6.5, unit: 'liters', minThreshold: 2, idealQty: 10 },
          { name: 'Fiery Chipotle Glaze', category: 'SAUCES', currentQty: 4.0, unit: 'liters', minThreshold: 1.5, idealQty: 8 },
          { name: 'Mozzarella & Cheddar Shreds', category: 'DAIRY', currentQty: 3.2, unit: 'kg', minThreshold: 4.0, idealQty: 12 },
          { name: 'Thermal KOT Printer Rolls', category: 'PACKAGING', currentQty: 8, unit: 'rolls', minThreshold: 3, idealQty: 15 },
          { name: 'Food-Grade Roll Foil Wraps', category: 'PACKAGING', currentQty: 280, unit: 'wraps', minThreshold: 50, idealQty: 500 },
        ],
      })

      items = await prisma.inventoryItem.findMany({
        orderBy: { currentQty: 'asc' },
      })
    }

    const lowStockCount = items.filter((i) => i.currentQty <= i.minThreshold).length

    return NextResponse.json({ success: true, data: items, lowStockCount })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const { id, currentQty, minThreshold, idealQty } = await req.json()

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(currentQty !== undefined && { currentQty: parseFloat(currentQty) }),
        ...(minThreshold !== undefined && { minThreshold: parseFloat(minThreshold) }),
        ...(idealQty !== undefined && { idealQty: parseFloat(idealQty) }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
