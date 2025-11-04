import { getSession } from '@auth0/nextjs-auth0'
import { redirect } from 'next/navigation'
import { NotificationSettings } from '@/components/notifications/NotificationSettings'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Settings - NRL Fan Hub',
  description: 'Manage your notification preferences and account settings',
}

/**
 * Settings page
 * Allows users to manage notifications and other preferences
 */
export default async function SettingsPage() {
  const session = await getSession()

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/api/auth/login?returnTo=/settings')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your notification preferences and account settings
              </p>
            </div>
            <Link href="/" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Account Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-4">
                <Image
                  src={session.user.picture || '/default-avatar.png'}
                  alt={session.user.name || 'User'}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">{session.user.name}</p>
                  <p className="text-sm text-gray-600">{session.user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
            <NotificationSettings />
          </div>

          {/* About Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Version</span>
                  <span className="font-medium text-gray-900">1.0.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Privacy Policy</span>
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    View
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span>Terms of Service</span>
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    View
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Link
                href="/api/auth/logout"
                className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
