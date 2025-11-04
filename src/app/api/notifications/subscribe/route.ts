import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'

/**
 * POST /api/notifications/subscribe
 *
 * Saves a push notification subscription for the authenticated user.
 * In production, this would save to a database and use it to send push notifications.
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get subscription from request body
    const subscription = await request.json()

    // Validate subscription
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    // TODO: Save subscription to database
    // For now, we'll just log it in development and return success
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[Notifications] Subscription saved for user:', session.user.sub)
      // eslint-disable-next-line no-console
      console.log('[Notifications] Subscription:', JSON.stringify(subscription, null, 2))
    }

    // In production, you would:
    // 1. Save subscription to database with user ID
    // 2. Store endpoint, keys, and expiration
    // 3. Use this data to send push notifications when matches start
    //
    // Example:
    // await prisma.pushSubscription.upsert({
    //   where: {
    //     userId_endpoint: {
    //       userId: session.user.sub,
    //       endpoint: subscription.endpoint,
    //     },
    //   },
    //   create: {
    //     userId: session.user.sub,
    //     endpoint: subscription.endpoint,
    //     p256dh: subscription.keys.p256dh,
    //     auth: subscription.keys.auth,
    //     expirationTime: subscription.expirationTime,
    //   },
    //   update: {
    //     p256dh: subscription.keys.p256dh,
    //     auth: subscription.keys.auth,
    //     expirationTime: subscription.expirationTime,
    //   },
    // })

    return NextResponse.json({
      success: true,
      message: 'Subscription saved successfully',
    })
  } catch (error) {
    console.error('[Notifications] Error saving subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
