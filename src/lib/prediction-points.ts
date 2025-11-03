import { Match } from '@prisma/client'

/**
 * Points awarded for correct predictions
 */
export const PREDICTION_POINTS = {
  CORRECT_WINNER: 10,
  BONUS_MARGIN: 5, // Bonus if predicted winner wins by 12+ points
} as const

/**
 * Calculate if a prediction is correct
 * @param predictedWinner - Team name that was predicted to win
 * @param match - Match data with final scores
 * @returns boolean indicating if prediction was correct
 */
export function isPredictionCorrect(predictedWinner: string, match: Match): boolean {
  if (match.homeScore === null || match.awayScore === null) {
    return false
  }

  if (match.homeScore === match.awayScore) {
    // Draw - no winner
    return false
  }

  const actualWinner = match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam

  return predictedWinner === actualWinner
}

/**
 * Calculate points for a prediction
 * @param predictedWinner - Team name that was predicted to win
 * @param match - Match data with final scores
 * @returns Points earned (0 if incorrect)
 */
export function calculatePredictionPoints(predictedWinner: string, match: Match): number {
  if (!isPredictionCorrect(predictedWinner, match)) {
    return 0
  }

  if (match.homeScore === null || match.awayScore === null) {
    return 0
  }

  let points = PREDICTION_POINTS.CORRECT_WINNER

  // Bonus points for large margin victories (12+ points)
  const margin = Math.abs(match.homeScore - match.awayScore)
  if (margin >= 12) {
    points += PREDICTION_POINTS.BONUS_MARGIN
  }

  return points
}

/**
 * Get the winning team from a match
 * @param match - Match data with final scores
 * @returns Winning team name or null if draw/incomplete
 */
export function getMatchWinner(match: Match): string | null {
  if (match.homeScore === null || match.awayScore === null) {
    return null
  }

  if (match.homeScore === match.awayScore) {
    return null // Draw
  }

  return match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam
}
