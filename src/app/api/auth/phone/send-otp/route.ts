import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendWhatsAppPhoneOtp } from '@/lib/whatsapp'
import { rateLimit, rateLimitResponse } from '@/lib/security'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
  if (!rateLimit(`phone_otp:${ip}`, 5, 60000)) return rateLimitResponse()

  try {
    const { phone } = await req.json()
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : ''

    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit Indian mobile number' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 mins

    // Clear old tokens for this phone & create new
    await prisma.phoneOtpToken.deleteMany({ where: { phone: cleanPhone } })
    await prisma.phoneOtpToken.create({
      data: {
        phone: cleanPhone,
        otp,
        expiresAt,
      },
    })

    // Send OTP via WhatsApp / SMS
    await sendWhatsAppPhoneOtp(cleanPhone, otp)

    return NextResponse.json({
      success: true,
      message: `6-digit OTP code sent to +91 ${cleanPhone} via WhatsApp`,
      // For local testing convenience if keys are unset
      ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
    })
  } catch (error: any) {
    console.error('[SEND PHONE OTP ERROR]', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
