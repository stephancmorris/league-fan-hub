'use client'

import { useState } from 'react'
import Image from 'next/image'
import useSWR from 'swr'

interface LeaderboardEntry {
  userId: string
  userName: string
  userPicture: string | null
  totalPoints: number
  totalPredictions: number
  correctPredictions: number
  accuracy: number
  rank: number
  streak: number
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  currentUserRank: {
    rank: number
    totalUsers: number
  } | null
  timeframe: 'week' | 'all-time'
  pagination: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface LeaderboardTableProps {
  initialTimeframe?: 'week' | 'all-time'
}

/**
 * LeaderboardTable component
 * Displays rankings with user stats and performance metrics
 */
export function LeaderboardTable({ initialTimeframe = 'all-time' }: LeaderboardTableProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'all-time'>(initialTimeframe)

  const { data, error, isLoading } = useSWR<LeaderboardResponse>(
    `/api/leaderboard?timeframe=${timeframe}&limit=100`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
      revalidateOnMount: true,
      keepPreviousData: true, // Keep previous data while fetching new data
    }
  )

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300'
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300'
    return 'bg-blue-50 text-blue-700 border-blue-200'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Failed to load leaderboard. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setTimeframe('all-time')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeframe === 'all-time'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setTimeframe('week')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeframe === 'week'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          This Week
        </button>
      </div>

      {/* Current User Rank */}
      {data?.currentUserRank && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-sm font-medium text-primary-900">Your Current Rank</p>
          <p className="text-2xl font-bold text-primary-600">
            #{data.currentUserRank.rank}
            <span className="text-sm font-normal text-primary-700 ml-2">
              out of {data.currentUserRank.totalUsers} players
            </span>
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
          ))}
        </div>
      )}

      {/* Leaderboard Table */}
      {!isLoading && data && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predictions
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                  {timeframe === 'all-time' && (
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Streak
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.leaderboard.length === 0 ? (
                  <tr>
                    <td
                      colSpan={timeframe === 'all-time' ? 6 : 5}
                      className="px-6 py-12 text-center"
                    >
                      <p className="text-gray-500">No leaderboard data available yet.</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Start making predictions to see rankings!
                      </p>
                    </td>
                  </tr>
                ) : (
                  data.leaderboard.map((entry) => (
                    <tr key={entry.userId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm ${getRankBadgeColor(entry.rank)}`}
                          >
                            {getRankIcon(entry.rank) || entry.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {entry.userPicture ? (
                            <Image
                              src={entry.userPicture}
                              alt={entry.userName}
                              width={40}
                              height={40}
                              className="rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-gray-600 font-semibold">
                                {entry.userName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{entry.userName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-accent-500">
                          {entry.totalPoints}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm">
                          <span className="font-semibold text-green-600">
                            {entry.correctPredictions}
                          </span>
                          <span className="text-gray-400"> / </span>
                          <span className="text-gray-600">{entry.totalPredictions}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                            entry.accuracy >= 70
                              ? 'bg-green-100 text-green-800'
                              : entry.accuracy >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {entry.accuracy}%
                        </span>
                      </td>
                      {timeframe === 'all-time' && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {entry.streak > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                              🔥 {entry.streak}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
