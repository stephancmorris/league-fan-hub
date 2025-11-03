'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { MatchStatus } from '@prisma/client'

interface Prediction {
  id: string
  predictedWinner: string
  points: number
  isCorrect: boolean | null
  createdAt: string
  match: {
    id: string
    round: number
    homeTeam: string
    awayTeam: string
    homeTeamLogo: string | null
    awayTeamLogo: string | null
    homeScore: number | null
    awayScore: number | null
    status: MatchStatus
    kickoffTime: string
    venue: string
  }
}

interface PredictionHistoryResponse {
  predictions: Prediction[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface PredictionHistoryProps {
  status?: 'upcoming' | 'live' | 'completed' | 'all'
}

/**
 * PredictionHistory component
 * Displays user's prediction history with filtering options
 */
export function PredictionHistory({ status = 'all' }: PredictionHistoryProps) {
  const [filter, setFilter] = useState<string>(status)

  // Build API URL with filter
  const apiUrl = filter === 'all' ? '/api/predictions' : `/api/predictions?status=${filter}`

  const { data, error, isLoading, mutate } = useSWR<PredictionHistoryResponse>(apiUrl, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  })

  useEffect(() => {
    setFilter(status)
  }, [status])

  const predictions = data?.predictions || []

  // Calculate stats
  const totalPredictions = predictions.length
  const correctPredictions = predictions.filter((p) => p.isCorrect === true).length
  const totalPoints = predictions.reduce((sum, p) => sum + p.points, 0)
  const accuracy =
    totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    mutate() // Trigger revalidation
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Failed to load predictions. Please try again.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{totalPredictions}</p>
          <p className="text-sm text-gray-600">Predictions</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{correctPredictions}</p>
          <p className="text-sm text-gray-600">Correct</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-accent-500">{totalPoints}</p>
          <p className="text-sm text-gray-600">Points</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{accuracy}%</p>
          <p className="text-sm text-gray-600">Accuracy</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'upcoming', 'live', 'completed'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => handleFilterChange(filterOption)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === filterOption
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Predictions List */}
      {predictions.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No predictions found.</p>
          <p className="text-sm text-gray-500 mt-2">
            Start making predictions on upcoming matches!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {predictions.map((prediction) => {
            const isUpcoming = prediction.match.status === MatchStatus.UPCOMING
            const isLive = prediction.match.status === MatchStatus.LIVE
            const isCompleted = prediction.match.status === MatchStatus.COMPLETED

            return (
              <div
                key={prediction.id}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Round {prediction.match.round}
                    </p>
                    <p className="text-xs text-gray-500">{prediction.match.venue}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLive && (
                      <span className="text-xs font-bold px-2 py-1 rounded bg-red-500 text-white animate-pulse">
                        LIVE
                      </span>
                    )}
                    {isCompleted && prediction.isCorrect !== null && (
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          prediction.isCorrect
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {prediction.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{prediction.match.homeTeam}</p>
                    {!isUpcoming && (
                      <p className="text-xl font-bold mt-1">{prediction.match.homeScore ?? 0}</p>
                    )}
                  </div>

                  <div className="px-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Your Pick</p>
                    <p className="text-sm font-bold text-primary-500">
                      {prediction.predictedWinner === prediction.match.homeTeam ? '←' : '→'}
                    </p>
                  </div>

                  <div className="flex-1 text-right">
                    <p className="text-sm font-semibold">{prediction.match.awayTeam}</p>
                    {!isUpcoming && (
                      <p className="text-xl font-bold mt-1">{prediction.match.awayScore ?? 0}</p>
                    )}
                  </div>
                </div>

                {isCompleted && prediction.points > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-center">
                      <span className="font-semibold text-accent-500">+{prediction.points}</span>
                      <span className="text-gray-600"> points earned</span>
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
