import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { getUserRank } from '@/lib/leaderboard'

/**
 * GET /api/users/[userId]/stats
 * Get detailed statistics for a user
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    // Get authenticated user
    const session = await getSession()
    const auth0User = session?.user

    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is requesting their own stats
    const requestingUser = await prisma.user.findUnique({
      where: { auth0Id: auth0User.sub },
    })

    if (!requestingUser || requestingUser.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user predictions
    const predictions = await prisma.prediction.findMany({
      where: {
        userId,
        isCorrect: { not: null },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate stats
    const totalPredictions = predictions.length
    const correctPredictions = predictions.filter((p) => p.isCorrect === true).length
    const totalPoints = predictions.reduce((sum, p) => sum + p.points, 0)
    const accuracy =
      totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0

    // Calculate current streak
    let currentStreak = 0
    for (const prediction of predictions) {
      if (prediction.isCorrect === true) {
        currentStreak++
      } else {
        break
      }
    }

    // Calculate best streak
    let bestStreak = 0
    let tempStreak = 0
    for (const prediction of predictions) {
      if (prediction.isCorrect === true) {
        tempStreak++
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak
        }
      } else {
        tempStreak = 0
      }
    }

    // Get recent form (last 5 predictions)
    const recentForm = predictions.slice(0, 5).map((p) => p.isCorrect === true)

    // Get ranks
    const allTimeRank = await getUserRank(userId, 'all-time')
    const weeklyRank = await getUserRank(userId, 'week')

    return NextResponse.json({
      totalPoints,
      totalPredictions,
      correctPredictions,
      accuracy,
      currentStreak,
      bestStreak,
      rank: {
        allTime: allTimeRank?.rank || 0,
        weekly: weeklyRank?.rank || 0,
      },
      recentForm,
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 })
  }
}
