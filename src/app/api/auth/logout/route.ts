import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashToken } from '@/lib/auth'
import { clearAuthCookies } from '@/lib/security'

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken)
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { isRevoked: true },
    })
  }

  const res = NextResponse.json({ success: true, message: 'Logged out successfully' })
  return clearAuthCookies(res)
}
