import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/security'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const addresses = await prisma.address.findMany({
    where: { userId: auth.user.userId },
    orderBy: { isDefault: 'desc' },
  })

  return NextResponse.json({ success: true, data: addresses })
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const { name, phone, houseFlatNo, street, area, city, state, pinCode, landmark, instructions, isDefault } = body

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: auth.user.userId },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: auth.user.userId,
        name,
        phone,
        houseFlatNo,
        street,
        area,
        city: city || 'Bengaluru',
        state: state || 'Karnataka',
        pinCode,
        landmark,
        instructions,
        isDefault: isDefault ?? true,
      },
    })

    return NextResponse.json({ success: true, data: address })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
