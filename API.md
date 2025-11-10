# NRL Fan Hub - API Documentation

## Overview

The NRL Fan Hub API provides a RESTful interface for managing matches, predictions, leaderboards, and user data. All API endpoints follow REST conventions and return JSON responses.

**Base URL:** `http://localhost:3000/api` (development)
**Production URL:** `https://your-domain.com/api`

## Table of Contents

1. [Authentication](#authentication)
2. [Matches](#matches)
3. [Predictions](#predictions)
4. [Leaderboard](#leaderboard)
5. [User Stats](#user-stats)
6. [Admin](#admin)
7. [Notifications](#notifications)
8. [Error Handling](#error-handling)

---

## Authentication

All authenticated endpoints use **Auth0** session-based authentication via cookies. The Auth0 SDK handles authentication automatically.

### Auth Endpoints

#### Login

```
GET /api/auth/login
```

Redirects to Auth0 login page.

#### Logout

```
GET /api/auth/logout
```

Logs out the current user and redirects to homepage.

#### Callback

```
GET /api/auth/callback
```

Auth0 callback endpoint (handled automatically by Auth0 SDK).

#### Get Current User

```
GET /api/auth/me
```

Returns the currently authenticated user's profile.

**Response:**

```json
{
  "sub": "auth0|123456",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://..."
}
```

---

## Matches

### Get Matches

Retrieve a list of NRL matches with optional filtering.

```
GET /api/matches
```

**Query Parameters:**

| Parameter | Type   | Default | Description                                 |
| --------- | ------ | ------- | ------------------------------------------- |
| round     | number | -       | Filter by round number (e.g., 1, 2, 3)      |
| status    | string | -       | Filter by status: UPCOMING, LIVE, COMPLETED |
| limit     | number | 20      | Number of matches to return (max: 100)      |

**Example Request:**

```bash
GET /api/matches?round=1&status=LIVE&limit=10
```

**Response:**

```json
{
  "matches": [
    {
      "id": "match-123",
      "round": 1,
      "homeTeam": "Broncos",
      "awayTeam": "Cowboys",
      "homeScore": 24,
      "awayScore": 18,
      "status": "LIVE",
      "kickoffTime": "2025-03-15T19:00:00Z",
      "venue": "Suncorp Stadium",
      "currentMinute": 65,
      "half": "SECOND",
      "lastScoreTime": "2025-03-15T20:15:00Z",
      "_count": {
        "predictions": 152
      }
    }
  ]
}
```

**Status Values:**

- `UPCOMING` - Match hasn't started yet
- `LIVE` - Match is currently in progress
- `COMPLETED` - Match has finished

**Match Half Values:**

- `FIRST` - First half (0-40 minutes)
- `HALFTIME` - Half-time break
- `SECOND` - Second half (40-80 minutes)
- `FULLTIME` - Match completed

---

## Predictions

### Submit Prediction

Submit a prediction for an upcoming match. Requires authentication.

```
POST /api/predictions/submit
```

**Authentication:** Required

**Request Body:**

```json
{
  "matchId": "match-123",
  "predictedWinner": "Broncos"
}
```

**Validation Rules:**

- Match must have status `UPCOMING`
- Match kickoff time must be in the future
- Predicted winner must be either homeTeam or awayTeam
- User can only submit one prediction per match

**Success Response (201):**

```json
{
  "message": "Prediction submitted successfully",
  "prediction": {
    "id": "pred-456",
    "predictedWinner": "Broncos",
    "match": {
      "homeTeam": "Broncos",
      "awayTeam": "Cowboys",
      "kickoffTime": "2025-03-15T19:00:00Z"
    }
  }
}
```

**Error Responses:**

- `400` - Invalid request or prediction already exists
- `401` - User not authenticated
- `404` - Match or user not found

### Get User Predictions

Retrieve predictions for the authenticated user.

```
GET /api/predictions
```

**Authentication:** Required

**Query Parameters:**

| Parameter | Type   | Default | Description                     |
| --------- | ------ | ------- | ------------------------------- |
| limit     | number | 50      | Number of predictions to return |
| offset    | number | 0       | Pagination offset               |

**Response:**

```json
{
  "predictions": [
    {
      "id": "pred-456",
      "predictedWinner": "Broncos",
      "isCorrect": true,
      "points": 10,
      "createdAt": "2025-03-14T10:30:00Z",
      "match": {
        "id": "match-123",
        "homeTeam": "Broncos",
        "awayTeam": "Cowboys",
        "homeScore": 24,
        "awayScore": 18,
        "status": "COMPLETED",
        "kickoffTime": "2025-03-15T19:00:00Z"
      }
    }
  ]
}
```

---

## Leaderboard

### Get Leaderboard

Retrieve leaderboard rankings with pagination.

```
GET /api/leaderboard
```

**Query Parameters:**

| Parameter | Type   | Default  | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| timeframe | string | all-time | Timeframe: "week" or "all-time" |
| limit     | number | 100      | Number of entries (1-100)       |
| offset    | number | 0        | Pagination offset               |

**Example Request:**

```bash
GET /api/leaderboard?timeframe=week&limit=50
```

**Response:**

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "picture": "https://...",
      "totalPoints": 250,
      "correctPredictions": 25,
      "totalPredictions": 30,
      "accuracy": 83
    }
  ],
  "currentUserRank": {
    "rank": 15,
    "totalPoints": 180
  },
  "timeframe": "week",
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

**Performance:**

- Cached with Redis for 60 seconds
- Optimized query with database indexes
- Average response time: < 100ms

---

## User Stats

### Get User Statistics

Retrieve detailed statistics for a user.

```
GET /api/users/{userId}/stats
```

**Authentication:** Required (users can only access their own stats)

**Response:**

```json
{
  "totalPoints": 250,
  "totalPredictions": 30,
  "correctPredictions": 25,
  "accuracy": 83,
  "currentStreak": 5,
  "bestStreak": 8,
  "rank": {
    "allTime": 15,
    "weekly": 8
  },
  "recentForm": [true, true, false, true, true]
}
```

**Fields:**

- `currentStreak` - Current consecutive correct predictions
- `bestStreak` - Best streak of correct predictions ever
- `recentForm` - Last 5 predictions (true = correct, false = incorrect)
- `accuracy` - Percentage of correct predictions

---

## Admin

Admin endpoints require the user to have the `admin` role in Auth0.

### Update Match Scores

Update match scores and status in real-time.

```
PATCH /api/admin/matches/{matchId}/update
```

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "homeScore": 24,
  "awayScore": 18,
  "status": "LIVE",
  "currentMinute": 65,
  "half": "SECOND"
}
```

**Response:**

```json
{
  "match": {
    "id": "match-123",
    "homeTeam": "Broncos",
    "awayTeam": "Cowboys",
    "homeScore": 24,
    "awayScore": 18,
    "status": "LIVE",
    "currentMinute": 65,
    "half": "SECOND",
    "lastScoreTime": "2025-03-15T20:15:00Z"
  }
}
```

**Side Effects:**

- Broadcasts WebSocket update to all connected clients
- Updates `lastScoreTime` when scores change

### Calculate Prediction Points

Calculate and award points for predictions after match completion.

```
POST /api/admin/matches/{matchId}/calculate-points
```

**Authentication:** Required (Admin only)

**Response:**

```json
{
  "message": "Points calculated successfully",
  "updated": 152
}
```

**Point Calculation:**

- Correct prediction: 10 points
- Incorrect prediction: 0 points
- Only awarded after match status is `COMPLETED`

### Get All Users

Retrieve list of all users (admin only).

```
GET /api/admin/users
```

**Authentication:** Required (Admin only)

**Response:**

```json
{
  "users": [
    {
      "id": "user-123",
      "auth0Id": "auth0|123456",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "fan",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Update User Role

Change a user's role.

```
PATCH /api/admin/users/{userId}/role
```

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "role": "admin"
}
```

**Valid Roles:**

- `fan` - Regular user
- `admin` - Administrator with full access

**Response:**

```json
{
  "user": {
    "id": "user-123",
    "role": "admin"
  }
}
```

---

## Notifications

### Subscribe to Push Notifications

Subscribe to push notifications for match updates.

```
POST /api/notifications/subscribe
```

**Authentication:** Required

**Request Body:**

```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  },
  "expirationTime": null
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription saved successfully"
}
```

### Unsubscribe from Push Notifications

Unsubscribe from push notifications.

```
POST /api/notifications/unsubscribe
```

**Authentication:** Required

**Request Body:**

```json
{
  "endpoint": "https://fcm.googleapis.com/..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Unsubscribed successfully"
}
```

---

## Error Handling

All API endpoints follow consistent error response format:

### Standard Error Response

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Description                              |
| ---- | ---------------------------------------- |
| 200  | Success                                  |
| 201  | Resource created successfully            |
| 400  | Bad request - invalid parameters or data |
| 401  | Unauthorized - authentication required   |
| 403  | Forbidden - insufficient permissions     |
| 404  | Not found - resource doesn't exist       |
| 500  | Internal server error                    |

### Common Error Messages

**Authentication Errors:**

```json
{ "error": "Unauthorized" }
{ "error": "User not found" }
{ "error": "Forbidden" }
```

**Validation Errors:**

```json
{ "error": "Missing required fields: matchId, predictedWinner" }
{ "error": "Predicted winner must be one of the match teams" }
{ "error": "Predictions can only be made for upcoming matches" }
{ "error": "Predictions are locked - match has already started" }
```

**Resource Errors:**

```json
{ "error": "Match not found" }
{ "error": "You have already made a prediction for this match" }
```

---

## Rate Limiting

Rate limiting is implemented on all API routes:

- **Authenticated users:** 100 requests per minute
- **Unauthenticated users:** 20 requests per minute
- **Admin endpoints:** 200 requests per minute

When rate limit is exceeded, the API returns:

```json
{
  "error": "Too many requests, please try again later"
}
```

HTTP Status: `429 Too Many Requests`

---

## WebSocket Events

The application uses WebSockets for real-time updates on port 3001.

### Connect to WebSocket

```javascript
const socket = io('http://localhost:3001')
```

### Events

#### Score Update

```javascript
socket.on('score-update', (data) => {
  // data: { matchId, homeScore, awayScore }
})
```

#### Status Update

```javascript
socket.on('status-update', (data) => {
  // data: { matchId, status, currentMinute, half }
})
```

#### Match Start

```javascript
socket.on('match-start', (data) => {
  // data: { matchId, kickoffTime }
})
```

---

## Best Practices

### Caching

- Use `Cache-Control` headers returned by the API
- Leaderboard is cached for 60 seconds
- Match data is cached for 10 seconds

### Pagination

- Always use `limit` and `offset` for large datasets
- Default limits are applied if not specified
- Check `hasMore` flag to determine if more data is available

### Error Handling

```javascript
try {
  const response = await fetch('/api/matches')
  if (!response.ok) {
    const error = await response.json()
    console.error('API Error:', error.error)
  }
  const data = await response.json()
} catch (error) {
  console.error('Network Error:', error)
}
```

### Authentication

```javascript
// Client-side authentication check
const response = await fetch('/api/predictions/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important: include cookies
  body: JSON.stringify({ matchId, predictedWinner }),
})
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Submit a prediction
async function submitPrediction(matchId: string, predictedWinner: string) {
  const response = await fetch('/api/predictions/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ matchId, predictedWinner }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  return response.json()
}

// Get leaderboard
async function getLeaderboard(timeframe: 'week' | 'all-time' = 'all-time') {
  const response = await fetch(`/api/leaderboard?timeframe=${timeframe}&limit=100`)
  return response.json()
}

// Get live matches
async function getLiveMatches() {
  const response = await fetch('/api/matches?status=LIVE')
  return response.json()
}
```

### React Hook Example

```typescript
import useSWR from 'swr'

function useMatches(status?: string) {
  const { data, error, isLoading } = useSWR(
    status ? `/api/matches?status=${status}` : '/api/matches'
  )

  return {
    matches: data?.matches || [],
    isLoading,
    error,
  }
}
```

---

## Changelog

### v1.0.0 (Current)

- Initial API release
- Match management endpoints
- Prediction system
- Leaderboard with caching
- Admin endpoints
- WebSocket real-time updates
- Push notification support

---

## Support

For API issues or questions:

1. Check this documentation
2. Review example code in `/src/app/api`
3. Check test files in `/src/app/api/__tests__`
4. Create an issue on GitHub

**Note:** This API is designed for the NRL Fan Hub application and may require modification for other use cases.
