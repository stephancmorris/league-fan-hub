import { render } from '@testing-library/react'
import { WebVitals } from './WebVitals'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/test-path',
}))

describe('WebVitals', () => {
  it('renders without crashing', () => {
    const { container } = render(<WebVitals />)
    // WebVitals returns null, so container should only have the div wrapper
    expect(container.firstChild).toBeNull()
  })

  it('does not render any visible content', () => {
    const { container } = render(<WebVitals />)
    expect(container.textContent).toBe('')
  })
})
