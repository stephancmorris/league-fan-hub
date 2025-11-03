import { withRole } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { updateUserRole } from '@/lib/user-service'
import { UserRole } from '@prisma/client'
import { Auth0User } from '@/lib/auth'

/**
 * Admin-only API route
 * PATCH /api/admin/users/[userId]/role - Update user role
 */
export const PATCH = withRole('admin', async (req: NextRequest, _user: Auth0User) => {
  try {
    // Extract userId from URL pathname
    const pathname = req.nextUrl.pathname
    const userId = pathname.split('/').slice(-2)[0]

    const { role } = await req.json()

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const updatedUser = await updateUserRole(userId, role)

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
  }
})
