import { test as base, Page } from '@playwright/test'
import { mockMatches, mockLeaderboard, mockPredictions, mockUserStats } from './mock-data'

/**
 * Custom Playwright fixtures with API mocking
 * This automatically intercepts API calls and returns mock data
 */

/**
 * Setup API mocking for a page
 */
async function setupApiMocks(page: Page) {
  // Mock /api/matches endpoint
  await page.route('**/api/matches**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockMatches),
    })
  })

  // Mock /api/leaderboard endpoint
  await page.route('**/api/leaderboard**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockLeaderboard),
    })
  })

  // Mock /api/predictions endpoint
  await page.route('**/api/predictions**', async (route) => {
    // Handle POST requests (submit prediction)
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          prediction: {
            id: 'new-pred',
            userId: 'user-1',
            matchId: 'match-3',
            predictedWinner: 'Canterbury Bulldogs',
            points: 0,
            isCorrect: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      })
    } else {
      // Handle GET requests
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPredictions),
      })
    }
  })

  // Mock /api/users/[userId]/stats endpoint
  await page.route('**/api/users/**/stats**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUserStats),
    })
  })

  // Mock /api/auth/sync endpoint (Auth0 sync)
  await page.route('**/api/auth/sync**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    })
  })

  // Mock /api/protected/profile endpoint
  await page.route('**/api/protected/profile**', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unauthorized' }),
    })
  })

  // Mock notifications endpoints
  await page.route('**/api/notifications/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    })
  })
}

/**
 * Extended test with automatic API mocking
 * Overrides the default page fixture to include API mocks
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Setup API mocks before each test
    await setupApiMocks(page)

    // Provide the page to the test
    await use(page)
  },
})

export { expect } from '@playwright/test'
