'use client'

import { useState, useCallback } from 'react'
import { MatchCard } from '@/components/match/MatchCard'
import { useMatches } from '@/hooks/useMatches'
import { useMatchUpdates } from '@/hooks/useMatchUpdates'
import { usePredictions } from '@/hooks/usePredictions'
import { MatchStatus } from '@prisma/client'
import { MatchUpdatePayload } from '@/types/match'

/**
 * Matches page - Display all matches with live updates and predictions
 */
export default function MatchesPage() {
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | 'ALL'>('ALL')

  const { matches, isLoading, isError, mutate } = useMatches({
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    refreshInterval: 30000, // Fallback refresh every 30 seconds
  })

  // Load user predictions with optimistic updates
  const { submitPrediction, getPredictionForMatch } = usePredictions()

  // Handle WebSocket match updates
  const handleMatchUpdate = useCallback(
    (update: MatchUpdatePayload) => {
      // Optimistically update the match in the cache
      mutate(
        (currentData) => {
          if (!currentData) return currentData

          const updatedMatches = currentData.matches.map((match) =>
            match.id === update.matchId ? { ...match, ...update.data } : match
          )

          return { matches: updatedMatches }
        },
        { revalidate: false } // Don't revalidate from server immediately
      )
    },
    [mutate]
  )

  // Subscribe to all match updates via WebSocket
  const { isConnected } = useMatchUpdates(undefined, handleMatchUpdate)

  // Handle prediction submission
  const handlePredictionSubmit = useCallback(
    async (matchId: string, predictedWinner: string) => {
      await submitPrediction(matchId, predictedWinner)
    },
    [submitPrediction]
  )

  const statusTabs = [
    { value: 'ALL' as const, label: 'All Matches' },
    { value: MatchStatus.LIVE, label: 'Live' },
    { value: MatchStatus.UPCOMING, label: 'Upcoming' },
    { value: MatchStatus.COMPLETED, label: 'Completed' },
  ]

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load matches</h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NRL Matches</h1>
              <p className="mt-2 text-sm text-gray-600">Live scores and upcoming fixtures</p>
            </div>
            {/* WebSocket Connection Status */}
            <div className="flex items-center space-x-2">
              <div
                className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}
              />
              <span className="text-xs text-gray-500">
                {isConnected ? 'Live updates active' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {statusTabs.map((tab) => {
              const isActive = selectedStatus === tab.value
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedStatus(tab.value)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                  {tab.value === MatchStatus.LIVE && matches.length > 0 && (
                    <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-bold">
                      {matches.filter((m) => m.status === MatchStatus.LIVE).length}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="px-4">
                    <div className="h-6 bg-gray-200 rounded w-8"></div>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No matches found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus === 'ALL'
                ? 'No matches scheduled yet'
                : `No ${selectedStatus.toLowerCase()} matches`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const userPrediction = getPredictionForMatch(match.id)
              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  showPredictionWidget
                  userPrediction={
                    userPrediction
                      ? {
                          predictedWinner: userPrediction.predictedWinner,
                          points: userPrediction.points,
                          isCorrect: userPrediction.isCorrect,
                        }
                      : null
                  }
                  onPredictionSubmit={handlePredictionSubmit}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Live indicator */}
      {matches.some((m) => m.status === MatchStatus.LIVE) && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="font-medium">Live matches active</span>
        </div>
      )}
    </div>
  )
}
