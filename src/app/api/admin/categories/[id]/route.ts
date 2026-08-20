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
  const body = await req.json()
  const { name, imageUrl, sortOrder, isActive } = body

  try {
    const dataToUpdate: any = {}
    if (name !== undefined) dataToUpdate.name = name
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl || null
    if (sortOrder !== undefined) dataToUpdate.sortOrder = parseInt(sortOrder)
    if (typeof isActive === 'boolean') dataToUpdate.isActive = isActive

    const updated = await prisma.category.update({
      where: { id },
      data: dataToUpdate,
    })

    await prisma.auditLog.create({
      data: {
        userId: auth.user.userId,
        action: 'ADMIN_CATEGORY_UPDATED',
        details: JSON.stringify({ categoryId: id, updates: dataToUpdate }),
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
    // Check if category has products
    const productCount = await prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete category with ${productCount} assigned products. Please reassign or delete the products first.` },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: auth.user.userId,
        action: 'ADMIN_CATEGORY_DELETED',
        details: JSON.stringify({ categoryId: id }),
      },
    })

    return NextResponse.json({ success: true, message: 'Category deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
