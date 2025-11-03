'use client'

interface LogoutButtonProps {
  className?: string
  children?: React.ReactNode
}

/**
 * Logout button component
 * Redirects to Auth0 logout endpoint
 */
export function LogoutButton({ className, children }: LogoutButtonProps) {
  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a
      href="/api/auth/logout"
      className={
        className ||
        'inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors'
      }
    >
      {children || 'Sign Out'}
    </a>
  )
}
