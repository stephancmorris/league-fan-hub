'use client'

import useSWR from 'swr'
import { useAuth } from '@/hooks/useAuth'

interface UserStats {
  totalPoints: number
  totalPredictions: number
  correctPredictions: number
  accuracy: number
  currentStreak: number
  bestStreak: number
  rank: {
    allTime: number
    weekly: number
  }
  recentForm: boolean[] // Last 5 predictions: true = correct, false = incorrect
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      if (res.status === 401) {
        return null
      }
      throw new Error('Failed to fetch user stats')
    }
    return res.json()
  })

/**
 * UserStatsCard component
 * Displays user's performance statistics and achievements
 */
export function UserStatsCard() {
  const { isAuthenticated, getUserId } = useAuth()
  const userId = getUserId()

  const { data, error, isLoading } = useSWR<UserStats>(
    isAuthenticated && userId ? `/api/users/${userId}/stats` : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  )

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Statistics</h3>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-accent-500">{data.totalPoints}</p>
          <p className="text-sm text-gray-600">Total Points</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary-500">{data.rank.allTime}</p>
          <p className="text-sm text-gray-600">Global Rank</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">{data.accuracy}%</p>
          <p className="text-sm text-gray-600">Accuracy</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-orange-600">{data.currentStreak}</p>
          <p className="text-sm text-gray-600">Current Streak</p>
        </div>
      </div>

      {/* Recent Form */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Recent Form</p>
        <div className="flex gap-2">
          {data.recentForm.length > 0 ? (
            data.recentForm.map((isCorrect, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  isCorrect ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={isCorrect ? 'Correct' : 'Incorrect'}
              >
                {isCorrect ? '✓' : '✗'}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent predictions</p>
          )}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="border-t border-gray-200 mt-4 pt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Predictions Made</p>
          <p className="font-semibold text-gray-900">{data.totalPredictions}</p>
        </div>
        <div>
          <p className="text-gray-600">Best Streak</p>
          <p className="font-semibold text-gray-900">{data.bestStreak}</p>
        </div>
        <div>
          <p className="text-gray-600">Correct Predictions</p>
          <p className="font-semibold text-gray-900">{data.correctPredictions}</p>
        </div>
        <div>
          <p className="text-gray-600">Weekly Rank</p>
          <p className="font-semibold text-gray-900">#{data.rank.weekly}</p>
        </div>
      </div>
    </div>
  )
}
