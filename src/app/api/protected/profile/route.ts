import { withAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { Auth0User } from '@/lib/auth'

/**
 * Protected API route example
 * GET /api/protected/profile - Get current user profile
 */
export const GET = withAuth(async (_req: NextRequest, user: Auth0User) => {
  return NextResponse.json({
    user: {
      id: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
      roles: user['https://nrl-fan-hub.com/roles'] || [],
    },
  })
})
