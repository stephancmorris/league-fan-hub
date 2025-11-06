// Mock for next/server to avoid Request/Response polyfill issues in tests
// This prevents Next.js from loading before polyfills are applied

class MockNextRequest {
  constructor(input, init) {
    this.url = typeof input === 'string' ? input : input.url
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers || {})
    this.body = init?.body
    this._parsedUrl = new URL(this.url)

    // Parse body if JSON
    this._bodyParsed = false
    this._bodyData = null
  }

  get nextUrl() {
    return {
      searchParams: this._parsedUrl.searchParams,
      pathname: this._parsedUrl.pathname,
    }
  }

  async json() {
    if (!this._bodyParsed && this.body) {
      this._bodyData = JSON.parse(this.body)
      this._bodyParsed = true
    }
    return this._bodyData
  }

  async text() {
    return this.body || ''
  }

  clone() {
    return new MockNextRequest(this.url, {
      method: this.method,
      headers: this.headers,
      body: this.body,
    })
  }
}

class MockNextResponse {
  constructor(body, init) {
    this.body = body
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.headers = new Headers(init?.headers || {})
    this._bodyData = null
  }

  static json(data, init) {
    const response = new MockNextResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
    response._bodyData = data
    return response
  }

  static next() {
    return new MockNextResponse(null, { status: 200 })
  }

  static redirect(url, status = 307) {
    return new MockNextResponse(null, {
      status,
      headers: {
        Location: url,
      },
    })
  }

  async json() {
    if (this._bodyData !== null) {
      return this._bodyData
    }
    return JSON.parse(this.body)
  }

  async text() {
    return this.body || ''
  }

  clone() {
    const cloned = new MockNextResponse(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
    })
    cloned._bodyData = this._bodyData
    return cloned
  }
}

module.exports = {
  NextRequest: MockNextRequest,
  NextResponse: MockNextResponse,
}
