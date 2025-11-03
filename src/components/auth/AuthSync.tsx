'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'

/**
 * AuthSync component
 * Automatically syncs user to database after login
 */
export function AuthSync() {
  const { user, isLoading } = useAuth()
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    async function syncUserToDb() {
      if (!user || synced || isLoading) return

      try {
        const response = await fetch('/api/auth/sync', {
          method: 'POST',
        })

        if (response.ok) {
          setSynced(true)
        }
      } catch (error) {
        console.error('Failed to sync user:', error)
      }
    }

    syncUserToDb()
  }, [user, synced, isLoading])

  return null
}
