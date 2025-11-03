'use client'

import { Match } from '@/types/match'
import { MatchStatus } from '@prisma/client'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { PredictionWidget } from '@/components/prediction/PredictionWidget'

interface MatchCardProps {
  match: Match
  showPredictionWidget?: boolean
  userPrediction?: {
    predictedWinner: string
    points: number
    isCorrect: boolean | null
  } | null
  onPredictionSubmit?: (matchId: string, predictedWinner: string) => Promise<void>
  // Legacy props for backward compatibility
  showPredictionButton?: boolean
  onPredictClick?: (matchId: string) => void
}

/**
 * MatchCard component
 * Displays match information with live score updates
 */
export function MatchCard({
  match,
  showPredictionWidget = false,
  userPrediction,
  onPredictionSubmit,
  showPredictionButton = false,
  onPredictClick,
}: MatchCardProps) {
  const isLive = match.status === MatchStatus.LIVE
  const isCompleted = match.status === MatchStatus.COMPLETED
  const isUpcoming = match.status === MatchStatus.UPCOMING

  const kickoffTime =
    typeof match.kickoffTime === 'string' ? new Date(match.kickoffTime) : match.kickoffTime

  const getStatusText = () => {
    if (isLive) {
      if (match.currentMinute) {
        return `${match.currentMinute}'`
      }
      return 'LIVE'
    }
    if (isCompleted) return 'FT'
    if (isUpcoming) {
      return formatDistanceToNow(kickoffTime, { addSuffix: true })
    }
    return match.status
  }

  const getStatusColor = () => {
    if (isLive) return 'bg-red-500 text-white animate-pulse'
    if (isCompleted) return 'bg-gray-500 text-white'
    return 'bg-blue-500 text-white'
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
      {/* Header: Round and Status */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium text-gray-500">
          Round {match.round} • {match.venue}
        </span>
        <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Match Content */}
      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center">
          {match.homeTeamLogo ? (
            <Image
              src={match.homeTeamLogo}
              alt={match.homeTeam}
              width={48}
              height={48}
              className="mb-2"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
              <span className="text-lg font-bold text-gray-600">
                {match.homeTeam.substring(0, 3).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-sm font-semibold text-center">{match.homeTeam}</span>
          {(isLive || isCompleted) && (
            <span className="text-2xl font-bold mt-2">{match.homeScore ?? 0}</span>
          )}
        </div>

        {/* VS or Score Separator */}
        <div className="px-4 flex flex-col items-center">
          {isUpcoming ? (
            <span className="text-gray-400 font-medium">VS</span>
          ) : (
            <span className="text-xl font-bold text-gray-300">-</span>
          )}
          {isUpcoming && (
            <span className="text-xs text-gray-400 mt-1">
              {kickoffTime.toLocaleTimeString('en-AU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center">
          {match.awayTeamLogo ? (
            <Image
              src={match.awayTeamLogo}
              alt={match.awayTeam}
              width={48}
              height={48}
              className="mb-2"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
              <span className="text-lg font-bold text-gray-600">
                {match.awayTeam.substring(0, 3).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-sm font-semibold text-center">{match.awayTeam}</span>
          {(isLive || isCompleted) && (
            <span className="text-2xl font-bold mt-2">{match.awayScore ?? 0}</span>
          )}
        </div>
      </div>

      {/* Footer: Prediction Widget or Legacy Button */}
      {showPredictionWidget ? (
        <PredictionWidget
          match={match}
          userPrediction={userPrediction}
          onPredictionSubmit={onPredictionSubmit}
        />
      ) : (
        showPredictionButton &&
        isUpcoming &&
        onPredictClick && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => onPredictClick(match.id)}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Make Prediction
            </button>
          </div>
        )
      )}

      {/* Half Time Indicator */}
      {isLive && match.half && (
        <div className="mt-3 text-center text-xs text-gray-500">{match.half.replace('_', ' ')}</div>
      )}
    </div>
  )
}
