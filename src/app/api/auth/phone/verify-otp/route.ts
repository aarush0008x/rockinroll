import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { issueTokenPair, generateFamilyId } from '@/lib/auth'
import { setAuthCookies } from '@/lib/security'

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, name } = await req.json()
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : ''

    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 })
    }

    if (!otp || otp.trim().length !== 6) {
      return NextResponse.json({ success: false, error: 'Invalid 6-digit OTP' }, { status: 400 })
    }

    const tokenRecord = await prisma.phoneOtpToken.findFirst({
      where: {
        phone: cleanPhone,
        otp: otp.trim(),
        expiresAt: { gt: new Date() },
      },
    })

    if (!tokenRecord) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP code' }, { status: 400 })
    }

    // Delete used OTP token
    await prisma.phoneOtpToken.deleteMany({ where: { phone: cleanPhone } })

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { phone: cleanPhone },
    })

    if (!user) {
      // Auto-register new customer with 100 welcome RollPoints
      const randomPassword = crypto.randomBytes(16).toString('hex')
      const passwordHash = await bcrypt.hash(randomPassword, 10)
      const placeholderEmail = `${cleanPhone}@phone.rockinroll.in`

      user = await prisma.user.create({
        data: {
          name: name?.trim() || `Roll Lover ${cleanPhone.slice(-4)}`,
          email: placeholderEmail,
          phone: cleanPhone,
          passwordHash,
          role: 'CUSTOMER',
          isVerified: true,
          loyaltyPoints: 100,
          referralCode: `RR${cleanPhone.slice(-4)}${Math.floor(100 + Math.random() * 900)}`,
        },
      })
    } else if (!user.isVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      })
    }

    const familyId = generateFamilyId()
    const { accessToken, refreshToken } = issueTokenPair(user, familyId)

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
      },
    })

    setAuthCookies(response, accessToken, refreshToken)
    return response
  } catch (error: any) {
    console.error('[VERIFY PHONE OTP ERROR]', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
