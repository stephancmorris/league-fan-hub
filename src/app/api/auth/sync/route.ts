import { getSession } from '@auth0/nextjs-auth0'
import { NextResponse } from 'next/server'
import { syncUser } from '@/lib/user-service'

/**
 * User sync endpoint
 * Called after successful login to sync Auth0 user with database
 */
export async function POST() {
  try {
    const session = await getSession()
    const user = session?.user

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Sync user to database
    const dbUser = await syncUser({
      auth0Id: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
    })

    return NextResponse.json({ user: dbUser })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 })
  }
}
