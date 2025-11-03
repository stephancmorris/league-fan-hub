'use client'

import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/useAuth'
import useSWR from 'swr'
import Link from 'next/link'

// Dynamic imports for heavy components with loading states
const LeaderboardTable = dynamic(
  () =>
    import('@/components/leaderboard/LeaderboardTable').then((mod) => ({
      default: mod.LeaderboardTable,
    })),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    ),
    ssr: false,
  }
)

const UserStatsCard = dynamic(
  () =>
    import('@/components/leaderboard/UserStatsCard').then((mod) => ({
      default: mod.UserStatsCard,
    })),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
    ssr: false,
  }
)

const AchievementBadges = dynamic(
  () =>
    import('@/components/leaderboard/AchievementBadges').then((mod) => ({
      default: mod.AchievementBadges,
    })),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    ),
    ssr: false,
  }
)

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
