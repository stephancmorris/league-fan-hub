import { MatchStatus, MatchHalf } from '@prisma/client'

/**
 * Match data type from database
 */
export interface Match {
  id: string
  round: number
  homeTeam: string
  awayTeam: string
  homeTeamLogo?: string | null
  awayTeamLogo?: string | null
  homeScore?: number | null
  awayScore?: number | null
  status: MatchStatus
  kickoffTime: Date | string
  venue: string
  season: number
  competition: string
  currentMinute?: number | null
  half?: MatchHalf | null
  lastScoreTime?: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
}

/**
 * Match with prediction count
 */
export interface MatchWithPredictions extends Match {
  _count?: {
    predictions: number
  }
}

/**
 * WebSocket match update payload
 */
export interface MatchUpdatePayload {
  matchId: string
  type: 'score' | 'status' | 'time'
  data: Partial<Match>
}
