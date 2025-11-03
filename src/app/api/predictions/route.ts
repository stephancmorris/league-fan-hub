import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { Prisma, MatchStatus } from '@prisma/client'

/**
 * GET /api/predictions
 * Get all predictions for the authenticated user
 * Optional query params:
 * - matchId: filter by specific match
 * - status: filter by match status (upcoming, live, completed)
 */
export async function GET(req: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const matchId = searchParams.get('matchId')
    const status = searchParams.get('status')

    // Build where clause with proper Prisma types
    const where: Prisma.PredictionWhereInput = {
      userId: user.id,
    }

    if (matchId) {
      where.matchId = matchId
    }

    if (status) {
      const matchStatus = status.toUpperCase() as MatchStatus
      where.match = {
        status: matchStatus,
      }
    }

    // Fetch predictions
    const predictions = await prisma.prediction.findMany({
      where,
      include: {
        match: {
          select: {
            id: true,
            round: true,
            homeTeam: true,
            awayTeam: true,
            homeTeamLogo: true,
            awayTeamLogo: true,
            homeScore: true,
            awayScore: true,
            status: true,
            kickoffTime: true,
            venue: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ predictions })
  } catch (error) {
    console.error('Error fetching predictions:', error)
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 })
  }
}
