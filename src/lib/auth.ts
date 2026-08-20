import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from './db'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'rockinroll-super-secret-access-token-key-2026-min-32-chars'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'rockinroll-super-secret-refresh-token-key-2026-min-32-chars'
const ACCESS_EXPIRY = '15m'
const REFRESH_EXPIRY = '30d'
const REFRESH_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000

export interface JWTPayload {
  userId: string
  email: string
  role: string
  name?: string
  iat?: number
  exp?: number
}

export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY })
}

export function signRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY })
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, ACCESS_SECRET) as JWTPayload
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, REFRESH_SECRET) as JWTPayload
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateFamilyId(): string {
  return crypto.randomUUID()
}

export async function issueTokenPair(
  user: { id: string; email: string; role: string; name?: string },
  familyId: string,
  ipAddress?: string,
  deviceInfo?: string
) {
  const payload = { userId: user.id, email: user.email, role: user.role, name: user.name }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)
  const tokenHash = hashToken(refreshToken)
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRY_MS)

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt,
    },
  })

  const sessionId = `${user.id}-${deviceInfo || 'standard-device'}`
  await prisma.authSession.upsert({
    where: { id: sessionId },
    update: { lastActiveAt: new Date(), ipAddress },
    create: {
      id: sessionId,
      userId: user.id,
      deviceInfo: deviceInfo || 'Web Browser',
      ipAddress: ipAddress || '127.0.0.1',
      lastActiveAt: new Date(),
    },
  })

  return { accessToken, refreshToken }
}

export async function rotateRefreshToken(
  oldRefreshToken: string,
  ipAddress?: string,
  deviceInfo?: string
): Promise<{ accessToken: string; refreshToken: string }> {
  let payload: JWTPayload
  try {
    payload = verifyRefreshToken(oldRefreshToken)
  } catch {
    throw new Error('INVALID_REFRESH_TOKEN')
  }

  const tokenHash = hashToken(oldRefreshToken)
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } })

  if (!stored) {
    throw new Error('TOKEN_NOT_FOUND')
  }

  if (stored.isRevoked) {
    // Invalidate entire family upon reuse
    await prisma.refreshToken.updateMany({
      where: { familyId: stored.familyId },
      data: { isRevoked: true },
    })
    await prisma.auditLog.create({
      data: {
        userId: stored.userId,
        action: 'REFRESH_TOKEN_REUSE_DETECTED',
        ipAddress,
        deviceInfo,
        details: JSON.stringify({ familyId: stored.familyId }),
      },
    })
    throw new Error('TOKEN_REUSE_DETECTED')
  }

  if (new Date() > stored.expiresAt) {
    throw new Error('REFRESH_TOKEN_EXPIRED')
  }

  await prisma.refreshToken.update({
    where: { tokenHash },
    data: { isRevoked: true },
  })

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) throw new Error('USER_NOT_FOUND')

  return issueTokenPair(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    stored.familyId,
    ipAddress,
    deviceInfo
  )
}
