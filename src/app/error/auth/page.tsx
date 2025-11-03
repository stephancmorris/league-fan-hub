'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

/**
 * Authentication error page content (wrapped in Suspense)
 */
function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')
  const errorDescription = searchParams?.get('error_description')

  const getErrorDetails = (errorCode: string | null) => {
    switch (errorCode) {
      case 'access_denied':
        return {
          title: 'Access Denied',
          message: 'You do not have permission to access this resource. This may be because:',
          reasons: [
            'Your account does not have the required role',
            'The resource you are trying to access is restricted',
            'You cancelled the login process',
          ],
        }
      case 'unauthorized':
        return {
          title: 'Authentication Required',
          message: 'You need to be logged in to access this page.',
          reasons: [
            'Your session has expired',
            'You have been logged out',
            'You need to log in first',
          ],
        }
      case 'forbidden':
        return {
          title: 'Forbidden',
          message: 'Access to this resource is forbidden.',
          reasons: ['You do not have the necessary permissions', 'Your account may be restricted'],
        }
      case 'invalid_token':
        return {
          title: 'Invalid Session',
          message: 'Your session is no longer valid.',
          reasons: [
            'Your session has expired',
            'Your authentication token is invalid',
            'You may have been logged out from another device',
          ],
        }
      default:
        return {
          title: 'Authentication Error',
          message: 'An error occurred during authentication.',
          reasons: [
            errorDescription || 'Please try logging in again',
            'If the problem persists, contact support',
          ],
        }
    }
  }

  const details = getErrorDetails(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg
              className="h-10 w-10 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {details.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">{details.message}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Possible reasons:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            {details.reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>

          {error && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-xs font-mono text-gray-500">Error code: {error}</p>
              {errorDescription && (
                <p className="text-xs font-mono text-gray-500 mt-1">{errorDescription}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-3">
          <Link
            href="/api/auth/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Try Logging In Again
          </Link>
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Authentication error page (with Suspense boundary)
 */
export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}
