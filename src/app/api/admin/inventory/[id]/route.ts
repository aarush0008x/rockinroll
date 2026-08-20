import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/security'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN', 'STAFF'])
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  try {
    const body = await req.json()
    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.currentQty !== undefined && { currentQty: parseFloat(body.currentQty) }),
        ...(body.unit !== undefined && { unit: body.unit }),
        ...(body.minThreshold !== undefined && { minThreshold: parseFloat(body.minThreshold) }),
        ...(body.idealQty !== undefined && { idealQty: parseFloat(body.idealQty) }),
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
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN', 'STAFF'])
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  try {
    await prisma.inventoryItem.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Inventory item deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
