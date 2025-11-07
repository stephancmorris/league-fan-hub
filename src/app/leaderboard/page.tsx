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
        {/* Login prompt for unauthenticated users */}
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Sign in to see your personal stats
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  Log in to track your predictions, view your rank, and earn achievement badges.
                </p>
                <div className="mt-3">
                  <Link
                    href="/api/auth/login"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

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
