// Polyfill TextEncoder/TextDecoder FIRST - Required by @whatwg-node/fetch
// This file runs BEFORE the test environment is set up
// Jest's setupFiles requires CommonJS format, not ES6 modules
/* eslint-disable @typescript-eslint/no-require-imports */
const util = require('util')
global.TextEncoder = util.TextEncoder
global.TextDecoder = util.TextDecoder

// Polyfill Web APIs - Required for Next.js NextRequest/NextResponse
if (typeof global.fetch === 'undefined') {
  // Import fetch polyfills from @whatwg-node/fetch which is compatible with Node.js
  const { fetch, Request, Response, Headers, FormData } = require('@whatwg-node/fetch')
  global.fetch = fetch
  global.Request = Request
  global.Response = Response
  global.Headers = Headers
  global.FormData = FormData
}
