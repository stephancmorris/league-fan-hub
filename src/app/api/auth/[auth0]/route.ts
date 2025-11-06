import { handleAuth } from '@auth0/nextjs-auth0'

/**
 * Auth0 authentication route handler
 * Handles /api/auth/login, /api/auth/logout, /api/auth/callback, and /api/auth/me
 *
 * Both GET and POST are required:
 * - GET: Used for login, logout, and profile endpoints
 * - POST: Used by Auth0 callback to send authentication data back to the app
 */
export const GET = handleAuth()
export const POST = handleAuth()
