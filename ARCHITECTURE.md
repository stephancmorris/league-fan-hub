# NRL Fan Hub - Architecture Documentation

## System Architecture Overview

The NRL Fan Hub is a modern, scalable web application built with a serverless architecture using Next.js 14, Auth0, PostgreSQL, and real-time WebSocket communication.

## High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        PWA[Progressive Web App]
        Mobile[Mobile Devices]
    end

    subgraph "CDN / Edge Network"
        Vercel[Vercel Edge Network]
        Static[Static Assets Cache]
    end

    subgraph "Application Layer - Next.js 14"
        AppRouter[App Router]
        Pages[React Pages/Components]
        API[API Routes - Serverless]
        Middleware[Middleware Layer]
    end

    subgraph "Authentication & Authorization"
        Auth0[Auth0 Service]
        AuthSDK[Auth0 Next.js SDK]
        Session[Session Management]
    end

    subgraph "Real-time Layer"
        WS[WebSocket Server :3001]
        SocketIO[Socket.IO]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        PostgreSQL[(PostgreSQL Database)]
        Redis[(Redis Cache)]
    end

    subgraph "External Services"
        Monitoring[Sentry - Error Tracking]
        Analytics[Analytics Service]
    end

    Browser --> Vercel
    PWA --> Vercel
    Mobile --> Vercel

    Vercel --> Static
    Vercel --> AppRouter

    AppRouter --> Pages
    AppRouter --> API
    AppRouter --> Middleware

    Middleware --> AuthSDK
    AuthSDK --> Auth0
    Auth0 --> Session

    Pages --> WS
    API --> Prisma
    API --> Redis

    Prisma --> PostgreSQL

    WS --> SocketIO
    SocketIO --> Pages

    API --> Monitoring
    Pages --> Analytics
```

## Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        Layout[Root Layout]
        Layout --> Header[Header/Navigation]
        Layout --> MainContent[Main Content Area]
        Layout --> Footer[Footer]

        MainContent --> MatchList[Match List]
        MainContent --> Leaderboard[Leaderboard]
        MainContent --> Profile[User Profile]

        MatchList --> MatchCard[Match Card]
        MatchCard --> PredictionWidget[Prediction Widget]
        MatchCard --> LiveScore[Live Score Display]

        Leaderboard --> LeaderboardTable[Leaderboard Table]
        Profile --> StatsCard[Stats Card]
    end

    subgraph "Shared Components"
        Button[Button]
        Modal[Modal]
        Loading[Loading States]
        Error[Error Boundaries]
    end

    MatchCard --> Button
    PredictionWidget --> Modal
    MatchList --> Loading
    MainContent --> Error
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextJS
    participant Auth0
    participant API
    participant Database
    participant WebSocket
    participant Redis

    User->>Browser: Visit site
    Browser->>NextJS: Request page
    NextJS->>Auth0: Check session
    Auth0-->>NextJS: Return user/null
    NextJS->>API: Fetch matches
    API->>Redis: Check cache

    alt Cache Hit
        Redis-->>API: Return cached data
    else Cache Miss
        API->>Database: Query matches
        Database-->>API: Return data
        API->>Redis: Cache data (60s)
    end

    API-->>Browser: Return matches
    Browser->>WebSocket: Connect to WS
    WebSocket-->>Browser: Connection established

    Note over Browser,WebSocket: Real-time Updates

    WebSocket->>Browser: score-update event
    Browser->>Browser: Update UI optimistically

    User->>Browser: Submit prediction
    Browser->>API: POST /predictions/submit
    API->>Auth0: Verify session
    Auth0-->>API: Valid user
    API->>Database: Save prediction
    Database-->>API: Confirmation
    API-->>Browser: Success response
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Auth0SDK
    participant Auth0
    participant Database

    User->>App: Click Login
    App->>Auth0SDK: Initiate login
    Auth0SDK->>Auth0: Redirect to login
    Auth0->>User: Show login form
    User->>Auth0: Enter credentials
    Auth0->>Auth0: Verify credentials
    Auth0->>Auth0SDK: Callback with token
    Auth0SDK->>App: Create session
    App->>Database: Sync user profile
    Database-->>App: User record
    App->>User: Redirect to dashboard
```

## Database Schema

