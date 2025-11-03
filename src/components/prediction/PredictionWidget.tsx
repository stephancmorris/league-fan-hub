'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Match } from '@/types/match'
import { MatchStatus } from '@prisma/client'
import { useAuth } from '@/hooks/useAuth'

interface PredictionWidgetProps {
  match: Match
  userPrediction?: {
    predictedWinner: string
    points: number
    isCorrect: boolean | null
  } | null
  onPredictionSubmit?: (matchId: string, predictedWinner: string) => Promise<void>
}

/**
 * PredictionWidget component
 * Allows users to predict match winners
 * Shows locked state once match starts
 */
export function PredictionWidget({
  match,
  userPrediction,
  onPredictionSubmit,
}: PredictionWidgetProps) {
  const { isAuthenticated } = useAuth()
  const [selectedWinner, setSelectedWinner] = useState<string>(
    userPrediction?.predictedWinner || ''
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  const isLive = match.status === MatchStatus.LIVE
  const isCompleted = match.status === MatchStatus.COMPLETED

  // Predictions are locked once match starts
  const isPredictionLocked = isLive || isCompleted || Boolean(userPrediction)

  const kickoffTime =
    typeof match.kickoffTime === 'string' ? new Date(match.kickoffTime) : match.kickoffTime
  const isPastKickoff = new Date() >= kickoffTime

  const handlePredictionSubmit = async () => {
    if (!selectedWinner || !onPredictionSubmit) return

    setIsSubmitting(true)
    setError('')

    try {
      await onPredictionSubmit(match.id, selectedWinner)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit prediction')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't show widget if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          <Link
            href="/api/auth/login"
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Log in
          </Link>{' '}
          to make predictions
        </p>
      </div>
    )
  }

  // Show prediction result if match is completed
  if (isCompleted && userPrediction) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Your prediction:</span>
            <span className="text-sm font-semibold">{userPrediction.predictedWinner}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Result:</span>
            {userPrediction.isCorrect === null ? (
              <span className="text-sm text-gray-500">Pending</span>
            ) : userPrediction.isCorrect ? (
              <span className="text-sm font-semibold text-green-600">
                ✓ Correct (+{userPrediction.points} pts)
              </span>
            ) : (
              <span className="text-sm font-semibold text-red-600">✗ Incorrect</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show locked prediction if match is live or user already predicted
  if (isPredictionLocked || isPastKickoff) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="space-y-2">
          {userPrediction ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Your prediction:</span>
                <span className="text-sm font-semibold">{userPrediction.predictedWinner}</span>
              </div>
              {isLive && (
                <p className="text-xs text-gray-500 text-center">
                  Prediction locked - match in progress
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 text-center">
              Predictions locked - match has started
            </p>
          )}
        </div>
      </div>
    )
  }

  // Show prediction form for upcoming matches
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Predict the winner:</p>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedWinner(match.homeTeam)}
            disabled={isSubmitting}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
              selectedWinner === match.homeTeam
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {match.homeTeam}
          </button>

          <button
            onClick={() => setSelectedWinner(match.awayTeam)}
            disabled={isSubmitting}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
              selectedWinner === match.awayTeam
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {match.awayTeam}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <button
          onClick={handlePredictionSubmit}
          disabled={!selectedWinner || isSubmitting}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            !selectedWinner || isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-accent-500 hover:bg-accent-600 text-gray-900 shadow-sm hover:shadow-md'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Prediction'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Predictions lock at kickoff:{' '}
          {kickoffTime.toLocaleString('en-AU', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
