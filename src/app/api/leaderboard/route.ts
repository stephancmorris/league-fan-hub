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
  // Parse query parameters outside try block so they're accessible in catch
  const { searchParams } = new URL(req.url)
  const timeframe = (searchParams.get('timeframe') || 'all-time') as 'week' | 'all-time'
  const limit = parseInt(searchParams.get('limit') || '100', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  try {
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

    // Calculate leaderboard (returns empty array if no data)
    const leaderboard = await calculateLeaderboard({
      timeframe,
      limit,
      offset,
    })

    // Get current user's rank if authenticated (optional)
    let currentUserRank = null
    try {
      const session = await getSession()
      if (session?.user) {
        const user = await prisma.user.findUnique({
          where: { auth0Id: session.user.sub },
        })

        if (user) {
          currentUserRank = await getUserRank(user.id, timeframe)
        }
      }
    } catch {
      // Authentication is optional - continue without user rank
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
    // Return more detailed error information in development
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leaderboard'
    console.error('Leaderboard error details:', errorMessage)

    // Return empty leaderboard instead of 500 to prevent app crashes
    return NextResponse.json({
      leaderboard: [],
      currentUserRank: null,
      timeframe,
      pagination: {
        limit,
        offset,
        hasMore: false,
      },
      error: 'Unable to load leaderboard. Please try again later.',
    })
  }
}
