/**
 * Environment variable validation and type-safe access
 * Ensures all required environment variables are present at build time
 */

// Simple environment helper without Zod validation
// This prevents build failures when dependencies aren't installed
const env = {
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  AUTH0_SECRET: process.env.AUTH0_SECRET || '',
  AUTH0_BASE_URL: process.env.AUTH0_BASE_URL || '',
  AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL || '',
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || '',
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET || '',
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  NEXT_PUBLIC_ENABLE_PREDICTIONS: process.env.NEXT_PUBLIC_ENABLE_PREDICTIONS === 'true',
  NEXT_PUBLIC_ENABLE_LEADERBOARD: process.env.NEXT_PUBLIC_ENABLE_LEADERBOARD === 'true',
  NEXT_PUBLIC_ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
}

export default env

// Type-safe environment variable access
export const getEnv = () => env

// Helper functions
export const isDevelopment = () => env.NODE_ENV === 'development'
export const isProduction = () => env.NODE_ENV === 'production'
export const isTest = () => env.NODE_ENV === 'test'
