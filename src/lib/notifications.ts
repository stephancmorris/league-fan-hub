/**
 * Push Notification Service
 *
 * Handles push notification subscriptions and notifications for match starts.
 * Uses the Web Push API and service workers.
 */

/**
 * Request permission for push notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[Notifications] Push notifications are not supported')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission === 'denied') {
    return 'denied'
  }

  // Request permission
  const permission = await Notification.requestPermission()
  return permission
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.warn('[Notifications] Service workers are not supported')
      return null
    }

    // Check if push notifications are supported
    if (!('PushManager' in window)) {
      console.warn('[Notifications] Push notifications are not supported')
      return null
    }

    // Request permission first
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[Notifications] Permission not granted:', permission)
      }
      return null
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[Notifications] Already subscribed')
      }
      return subscription
    }

    // Subscribe to push notifications
    // NOTE: You'll need to generate VAPID keys for production
    // For now, this will work in development without a server
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

    if (!vapidPublicKey) {
      console.warn('[Notifications] VAPID public key not configured')
      // Still create subscription for local testing
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // Development fallback key (replace in production)
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrIA-GXXkPl_TnM5_WPz0WQj9HQpGIrBHBh6B_3k6y2s5Ztfj8w'
        ),
      })
    } else {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })
    }

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[Notifications] Subscribed successfully')
    }

    // Send subscription to backend
    await saveSubscription(subscription)

    return subscription
  } catch (error) {
    console.error('[Notifications] Error subscribing to push notifications:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) {
      return false
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[Notifications] No active subscription')
      }
      return true
    }

    // Unsubscribe
    const successful = await subscription.unsubscribe()

    if (successful) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[Notifications] Unsubscribed successfully')
      }
      // Remove subscription from backend
      await removeSubscription(subscription)
    }

    return successful
  } catch (error) {
    console.error('[Notifications] Error unsubscribing from push notifications:', error)
    return false
  }
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isSubscribedToPushNotifications(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    return subscription !== null
  } catch {
    return false
  }
}

/**
 * Show a local notification (doesn't require push)
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  try {
    if (!('Notification' in window)) {
      console.warn('[Notifications] Notifications are not supported')
      return
    }

    const permission = await requestNotificationPermission()
    if (permission !== 'granted') {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[Notifications] Permission not granted')
      }
      return
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        badge: '/icon-192.png',
        icon: '/icon-192.png',
        ...options,
      })
    } else {
      // Fallback to regular notification
      new Notification(title, {
        badge: '/icon-192.png',
        icon: '/icon-192.png',
        ...options,
      })
    }
  } catch (error) {
    console.error('[Notifications] Error showing notification:', error)
  }
}

/**
 * Save subscription to backend
 */
async function saveSubscription(subscription: PushSubscription): Promise<void> {
  try {
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    })
  } catch (error) {
    console.error('[Notifications] Error saving subscription:', error)
  }
}

/**
 * Remove subscription from backend
 */
async function removeSubscription(subscription: PushSubscription): Promise<void> {
  try {
    await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    })
  } catch (error) {
    console.error('[Notifications] Error removing subscription:', error)
  }
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray as Uint8Array<ArrayBuffer>
}
