import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/security'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()
  const { role, isVerified, name, phone } = body

  try {
    const dataToUpdate: any = {}
    if (role) {
      const validRoles = ['CUSTOMER', 'STAFF', 'DELIVERY_PARTNER', 'ADMIN', 'SUPER_ADMIN']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ success: false, error: 'Invalid role specified' }, { status: 400 })
      }
      dataToUpdate.role = role
    }
    if (typeof isVerified === 'boolean') dataToUpdate.isVerified = isVerified
    if (name) dataToUpdate.name = name
    if (phone !== undefined) dataToUpdate.phone = phone

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: auth.user.userId,
        action: 'ADMIN_USER_UPDATED',
        details: JSON.stringify({ targetUserId: id, updates: dataToUpdate }),
      },
    })

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireRole(req, ['ADMIN', 'SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  if (id === auth.user.userId) {
    return NextResponse.json({ success: false, error: 'Cannot delete your own admin account' }, { status: 400 })
  }

  try {
    await prisma.user.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: auth.user.userId,
        action: 'ADMIN_USER_DELETED',
        details: JSON.stringify({ deletedUserId: id }),
      },
    })

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
