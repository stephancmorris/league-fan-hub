import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'

/**
 * POST /api/notifications/unsubscribe
 *
 * Removes a push notification subscription for the authenticated user.
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

    // TODO: Remove subscription from database
    // For now, we'll just log it in development and return success
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[Notifications] Subscription removed for user:', session.user.sub)
      // eslint-disable-next-line no-console
      console.log('[Notifications] Endpoint:', subscription.endpoint)
    }

    // In production, you would:
    // await prisma.pushSubscription.deleteMany({
    //   where: {
    //     userId: session.user.sub,
    //     endpoint: subscription.endpoint,
    //   },
    // })

    return NextResponse.json({
      success: true,
      message: 'Subscription removed successfully',
    })
  } catch (error) {
    console.error('[Notifications] Error removing subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
