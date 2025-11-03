import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

/**
 * User service for syncing Auth0 users with database
 */

export interface UserData {
  auth0Id: string
  email: string
  name?: string
  picture?: string
}

/**
 * Sync user from Auth0 to database
 * Creates user if doesn't exist, updates if exists
 */
export async function syncUser(userData: UserData) {
  try {
    const user = await prisma.user.upsert({
      where: { auth0Id: userData.auth0Id },
      update: {
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        lastLoginAt: new Date(),
      },
      create: {
        auth0Id: userData.auth0Id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        role: UserRole.USER,
        lastLoginAt: new Date(),
      },
    })

    return user
  } catch (error) {
    console.error('Error syncing user:', error)
    throw error
  }
}

/**
 * Get user by Auth0 ID
 */
export async function getUserByAuth0Id(auth0Id: string) {
  try {
    return await prisma.user.findUnique({
      where: { auth0Id },
    })
  } catch (error) {
    console.error('Error getting user:', error)
    throw error
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email },
    })
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw error
  }
}

/**
 * Update user role
 */
export async function updateUserRole(auth0Id: string, role: UserRole) {
  try {
    return await prisma.user.update({
      where: { auth0Id },
      data: { role },
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

/**
 * Get user stats
 */
export async function getUserStats(userId: string) {
  try {
    const [user, predictionCount, correctPredictions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
      }),
      prisma.prediction.count({
        where: { userId },
      }),
      prisma.prediction.count({
        where: {
          userId,
          isCorrect: true,
        },
      }),
    ])

    if (!user) {
      throw new Error('User not found')
    }

    const accuracy = predictionCount > 0 ? (correctPredictions / predictionCount) * 100 : 0

    return {
      user,
      stats: {
        totalPredictions: predictionCount,
        correctPredictions,
        accuracy: Math.round(accuracy * 10) / 10,
      },
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    throw error
  }
}
