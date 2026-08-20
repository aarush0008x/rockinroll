import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()
    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email and verification code are required' }, { status: 400 })
    }

    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        email,
        token: code.toString().trim(),
        expiresAt: { gt: new Date() },
      },
    })

    if (!tokenRecord) {
      return NextResponse.json({ success: false, error: 'Invalid or expired verification code' }, { status: 400 })
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    })

    await prisma.verificationToken.deleteMany({ where: { email } })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
