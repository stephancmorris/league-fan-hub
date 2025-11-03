import { getSession } from '@auth0/nextjs-auth0'
import { NextRequest, NextResponse } from 'next/server'
import { Auth0User } from './auth'

/**
 * API route authentication utilities
 */

/**
 * Wrapper for protected API routes
 * Ensures user is authenticated before executing handler
 */
export function withAuth(
  handler: (req: NextRequest, user: Auth0User) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest) => {
    try {
      const session = await getSession()
      const user = session?.user

      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      return handler(req, user)
    } catch (error) {
      console.error('Auth error:', error)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
  }
}

/**
 * Wrapper for API routes that require specific role
 */
export function withRole(
  role: string,
  handler: (req: NextRequest, user: Auth0User) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest) => {
    try {
      const session = await getSession()
      const user = session?.user

      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const userRoles = user['https://nrl-fan-hub.com/roles'] || []
      if (!userRoles.includes(role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      return handler(req, user)
    } catch (error) {
      console.error('Auth error:', error)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
  }
}

/**
 * Wrapper for API routes that require any of the specified roles
 */
export function withAnyRole(
  roles: string[],
  handler: (req: NextRequest, user: Auth0User) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest) => {
    try {
      const session = await getSession()
      const user = session?.user

      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const userRoles = user['https://nrl-fan-hub.com/roles'] || []
      const hasRequiredRole = roles.some((role) => userRoles.includes(role))

      if (!hasRequiredRole) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      return handler(req, user)
    } catch (error) {
      console.error('Auth error:', error)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
  }
}
