/**
 * Accessibility Tests using jest-axe
 * Ensures the application meets WCAG accessibility standards
 */

import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import Home from '@/app/page'
import { MatchCard } from '@/components/match/MatchCard'
import { PredictionWidget } from '@/components/prediction/PredictionWidget'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { MatchStatus } from '@prisma/client'
import { Match } from '@/types/match'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock dependencies
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: false,
  })),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: {
      leaderboard: [],
      currentUserRank: null,
      timeframe: 'all-time',
      pagination: { limit: 100, offset: 0, hasMore: false },
    },
    error: undefined,
    isLoading: false,
  })),
}))

describe('Accessibility Tests', () => {
  describe('Pages', () => {
    it('Home page should have no accessibility violations', async () => {
      const { container } = render(<Home />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Components', () => {
    const mockMatch: Match = {
      id: '1',
      homeTeam: 'Broncos',
      awayTeam: 'Cowboys',
      homeScore: 0,
      awayScore: 0,
      status: MatchStatus.UPCOMING,
      kickoffTime: new Date('2025-12-01T19:00:00Z'),
      venue: 'Suncorp Stadium',
      round: 1,
      homeTeamLogo: null,
      awayTeamLogo: null,
      season: 2025,
      competition: 'NRL',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('MatchCard should have no accessibility violations', async () => {
      const { container } = render(<MatchCard match={mockMatch} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('MatchCard with logos should have proper alt text', async () => {
      const matchWithLogos: Match = {
        ...mockMatch,
        homeTeamLogo: '/logos/broncos.png',
        awayTeamLogo: '/logos/cowboys.png',
      }

      const { container } = render(<MatchCard match={matchWithLogos} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('PredictionWidget should have no accessibility violations', async () => {
      const { container } = render(<PredictionWidget match={mockMatch} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('PredictionWidget buttons should be keyboard accessible', async () => {
      const { container, getByText } = render(<PredictionWidget match={mockMatch} />)

      // Check that buttons exist and are focusable
      const loginLink = getByText(/Log in/)
      expect(loginLink).toBeInTheDocument()

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('LeaderboardTable should have no accessibility violations', async () => {
      const { container } = render(<LeaderboardTable />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('LeaderboardTable with data should maintain accessibility', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const useSWR = require('swr').default
      useSWR.mockReturnValue({
        data: {
          leaderboard: [
            {
              userId: 'user1',
              userName: 'Test User',
              userPicture: null,
              totalPoints: 100,
              totalPredictions: 10,
              correctPredictions: 7,
              accuracy: 70,
              rank: 1,
              streak: 3,
            },
          ],
          currentUserRank: null,
          timeframe: 'all-time',
          pagination: { limit: 100, offset: 0, hasMore: false },
        },
        error: undefined,
        isLoading: false,
      })

      const { container } = render(<LeaderboardTable />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Form Elements', () => {
    it('prediction form buttons should have proper labels', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useAuth } = require('@/hooks/useAuth')
      useAuth.mockReturnValue({ isAuthenticated: true })

      const mockMatch: Match = {
        id: '1',
        homeTeam: 'Broncos',
        awayTeam: 'Cowboys',
        homeScore: 0,
        awayScore: 0,
        status: MatchStatus.UPCOMING,
        kickoffTime: new Date(Date.now() + 86400000),
        venue: 'Suncorp Stadium',
        round: 1,
        homeTeamLogo: null,
        awayTeamLogo: null,
        season: 2025,
        competition: 'NRL',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const { container } = render(<PredictionWidget match={mockMatch} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Color Contrast', () => {
    it('status badges should have sufficient color contrast', async () => {
      const liveMatch: Match = {
        id: '1',
        homeTeam: 'Broncos',
        awayTeam: 'Cowboys',
        homeScore: 12,
        awayScore: 8,
        status: MatchStatus.LIVE,
        kickoffTime: new Date(),
        venue: 'Suncorp Stadium',
        round: 1,
        homeTeamLogo: null,
        awayTeamLogo: null,
        currentMinute: 35,
        season: 2025,
        competition: 'NRL',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const { container } = render(<MatchCard match={liveMatch} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('completed match should maintain color contrast', async () => {
      const completedMatch: Match = {
        id: '1',
        homeTeam: 'Broncos',
        awayTeam: 'Cowboys',
        homeScore: 24,
        awayScore: 18,
        status: MatchStatus.COMPLETED,
        kickoffTime: new Date(),
        venue: 'Suncorp Stadium',
        round: 1,
        homeTeamLogo: null,
        awayTeamLogo: null,
        season: 2025,
        competition: 'NRL',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const { container } = render(<MatchCard match={completedMatch} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Semantic HTML', () => {
    it('should use proper heading hierarchy', async () => {
      const { container } = render(<Home />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('leaderboard should use table semantics correctly', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const useSWR = require('swr').default
      useSWR.mockReturnValue({
        data: {
          leaderboard: [
            {
              userId: 'user1',
              userName: 'Test User',
              userPicture: null,
              totalPoints: 100,
              totalPredictions: 10,
              correctPredictions: 7,
              accuracy: 70,
              rank: 1,
              streak: 3,
            },
          ],
          currentUserRank: null,
          timeframe: 'all-time',
          pagination: { limit: 100, offset: 0, hasMore: false },
        },
        error: undefined,
        isLoading: false,
      })

      const { container } = render(<LeaderboardTable />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Keyboard Navigation', () => {
    it('interactive elements should be keyboard accessible', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useAuth } = require('@/hooks/useAuth')
      useAuth.mockReturnValue({ isAuthenticated: true })

      const mockMatch: Match = {
        id: '1',
        homeTeam: 'Broncos',
        awayTeam: 'Cowboys',
        homeScore: 0,
        awayScore: 0,
        status: MatchStatus.UPCOMING,
        kickoffTime: new Date(Date.now() + 86400000),
        venue: 'Suncorp Stadium',
        round: 1,
        homeTeamLogo: null,
        awayTeamLogo: null,
        season: 2025,
        competition: 'NRL',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const { container, getAllByRole } = render(<PredictionWidget match={mockMatch} />)

      // All buttons should be present
      const buttons = getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)

      // Should have no violations
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('timeframe toggle buttons should be accessible', async () => {
      const { container, getByText } = render(<LeaderboardTable />)

      const allTimeButton = getByText('All Time')
      const weekButton = getByText('This Week')

      expect(allTimeButton).toBeInTheDocument()
      expect(weekButton).toBeInTheDocument()

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Screen Reader Support', () => {
    it('images should have alt text', async () => {
      const matchWithLogos: Match = {
        id: '1',
        homeTeam: 'Broncos',
        awayTeam: 'Cowboys',
        homeScore: 0,
        awayScore: 0,
        status: MatchStatus.UPCOMING,
        kickoffTime: new Date('2025-12-01T19:00:00Z'),
        venue: 'Suncorp Stadium',
        round: 1,
        homeTeamLogo: '/logos/broncos.png',
        awayTeamLogo: '/logos/cowboys.png',
        season: 2025,
        competition: 'NRL',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const { container, getByAltText } = render(<MatchCard match={matchWithLogos} />)

      expect(getByAltText('Broncos')).toBeInTheDocument()
      expect(getByAltText('Cowboys')).toBeInTheDocument()

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('loading states should be announced', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const useSWR = require('swr').default
      useSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
      })

      const { container } = render(<LeaderboardTable />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('ARIA Attributes', () => {
    it('disabled buttons should have proper aria attributes', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useAuth } = require('@/hooks/useAuth')
      useAuth.mockReturnValue({ isAuthenticated: true })

      const mockMatch: Match = {
        id: '1',
        homeTeam: 'Broncos',
        awayTeam: 'Cowboys',
        homeScore: 0,
        awayScore: 0,
        status: MatchStatus.UPCOMING,
        kickoffTime: new Date(Date.now() + 86400000),
        venue: 'Suncorp Stadium',
        round: 1,
        homeTeamLogo: null,
        awayTeamLogo: null,
        season: 2025,
        competition: 'NRL',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const { container } = render(<PredictionWidget match={mockMatch} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
