# E2E Test Fixtures

This directory contains mock data and test fixtures for Playwright E2E tests.

## Purpose

These fixtures allow E2E tests to run **without requiring a database connection**. All API requests are intercepted by Playwright and return mock data instead of hitting the real API/database.

## Files

- **`mock-data.ts`** - Mock response data for all API endpoints
- **`test-fixtures.ts`** - Playwright fixtures that set up automatic API mocking

## How It Works

1. Tests import `test` and `expect` from `./fixtures/test-fixtures` instead of `@playwright/test`
2. The custom fixture automatically overrides the default `page` fixture to include API mocking
3. When the page makes API requests, Playwright intercepts them and returns mock data
4. No database connection is required

## Mock Data Available

- **Matches** (`/api/matches`) - 4 mock matches with different statuses (COMPLETED, LIVE, UPCOMING)
- **Leaderboard** (`/api/leaderboard`) - 5 mock users with rankings
- **Predictions** (`/api/predictions`) - Mock predictions data
- **User Stats** (`/api/users/[userId]/stats`) - Mock user statistics
- **Auth endpoints** - Mocked to return appropriate responses

## Usage Example

```typescript
import { test, expect } from './fixtures/test-fixtures'

test('should display matches', async ({ page }) => {
  await page.goto('/matches')

  // This API call is intercepted and returns mock data
  // No database required!
  await expect(page.getByText('Brisbane Broncos')).toBeVisible()
})
```

## Updating Mock Data

To update mock data:

1. Edit `mock-data.ts`
2. Keep data realistic and representative of production
3. Include different scenarios (upcoming, live, completed matches, etc.)

## When to Use Real Database Tests

For integration testing that requires real database interactions:

1. Create a separate test file (e.g., `with-database.spec.ts`)
2. Use the standard Playwright `test` import
3. Set up a test database and seed it before tests
4. Run these tests separately from the mocked tests
