import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home Page', () => {
  it('renders the welcome heading', () => {
    render(<Home />)
    const heading = screen.getByText(/Welcome to NRL Fan Hub/i)
    expect(heading).toBeInTheDocument()
  })

  it('renders the site title in header', () => {
    render(<Home />)
    const allNRLFanHub = screen.getAllByText(/NRL Fan Hub/i)
    expect(allNRLFanHub.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the tagline', () => {
    render(<Home />)
    expect(
      screen.getByText(/Your ultimate destination for live NRL scores and predictions/i)
    ).toBeInTheDocument()
  })

  it('renders the three feature cards', () => {
    render(<Home />)
    expect(screen.getByText(/Live Matches/i)).toBeInTheDocument()
    expect(screen.getByText(/Make Predictions/i)).toBeInTheDocument()
    expect(screen.getByText(/Leaderboards/i)).toBeInTheDocument()
  })

  it('displays feature descriptions', () => {
    render(<Home />)
    expect(screen.getByText(/Follow real-time scores and updates/i)).toBeInTheDocument()
    expect(screen.getByText(/Compete with other fans/i)).toBeInTheDocument()
    expect(screen.getByText(/Climb the ranks/i)).toBeInTheDocument()
  })

  it('shows coming soon labels for predictions and leaderboards', () => {
    render(<Home />)
    const comingSoonLabels = screen.getAllByText(/Coming soon/i)
    expect(comingSoonLabels).toHaveLength(2)
  })

  it('has a link to the matches page', () => {
    render(<Home />)
    const matchesLink = screen.getByRole('link', { name: /Live Matches/i })
    expect(matchesLink).toHaveAttribute('href', '/matches')
  })
})
