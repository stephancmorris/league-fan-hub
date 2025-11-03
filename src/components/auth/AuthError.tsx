'use client'

import { useSearchParams } from 'next/navigation'

interface AuthErrorProps {
  className?: string
}

/**
 * AuthError component
 * Displays authentication error messages based on URL parameters
 */
export function AuthError({ className }: AuthErrorProps) {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')
  const errorDescription = searchParams?.get('error_description')

  if (!error) return null

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'access_denied':
        return 'Access was denied. You may not have permission to access this resource.'
      case 'unauthorized':
        return 'You need to be logged in to access this page.'
      case 'forbidden':
        return 'You do not have permission to access this resource.'
      case 'invalid_token':
        return 'Your session has expired. Please log in again.'
      case 'server_error':
        return 'A server error occurred. Please try again later.'
      case 'temporarily_unavailable':
        return 'The authentication service is temporarily unavailable. Please try again later.'
      default:
        return errorDescription || 'An authentication error occurred. Please try again.'
    }
  }

  return (
    <div
      className={
        className || 'bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4'
      }
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">Authentication Error</h3>
          <div className="mt-2 text-sm">{getErrorMessage(error)}</div>
          {errorDescription && error === 'unknown' && (
            <div className="mt-1 text-xs text-red-600">{errorDescription}</div>
          )}
        </div>
      </div>
    </div>
  )
}
