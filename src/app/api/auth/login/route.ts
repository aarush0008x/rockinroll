import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { issueTokenPair, generateFamilyId } from '@/lib/auth'
import { rateLimit, rateLimitResponse, setAuthCookies } from '@/lib/security'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
  if (!rateLimit(`login:${ip}`, 15, 60000)) return rateLimitResponse()

  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { email, password } = parsed.data
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 })
    }

    const familyId = generateFamilyId()
    const userAgent = req.headers.get('user-agent') || 'Unknown'
    const tokens = await issueTokenPair(user, familyId, ip, userAgent)

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        ipAddress: ip,
        deviceInfo: userAgent,
      },
    })

    const res = NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        accessToken: tokens.accessToken,
      },
    })

    return setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
