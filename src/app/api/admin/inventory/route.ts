import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/security'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const inventoryItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  category: z.string().default('GENERAL'),
  currentQty: z.number().nonnegative('Stock quantity must be non-negative'),
  unit: z.string().default('units'),
  minThreshold: z.number().nonnegative('Minimum threshold must be non-negative'),
  idealQty: z.number().positive('Ideal quantity must be positive'),
})

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN', 'STAFF'])
  if (auth instanceof NextResponse) return auth

  try {
    let items = await prisma.inventoryItem.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
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
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      })
    }

    const lowStockCount = items.filter((i) => i.currentQty <= i.minThreshold).length

    return NextResponse.json({ success: true, data: items, lowStockCount })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN', 'STAFF'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const parsed = inventoryItemSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    const item = await prisma.inventoryItem.create({
      data: parsed.data,
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN', 'STAFF'])
  if (auth instanceof NextResponse) return auth

  try {
    const { id, name, category, currentQty, unit, minThreshold, idealQty } = await req.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID required' }, { status: 400 })
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(currentQty !== undefined && { currentQty: parseFloat(currentQty) }),
        ...(unit !== undefined && { unit }),
        ...(minThreshold !== undefined && { minThreshold: parseFloat(minThreshold) }),
        ...(idealQty !== undefined && { idealQty: parseFloat(idealQty) }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
