import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('category')
  const isVeg = searchParams.get('veg')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')
  const bestseller = searchParams.get('bestseller')

  try {
    const where: any = { isAvailable: true }

    if (categoryId && categoryId !== 'ALL') where.categoryId = categoryId
    if (isVeg !== null && isVeg !== undefined && isVeg !== '') {
      where.isVeg = isVeg === 'true'
    }
    if (featured === 'true') where.isFeatured = true
    if (bestseller === 'true') where.isBestSeller = true
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        addons: true,
      },
      orderBy: [{ isBestSeller: 'desc' }, { isFeatured: 'desc' }, { rating: 'desc' }],
    })

    return NextResponse.json({ success: true, data: products })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
