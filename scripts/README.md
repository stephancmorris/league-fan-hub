# Setup Scripts

This directory contains scripts to help you set up and run the NRL Fan Hub application.

## 🚀 Quick Start with Sample Data

The easiest way to get started with the application is to use the setup script:

```bash
npm run setup
```

This single command will:

1. **Install dependencies** - Install all npm packages required by the app
2. **Install tsx** - Add TypeScript execution support for the seed script
3. **Generate Prisma client** - Create the database client from your schema
4. **Push database schema** - Update your database with the latest schema
5. **Seed the database** - Populate with 9 sample NRL matches:
   - 2 LIVE matches (in progress with scores)
   - 4 UPCOMING matches (scheduled for today/tomorrow)
   - 3 COMPLETED matches (from earlier this week)
6. **Start the dev server** - Launch both Next.js and WebSocket servers

## 📋 Prerequisites

Before running the setup script, make sure you have:

- **Node.js 18+** installed
- **PostgreSQL database** running (local or hosted)
- **`.env` file** created with required variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nrl_fan_hub"

# Auth0
AUTH0_SECRET="your-auth0-secret"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://your-tenant.auth0.com"
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"

# WebSocket
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
```

## 🔧 Manual Setup

If you prefer to run the steps individually:

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Install tsx
npm install --save-dev tsx

# 3. Generate Prisma client
npm run db:generate

# 4. Push database schema
npm run db:push

# 5. Seed sample data
npm run db:seed

# 6. Start development server
npm run dev
```

## 📦 Sample Data Details

The seed script creates realistic NRL match data:

### Live Matches (In Progress)

- **Melbourne Storm vs Brisbane Broncos**
  - Score: 18-14
  - Status: 65th minute, 2nd half
  - Venue: AAMI Park

- **Sydney Roosters vs Penrith Panthers**
  - Score: 12-16
  - Status: 52nd minute, 2nd half
  - Venue: Allianz Stadium

### Upcoming Matches

- South Sydney Rabbitohs vs Cronulla Sharks (in 3 hours)
- Parramatta Eels vs Canterbury Bulldogs (in 5 hours)
- Warriors vs Gold Coast Titans (tomorrow)
- Newcastle Knights vs Manly Sea Eagles (tomorrow evening)

### Completed Matches

- Canberra Raiders 24-20 North Queensland Cowboys
- Wests Tigers 16-22 St George Illawarra Dragons
- Penrith Panthers 28-12 Brisbane Broncos

## 🌐 Access Points

After setup completes, access the application at:

- **Main App**: http://localhost:3000
- **Matches Page**: http://localhost:3000/matches
- **WebSocket Server**: ws://localhost:3001
- **Prisma Studio**: `npm run db:studio` (http://localhost:5555)

## 🛠️ Troubleshooting

### Setup script fails

- Check that your `.env` file exists and has valid database credentials
- Ensure PostgreSQL is running and accessible
- Try running the manual setup steps one by one to identify the issue

### Database connection errors

- Verify `DATABASE_URL` in `.env` is correct
- Check that PostgreSQL is running: `psql -U postgres`
- Ensure the database user has proper permissions

### Port already in use

- Next.js (3000) or WebSocket (3001) ports may be in use
- Kill existing processes or change ports in `.env` and `server.js`

## 📝 Scripts Reference

| Script                | Description                                      |
| --------------------- | ------------------------------------------------ |
| `npm run setup`       | Full setup with sample data and dev server start |
| `npm run dev`         | Start development servers (Next.js + WebSocket)  |
| `npm run db:seed`     | Seed database with sample matches                |
| `npm run db:push`     | Push schema changes to database                  |
| `npm run db:generate` | Generate Prisma client                           |
| `npm run db:studio`   | Open Prisma Studio database GUI                  |

## 🔄 Re-seeding Data

To clear and re-seed the database with fresh sample data:

```bash
npm run db:seed
```

This will delete all existing matches and create new sample data.
