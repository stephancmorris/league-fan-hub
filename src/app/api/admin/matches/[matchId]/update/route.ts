import { withRole } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Auth0User } from '@/lib/auth'
import { MatchStatus, MatchHalf } from '@prisma/client'

/**
 * Admin-only API route
 * PATCH /api/admin/matches/[matchId]/update - Update match scores and status
 */
export const PATCH = withRole('admin', async (req: NextRequest, _user: Auth0User) => {
  try {
    const pathname = req.nextUrl.pathname
    const matchId = pathname.split('/').slice(-2)[0]

    const body = await req.json()
    const { homeScore, awayScore, status, currentMinute, half } = body

    // Build update data
    const updateData: {
      homeScore?: number
      awayScore?: number
      status?: MatchStatus
      currentMinute?: number
      half?: MatchHalf
      lastScoreTime?: Date
    } = {}

    if (typeof homeScore === 'number') updateData.homeScore = homeScore
    if (typeof awayScore === 'number') updateData.awayScore = awayScore
    if (status && Object.values(MatchStatus).includes(status)) {
      updateData.status = status
    }
    if (typeof currentMinute === 'number') updateData.currentMinute = currentMinute
    if (half && Object.values(MatchHalf).includes(half)) {
      updateData.half = half
    }

    // If scores changed, update lastScoreTime
    if (homeScore !== undefined || awayScore !== undefined) {
      updateData.lastScoreTime = new Date()
    }

    // Update match in database
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: updateData,
    })

    // Broadcast update via WebSocket if available
    if (global.io) {
      if (homeScore !== undefined || awayScore !== undefined) {
        global.io.broadcastScoreUpdate(matchId, updatedMatch.homeScore, updatedMatch.awayScore)
      }
      if (status) {
        global.io.broadcastStatusUpdate(matchId, status, { currentMinute, half })
      }
    }

    return NextResponse.json({ match: updatedMatch })
  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 })
  }
})
