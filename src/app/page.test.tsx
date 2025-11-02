import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home Page', () => {
  it('renders the NRL Fan Hub heading', () => {
    render(<Home />)
    const heading = screen.getByText(/NRL Fan Hub/i)
    expect(heading).toBeInTheDocument()
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
})
