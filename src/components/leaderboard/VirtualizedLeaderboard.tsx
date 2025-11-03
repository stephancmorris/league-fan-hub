'use client'

/**
 * VirtualizedLeaderboard component placeholder
 *
 * This is a placeholder file. The actual implementation requires 'react-window' package.
 * After running 'npm install', replace this file with VirtualizedLeaderboard.tsx.example
 *
 * To enable virtual scrolling:
 * 1. Run: npm install
 * 2. Delete this file
 * 3. Rename VirtualizedLeaderboard.tsx.example to VirtualizedLeaderboard.tsx
 */

import { LeaderboardEntry } from '@/lib/leaderboard'

interface VirtualizedLeaderboardProps {
  entries: LeaderboardEntry[]
  height: number
  itemHeight: number
  timeframe: 'week' | 'all-time'
}

export function VirtualizedLeaderboard({ entries }: VirtualizedLeaderboardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center text-gray-600">
        <p className="mb-2">Virtual Scrolling Not Available</p>
        <p className="text-sm">
          Run <code className="bg-gray-100 px-2 py-1 rounded">npm install</code> to enable this
          feature
        </p>
        <p className="text-xs mt-2 text-gray-500">Found {entries.length} entries</p>
      </div>
    </div>
  )
}
