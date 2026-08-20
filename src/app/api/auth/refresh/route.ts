import { NextRequest, NextResponse } from 'next/server'
import { rotateRefreshToken } from '@/lib/auth'
import { setAuthCookies, clearAuthCookies } from '@/lib/security'

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ success: false, error: 'Refresh token missing' }, { status: 401 })
  }

  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  try {
    const tokens = await rotateRefreshToken(refreshToken, ip, userAgent)
    const res = NextResponse.json({
      success: true,
      data: { accessToken: tokens.accessToken },
    })
    return setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
  } catch (error: any) {
    const res = NextResponse.json({ success: false, error: error.message || 'Token rotation failed' }, { status: 401 })
    return clearAuthCookies(res)
  }
}
