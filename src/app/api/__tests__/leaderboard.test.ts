/**
 * API Integration Tests for /api/leaderboard
 */

import { NextRequest } from 'next/server'
import { GET } from '../leaderboard/route'
import { calculateLeaderboard, getUserRank } from '@/lib/leaderboard'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/leaderboard', () => ({
  calculateLeaderboard: jest.fn(),
  getUserRank: jest.fn(),
}))

jest.mock('@auth0/nextjs-auth0', () => ({
  getSession: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

describe('/api/leaderboard', () => {
  const mockLeaderboard = [
    {
      userId: 'user1',
      userName: 'Alice',
      userPicture: null,
      totalPoints: 150,
      totalPredictions: 20,
      correctPredictions: 15,
      accuracy: 75,
      rank: 1,
      streak: 5,
    },
    {
      userId: 'user2',
      userName: 'Bob',
      userPicture: null,
      totalPoints: 120,
      totalPredictions: 18,
      correctPredictions: 12,
      accuracy: 67,
      rank: 2,
      streak: 3,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/leaderboard', () => {
    it('returns leaderboard with default parameters', async () => {
      ;(calculateLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard)
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/leaderboard')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.leaderboard).toEqual(mockLeaderboard)
      expect(data.timeframe).toBe('all-time')
      expect(data.pagination.limit).toBe(100)
      expect(data.pagination.offset).toBe(0)
    })

    it('accepts week timeframe', async () => {
      ;(calculateLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard)
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/leaderboard?timeframe=week')
      const response = await GET(request)
      const data = await response.json()

      expect(calculateLeaderboard).toHaveBeenCalledWith({
        timeframe: 'week',
        limit: 100,
        offset: 0,
      })
      expect(data.timeframe).toBe('week')
    })

    it('accepts all-time timeframe', async () => {
      ;(calculateLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard)
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/leaderboard?timeframe=all-time')
      await GET(request)

      expect(calculateLeaderboard).toHaveBeenCalledWith({
        timeframe: 'all-time',
        limit: 100,
        offset: 0,
      })
    })

    it('returns 400 for invalid timeframe', async () => {
      const request = new NextRequest('http://localhost:3000/api/leaderboard?timeframe=invalid')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid timeframe')
    })

    it('respects custom limit parameter', async () => {
      ;(calculateLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard)
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=50')
      await GET(request)

      expect(calculateLeaderboard).toHaveBeenCalledWith({
        timeframe: 'all-time',
        limit: 50,
        offset: 0,
      })
    })

    it('respects custom offset parameter', async () => {
      ;(calculateLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard)
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/leaderboard?offset=10')
      await GET(request)

      expect(calculateLeaderboard).toHaveBeenCalledWith({
        timeframe: 'all-time',
        limit: 100,
        offset: 10,
      })
    })

    it('returns 400 when limit is less than 1', async () => {
      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=0')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Limit must be between 1 and 100')
    })

    it('returns 400 when limit is greater than 100', async () => {
      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=101')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Limit must be between 1 and 100')
    })

    it('includes current user rank for authenticated users', async () => {
      ;(calculateLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard)
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-5',
        auth0Id: 'auth0|123456',
      })
      ;(getUserRank as jest.Mock).mockResolvedValue({
        rank: 5,
        totalUsers: 100,
      })

      const request = new NextRequest('http://localhost:3000/api/leaderboard')
      const response = await GET(request)
      const data = await response.json()

      expect(data.currentUserRank).toEqual({
        rank: 5,
        totalUsers: 100,
      })
      expect(getUserRank).toHaveBeenCalledWith('user-5', 'all-time')
    })

    it('returns null currentUserRank for unauthenticated users', async () => {
      ;(calculateLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard)
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/leaderboard')
      const response = await GET(request)
      const data = await response.json()

      expect(data.currentUserRank).toBeNull()
      expect(getUserRank).not.toHaveBeenCalled()
    })

    it('returns null currentUserRank when user not found in database', async () => {
      ;(calculateLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard)
      ;(getSession as jest.Mock).mockResolvedValue({
        user: { sub: 'auth0|123456' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/leaderboard')
      const response = await GET(request)
      const data = await response.json()

      expect(data.currentUserRank).toBeNull()
    })

    it('sets hasMore to true when leaderboard length equals limit', async () => {
      const fullLeaderboard = Array(100).fill(mockLeaderboard[0])
      ;(calculateLeaderboard as jest.Mock).mockResolvedValue(fullLeaderboard)
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=100')
      const response = await GET(request)
      const data = await response.json()

      expect(data.pagination.hasMore).toBe(true)
    })

    it('sets hasMore to false when leaderboard length is less than limit', async () => {
      ;(calculateLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard)
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=100')
      const response = await GET(request)
      const data = await response.json()

      expect(data.pagination.hasMore).toBe(false)
    })

    it('handles empty leaderboard', async () => {
      ;(calculateLeaderboard as jest.Mock).mockResolvedValue([])
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/leaderboard')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.leaderboard).toEqual([])
      expect(data.pagination.hasMore).toBe(false)
    })

    it('handles errors gracefully', async () => {
      ;(calculateLeaderboard as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/leaderboard')
      const response = await GET(request)
      const data = await response.json()

      // Should return 200 with empty leaderboard instead of 500 to prevent app crashes
      expect(response.status).toBe(200)
      expect(data.leaderboard).toEqual([])
      expect(data.currentUserRank).toBeNull()
      expect(data.error).toBe('Unable to load leaderboard. Please try again later.')
      expect(data.pagination.hasMore).toBe(false)
    })

    it('combines all query parameters correctly', async () => {
      ;(calculateLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard)
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest(
        'http://localhost:3000/api/leaderboard?timeframe=week&limit=50&offset=25'
      )
      await GET(request)

      expect(calculateLeaderboard).toHaveBeenCalledWith({
        timeframe: 'week',
        limit: 50,
        offset: 25,
      })
    })

    it('parses numeric parameters correctly', async () => {
      ;(calculateLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard)
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=10&offset=20')
      const response = await GET(request)
      const data = await response.json()

      expect(data.pagination.limit).toBe(10)
      expect(data.pagination.offset).toBe(20)
    })
  })
})
