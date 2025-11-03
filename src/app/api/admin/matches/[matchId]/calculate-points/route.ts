import { withRole } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Auth0User } from '@/lib/auth'
import { MatchStatus } from '@prisma/client'
import { calculatePredictionPoints, isPredictionCorrect } from '@/lib/prediction-points'

/**
 * Admin-only API route
 * POST /api/admin/matches/[matchId]/calculate-points
 * Calculate and update points for all predictions on a completed match
 */
export const POST = withRole('admin', async (req: NextRequest, _user: Auth0User) => {
  try {
    const pathname = req.nextUrl.pathname
    const matchId = pathname.split('/').slice(-2)[0]

    // Get match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Only calculate points for completed matches
    if (match.status !== MatchStatus.COMPLETED) {
      return NextResponse.json(
        { error: 'Points can only be calculated for completed matches' },
        { status: 400 }
      )
    }

    // Validate scores exist
    if (match.homeScore === null || match.awayScore === null) {
      return NextResponse.json(
        { error: 'Match must have final scores to calculate points' },
        { status: 400 }
      )
    }

    // Get all predictions for this match
    const predictions = await prisma.prediction.findMany({
      where: { matchId },
    })

    if (predictions.length === 0) {
      return NextResponse.json(
        { message: 'No predictions found for this match', updated: 0 },
        { status: 200 }
      )
    }

    // Calculate points for each prediction
    const updates = predictions.map((prediction) => {
      const isCorrect = isPredictionCorrect(prediction.predictedWinner, match)
      const points = calculatePredictionPoints(prediction.predictedWinner, match)

      return prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          isCorrect,
          points,
        },
      })
    })

    // Execute all updates in a transaction
    const results = await prisma.$transaction(updates)

    // Calculate summary stats
    const correctCount = results.filter((p) => p.isCorrect).length
    const totalPoints = results.reduce((sum, p) => sum + p.points, 0)

    return NextResponse.json({
      message: 'Points calculated successfully',
      updated: results.length,
      stats: {
        totalPredictions: results.length,
        correctPredictions: correctCount,
        totalPointsAwarded: totalPoints,
      },
    })
  } catch (error) {
    console.error('Error calculating points:', error)
    return NextResponse.json({ error: 'Failed to calculate points' }, { status: 500 })
  }
})
