import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { MatchStatus } from '@prisma/client'

/**
 * POST /api/predictions/submit
 * Submit a prediction for a match
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const session = await getSession()
    const auth0User = session?.user

    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { auth0Id: auth0User.sub },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse request body
    const body = await req.json()
    const { matchId, predictedWinner } = body

    if (!matchId || !predictedWinner) {
      return NextResponse.json(
        { error: 'Missing required fields: matchId, predictedWinner' },
        { status: 400 }
      )
    }

    // Get match details
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Validate prediction is for upcoming match only
    if (match.status !== MatchStatus.UPCOMING) {
      return NextResponse.json(
        { error: 'Predictions can only be made for upcoming matches' },
        { status: 400 }
      )
    }

    // Validate match hasn't kicked off yet
    const now = new Date()
    const kickoffTime = new Date(match.kickoffTime)
    if (now >= kickoffTime) {
      return NextResponse.json(
        { error: 'Predictions are locked - match has already started' },
        { status: 400 }
      )
    }

    // Validate predicted winner is one of the teams
    if (predictedWinner !== match.homeTeam && predictedWinner !== match.awayTeam) {
      return NextResponse.json(
        { error: 'Predicted winner must be one of the match teams' },
        { status: 400 }
      )
    }

    // Check if user already has a prediction for this match
    const existingPrediction = await prisma.prediction.findUnique({
      where: {
        userId_matchId: {
          userId: user.id,
          matchId: matchId,
        },
      },
    })

    if (existingPrediction) {
      return NextResponse.json(
        { error: 'You have already made a prediction for this match' },
        { status: 400 }
      )
    }

    // Create prediction
    const prediction = await prisma.prediction.create({
      data: {
        userId: user.id,
        matchId: matchId,
        predictedWinner: predictedWinner,
        points: 0, // Points will be calculated after match completion
        isCorrect: null, // Will be determined after match completion
      },
      include: {
        match: {
          select: {
            homeTeam: true,
            awayTeam: true,
            kickoffTime: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Prediction submitted successfully',
        prediction: {
          id: prediction.id,
          predictedWinner: prediction.predictedWinner,
          match: prediction.match,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting prediction:', error)
    return NextResponse.json({ error: 'Failed to submit prediction' }, { status: 500 })
  }
}
