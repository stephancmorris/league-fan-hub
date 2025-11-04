'use client'

import { useEffect, useState } from 'react'
import {
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPushNotifications,
} from '@/lib/notifications'

/**
 * NotificationSettings Component
 *
 * Allows users to enable/disable push notifications for match starts.
 * Shows current notification status and handles subscription management.
 */
export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator
    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    const subscribed = await isSubscribedToPushNotifications()
    setIsSubscribed(subscribed)
  }

  const handleEnableNotifications = async () => {
    setIsLoading(true)
    try {
      // Request permission
      const newPermission = await requestNotificationPermission()
      setPermission(newPermission)

      if (newPermission === 'granted') {
        // Subscribe to push notifications
        const subscription = await subscribeToPushNotifications()
        setIsSubscribed(subscription !== null)

        if (subscription && process.env.NODE_ENV === 'development') {
          // Show success message in development
          // eslint-disable-next-line no-console
          console.log('[NotificationSettings] Notifications enabled successfully')
        }
      }
    } catch (error) {
      console.error('[NotificationSettings] Error enabling notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisableNotifications = async () => {
    setIsLoading(true)
    try {
      const success = await unsubscribeFromPushNotifications()
      if (success) {
        setIsSubscribed(false)
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('[NotificationSettings] Notifications disabled successfully')
        }
      }
    } catch (error) {
      console.error('[NotificationSettings] Error disabling notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render if notifications are not supported
  if (!isSupported) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Match Notifications</h3>
          <p className="text-sm text-gray-600 mb-4">
            Get notified when NRL matches are about to start so you never miss a prediction.
          </p>

          {/* Permission denied state */}
          {permission === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Notifications Blocked</p>
                  <p className="text-sm text-red-700 mt-1">
                    You&apos;ve blocked notifications for this site. To enable them, please update
                    your browser settings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subscription status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isSubscribed ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Notifications enabled</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-500">Notifications disabled</span>
                </>
              )}
            </div>

            {/* Toggle button */}
            {permission !== 'denied' && (
              <button
                onClick={isSubscribed ? handleDisableNotifications : handleEnableNotifications}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  isSubscribed
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Loading...' : isSubscribed ? 'Disable' : 'Enable'}
              </button>
            )}
          </div>

          {/* Benefits when not subscribed */}
          {!isSubscribed && permission !== 'denied' && (
            <ul className="mt-4 space-y-2">
              <li className="flex items-center text-xs text-gray-600">
                <svg
                  className="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Never miss a match start
              </li>
              <li className="flex items-center text-xs text-gray-600">
                <svg
                  className="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Make predictions on time
              </li>
              <li className="flex items-center text-xs text-gray-600">
                <svg
                  className="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Works even when app is closed
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
