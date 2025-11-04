# NRL Fan Hub

A high-performance, scalable fan engagement platform built with Next.js, React, Auth0, and real-time WebSockets. Built to handle 100K+ concurrent users with enterprise-grade CI/CD.

## Features

- **Live Match Tracking**: Real-time score updates via WebSockets
- **Match Predictions**: Compete with other fans by predicting match outcomes
- **Leaderboards**: Track your ranking and compete for the top spot
- **Secure Authentication**: Auth0 integration with role-based access control
- **PWA Support**: Installable app with offline capabilities
- **Performance Optimized**: Lighthouse score > 90, sub-2s load times
- **Fully Tested**: >70% code coverage with unit, integration, and E2E tests

## Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **SWR** - Data fetching and caching

### Backend

- **Next.js API Routes** - Serverless API
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **WebSockets** - Real-time updates

### Authentication & Security

- **Auth0** - Authentication and authorization
- **Zod** - Runtime type validation
- **Security Headers** - OWASP best practices

### DevOps & Infrastructure

- **Vercel** - Hosting and deployments
- **GitHub Actions** - CI/CD pipeline
- **Jest & React Testing Library** - Testing
- **ESLint & Prettier** - Code quality
- **Husky** - Git hooks

## Getting Started

### 🚀 Automated Setup (Recommended)

**The fastest way to get started!** Use our interactive setup scripts:

#### Mac / Linux

```bash
chmod +x setup.sh
./setup.sh
```

#### Windows

```cmd
setup.bat
```

The script will guide you through:

- ✅ Installing dependencies
- ✅ Configuring Auth0
- ✅ Setting up environment variables
- ✅ Creating the database
- ✅ Starting the dev server

**Time:** ~10 minutes | **Difficulty:** Beginner-friendly

📚 **Full documentation:** [SETUP_SCRIPTS.md](./SETUP_SCRIPTS.md)

---

### 📖 Manual Setup

Prefer to do it manually? Follow the detailed guide:

**Quick reference:** [QUICK_START.md](./QUICK_START.md)
**Step-by-step guide:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)

#### Prerequisites

- Node.js 20+ and npm
- PostgreSQL 14+ (or Docker)
- Auth0 account (free tier)

#### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/league-fan-hub.git
   cd league-fan-hub
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Generate Auth0 secret**

   ```bash
   openssl rand -hex 32
   ```

4. **Configure Auth0**
   - Sign up at [auth0.com](https://auth0.com)
   - Create a Regular Web Application
   - Add `http://localhost:3000/api/auth/callback` to Allowed Callback URLs
   - Get your Domain, Client ID, and Client Secret

5. **Setup environment variables**

   Update `.env.local` with your Auth0 credentials:

   ```bash
   AUTH0_SECRET=<paste-output-from-step-3>
   AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nrl_fan_hub
   ```

6. **Setup the database**

   ```bash
   createdb nrl_fan_hub
   npm run db:generate
   npm run db:push
   ```

7. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Git Hooks
npm run prepare          # Setup Husky hooks
```

## Project Structure

```
league-fan-hub/
├── .github/              # GitHub Actions workflows and templates
├── .husky/               # Git hooks
├── public/               # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   ├── lib/             # Utilities and helpers
│   ├── types/           # TypeScript type definitions
│   └── styles/          # Global styles
├── .env.example         # Environment variables template
├── next.config.js       # Next.js configuration
├── tailwind.config.ts   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Deployment

### Vercel (Recommended)

1. **Connect to Vercel**

   ```bash
   npm i -g vercel
   vercel
   ```

2. **Add environment variables** in Vercel dashboard

3. **Deploy**
   - Push to `main` branch for production
   - Push to `develop` branch for staging
   - Pull requests get preview deployments

### Environment Variables (Production)

Required environment variables for production:

- `AUTH0_*` - Auth0 configuration
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `NEXT_PUBLIC_APP_URL` - Your production URL

See [.env.example](.env.example) for full list.

## Testing

Comprehensive testing strategy with 140+ test cases covering unit, integration, E2E, and accessibility testing.

### Running Tests

```bash
# Unit and integration tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode
npm run test:ci

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui

# E2E in headed mode
npm run test:e2e:headed

# All tests
npm run test:all
```

### Test Coverage

- **Target:** 70% coverage across all metrics
- **Unit Tests:** 60+ test cases for components
- **API Tests:** 42 integration test cases
- **E2E Tests:** 24 critical path scenarios
- **Accessibility Tests:** 15+ WCAG compliance checks
- Tests run automatically in CI/CD
- Multi-browser E2E testing (Chrome, Firefox, Safari, Mobile)

### Test Documentation

For detailed testing information, see [TESTING.md](TESTING.md)

## Contributing

Please read [CONTRIBUTING.md](.github/CONTRIBUTING.md) for details on our branch strategy, code of conduct, and the process for submitting pull requests.

### Branch Strategy

- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add login component [AUTH-003]
fix(match): resolve websocket reconnection [MATCH-007]
docs: update API documentation
test(prediction): add validation tests
```

## Performance

### Targets

- ✅ Lighthouse Score: >90
- ✅ First Contentful Paint: <1.5s
- ✅ Time to Interactive: <3s
- ✅ Bundle Size: <200KB
- ✅ Concurrent Users: 100K+

### Optimizations

- Code splitting and lazy loading
- Image optimization with Next.js Image
- CDN caching via Vercel Edge Network
- Redis caching for leaderboards
- Optimistic UI updates

## Security

- OWASP security headers configured
- Auth0 for secure authentication
- Environment variables for secrets
- CSRF protection
- Rate limiting on API routes
- Input validation with Zod

## Monitoring & Analytics

- Error tracking with Sentry (optional)
- Performance monitoring
- User analytics (optional)
- Uptime monitoring

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- NRL for the amazing sport
- Next.js team for the fantastic framework
- Auth0 for secure authentication
- Vercel for excellent hosting

## Support

For questions or issues, please:

1. Check existing issues
2. Create a new issue with details
3. Contact the development team

---

Built for the NRL Lead Engineer role demonstration.
