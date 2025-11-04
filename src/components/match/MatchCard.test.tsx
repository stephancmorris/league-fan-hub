import { render, screen, fireEvent } from '@testing-library/react'
import { MatchCard } from './MatchCard'
import { MatchStatus } from '@prisma/client'
import { Match } from '@/types/match'

// Mock the PredictionWidget component
jest.mock('@/components/prediction/PredictionWidget', () => ({
  PredictionWidget: ({ match }: { match: Match }) => (
    <div data-testid="prediction-widget">
      Prediction Widget for {match.homeTeam} vs {match.awayTeam}
    </div>
  ),
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

describe('MatchCard', () => {
  const baseMatch: Match = {
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
  }

  describe('Upcoming Match', () => {
    it('renders upcoming match with VS separator', () => {
      render(<MatchCard match={baseMatch} />)

      expect(screen.getByText('Broncos')).toBeInTheDocument()
      expect(screen.getByText('Cowboys')).toBeInTheDocument()
      expect(screen.getByText('VS')).toBeInTheDocument()
      expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument() // No scores shown
    })

    it('displays round and venue information', () => {
      render(<MatchCard match={baseMatch} />)

      expect(screen.getByText(/Round 1/)).toBeInTheDocument()
      expect(screen.getByText(/Suncorp Stadium/)).toBeInTheDocument()
    })

    it('shows kickoff time', () => {
      render(<MatchCard match={baseMatch} />)

      // Kickoff time should be displayed in the VS section
      const kickoffElement = screen.getByText(/\d{2}:\d{2}/)
      expect(kickoffElement).toBeInTheDocument()
    })

    it('displays team abbreviations when no logo provided', () => {
      render(<MatchCard match={baseMatch} />)

      expect(screen.getByText('BRO')).toBeInTheDocument()
      expect(screen.getByText('COW')).toBeInTheDocument()
    })

    it('displays team logos when provided', () => {
      const matchWithLogos: Match = {
        ...baseMatch,
        homeTeamLogo: '/logos/broncos.png',
        awayTeamLogo: '/logos/cowboys.png',
      }

      render(<MatchCard match={matchWithLogos} />)

      const homeLogoImg = screen.getByAltText('Broncos')
      const awayLogoImg = screen.getByAltText('Cowboys')

      expect(homeLogoImg).toHaveAttribute('src', '/logos/broncos.png')
      expect(awayLogoImg).toHaveAttribute('src', '/logos/cowboys.png')
    })

    it('shows prediction button when showPredictionButton is true', () => {
      const onPredictClick = jest.fn()

      render(<MatchCard match={baseMatch} showPredictionButton onPredictClick={onPredictClick} />)

      const predictButton = screen.getByText('Make Prediction')
      expect(predictButton).toBeInTheDocument()

      fireEvent.click(predictButton)
      expect(onPredictClick).toHaveBeenCalledWith('1')
    })

    it('does not show prediction button for non-upcoming matches', () => {
      const liveMatch: Match = { ...baseMatch, status: MatchStatus.LIVE }
      const onPredictClick = jest.fn()

      render(<MatchCard match={liveMatch} showPredictionButton onPredictClick={onPredictClick} />)

      expect(screen.queryByText('Make Prediction')).not.toBeInTheDocument()
    })
  })

  describe('Live Match', () => {
    const liveMatch: Match = {
      ...baseMatch,
      status: MatchStatus.LIVE,
      homeScore: 12,
      awayScore: 8,
      currentMinute: 35,
    }

    it('displays LIVE badge with animation', () => {
      render(<MatchCard match={liveMatch} />)

      // When currentMinute is present, shows the minute (e.g., "35'")
      const liveStatus = screen.getByText("35'")
      expect(liveStatus).toBeInTheDocument()
      expect(liveStatus).toHaveClass('animate-pulse')
    })

    it('shows current scores', () => {
      render(<MatchCard match={liveMatch} />)

      // Scores are displayed as text content "12" and "8"
      const scores = screen.getAllByText(/^(12|8)$/)
      expect(scores).toHaveLength(2)
    })

    it('displays score separator instead of VS', () => {
      render(<MatchCard match={liveMatch} />)

      expect(screen.queryByText('VS')).not.toBeInTheDocument()
      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('displays current minute when provided', () => {
      render(<MatchCard match={liveMatch} />)

      expect(screen.getByText("35'")).toBeInTheDocument()
    })

    it('displays LIVE when no current minute', () => {
      const liveMatchNoMinute: Match = {
        ...liveMatch,
        currentMinute: undefined,
      }

      render(<MatchCard match={liveMatchNoMinute} />)

      expect(screen.getByText('LIVE')).toBeInTheDocument()
    })

    it('shows half indicator when provided', () => {
      const matchWithHalf: Match = {
        ...liveMatch,
        half: 'SECOND_HALF',
      }

      render(<MatchCard match={matchWithHalf} />)

      expect(screen.getByText('SECOND HALF')).toBeInTheDocument()
    })
  })

  describe('Completed Match', () => {
    const completedMatch: Match = {
      ...baseMatch,
      status: MatchStatus.COMPLETED,
      homeScore: 24,
      awayScore: 18,
    }

    it('displays FT (Full Time) badge', () => {
      render(<MatchCard match={completedMatch} />)

      expect(screen.getByText('FT')).toBeInTheDocument()
    })

    it('shows final scores', () => {
      render(<MatchCard match={completedMatch} />)

      const scores = screen.getAllByText(/^(24|18)$/)
      expect(scores).toHaveLength(2)
    })

    it('does not show prediction button', () => {
      const onPredictClick = jest.fn()

      render(
        <MatchCard match={completedMatch} showPredictionButton onPredictClick={onPredictClick} />
      )

      expect(screen.queryByText('Make Prediction')).not.toBeInTheDocument()
    })
  })

  describe('Prediction Widget Integration', () => {
    it('renders PredictionWidget when showPredictionWidget is true', () => {
      const userPrediction = {
        predictedWinner: 'Broncos',
        points: 10,
        isCorrect: true,
      }

      render(<MatchCard match={baseMatch} showPredictionWidget userPrediction={userPrediction} />)

      expect(screen.getByTestId('prediction-widget')).toBeInTheDocument()
      expect(screen.getByText(/Prediction Widget for Broncos vs Cowboys/)).toBeInTheDocument()
    })

    it('does not render PredictionWidget when showPredictionWidget is false', () => {
      render(<MatchCard match={baseMatch} showPredictionWidget={false} />)

      expect(screen.queryByTestId('prediction-widget')).not.toBeInTheDocument()
    })

    it('passes prediction submission handler to PredictionWidget', () => {
      const onPredictionSubmit = jest.fn()

      render(
        <MatchCard match={baseMatch} showPredictionWidget onPredictionSubmit={onPredictionSubmit} />
      )

      expect(screen.getByTestId('prediction-widget')).toBeInTheDocument()
    })
  })

  describe('Status Colors', () => {
    it('applies correct color classes for LIVE status', () => {
      const liveMatch: Match = { ...baseMatch, status: MatchStatus.LIVE }
      render(<MatchCard match={liveMatch} />)

      const liveElement = screen.getByText('LIVE')
      expect(liveElement).toHaveClass('bg-red-500', 'text-white', 'animate-pulse')
    })

    it('applies correct color classes for COMPLETED status', () => {
      const completedMatch: Match = { ...baseMatch, status: MatchStatus.COMPLETED }
      render(<MatchCard match={completedMatch} />)

      const ftElement = screen.getByText('FT')
      expect(ftElement).toHaveClass('bg-gray-500', 'text-white')
    })

    it('applies correct color classes for UPCOMING status', () => {
      render(<MatchCard match={baseMatch} />)

      const statusElement = screen.getByText(/in \d+ (hour|day|minute)s?/)
      expect(statusElement).toHaveClass('bg-blue-500', 'text-white')
    })
  })

  describe('Edge Cases', () => {
    it('handles null scores for live matches', () => {
      const liveMatchNullScores: Match = {
        ...baseMatch,
        status: MatchStatus.LIVE,
        homeScore: null,
        awayScore: null,
      }

      render(<MatchCard match={liveMatchNullScores} />)

      // Should display 0 for null scores
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThanOrEqual(2)
    })

    it('handles kickoffTime as string', () => {
      const matchWithStringKickoff: Match = {
        ...baseMatch,
        kickoffTime: '2025-12-01T19:00:00Z' as unknown as Date,
      }

      render(<MatchCard match={matchWithStringKickoff} />)

      // Should render without errors
      expect(screen.getByText('Broncos')).toBeInTheDocument()
    })

    it('renders without optional props', () => {
      render(<MatchCard match={baseMatch} />)

      expect(screen.getByText('Broncos')).toBeInTheDocument()
      expect(screen.getByText('Cowboys')).toBeInTheDocument()
    })
  })
})
