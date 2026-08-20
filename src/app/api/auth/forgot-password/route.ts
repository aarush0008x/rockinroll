import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.warn(`[FORGOT PASSWORD] No user found with email: ${email}`)
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.deleteMany({ where: { email } })
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expiresAt,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rockinroll.in'
    const resetLink = `${appUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

    console.log(`[FORGOT PASSWORD] Dispatching reset email to ${email}`)
    const emailResult = await sendPasswordResetEmail(email, user.name, resetLink)
    console.log(`[FORGOT PASSWORD] Email dispatch result:`, emailResult)

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
