import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MatchStatus } from '@prisma/client'

/**
 * GET /api/matches - Get all matches
 * Query params:
 *   - round: Filter by round number
 *   - status: Filter by status (UPCOMING, LIVE, COMPLETED)
 *   - limit: Number of matches to return (default: 20)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const round = searchParams.get('round')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: {
      round?: number
      status?: MatchStatus
    } = {}

    if (round) {
      where.round = parseInt(round)
    }

    if (status && Object.values(MatchStatus).includes(status as MatchStatus)) {
      where.status = status as MatchStatus
    }

    const matches = await prisma.match.findMany({
      where,
      orderBy: [{ kickoffTime: 'asc' }, { round: 'asc' }],
      take: limit,
      include: {
        _count: {
          select: {
            predictions: true,
          },
        },
      },
    })

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}
