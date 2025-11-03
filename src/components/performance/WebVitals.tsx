'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * WebVitals component
 * Monitors and reports Core Web Vitals metrics
 */
export function WebVitals() {
  const pathname = usePathname()

  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    // Report Core Web Vitals
    const reportWebVitals = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const webVitals = await import('web-vitals' as any)
        const { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } = webVitals

        const sendToAnalytics = (metric: {
          name: string
          value: number
          id: string
          rating: 'good' | 'needs-improvement' | 'poor'
        }) => {
          // Log to console in development/staging
          if (process.env.NEXT_PUBLIC_LOG_VITALS === 'true') {
            // eslint-disable-next-line no-console
            console.log('[Web Vitals]', {
              name: metric.name,
              value: Math.round(metric.value),
              rating: metric.rating,
              id: metric.id,
              path: pathname,
            })
          }

          // Send to analytics service (e.g., Google Analytics, custom endpoint)
          if (window.gtag) {
            window.gtag('event', metric.name, {
              event_category: 'Web Vitals',
              value: Math.round(metric.value),
              event_label: metric.id,
              non_interaction: true,
              page_path: pathname,
              metric_rating: metric.rating,
            })
          }

          // Send to custom analytics endpoint
          if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
            fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                metric: metric.name,
                value: metric.value,
                rating: metric.rating,
                id: metric.id,
                path: pathname,
                timestamp: Date.now(),
              }),
              keepalive: true,
            }).catch((err) => {
              console.error('Failed to send web vitals:', err)
            })
          }
        }

        // Monitor all Core Web Vitals
        onCLS(sendToAnalytics) // Cumulative Layout Shift
        onFID(sendToAnalytics) // First Input Delay (deprecated, but still useful)
        onFCP(sendToAnalytics) // First Contentful Paint
        onLCP(sendToAnalytics) // Largest Contentful Paint
        onTTFB(sendToAnalytics) // Time to First Byte
        onINP(sendToAnalytics) // Interaction to Next Paint (replaces FID)
      } catch {
        // web-vitals package not installed, skip monitoring
        // This is expected during development before npm install
      }
    }

    reportWebVitals()
  }, [pathname])

  return null // This component doesn't render anything
}

// Extend Window type for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params: Record<string, string | number | boolean>
    ) => void
  }
}
