'use client'

interface LoginButtonProps {
  className?: string
  children?: React.ReactNode
}

/**
 * Login button component
 * Redirects to Auth0 login page
 */
export function LoginButton({ className, children }: LoginButtonProps) {
  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a
      href="/api/auth/login"
      className={
        className ||
        'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors'
      }
    >
      {children || 'Sign In'}
    </a>
  )
}
