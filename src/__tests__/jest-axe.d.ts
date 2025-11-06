/**
 * Type definitions for jest-axe
 * Provides TypeScript types for accessibility testing
 */

declare module 'jest-axe' {
  import { Result, RunOptions } from 'axe-core'

  export function axe(html: Element | Document, options?: RunOptions): Promise<Result>

  export const toHaveNoViolations: {
    toHaveNoViolations(results: Result): {
      message(): string
      pass: boolean
    }
  }

  export const configureAxe: (options?: RunOptions) => typeof axe
}
