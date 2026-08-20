import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { issueTokenPair, generateFamilyId } from '@/lib/auth'
import { rateLimit, rateLimitResponse, setAuthCookies } from '@/lib/security'
import { sendAccountVerificationEmail } from '@/lib/email'
import { getAppUrl } from '@/lib/utils'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'DELIVERY_PARTNER', 'STAFF']).default('CUSTOMER'),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
  if (!rateLimit(`reg:${ip}`, 10, 60000)) return rateLimitResponse()

  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, email, phone, password, role } = parsed.data

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(phone ? [{ phone }] : [])],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email or phone already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role,
        isVerified: false,
      },
    })

    // Generate 6-digit verification code & send Brevo verification email
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
    await prisma.verificationToken.create({
      data: {
        email: user.email,
        token: code,
        expiresAt,
      },
    })

    const appUrl = getAppUrl()
    const verificationLink = `${appUrl}/auth/verify?email=${encodeURIComponent(user.email)}&code=${code}`
    
    console.log(`[REGISTER] Dispatching verification OTP to ${user.email}`)
    try {
      const emailResult = await sendAccountVerificationEmail(user.email, user.name, code, verificationLink)
      console.log(`[REGISTER] Email dispatch result:`, emailResult)
    } catch (err) {
      console.error('[REGISTER] Failed to send verification email:', err)
    }

    const familyId = generateFamilyId()
    const userAgent = req.headers.get('user-agent') || 'Unknown'
    const tokens = await issueTokenPair(user, familyId, ip, userAgent)

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        ipAddress: ip,
        deviceInfo: userAgent,
        details: JSON.stringify({ email: user.email, role: user.role }),
      },
    })

    const res = NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: false },
        accessToken: tokens.accessToken,
      },
    })

    return setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
