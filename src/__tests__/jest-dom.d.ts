/**
 * Type definitions for @testing-library/jest-dom
 * Extends Jest matchers with DOM-specific assertions
 */

import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toBeVisible(): R
      toHaveClass(...classNames: string[]): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveTextContent(text: string | RegExp): R
      toHaveValue(value?: string | number | string[]): R
    }
  }
}
