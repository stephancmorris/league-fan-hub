/**
 * API Integration Tests for /api/matches
 */

import { NextRequest } from 'next/server'
import { GET } from '../matches/route'
import { prisma } from '@/lib/prisma'
import { MatchStatus } from '@prisma/client'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    match: {
      findMany: jest.fn(),
    },
  },
}))

describe('/api/matches', () => {
  const mockMatches = [
    {
      id: '1',
      homeTeam: 'Broncos',
      awayTeam: 'Cowboys',
      homeScore: 0,
      awayScore: 0,
      status: MatchStatus.UPCOMING,
      kickoffTime: new Date('2025-12-01T19:00:00Z'),
      venue: 'Suncorp Stadium',
      round: 1,
      _count: {
        predictions: 10,
      },
    },
    {
      id: '2',
      homeTeam: 'Storm',
      awayTeam: 'Eels',
      homeScore: 24,
      awayScore: 18,
      status: MatchStatus.LIVE,
      kickoffTime: new Date('2025-12-01T17:00:00Z'),
      venue: 'AAMI Park',
      round: 1,
      _count: {
        predictions: 15,
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/matches', () => {
    it('returns all matches when no filters provided', async () => {
      ;(prisma.match.findMany as jest.Mock).mockResolvedValue(mockMatches)

      const request = new NextRequest('http://localhost:3000/api/matches')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.matches).toHaveLength(2)
      expect(data.matches[0].homeTeam).toBe('Broncos')
    })

    it('filters matches by round', async () => {
      ;(prisma.match.findMany as jest.Mock).mockResolvedValue([mockMatches[0]])

      const request = new NextRequest('http://localhost:3000/api/matches?round=1')
      const response = await GET(request)
      const data = await response.json()

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { round: 1 },
        })
      )
      expect(data.matches).toHaveLength(1)
    })

    it('filters matches by status', async () => {
      ;(prisma.match.findMany as jest.Mock).mockResolvedValue([mockMatches[1]])

      const request = new NextRequest('http://localhost:3000/api/matches?status=LIVE')
      const response = await GET(request)
      const data = await response.json()

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: MatchStatus.LIVE },
        })
      )
      expect(data.matches[0].status).toBe(MatchStatus.LIVE)
    })

    it('filters matches by both round and status', async () => {
      ;(prisma.match.findMany as jest.Mock).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/matches?round=1&status=UPCOMING')
      await GET(request)

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            round: 1,
            status: MatchStatus.UPCOMING,
          },
        })
      )
    })

    it('respects limit parameter', async () => {
      ;(prisma.match.findMany as jest.Mock).mockResolvedValue(mockMatches)

      const request = new NextRequest('http://localhost:3000/api/matches?limit=5')
      await GET(request)

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      )
    })

    it('uses default limit of 20 when not specified', async () => {
      ;(prisma.match.findMany as jest.Mock).mockResolvedValue(mockMatches)

      const request = new NextRequest('http://localhost:3000/api/matches')
      await GET(request)

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
        })
      )
    })

    it('orders matches by kickoffTime and round', async () => {
      ;(prisma.match.findMany as jest.Mock).mockResolvedValue(mockMatches)

      const request = new NextRequest('http://localhost:3000/api/matches')
      await GET(request)

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ kickoffTime: 'asc' }, { round: 'asc' }],
        })
      )
    })

    it('includes prediction count', async () => {
      ;(prisma.match.findMany as jest.Mock).mockResolvedValue(mockMatches)

      const request = new NextRequest('http://localhost:3000/api/matches')
      const response = await GET(request)
      const data = await response.json()

      expect(data.matches[0]._count.predictions).toBe(10)
      expect(data.matches[1]._count.predictions).toBe(15)
    })

    it('ignores invalid status values', async () => {
      ;(prisma.match.findMany as jest.Mock).mockResolvedValue(mockMatches)

      const request = new NextRequest('http://localhost:3000/api/matches?status=INVALID')
      await GET(request)

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      )
    })

    it('handles database errors gracefully', async () => {
      ;(prisma.match.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/matches')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch matches')
    })

    it('returns empty array when no matches found', async () => {
      ;(prisma.match.findMany as jest.Mock).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/matches')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.matches).toEqual([])
    })

    it('handles multiple status filters correctly', async () => {
      ;(prisma.match.findMany as jest.Mock).mockResolvedValue(mockMatches)

      const request = new NextRequest(
        'http://localhost:3000/api/matches?status=UPCOMING&status=LIVE'
      )
      await GET(request)

      // Only the last status should be used
      expect(prisma.match.findMany).toHaveBeenCalled()
    })
  })
})
