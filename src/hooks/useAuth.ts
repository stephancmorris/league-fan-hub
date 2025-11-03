'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { UserRole } from '@/lib/auth'

/**
 * Client-side authentication hook
 * Provides user data and auth helpers for React components
 */
export function useAuth() {
  const { user, error, isLoading } = useUser()

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: UserRole | string): boolean => {
    if (!user) return false
    const roles = (user['https://nrl-fan-hub.com/roles'] as string[]) || []
    return roles.includes(role)
  }

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: (UserRole | string)[]): boolean => {
    if (!user) return false
    const userRoles = (user['https://nrl-fan-hub.com/roles'] as string[]) || []
    return roles.some((role) => userRoles.includes(role))
  }

  /**
   * Check if user is an admin
   */
  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN)
  }

  /**
   * Check if user is a moderator
   */
  const isModerator = (): boolean => {
    return hasRole(UserRole.MODERATOR)
  }

  /**
   * Get user ID
   */
  const getUserId = (): string | undefined => {
    return (
      (user?.sub as string) || (user?.['https://nrl-fan-hub.com/user_id'] as string) || undefined
    )
  }

  /**
   * Get user email
   */
  const getEmail = (): string | undefined => {
    return (user?.email as string) || undefined
  }

  /**
   * Get user name
   */
  const getName = (): string | undefined => {
    return (user?.name as string) || undefined
  }

  /**
   * Get user picture
   */
  const getPicture = (): string | undefined => {
    return (user?.picture as string) || undefined
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
    isAdmin,
    isModerator,
    getUserId,
    getEmail,
    getName,
    getPicture,
  }
}
