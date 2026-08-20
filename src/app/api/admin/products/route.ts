import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/security'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        addons: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: products })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const {
      name,
      description,
      price,
      discountPrice,
      categoryId,
      imageUrl,
      isVeg,
      spiceLevel,
      preparationTime,
      isAvailable,
      isBestSeller,
      isFeatured,
      isNewItem,
      ingredients,
      allergens,
      addons,
    } = body

    if (!name || !description || price === undefined || !categoryId) {
      return NextResponse.json({ success: false, error: 'Missing required product fields' }, { status: 400 })
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4)

    const product = await prisma.product.create({
      data: {
        id: slug,
        name,
        description,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        categoryId,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800',
        isVeg: Boolean(isVeg),
        spiceLevel: parseInt(spiceLevel || 1),
        preparationTime: parseInt(preparationTime || 10),
        isAvailable: isAvailable ?? true,
        isBestSeller: Boolean(isBestSeller),
        isFeatured: Boolean(isFeatured),
        isNewItem: Boolean(isNewItem),
        ingredients: typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients || []),
        allergens: typeof allergens === 'string' ? allergens : JSON.stringify(allergens || []),
        addons: addons && Array.isArray(addons) && addons.length > 0 ? {
          create: addons.map((a: any) => ({
            name: a.name,
            price: parseFloat(a.price || 0),
            isDefault: Boolean(a.isDefault),
          })),
        } : undefined,
      },
      include: {
        category: true,
        addons: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: auth.user.userId,
        action: 'ADMIN_PRODUCT_CREATED',
        details: JSON.stringify({ productId: product.id, name: product.name }),
      },
    })

    return NextResponse.json({ success: true, data: product })
  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
