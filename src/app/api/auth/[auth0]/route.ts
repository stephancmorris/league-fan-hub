import { handleAuth } from '@auth0/nextjs-auth0'

/**
 * Auth0 authentication route handler
 * Handles /api/auth/login, /api/auth/logout, /api/auth/callback, and /api/auth/me
 */
export const GET = handleAuth()
