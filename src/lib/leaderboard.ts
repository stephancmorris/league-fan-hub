import { prisma } from './prisma'

/**
 * Leaderboard calculation utilities
 */

export interface LeaderboardEntry {
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

export interface LeaderboardOptions {
  timeframe?: 'week' | 'all-time'
  limit?: number
  offset?: number
}

/**
 * Calculate user's current streak of correct predictions
 */
async function calculateStreak(userId: string): Promise<number> {
  const predictions = await prisma.prediction.findMany({
    where: {
      userId,
      isCorrect: { not: null },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50, // Check last 50 predictions
  })

  let streak = 0
  for (const prediction of predictions) {
    if (prediction.isCorrect === true) {
      streak++
    } else {
      break
    }
  }

  return streak
}

/**
 * Get start date for weekly leaderboard
 */
function getWeekStartDate(): Date {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Monday is start of week
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - daysToSubtract)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

/**
 * Calculate leaderboard rankings
 */
export async function calculateLeaderboard(
  options: LeaderboardOptions = {}
): Promise<LeaderboardEntry[]> {
  const { timeframe = 'all-time', limit = 100, offset = 0 } = options

  // Build date filter for weekly leaderboard
  const dateFilter = timeframe === 'week' ? { gte: getWeekStartDate() } : undefined

  // Aggregate prediction stats per user
  const userStats = await prisma.prediction.groupBy({
    by: ['userId'],
    where: {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      isCorrect: { not: null }, // Only count completed predictions
    },
    _sum: {
      points: true,
    },
    _count: {
      id: true,
    },
  })

  // Get correct predictions count separately
  const correctCounts = await Promise.all(
    userStats.map(async (stat) => {
      const correctCount = await prisma.prediction.count({
        where: {
          userId: stat.userId,
          isCorrect: true,
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
      })
      return { userId: stat.userId, correctCount }
    })
  )

  // Get user details and calculate streaks
  const leaderboardData = await Promise.all(
    userStats.map(async (stat) => {
      const user = await prisma.user.findUnique({
        where: { id: stat.userId },
        select: {
          id: true,
          name: true,
          picture: true,
        },
      })

      const correctData = correctCounts.find((c) => c.userId === stat.userId)
      const totalPredictions = stat._count.id
      const correctPredictions = correctData?.correctCount || 0
      const totalPoints = stat._sum.points || 0
      const accuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0

      // Calculate streak (only for all-time leaderboard)
      const streak = timeframe === 'all-time' ? await calculateStreak(stat.userId) : 0

      return {
        userId: stat.userId,
        userName: user?.name || 'Anonymous',
        userPicture: user?.picture || null,
        totalPoints,
        totalPredictions,
        correctPredictions,
        accuracy: Math.round(accuracy * 10) / 10, // Round to 1 decimal
        rank: 0, // Will be assigned below
        streak,
      }
    })
  )

  // Sort by points (descending) and assign ranks
  const sortedLeaderboard = leaderboardData
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints
      }
      // Tiebreaker: accuracy
      if (b.accuracy !== a.accuracy) {
        return b.accuracy - a.accuracy
      }
      // Second tiebreaker: total predictions
      return b.totalPredictions - a.totalPredictions
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))

  // Apply pagination
  return sortedLeaderboard.slice(offset, offset + limit)
}

/**
 * Get user's rank in leaderboard
 */
export async function getUserRank(
  userId: string,
  timeframe: 'week' | 'all-time' = 'all-time'
): Promise<{ rank: number; totalUsers: number } | null> {
  const dateFilter = timeframe === 'week' ? { gte: getWeekStartDate() } : undefined

  // Get user's total points
  const userPoints = await prisma.prediction.aggregate({
    where: {
      userId,
      isCorrect: { not: null },
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
    _sum: {
      points: true,
    },
  })

  const userTotalPoints = userPoints._sum.points || 0

  // Count users with more points
  const usersAhead = await prisma.prediction.groupBy({
    by: ['userId'],
    where: {
      isCorrect: { not: null },
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
    _sum: {
      points: true,
    },
    having: {
      points: {
        _sum: {
          gt: userTotalPoints,
        },
      },
    },
  })

  // Get total users with at least one completed prediction
  const totalUsers = await prisma.prediction
    .groupBy({
      by: ['userId'],
      where: {
        isCorrect: { not: null },
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    })
    .then((groups) => groups.length)

  return {
    rank: usersAhead.length + 1,
    totalUsers,
  }
}
