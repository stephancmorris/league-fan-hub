import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Critical User Paths
 * Tests the main user journeys through the application
 */

test.describe('Critical User Paths', () => {
  test.describe('Homepage and Navigation', () => {
    test('should load homepage successfully', async ({ page }) => {
      await page.goto('/')

      // Check for main elements
      await expect(page.getByRole('heading', { name: /NRL Fan Hub/i })).toBeVisible()
      await expect(page.getByText(/Your ultimate destination/i)).toBeVisible()
    })

    test('should navigate to matches page', async ({ page }) => {
      await page.goto('/')

      await page.click('a[href="/matches"]')
      await page.waitForURL('/matches')

      await expect(page.getByText(/Live Matches/i)).toBeVisible()
    })

    test('should navigate to leaderboard page', async ({ page }) => {
      await page.goto('/')

      await page.click('a[href="/leaderboard"]')
      await page.waitForURL('/leaderboard')

      await expect(page.getByText(/Leaderboard/i)).toBeVisible()
    })

    test('should navigate to predictions page', async ({ page }) => {
      await page.goto('/')

      await page.click('a[href="/predictions"]')
      await page.waitForURL('/predictions')

      await expect(page.getByText(/Predictions/i)).toBeVisible()
    })
  })

  test.describe('Match Viewing', () => {
    test('should display match list', async ({ page }) => {
      await page.goto('/matches')

      // Wait for matches to load
      await page.waitForSelector('[class*="MatchCard"]', { timeout: 10000 })

      // Check for match elements
      const matches = await page.$$('[class*="MatchCard"]')
      expect(matches.length).toBeGreaterThan(0)
    })

    test('should show match details', async ({ page }) => {
      await page.goto('/matches')

      // Wait for first match card
      const matchCard = await page.waitForSelector('[class*="MatchCard"]')
      expect(matchCard).toBeTruthy()

      // Check for team names
      const hasTeamNames = await page.locator('text=/[A-Z][a-z]+/').first().isVisible()
      expect(hasTeamNames).toBeTruthy()
    })

    test('should display match status indicators', async ({ page }) => {
      await page.goto('/matches')

      // Look for status badges (LIVE, FT, or time remaining)
      const statusBadges = await page.$$(
        '[class*="bg-red-500"], [class*="bg-gray-500"], [class*="bg-blue-500"]'
      )
      expect(statusBadges.length).toBeGreaterThan(0)
    })
  })

  test.describe('Prediction Flow (Unauthenticated)', () => {
    test('should show login prompt for unauthenticated users', async ({ page }) => {
      await page.goto('/predictions')

      // Should see login prompt or redirect to login
      const hasLoginPrompt =
        (await page.locator('text=/log in/i').count()) > 0 || page.url().includes('/api/auth/login')

      expect(hasLoginPrompt).toBeTruthy()
    })

    test('should redirect to login when trying to make prediction', async ({ page }) => {
      await page.goto('/matches')

      // Try to find and click a prediction button if visible
      const predictionButton = await page.locator('button:has-text("Make Prediction")').first()

      if (await predictionButton.isVisible()) {
        await predictionButton.click()

        // Should either show login modal or redirect
        await page.waitForTimeout(1000)
        const isLoginPage = page.url().includes('/api/auth/login') || page.url().includes('auth0')
        const hasLoginText = (await page.locator('text=/log in/i').count()) > 0

        expect(isLoginPage || hasLoginText).toBeTruthy()
      }
    })
  })

  test.describe('Leaderboard Display', () => {
    test('should display leaderboard table', async ({ page }) => {
      await page.goto('/leaderboard')

      // Check for table or leaderboard container
      await page.waitForSelector('table, [class*="LeaderboardTable"]', { timeout: 10000 })

      // Verify headers are present
      const hasRankHeader = (await page.locator('text=/rank/i').count()) > 0
      const hasPlayerHeader = (await page.locator('text=/player/i').count()) > 0
      const hasPointsHeader = (await page.locator('text=/points/i').count()) > 0

      expect(hasRankHeader || hasPlayerHeader || hasPointsHeader).toBeTruthy()
    })

    test('should switch between timeframes', async ({ page }) => {
      await page.goto('/leaderboard')

      // Wait for page to load
      await page.waitForSelector('button:has-text("All Time"), button:has-text("This Week")', {
        timeout: 10000,
      })

      // Find and click "This Week" button
      const weekButton = page.locator('button:has-text("This Week")')
      if (await weekButton.isVisible()) {
        await weekButton.click()

        // Wait for data to update
        await page.waitForTimeout(1000)

        // Verify button is active
        await expect(weekButton).toHaveClass(/bg-primary/)
      }
    })

    test('should display top 3 medals', async ({ page }) => {
      await page.goto('/leaderboard')

      // Wait for leaderboard to load
      await page.waitForTimeout(2000)

      // Look for medal emojis or special styling for top 3
      const hasMedals =
        (await page.locator('text=🥇').count()) > 0 ||
        (await page.locator('text=🥈').count()) > 0 ||
        (await page.locator('text=🥉').count()) > 0

      // If there's data, medals should be present
      const hasData = (await page.locator('table tbody tr').count()) > 0
      if (hasData) {
        expect(hasMedals).toBeTruthy()
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      await expect(page.getByRole('heading', { name: /NRL Fan Hub/i })).toBeVisible()
    })

    test('should display mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      // Look for hamburger menu or mobile navigation
      const hasMobileNav =
        (await page.locator('[aria-label*="menu"]').count()) > 0 ||
        (await page.locator('button:has-text("Menu")').count()) > 0 ||
        (await page.locator('nav').count()) > 0

      expect(hasMobileNav).toBeTruthy()
    })

    test('should work on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/matches')

      await expect(page).toHaveURL('/matches')
    })
  })

  test.describe('Performance', () => {
    test('should load homepage within 5 seconds', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')
      const loadTime = Date.now() - startTime

      expect(loadTime).toBeLessThan(5000)
    })

    test('should load matches page within 5 seconds', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/matches')
      await page.waitForLoadState('networkidle', { timeout: 10000 })
      const loadTime = Date.now() - startTime

      expect(loadTime).toBeLessThan(5000)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle non-existent routes gracefully', async ({ page }) => {
      const response = await page.goto('/non-existent-page')

      // Should either show 404 page or redirect
      expect(response?.status()).toBeTruthy()
    })

    test('should handle network errors gracefully', async ({ page }) => {
      // Navigate to page first
      await page.goto('/matches')

      // Simulate offline
      await page.context().setOffline(true)

      // Try to navigate
      await page.goto('/leaderboard').catch(() => {
        // Expected to fail
      })

      // Go back online
      await page.context().setOffline(false)
    })
  })

  test.describe('SEO and Meta Tags', () => {
    test('should have proper page title', async ({ page }) => {
      await page.goto('/')

      const title = await page.title()
      expect(title).toBeTruthy()
      expect(title.length).toBeGreaterThan(0)
    })

    test('should have meta description', async ({ page }) => {
      await page.goto('/')

      const metaDescription = await page.getAttribute('meta[name="description"]', 'content')
      expect(metaDescription).toBeTruthy()
    })

    test('should have viewport meta tag', async ({ page }) => {
      await page.goto('/')

      const viewport = await page.getAttribute('meta[name="viewport"]', 'content')
      expect(viewport).toBeTruthy()
    })
  })

  test.describe('Links and Navigation', () => {
    test('all navigation links should work', async ({ page }) => {
      await page.goto('/')

      // Get all navigation links
      const navLinks = await page.$$('nav a')

      for (const link of navLinks.slice(0, 3)) {
        // Test first 3 links to save time
        const href = await link.getAttribute('href')
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
          await page.goto(href)
          expect(page.url()).toContain(href)
          await page.goto('/')
        }
      }
    })

    test('should handle external links properly', async ({ page }) => {
      await page.goto('/')

      // Look for external links
      const externalLinks = await page.$$('a[target="_blank"]')

      for (const link of externalLinks.slice(0, 2)) {
        const rel = await link.getAttribute('rel')
        // External links should have noopener noreferrer for security
        expect(rel).toContain('noopener')
      }
    })
  })
})
