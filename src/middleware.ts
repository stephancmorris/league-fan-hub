import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'

/**
 * Next.js Middleware with Auth0
 * Protects routes that require authentication
 */

// Protect API routes that start with /api/protected
export default withMiddlewareAuthRequired()

export const config = {
  matcher: ['/api/protected/:path*', '/dashboard/:path*', '/profile/:path*'],
}
