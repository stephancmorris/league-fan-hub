import { NextRequest, NextResponse } from 'next/server'
import { calculateLeaderboard, getUserRank } from '@/lib/leaderboard'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/leaderboard
 * Get leaderboard rankings
 * Query params:
 * - timeframe: 'week' | 'all-time' (default: 'all-time')
 * - limit: number (default: 100)
 * - offset: number (default: 0)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const timeframe = (searchParams.get('timeframe') || 'all-time') as 'week' | 'all-time'
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Validate parameters
    if (!['week', 'all-time'].includes(timeframe)) {
      return NextResponse.json(
        { error: 'Invalid timeframe. Must be "week" or "all-time"' },
        { status: 400 }
      )
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Limit must be between 1 and 100' }, { status: 400 })
    }

    // Calculate leaderboard
    const leaderboard = await calculateLeaderboard({
      timeframe,
      limit,
      offset,
    })

    // Get current user's rank if authenticated
    let currentUserRank = null
    const session = await getSession()
    if (session?.user) {
      const user = await prisma.user.findUnique({
        where: { auth0Id: session.user.sub },
      })

      if (user) {
        currentUserRank = await getUserRank(user.id, timeframe)
      }
    }

    return NextResponse.json({
      leaderboard,
      currentUserRank,
      timeframe,
      pagination: {
        limit,
        offset,
        hasMore: leaderboard.length === limit,
      },
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
