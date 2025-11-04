/**
 * API Integration Tests for /api/predictions/submit
 */

import { NextRequest } from 'next/server'
import { POST } from '../predictions/submit/route'
import { prisma } from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'
import { MatchStatus } from '@prisma/client'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    match: {
      findUnique: jest.fn(),
    },
    prediction: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('@auth0/nextjs-auth0', () => ({
  getSession: jest.fn(),
}))

describe('/api/predictions/submit', () => {
  const mockUser = {
    id: 'user-1',
    auth0Id: 'auth0|123456',
    email: 'test@example.com',
    name: 'Test User',
  }

  const mockMatch = {
    id: 'match-1',
    homeTeam: 'Broncos',
    awayTeam: 'Cowboys',
    status: MatchStatus.UPCOMING,
    kickoffTime: new Date(Date.now() + 86400000), // Tomorrow
    round: 1,
    venue: 'Suncorp Stadium',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/predictions/submit', () => {
    it('successfully creates a prediction for authenticated user', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.match.findUnique as jest.Mock).mockResolvedValue(mockMatch)
      ;(prisma.prediction.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.prediction.create as jest.Mock).mockResolvedValue({
        id: 'pred-1',
        userId: 'user-1',
        matchId: 'match-1',
        predictedWinner: 'Broncos',
        points: 0,
        isCorrect: null,
        match: {
          homeTeam: 'Broncos',
          awayTeam: 'Cowboys',
          kickoffTime: mockMatch.kickoffTime,
        },
      })

      const request = new NextRequest('http://localhost:3000/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-1',
          predictedWinner: 'Broncos',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('Prediction submitted successfully')
      expect(data.prediction.predictedWinner).toBe('Broncos')
    })

    it('returns 401 when user is not authenticated', async () => {
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-1',
          predictedWinner: 'Broncos',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 404 when user not found in database', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-1',
          predictedWinner: 'Broncos',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('returns 400 when matchId is missing', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({
          predictedWinner: 'Broncos',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })

    it('returns 400 when predictedWinner is missing', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-1',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })

    it('returns 404 when match not found', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.match.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-1',
          predictedWinner: 'Broncos',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Match not found')
    })

    it('returns 400 when match is not UPCOMING', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.match.findUnique as jest.Mock).mockResolvedValue({
        ...mockMatch,
        status: MatchStatus.LIVE,
      })

      const request = new NextRequest('http://localhost:3000/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-1',
          predictedWinner: 'Broncos',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Predictions can only be made for upcoming matches')
    })

    it('returns 400 when match has already kicked off', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.match.findUnique as jest.Mock).mockResolvedValue({
        ...mockMatch,
        kickoffTime: new Date(Date.now() - 1000), // 1 second ago
      })

      const request = new NextRequest('http://localhost:3000/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-1',
          predictedWinner: 'Broncos',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Predictions are locked - match has already started')
    })

    it('returns 400 when predicted winner is not one of the teams', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.match.findUnique as jest.Mock).mockResolvedValue(mockMatch)

      const request = new NextRequest('http://localhost:3000/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-1',
          predictedWinner: 'Storm', // Invalid team
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Predicted winner must be one of the match teams')
    })

    it('returns 400 when user already has a prediction for the match', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.match.findUnique as jest.Mock).mockResolvedValue(mockMatch)
      ;(prisma.prediction.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-pred',
        userId: 'user-1',
        matchId: 'match-1',
        predictedWinner: 'Cowboys',
      })

      const request = new NextRequest('http://localhost:3000/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-1',
          predictedWinner: 'Broncos',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('You have already made a prediction for this match')
    })

    it('accepts prediction for home team', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.match.findUnique as jest.Mock).mockResolvedValue(mockMatch)
      ;(prisma.prediction.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.prediction.create as jest.Mock).mockResolvedValue({
        id: 'pred-1',
        userId: 'user-1',
        matchId: 'match-1',
        predictedWinner: 'Broncos',
        points: 0,
        isCorrect: null,
        match: mockMatch,
      })

      const request = new NextRequest('http://localhost:3000/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-1',
          predictedWinner: 'Broncos',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
    })

    it('accepts prediction for away team', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.match.findUnique as jest.Mock).mockResolvedValue(mockMatch)
      ;(prisma.prediction.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.prediction.create as jest.Mock).mockResolvedValue({
        id: 'pred-1',
        userId: 'user-1',
        matchId: 'match-1',
        predictedWinner: 'Cowboys',
        points: 0,
        isCorrect: null,
        match: mockMatch,
      })

      const request = new NextRequest('http://localhost:3000/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-1',
          predictedWinner: 'Cowboys',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
    })

    it('handles database errors gracefully', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-1',
          predictedWinner: 'Broncos',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to submit prediction')
    })

    it('creates prediction with correct initial values', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.match.findUnique as jest.Mock).mockResolvedValue(mockMatch)
      ;(prisma.prediction.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.prediction.create as jest.Mock).mockResolvedValue({
        id: 'pred-1',
        userId: 'user-1',
        matchId: 'match-1',
        predictedWinner: 'Broncos',
        points: 0,
        isCorrect: null,
        match: mockMatch,
      })

      const request = new NextRequest('http://localhost:3000/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-1',
          predictedWinner: 'Broncos',
        }),
      })

      await POST(request)

      expect(prisma.prediction.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          matchId: 'match-1',
          predictedWinner: 'Broncos',
          points: 0,
          isCorrect: null,
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
    })
  })
})
