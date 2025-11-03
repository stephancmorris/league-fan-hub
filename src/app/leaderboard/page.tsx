'use client'

import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { UserStatsCard } from '@/components/leaderboard/UserStatsCard'
import { AchievementBadges } from '@/components/leaderboard/AchievementBadges'
import { useAuth } from '@/hooks/useAuth'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return null
      }
      throw new Error('Failed to fetch')
    }
    return res.json()
  })

/**
 * Leaderboard page - View rankings and compete with other fans
 */
export default function LeaderboardPage() {
  const { isAuthenticated, getUserId } = useAuth()
  const userId = getUserId()

  const { data: stats } = useSWR(
    isAuthenticated && userId ? `/api/users/${userId}/stats` : null,
    fetcher
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
              <p className="mt-2 text-sm text-gray-600">See how you rank against other fans</p>
            </div>
            <Link
              href="/matches"
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Make Predictions
            </Link>
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* User Stats Dashboard */}
        <UserStatsCard />

        {/* Achievement Badges */}
        {stats && <AchievementBadges stats={stats} />}

        {/* Leaderboard Table */}
        <LeaderboardTable />
      </div>
    </div>
  )
}