```mermaid
erDiagram
    User ||--o{ Prediction : makes
    User ||--o{ PushSubscription : has
    Match ||--o{ Prediction : receives

    User {
        string id PK
        string auth0Id UK
        string email
        string name
        string picture
        string role
        datetime createdAt
        datetime updatedAt
    }

    Match {
        string id PK
        int round
        string homeTeam
        string awayTeam
        int homeScore
        int awayScore
        string status
        datetime kickoffTime
        string venue
        int currentMinute
        string half
        datetime lastScoreTime
        datetime createdAt
        datetime updatedAt
    }

    Prediction {
        string id PK
        string userId FK
        string matchId FK
        string predictedWinner
        boolean isCorrect
        int points
        datetime createdAt
        datetime updatedAt
    }

    PushSubscription {
        string id PK
        string userId FK
        string endpoint
        string p256dh
        string auth
        datetime expirationTime
        datetime createdAt
    }
```

## API Architecture

```mermaid
graph TB
    subgraph "Public APIs"
        GetMatches[GET /api/matches]
        GetLeaderboard[GET /api/leaderboard]
    end

    subgraph "Authenticated APIs"
        SubmitPrediction[POST /api/predictions/submit]
        GetPredictions[GET /api/predictions]
        GetUserStats[GET /api/users/:id/stats]
        SubscribeNotif[POST /api/notifications/subscribe]
    end

    subgraph "Admin APIs"
        UpdateMatch[PATCH /api/admin/matches/:id/update]
        CalculatePoints[POST /api/admin/matches/:id/calculate-points]
        GetUsers[GET /api/admin/users]
        UpdateRole[PATCH /api/admin/users/:id/role]
    end

    subgraph "Middleware"
        AuthMiddleware[Auth Middleware]
        RoleMiddleware[Role Check Middleware]
        RateLimit[Rate Limiting]
        Validation[Input Validation]
    end

    GetMatches --> RateLimit
    GetLeaderboard --> RateLimit

    SubmitPrediction --> AuthMiddleware
    GetPredictions --> AuthMiddleware
    GetUserStats --> AuthMiddleware
    SubscribeNotif --> AuthMiddleware

    AuthMiddleware --> Validation

    UpdateMatch --> RoleMiddleware
    CalculatePoints --> RoleMiddleware
    GetUsers --> RoleMiddleware
    UpdateRole --> RoleMiddleware

    RoleMiddleware --> AuthMiddleware
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Developer"
        Dev[Developer Machine]
        Git[Git Push]
    end

    subgraph "GitHub"
        Repo[GitHub Repository]
        Actions[GitHub Actions CI/CD]
    end

    subgraph "CI/CD Pipeline"
        Lint[ESLint & Prettier]
        TypeCheck[TypeScript Check]
        Test[Jest Tests]
        E2E[Playwright E2E]
        Build[Next.js Build]
    end

    subgraph "Vercel Platform"
        Preview[Preview Deployment]
        Prod[Production Deployment]
        Edge[Edge Functions]
    end

    subgraph "External Services"
        DB[(PostgreSQL - Vercel/Supabase)]
        RedisCache[(Redis - Upstash)]
        Auth0Svc[Auth0]
        Sentry[Sentry]
    end

    Dev --> Git
    Git --> Repo
    Repo --> Actions

    Actions --> Lint
    Lint --> TypeCheck
    TypeCheck --> Test
    Test --> E2E
    E2E --> Build

    Build --> Preview
    Build --> Prod

    Prod --> Edge

    Edge --> DB
    Edge --> RedisCache
    Edge --> Auth0Svc
    Prod --> Sentry
```

## Technology Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks + SWR
- **Real-time:** Socket.IO Client
- **Forms:** React Hook Form (if applicable)
- **Testing:** Jest + React Testing Library + Playwright

### Backend

- **Runtime:** Node.js 20+
- **API:** Next.js API Routes (Serverless)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Cache:** Redis (Upstash)
- **Real-time:** Socket.IO Server
- **Authentication:** Auth0

### DevOps & Infrastructure

- **Hosting:** Vercel
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (optional)
- **Version Control:** Git + GitHub
- **Package Manager:** npm

## Key Design Decisions

### 1. Serverless Architecture

**Decision:** Use Next.js API routes with serverless functions
**Rationale:**

- Auto-scaling based on demand
- Cost-effective for variable traffic
- No server management overhead
- Global edge deployment

### 2. Prisma ORM

**Decision:** Use Prisma instead of raw SQL
**Rationale:**

- Type-safe database queries
- Excellent TypeScript integration
- Easy migrations and schema management
- Built-in connection pooling

### 3. Redis Caching

