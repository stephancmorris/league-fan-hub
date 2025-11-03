// Mock for @auth0/nextjs-auth0 to avoid ESM issues with jose package

module.exports = {
  handleAuth: jest.fn(() => Promise.resolve()),
  handleLogin: jest.fn(() => Promise.resolve()),
  handleLogout: jest.fn(() => Promise.resolve()),
  handleCallback: jest.fn(() => Promise.resolve()),
  handleProfile: jest.fn(() => Promise.resolve()),
  withApiAuthRequired: jest.fn((handler) => handler),
  withPageAuthRequired: jest.fn((component) => component),
  getSession: jest.fn(() => Promise.resolve(null)),
  getAccessToken: jest.fn(() => Promise.resolve({ accessToken: 'mock-token' })),
  useUser: jest.fn(() => ({
    user: null,
    error: null,
    isLoading: false,
  })),
  UserProvider: ({ children }) => children,
  UserProfile: jest.fn(),
  UserContext: {
    Consumer: jest.fn(),
    Provider: jest.fn(),
  },
}
