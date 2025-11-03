import { getSession } from '@auth0/nextjs-auth0'

/**
 * Auth utility functions for server-side authentication
 */

/**
 * User type from Auth0 session
 */
export interface Auth0User {
  sub?: string
  email?: string
  name?: string
  picture?: string
  'https://nrl-fan-hub.com/roles'?: string[]
  'https://nrl-fan-hub.com/user_id'?: string
  [key: string]: unknown
}

/**
 * Get the current user session
 * Use in Server Components and API routes
 */
export async function getCurrentUser() {
  try {
    const session = await getSession()
    return session?.user || null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: Auth0User | null, role: string): boolean {
  if (!user) return false

  const roles = (user['https://nrl-fan-hub.com/roles'] as string[]) || []
  return roles.includes(role)
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: Auth0User | null, roles: string[]): boolean {
  if (!user) return false

  const userRoles = (user['https://nrl-fan-hub.com/roles'] as string[]) || []
  return roles.some((role) => userRoles.includes(role))
}

/**
 * Require authentication for API routes
 * Throws error if user is not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * Require specific role for API routes
 * Throws error if user doesn't have the required role
 */
export async function requireRole(role: string) {
  const user = await requireAuth()
  if (!hasRole(user, role)) {
    throw new Error(`Role '${role}' required`)
  }
  return user
}

/**
 * User role types
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

/**
 * Get user ID from session
 */
export function getUserId(user: Auth0User | null): string | null {
  if (!user) return null
  return user.sub || (user['https://nrl-fan-hub.com/user_id'] as string | undefined) || null
}