**Decision:** Cache leaderboard and high-traffic endpoints
**Rationale:**

- Reduce database load
- Improve response times (< 100ms)
- Handle 100K+ concurrent users
- Cost-effective scaling

### 4. WebSocket for Real-time

**Decision:** Separate WebSocket server on port 3001
**Rationale:**

- Persistent connections for live updates
- Efficient for real-time sports scores
- Better UX than polling
- Separated from serverless functions

### 5. Auth0 for Authentication

**Decision:** Use Auth0 instead of building custom auth
**Rationale:**

- Enterprise-grade security
- OAuth/Social login support
- Role-based access control
- Reduces development time

## Performance Optimizations

### Frontend

1. **Code Splitting:** Dynamic imports for heavy components
2. **Image Optimization:** Next.js Image component with WebP
3. **Lazy Loading:** Components below fold loaded on demand
4. **Bundle Optimization:** Tree shaking and minification
5. **Prefetching:** Link prefetching for faster navigation

### Backend

1. **Database Indexing:** Indexes on frequently queried fields
2. **Connection Pooling:** Prisma connection pooling
3. **Query Optimization:** Efficient joins and selective fields
4. **Redis Caching:** 60s TTL for leaderboard, 10s for matches
5. **CDN Caching:** Static assets cached at edge

### Network

1. **Edge Functions:** Deployed globally via Vercel
2. **Compression:** Gzip/Brotli for API responses
3. **HTTP/2:** Multiplexed connections
4. **Optimistic Updates:** UI updates before API confirmation

## Security Measures

### Authentication & Authorization

- Session-based auth with Auth0
- HTTP-only secure cookies
- CSRF protection
- Role-based access control (RBAC)

### API Security

- Input validation with Zod schemas
- Rate limiting per endpoint
- SQL injection prevention (Prisma ORM)
- XSS protection via React

### Infrastructure

- HTTPS only (TLS 1.3)
- Security headers (OWASP recommendations)
- Environment variables for secrets
- Vercel security features

## Scalability Considerations

### Current Capacity

- **Concurrent Users:** 100,000+
- **Requests/Second:** 10,000+
- **Database Connections:** 100 (pooled)
- **Cache Hit Rate:** > 80%

### Scaling Strategy

1. **Horizontal Scaling:** Serverless functions auto-scale
2. **Database:** Read replicas for heavy read operations
3. **Caching:** Increase Redis cluster size
4. **CDN:** Vercel Edge Network global distribution
5. **WebSocket:** Cluster WebSocket servers with Redis adapter

## Monitoring & Observability

### Metrics Tracked

- API response times
- Error rates and types
- Database query performance
- Cache hit/miss rates
- User engagement metrics

### Tools

- **Error Tracking:** Sentry (optional)
- **Performance:** Vercel Analytics
- **Logs:** Vercel Logs + CloudWatch
- **Uptime:** Vercel monitoring

## Development Workflow

```mermaid
graph LR
    Local[Local Development] --> Commit[Git Commit]
    Commit --> Push[Push to Branch]
    Push --> PR[Create Pull Request]
    PR --> CI[CI Checks Run]
    CI --> Preview[Preview Deploy]
    Preview --> Review[Code Review]
    Review --> Merge[Merge to Main]
    Merge --> Deploy[Production Deploy]
```

## Testing Strategy

### Unit Tests (Jest)

- Component rendering
- Utility functions
- Business logic

### Integration Tests (Jest)

- API endpoints
- Database interactions
- Auth flows

### E2E Tests (Playwright)

- User journeys
- Critical paths
- Cross-browser testing

### Performance Tests

- Lighthouse audits
- Load testing with k6 (planned)

## Future Enhancements

### Phase 2 Features

1. **GraphQL API:** More flexible data fetching
2. **Microservices:** Split admin and public APIs
3. **Event Sourcing:** Better audit trails
4. **Advanced Analytics:** Custom dashboards
5. **Mobile Apps:** React Native apps
6. **AI Predictions:** ML-based predictions

### Infrastructure Improvements

1. **Multi-region Database:** Lower latency globally
2. **Kubernetes:** If moving away from serverless
3. **Message Queue:** For async processing (Bull/Redis)
4. **Elasticsearch:** For advanced search

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth0 Next.js SDK](https://github.com/auth0/nextjs-auth0)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Vercel Platform](https://vercel.com/docs)

---

**Document Version:** 1.0
**Last Updated:** November 2025
**Maintained By:** Development Team
