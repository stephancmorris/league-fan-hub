import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PredictionWidget } from './PredictionWidget'
import { MatchStatus } from '@prisma/client'
import { Match } from '@/types/match'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: true,
    user: { sub: 'user123', name: 'Test User' },
  })),
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useAuth } = require('@/hooks/useAuth')

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

describe('PredictionWidget', () => {
  const upcomingMatch: Match = {
    id: 'match-1',
    homeTeam: 'Broncos',
    awayTeam: 'Cowboys',
    homeScore: 0,
    awayScore: 0,
    status: MatchStatus.UPCOMING,
    kickoffTime: new Date(Date.now() + 86400000), // Tomorrow
    venue: 'Suncorp Stadium',
    round: 1,
    homeTeamLogo: null,
    awayTeamLogo: null,
    season: 2025,
    competition: 'NRL',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Unauthenticated User', () => {
    it('shows login prompt when user is not authenticated', () => {
      useAuth.mockReturnValue({ isAuthenticated: false })

      render(<PredictionWidget match={upcomingMatch} />)

      expect(screen.getByText(/Log in/)).toBeInTheDocument()
      expect(screen.getByText(/to make predictions/)).toBeInTheDocument()
    })

    it('login link points to correct auth endpoint', () => {
      useAuth.mockReturnValue({ isAuthenticated: false })

      render(<PredictionWidget match={upcomingMatch} />)

      const loginLink = screen.getByText('Log in')
      expect(loginLink).toHaveAttribute('href', '/api/auth/login')
    })
  })

  describe('Authenticated User - Upcoming Match', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ isAuthenticated: true })
    })

    it('renders prediction form for upcoming match', () => {
      render(<PredictionWidget match={upcomingMatch} />)

      expect(screen.getByText('Predict the winner:')).toBeInTheDocument()
      expect(screen.getByText('Broncos')).toBeInTheDocument()
      expect(screen.getByText('Cowboys')).toBeInTheDocument()
      expect(screen.getByText('Submit Prediction')).toBeInTheDocument()
    })

    it('allows selecting home team', () => {
      render(<PredictionWidget match={upcomingMatch} />)

      const brocosButton = screen.getByRole('button', { name: 'Broncos' })
      fireEvent.click(brocosButton)

      expect(brocosButton).toHaveClass('bg-primary-500')
    })

    it('allows selecting away team', () => {
      render(<PredictionWidget match={upcomingMatch} />)

      const cowboysButton = screen.getByRole('button', { name: 'Cowboys' })
      fireEvent.click(cowboysButton)

      expect(cowboysButton).toHaveClass('bg-primary-500')
    })

    it('allows switching team selection', () => {
      render(<PredictionWidget match={upcomingMatch} />)

      const broncosButton = screen.getByRole('button', { name: 'Broncos' })
      const cowboysButton = screen.getByRole('button', { name: 'Cowboys' })

      fireEvent.click(broncosButton)
      expect(broncosButton).toHaveClass('bg-primary-500')

      fireEvent.click(cowboysButton)
      expect(cowboysButton).toHaveClass('bg-primary-500')
      expect(broncosButton).toHaveClass('bg-gray-100')
    })

    it('submit button is disabled when no team selected', () => {
      render(<PredictionWidget match={upcomingMatch} />)

      const submitButton = screen.getByText('Submit Prediction')
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveClass('cursor-not-allowed')
    })

    it('submit button is enabled when team is selected', () => {
      render(<PredictionWidget match={upcomingMatch} />)

      const broncosButton = screen.getByRole('button', { name: 'Broncos' })
      fireEvent.click(broncosButton)

      const submitButton = screen.getByText('Submit Prediction')
      expect(submitButton).not.toBeDisabled()
    })

    it('calls onPredictionSubmit with correct parameters', async () => {
      const onPredictionSubmit = jest.fn().mockResolvedValue(undefined)

      render(<PredictionWidget match={upcomingMatch} onPredictionSubmit={onPredictionSubmit} />)

      const broncosButton = screen.getByRole('button', { name: 'Broncos' })
      fireEvent.click(broncosButton)

      const submitButton = screen.getByText('Submit Prediction')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onPredictionSubmit).toHaveBeenCalledWith('match-1', 'Broncos')
      })
    })

    it('shows loading state during submission', async () => {
      const onPredictionSubmit = jest.fn(
        () => new Promise<void>((resolve) => setTimeout(resolve, 100))
      )

      render(<PredictionWidget match={upcomingMatch} onPredictionSubmit={onPredictionSubmit} />)

      const broncosButton = screen.getByRole('button', { name: 'Broncos' })
      fireEvent.click(broncosButton)

      const submitButton = screen.getByText('Submit Prediction')
      fireEvent.click(submitButton)

      expect(await screen.findByText('Submitting...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('Submit Prediction')).toBeInTheDocument()
      })
    })

    it('disables team selection during submission', async () => {
      const onPredictionSubmit = jest.fn(
        () => new Promise<void>((resolve) => setTimeout(resolve, 100))
      )

      render(<PredictionWidget match={upcomingMatch} onPredictionSubmit={onPredictionSubmit} />)

      const broncosButton = screen.getByRole('button', { name: 'Broncos' })
      fireEvent.click(broncosButton)

      const submitButton = screen.getByText('Submit Prediction')
      fireEvent.click(submitButton)

      const cowboysButton = screen.getByRole('button', { name: 'Cowboys' })
      expect(cowboysButton).toBeDisabled()

      await waitFor(() => {
        expect(screen.getByText('Submit Prediction')).toBeInTheDocument()
      })
    })

    it('displays error message on submission failure', async () => {
      const onPredictionSubmit = jest.fn().mockRejectedValue(new Error('Network error'))

      render(<PredictionWidget match={upcomingMatch} onPredictionSubmit={onPredictionSubmit} />)

      const broncosButton = screen.getByRole('button', { name: 'Broncos' })
      fireEvent.click(broncosButton)

      const submitButton = screen.getByText('Submit Prediction')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('displays kickoff time information', () => {
      render(<PredictionWidget match={upcomingMatch} />)

      expect(screen.getByText(/Predictions lock at kickoff:/)).toBeInTheDocument()
    })

    it('pre-selects team when userPrediction is provided', () => {
      const userPrediction = {
        predictedWinner: 'Broncos',
        points: 10,
        isCorrect: null,
      }

      render(<PredictionWidget match={upcomingMatch} userPrediction={userPrediction} />)

      // Should show locked state instead of form
      expect(screen.getByText('Your prediction:')).toBeInTheDocument()
      expect(screen.getByText('Broncos')).toBeInTheDocument()
    })
  })

  describe('Locked Predictions', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ isAuthenticated: true })
    })

    it('shows locked state for live matches', () => {
      const liveMatch: Match = {
        ...upcomingMatch,
        status: MatchStatus.LIVE,
      }

      render(<PredictionWidget match={liveMatch} />)

      expect(screen.getByText(/Predictions locked - match has started/)).toBeInTheDocument()
      expect(screen.queryByText('Submit Prediction')).not.toBeInTheDocument()
    })

    it('shows user prediction when locked', () => {
      const userPrediction = {
        predictedWinner: 'Cowboys',
        points: 10,
        isCorrect: null,
      }

      const liveMatch: Match = {
        ...upcomingMatch,
        status: MatchStatus.LIVE,
      }

      render(<PredictionWidget match={liveMatch} userPrediction={userPrediction} />)

      expect(screen.getByText('Your prediction:')).toBeInTheDocument()
      expect(screen.getByText('Cowboys')).toBeInTheDocument()
      expect(screen.getByText(/Prediction locked - match in progress/)).toBeInTheDocument()
    })

    it('locks predictions after kickoff time', () => {
      const pastMatch: Match = {
        ...upcomingMatch,
        kickoffTime: new Date(Date.now() - 1000), // 1 second ago
      }

      render(<PredictionWidget match={pastMatch} />)

      expect(screen.getByText(/Predictions locked - match has started/)).toBeInTheDocument()
    })
  })

  describe('Completed Match', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ isAuthenticated: true })
    })

    it('shows correct prediction result with points', () => {
      const userPrediction = {
        predictedWinner: 'Broncos',
        points: 10,
        isCorrect: true,
      }

      const completedMatch: Match = {
        ...upcomingMatch,
        status: MatchStatus.COMPLETED,
        homeScore: 24,
        awayScore: 18,
      }

      render(<PredictionWidget match={completedMatch} userPrediction={userPrediction} />)

      expect(screen.getByText('Your prediction:')).toBeInTheDocument()
      expect(screen.getByText('Broncos')).toBeInTheDocument()
      expect(screen.getByText(/✓ Correct \(\+10 pts\)/)).toBeInTheDocument()
    })

    it('shows incorrect prediction result', () => {
      const userPrediction = {
        predictedWinner: 'Cowboys',
        points: 0,
        isCorrect: false,
      }

      const completedMatch: Match = {
        ...upcomingMatch,
        status: MatchStatus.COMPLETED,
        homeScore: 24,
        awayScore: 18,
      }

      render(<PredictionWidget match={completedMatch} userPrediction={userPrediction} />)

      expect(screen.getByText('Your prediction:')).toBeInTheDocument()
      expect(screen.getByText('Cowboys')).toBeInTheDocument()
      expect(screen.getByText('✗ Incorrect')).toBeInTheDocument()
    })

    it('shows pending result when isCorrect is null', () => {
      const userPrediction = {
        predictedWinner: 'Broncos',
        points: 0,
        isCorrect: null,
      }

      const completedMatch: Match = {
        ...upcomingMatch,
        status: MatchStatus.COMPLETED,
        homeScore: 24,
        awayScore: 18,
      }

      render(<PredictionWidget match={completedMatch} userPrediction={userPrediction} />)

      expect(screen.getByText('Your prediction:')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ isAuthenticated: true })
    })

    it('handles missing onPredictionSubmit gracefully', () => {
      render(<PredictionWidget match={upcomingMatch} />)

      const broncosButton = screen.getByRole('button', { name: 'Broncos' })
      fireEvent.click(broncosButton)

      const submitButton = screen.getByText('Submit Prediction')
      fireEvent.click(submitButton)

      // Should not crash
      expect(screen.getByText('Submit Prediction')).toBeInTheDocument()
    })

    it('handles non-Error exceptions', async () => {
      const onPredictionSubmit = jest.fn().mockRejectedValue('String error')

      render(<PredictionWidget match={upcomingMatch} onPredictionSubmit={onPredictionSubmit} />)

      const broncosButton = screen.getByRole('button', { name: 'Broncos' })
      fireEvent.click(broncosButton)

      const submitButton = screen.getByText('Submit Prediction')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to submit prediction')).toBeInTheDocument()
      })
    })
  })
})
