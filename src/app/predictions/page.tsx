'use client'

import { PredictionHistory } from '@/components/prediction/PredictionHistory'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

/**
 * Predictions page - View prediction history and stats
 */
export default function PredictionsPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view predictions</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your prediction history and stats.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/api/auth/login"
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/"
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 rounded-lg border border-gray-300 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Predictions</h1>
              <p className="mt-2 text-sm text-gray-600">
                Track your predictions and see how you&apos;re performing
              </p>
            </div>
            <Link
              href="/matches"
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Make Predictions
            </Link>
          </div>
        </div>
      </div>

      {/* Prediction History */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PredictionHistory />
      </div>
    </div>
  )
}
