# NRL Fan Hub - Application Flow

## System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Browser]
        HomePage[Home Page]
        MatchesPage[Matches Page]
        PredictionsPage[Predictions Page]
    end

    subgraph "Authentication"
        Auth0[Auth0]
        UserMenu[User Menu Component]
    end

    subgraph "Real-Time Layer"
        WS[WebSocket Server<br/>Socket.IO]
        WSHook[useMatchUpdates Hook]
    end

    subgraph "API Layer"
        MatchesAPI[/api/matches]
        PredictionsAPI[/api/predictions]
        SubmitAPI[/api/predictions/submit]
        AdminAPI[/api/admin/matches]
        CalcAPI[/api/admin/matches/calculate-points]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        PostgreSQL[(PostgreSQL Database)]
    end

    subgraph "Database Schema"
        UserTable[User Table]
        MatchTable[Match Table]
        PredictionTable[Prediction Table]
    end

    Browser --> HomePage
    Browser --> MatchesPage
    Browser --> PredictionsPage

    HomePage --> UserMenu
    MatchesPage --> UserMenu
    PredictionsPage --> UserMenu

    UserMenu --> Auth0

    MatchesPage --> MatchesAPI
    MatchesPage --> PredictionsAPI
    MatchesPage --> SubmitAPI
    MatchesPage --> WSHook

    PredictionsPage --> PredictionsAPI

    WSHook --> WS
    WS --> MatchesPage

    AdminAPI --> WS
    AdminAPI --> Prisma
    CalcAPI --> Prisma

    MatchesAPI --> Prisma
    PredictionsAPI --> Prisma
    SubmitAPI --> Prisma

    Prisma --> PostgreSQL
    PostgreSQL --> UserTable
    PostgreSQL --> MatchTable
    PostgreSQL --> PredictionTable

    PredictionTable -.belongs to.-> UserTable
    PredictionTable -.belongs to.-> MatchTable
```

## User Flow - Making a Prediction

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant MP as Matches Page
    participant PW as PredictionWidget
    participant API as /api/predictions/submit
    participant DB as Database
    participant WS as WebSocket Server

    U->>B: Navigate to /matches
    B->>MP: Load matches page
    MP->>API: GET /api/matches
    API->>DB: Fetch matches
    DB-->>API: Return matches
    API-->>MP: Return match data

    MP->>API: GET /api/predictions
    API->>DB: Fetch user predictions
    DB-->>API: Return predictions
    API-->>MP: Return prediction data

    MP->>PW: Render match cards with widgets

    U->>PW: Select team & submit prediction
    PW->>MP: Optimistic UI update
    PW->>API: POST /api/predictions/submit

    API->>DB: Validate match status
    API->>DB: Check kickoff time
    API->>DB: Create prediction
    DB-->>API: Prediction created

    API-->>PW: Success response
    PW->>MP: Update SWR cache
    MP-->>U: Show success state
```

## Admin Flow - Updating Match Scores

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as /api/admin/matches/[id]/update
    participant DB as Database
    participant WS as WebSocket Server
    participant C as Connected Clients

    A->>API: PATCH /api/admin/matches/{id}/update
    Note over API: Verify admin role

    API->>DB: Update match scores/status
    DB-->>API: Match updated

    API->>WS: Broadcast score update
    WS->>C: Emit 'match:score' event
    C-->>C: Update UI in real-time

    API-->>A: Return updated match
```

## Prediction Points Calculation Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as /api/admin/matches/[id]/calculate-points
    participant DB as Database
    participant Calc as Points Calculator

    A->>API: POST /api/admin/matches/{id}/calculate-points
    Note over API: Verify admin role

    API->>DB: Fetch match details
    DB-->>API: Match with final scores

    API->>DB: Fetch all predictions for match
    DB-->>API: List of predictions

    loop For each prediction
        API->>Calc: Calculate points
        Calc-->>API: Points & correctness
        API->>DB: Update prediction
    end

    API-->>A: Return statistics
    Note over API: Total predictions, correct count, points awarded
```

