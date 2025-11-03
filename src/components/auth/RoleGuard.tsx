'use client'

import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/auth'

interface RoleGuardProps {
  children: React.ReactNode
  role?: UserRole | string
  roles?: (UserRole | string)[]
  fallback?: React.ReactNode
  requireAll?: boolean
}

/**
 * RoleGuard component
 * Conditionally renders children based on user role
 */
export function RoleGuard({
  children,
  role,
  roles,
  fallback = null,
  requireAll = false,
}: RoleGuardProps) {
  const { hasRole, hasAnyRole, isLoading } = useAuth()

  if (isLoading) {
    return <>{fallback}</>
  }

  // Check single role
  if (role && !hasRole(role)) {
    return <>{fallback}</>
  }

  // Check multiple roles
  if (roles) {
    if (requireAll) {
      // User must have all roles
      const hasAllRoles = roles.every((r) => hasRole(r))
      if (!hasAllRoles) {
        return <>{fallback}</>
      }
    } else {
      // User must have at least one role
      if (!hasAnyRole(roles)) {
        return <>{fallback}</>
      }
    }
  }

  return <>{children}</>
}
