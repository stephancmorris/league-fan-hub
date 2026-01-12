# NRL Fan Hub

A production-ready fan engagement platform demonstrating enterprise-grade architecture, real-time capabilities, and DevOps excellence.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-leaguefanhub.vercel.app-brightgreen?style=for-the-badge)](https://leaguefanhub.vercel.app/)

## Project Overview

The NRL Fan Hub is a scalable, real-time sports engagement platform built to demonstrate modern full-stack development practices, system design expertise, and production-ready DevOps workflows.

**Key Features:**

- Live match tracking with real-time score updates via WebSockets
- Fan prediction system with points and leaderboards
- Admin dashboard for match management
- Mobile-responsive PWA with offline support

**Technology Stack:**

- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes (serverless), PostgreSQL, Prisma ORM
- Real-time: Socket.IO WebSockets
- Caching: Redis (Upstash)
- Authentication: Auth0
- Hosting: Vercel

## System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Devices]
    end

    subgraph "Edge Network - Vercel CDN"
        Edge[Edge Functions]
        Static[Static Assets Cache]
    end

    subgraph "Application Layer - Next.js 14"
        Pages[React Pages/RSC]
        API[API Routes - Serverless]
        Middleware[Auth Middleware]
    end

    subgraph "Authentication"
        Auth0[Auth0 Service]
    end

    subgraph "Real-time Layer"
        WS[WebSocket Server :3001]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis Cache)]
    end

    Browser --> Edge
    Mobile --> Edge
    Edge --> Static
    Edge --> Pages
    Edge --> API

    API --> Middleware
    Middleware --> Auth0

    Pages --> WS
    API --> Prisma
    API --> Redis

    Prisma --> PostgreSQL
    WS --> Redis

    style PostgreSQL fill:#336791,color:#fff
    style Redis fill:#DC382D,color:#fff
    style Auth0 fill:#EB5424,color:#fff
    style Edge fill:#000,color:#fff
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or Docker)
- Auth0 account (free tier)
- Redis (optional, Upstash free tier works)

### Quick Setup

1. Clone and install dependencies:

```bash
git clone https://github.com/stephancmorris/league-fan-hub.git
cd league-fan-hub
npm install
```

2. Configure Auth0:
   - Sign up at [auth0.com](https://auth0.com)
   - Create a Regular Web Application
   - Add `http://localhost:3000/api/auth/callback` to Allowed Callback URLs

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:

```bash
AUTH0_SECRET=$(openssl rand -hex 32)
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nrl_fan_hub
```

4. Initialize database:

```bash
createdb nrl_fan_hub
npx prisma generate
npx prisma db push
npm run db:seed
```

5. Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Essential Commands

| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start development server |
| `npm run build`     | Build for production     |
| `npm test`          | Run all tests            |
| `npx prisma studio` | Open database GUI        |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built by Stephan Morris | [Live Demo](https://leaguefanhub.vercel.app/)
