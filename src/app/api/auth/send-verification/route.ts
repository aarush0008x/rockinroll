import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendAccountVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ success: true, message: 'Account is already verified' })
    }

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 mins

    await prisma.verificationToken.deleteMany({ where: { email } })
    await prisma.verificationToken.create({
      data: {
        email,
        token: code,
        expiresAt,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'
    const verificationLink = `${appUrl}/auth/verify?email=${encodeURIComponent(email)}&code=${code}`

    console.log(`[VERIFICATION] Dispatching OTP email to ${email}`)
    const emailResult = await sendAccountVerificationEmail(email, user.name, code, verificationLink)
    console.log(`[VERIFICATION] Email dispatch result:`, emailResult)

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
