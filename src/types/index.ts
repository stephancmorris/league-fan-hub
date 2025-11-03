/**
 * Shared TypeScript type definitions for the NRL Fan Hub
 */

// User Types
export interface User {
  id: string
  email: string
  name: string
  picture?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// Match Types
export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  homeScore: number
  awayScore: number
  status: MatchStatus
  round: number
  season: number
  venue: string
  startTime: Date
  endTime?: Date
}

export enum MatchStatus {
  UPCOMING = 'UPCOMING',
  LIVE = 'LIVE',
  HALFTIME = 'HALFTIME',
  FULLTIME = 'FULLTIME',
  COMPLETED = 'COMPLETED',
}

export interface Team {
  id: string
  name: string
  shortName: string
  logo: string
  primaryColor: string
  secondaryColor: string
}

// Prediction Types
export interface Prediction {
  id: string
  userId: string
  matchId: string
  predictedWinnerId: string
  margin?: number
  locked: boolean
  correct?: boolean
  points?: number
  createdAt: Date
  updatedAt: Date
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  userPicture?: string
  totalPoints: number
  correctPredictions: number
  totalPredictions: number
  accuracy: number
  weeklyPoints?: number
}

export interface LeaderboardFilters {
  timeframe: 'weekly' | 'season' | 'alltime'
  limit?: number
  offset?: number
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  metadata?: {
    page?: number
    limit?: number
    total?: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// WebSocket Types
export interface WebSocketMessage {
  type: WebSocketEventType
  payload: unknown
  timestamp: number
}

export enum WebSocketEventType {
  MATCH_UPDATE = 'MATCH_UPDATE',
  SCORE_CHANGE = 'SCORE_CHANGE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  PREDICTION_LOCKED = 'PREDICTION_LOCKED',
  LEADERBOARD_UPDATE = 'LEADERBOARD_UPDATE',
}

// Form Types
export interface PredictionFormData {
  matchId: string
  predictedWinnerId: string
  margin?: number
}