## Component Architecture

```mermaid
graph LR
    subgraph "Pages"
        Home[page.tsx]
        Matches[matches/page.tsx]
        Predictions[predictions/page.tsx]
    end

    subgraph "Match Components"
        MatchCard[MatchCard]
        PredWidget[PredictionWidget]
    end

    subgraph "Prediction Components"
        PredHistory[PredictionHistory]
    end

    subgraph "Auth Components"
        UserMenu[UserMenu]
        AuthSync[AuthSync]
    end

    subgraph "Custom Hooks"
        useAuth[useAuth]
        useMatches[useMatches]
        usePreds[usePredictions]
        useMatchUpdates[useMatchUpdates]
    end

    Home --> UserMenu
    Matches --> MatchCard
    Matches --> useMatches
    Matches --> usePreds
    Matches --> useMatchUpdates

    MatchCard --> PredWidget
    PredWidget --> useAuth

    Predictions --> PredHistory
    Predictions --> useAuth

    PredHistory --> usePreds
```

## Data Flow - Real-Time Match Updates

```mermaid
graph LR
    subgraph "External Source"
        Admin[Admin Panel]
    end

    subgraph "Server"
        API[Admin API]
        WS[WebSocket Server]
        DB[(Database)]
    end

    subgraph "Client"
        Hook[useMatchUpdates]
        SWR[SWR Cache]
        UI[Match Cards]
    end

    Admin -->|Update scores| API
    API -->|Save| DB
    API -->|Broadcast| WS
    WS -->|Socket event| Hook
    Hook -->|Mutate cache| SWR
    SWR -->|Re-render| UI
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant App as Application
    participant Auth0 as Auth0
    participant API as API Routes
    participant DB as Database

    U->>App: Click "Sign In"
    App->>Auth0: Redirect to /api/auth/login
    Auth0->>U: Show login page
    U->>Auth0: Enter credentials
    Auth0->>Auth0: Validate credentials
    Auth0->>App: Redirect with auth code
    App->>Auth0: Exchange code for tokens
    Auth0-->>App: Return ID token, access token

    App->>API: Request with session cookie
    API->>Auth0: Verify session
    API->>DB: Sync user data
    DB-->>API: User record
    API-->>App: Protected resource
    App-->>U: Show authenticated UI
```

## Prediction System State Machine

```mermaid
stateDiagram-v2
    [*] --> NoAuth: User not logged in
    NoAuth --> ShowLogin: Display login prompt
    ShowLogin --> Authenticated: User logs in

    Authenticated --> UpcomingMatch: Match is upcoming
    UpcomingMatch --> NoPrediction: No prediction made
    UpcomingMatch --> HasPrediction: Prediction exists

    NoPrediction --> MakingPrediction: User selects team
    MakingPrediction --> Submitting: User clicks submit
    Submitting --> HasPrediction: Success
    Submitting --> Error: Failed
    Error --> NoPrediction: User retries

    HasPrediction --> Locked: Match starts
    Locked --> Calculating: Match ends
    Calculating --> Correct: Prediction correct
    Calculating --> Incorrect: Prediction incorrect

    Correct --> [*]: Points awarded
    Incorrect --> [*]: No points
```

## Key Features

### 1. **Live Match Display**

- Real-time score updates via WebSocket
- Match status tracking (UPCOMING, LIVE, COMPLETED)
- Live indicator with animation
- Automatic UI updates without refresh

### 2. **Prediction System**

- Submit predictions before kickoff
- Automatic locking at match start
- Optimistic UI updates
- Points calculation (10 base + 5 bonus for 12+ point margin)

### 3. **Prediction History**

- View all predictions with filtering
- Stats dashboard (total, correct, points, accuracy)
- Real-time updates

### 4. **Authentication & Authorization**

- Auth0 integration
- Role-based access (USER, MODERATOR, ADMIN)
- Protected API routes
- Session management

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js custom server
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO
- **Authentication**: Auth0
- **State Management**: SWR for data fetching
- **Testing**: Jest, React Testing Library
