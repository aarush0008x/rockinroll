import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, JWTPayload } from './auth'

interface RateLimitEntry {
  count: number
  windowStart: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function rateLimit(
  key: string,
  maxRequests: number = 30,
  windowMs: number = 60_000
): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count++
  return true
}

export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: 'Too many requests. Please slow down.' },
    { status: 429 }
  )
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookie = req.cookies.get('access_token')?.value
  if (cookie) return cookie

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)

  return null
}

export function authenticateJWT(req: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(req)
  if (!token) return null

  try {
    return verifyAccessToken(token)
  } catch {
    return null
  }
}

export function requireAuth(req: NextRequest): { user: JWTPayload } | NextResponse {
  const user = authenticateJWT(req)
  if (!user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
  }
  return { user }
}

export function requireRole(
  req: NextRequest,
  allowedRoles: string[]
): { user: JWTPayload } | NextResponse {
  const result = requireAuth(req)
  if (result instanceof NextResponse) return result

  if (!allowedRoles.includes(result.user.role)) {
    return NextResponse.json({ success: false, error: 'Access forbidden: insufficient permissions' }, { status: 403 })
  }
  return result
}

export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production'

  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  })

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })

  return response
}

export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete('access_token')
  response.cookies.delete('refresh_token')
  return response
}
