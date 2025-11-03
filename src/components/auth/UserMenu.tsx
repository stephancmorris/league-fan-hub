'use client'

import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { LoginButton } from './LoginButton'
import { LogoutButton } from './LogoutButton'

/**
 * User menu component
 * Shows login button if not authenticated, or user info with logout if authenticated
 */
export function UserMenu() {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginButton />
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        {user?.picture && (
          <Image
            src={user.picture}
            alt={user.name || 'User'}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {user?.name || user?.email}
        </span>
      </div>
      <LogoutButton />
    </div>
  )
}
