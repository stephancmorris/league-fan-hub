/**
 * Environment variable validation and type-safe access
 * Ensures all required environment variables are present at build time
 */

import { z } from 'zod'

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // App Configuration
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Auth0
  AUTH0_SECRET: z.string().min(32),
  AUTH0_BASE_URL: z.string().url(),
  AUTH0_ISSUER_BASE_URL: z.string().url(),
  AUTH0_CLIENT_ID: z.string().min(1),
  AUTH0_CLIENT_SECRET: z.string().min(1),
  AUTH0_AUDIENCE: z.string().optional(),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // WebSocket
  NEXT_PUBLIC_WS_URL: z.string().url(),

  // API
  NEXT_PUBLIC_API_URL: z.string().url(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_PREDICTIONS: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_LEADERBOARD: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_NOTIFICATIONS: z.string().transform(val => val === 'true').default('true'),

  // Monitoring
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
})

// Validate environment variables at build time
const env = envSchema.parse(process.env)

export default env

// Type-safe environment variable access
export const getEnv = () => env

// Helper functions
export const isDevelopment = () => env.NODE_ENV === 'development'
export const isProduction = () => env.NODE_ENV === 'production'
export const isTest = () => env.NODE_ENV === 'test'
