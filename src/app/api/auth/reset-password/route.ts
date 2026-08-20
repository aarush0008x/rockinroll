import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, token, newPassword } = await req.json()
    if (!email || !token || !newPassword) {
      return NextResponse.json({ success: false, error: 'Email, token, and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        token,
        expiresAt: { gt: new Date() },
      },
    })

    if (!resetRecord) {
      return NextResponse.json({ success: false, error: 'Invalid or expired password reset link' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    })

    // Invalidate reset tokens and user sessions
    await prisma.passwordResetToken.deleteMany({ where: { email } })
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } })
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
