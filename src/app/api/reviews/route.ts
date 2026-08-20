import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/security'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const onlyPhotos = searchParams.get('photos') === 'true'

    const reviews = await prisma.review.findMany({
      where: {
        isApproved: true,
        ...(productId && { productId }),
        ...(onlyPhotos && { imageUrl: { not: null } }),
      },
      include: {
        user: { select: { name: true, phone: true } },
        product: { select: { name: true, imageUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ success: true, data: reviews })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const user = auth.user

  try {
    const { productId, rating, comment, imageUrl, orderId } = await req.json()

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Valid rating (1-5) and product required' }, { status: 400 })
    }

    const hasPhoto = Boolean(imageUrl && imageUrl.trim().length > 0)
    const pointsToAdd = hasPhoto ? 5 : 0

    // Upsert review
    const review = await prisma.review.create({
      data: {
        userId: user.userId,
        productId,
        orderId: orderId || null,
        rating: parseInt(rating),
        comment: comment?.trim() || '',
        imageUrl: imageUrl?.trim() || null,
        pointsAwarded: hasPhoto,
        isApproved: true,
      },
    })

    // Award 5 bonus RollPoints if photo was uploaded
    if (hasPhoto) {
      await prisma.user.update({
        where: { id: user.userId },
        data: { loyaltyPoints: { increment: 5 } },
      })
    }

    // Update product rating
    const allProductReviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    })

    const avgRating =
      allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allProductReviews.length,
      },
    })

    return NextResponse.json({
      success: true,
      data: review,
      pointsAwarded: pointsToAdd,
      message: hasPhoto
        ? '🎉 Review submitted! You earned +5 bonus RollPoints!'
        : 'Review submitted successfully!',
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
