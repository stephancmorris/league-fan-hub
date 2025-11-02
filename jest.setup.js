// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.AUTH0_SECRET = 'test-secret'
process.env.AUTH0_BASE_URL = 'http://localhost:3000'
process.env.AUTH0_ISSUER_BASE_URL = 'https://test.auth0.com'
process.env.AUTH0_CLIENT_ID = 'test-client-id'
process.env.AUTH0_CLIENT_SECRET = 'test-client-secret'
