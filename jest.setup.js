// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.AUTH0_SECRET = 'test-secret'
process.env.AUTH0_BASE_URL = 'http://localhost:3000'
process.env.AUTH0_ISSUER_BASE_URL = 'https://test.auth0.com'
process.env.AUTH0_CLIENT_ID = 'test-client-id'
process.env.AUTH0_CLIENT_SECRET = 'test-client-secret'

// Mock Auth0 Next.js SDK
jest.mock('@auth0/nextjs-auth0', () => ({
  handleAuth: jest.fn(),
  handleLogin: jest.fn(),
  handleLogout: jest.fn(),
  handleCallback: jest.fn(),
  handleProfile: jest.fn(),
  withApiAuthRequired: jest.fn((handler) => handler),
  withPageAuthRequired: jest.fn((component) => component),
  getSession: jest.fn(),
  getAccessToken: jest.fn(),
  useUser: jest.fn(() => ({ user: null, error: null, isLoading: false })),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))
