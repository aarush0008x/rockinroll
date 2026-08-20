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

  try {
    const dataToUpdate: any = {}
    const fields = [
      'name', 'description', 'categoryId', 'imageUrl',
      'isVeg', 'spiceLevel', 'preparationTime', 'isAvailable',
      'isBestSeller', 'isFeatured', 'isNewItem'
    ]

    for (const f of fields) {
      if (body[f] !== undefined) {
        if (f === 'price' || f === 'discountPrice') {
          dataToUpdate[f] = body[f] !== null ? parseFloat(body[f]) : null
        } else if (f === 'spiceLevel' || f === 'preparationTime') {
          dataToUpdate[f] = parseInt(body[f])
        } else {
          dataToUpdate[f] = body[f]
        }
      }
    }

    if (body.price !== undefined) dataToUpdate.price = parseFloat(body.price)
    if (body.discountPrice !== undefined) {
      dataToUpdate.discountPrice = body.discountPrice ? parseFloat(body.discountPrice) : null
    }

    if (body.ingredients !== undefined) {
      dataToUpdate.ingredients = typeof body.ingredients === 'string' ? body.ingredients : JSON.stringify(body.ingredients)
    }
    if (body.allergens !== undefined) {
      dataToUpdate.allergens = typeof body.allergens === 'string' ? body.allergens : JSON.stringify(body.allergens)
    }

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: true,
        addons: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: auth.user.userId,
        action: 'ADMIN_PRODUCT_UPDATED',
        details: JSON.stringify({ productId: id, changes: dataToUpdate }),
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
    await prisma.productAddon.deleteMany({ where: { productId: id } })
    await prisma.review.deleteMany({ where: { productId: id } })
    await prisma.favorite.deleteMany({ where: { productId: id } })
    await prisma.orderItem.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: auth.user.userId,
        action: 'ADMIN_PRODUCT_DELETED',
        details: JSON.stringify({ productId: id }),
      },
    })

    return NextResponse.json({ success: true, message: 'Product removed from menu' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
