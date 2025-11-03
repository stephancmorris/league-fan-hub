'use client'

import { useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { MatchUpdatePayload } from '@/types/match'

let socket: Socket | null = null

/**
 * Initialize WebSocket connection
 */
function getSocket() {
  if (!socket) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
    socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.warn('WebSocket connected')
    })

    socket.on('disconnect', () => {
      console.warn('WebSocket disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })
  }

  return socket
}

/**
 * Hook to subscribe to match updates via WebSocket
 * @param matchId Optional match ID to subscribe to specific match
 * @param onUpdate Callback when match update received
 */
export function useMatchUpdates(matchId?: string, onUpdate?: (update: MatchUpdatePayload) => void) {
  const subscribeToMatch = useCallback((id: string) => {
    const socket = getSocket()
    socket.emit('subscribe:match', id)
  }, [])

  const unsubscribeFromMatch = useCallback((id: string) => {
    const socket = getSocket()
    socket.emit('unsubscribe:match', id)
  }, [])

  const subscribeToAllMatches = useCallback(() => {
    const socket = getSocket()
    socket.emit('subscribe:all-matches')
  }, [])

  useEffect(() => {
    const socket = getSocket()

    // Subscribe to match updates
    if (matchId) {
      subscribeToMatch(matchId)
    } else {
      subscribeToAllMatches()
    }

    // Listen for updates
    if (onUpdate) {
      socket.on('match:update', onUpdate)
    }

    // Cleanup
    return () => {
      if (matchId) {
        unsubscribeFromMatch(matchId)
      }
      if (onUpdate) {
        socket.off('match:update', onUpdate)
      }
    }
  }, [matchId, onUpdate, subscribeToMatch, unsubscribeFromMatch, subscribeToAllMatches])

  return {
    subscribeToMatch,
    unsubscribeFromMatch,
    subscribeToAllMatches,
    isConnected: socket?.connected || false,
  }
}

/**
 * Hook for admin/simulation purposes - emit match updates
 * This would be used by admin panel or match simulation system
 */
export function useMatchSimulator() {
  const updateScore = useCallback((matchId: string, homeScore: number, awayScore: number) => {
    const socket = getSocket()
    socket.emit('admin:update-score', { matchId, homeScore, awayScore })
  }, [])

  const updateStatus = useCallback(
    (matchId: string, status: string, data?: Record<string, unknown>) => {
      const socket = getSocket()
      socket.emit('admin:update-status', { matchId, status, ...data })
    },
    []
  )

  return {
    updateScore,
    updateStatus,
  }
}
