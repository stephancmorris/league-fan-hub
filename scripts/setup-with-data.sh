#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   NRL Fan Hub - Setup with Sample Data${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}✗ Error: .env file not found${NC}"
    echo -e "${YELLOW}  Please create a .env file with your database and Auth0 configuration${NC}"
    echo -e "${YELLOW}  See .env.example for required variables${NC}\n"
    exit 1
fi

echo -e "${BLUE}[1/6]${NC} Installing dependencies..."
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to install dependencies${NC}\n"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}\n"

echo -e "${BLUE}[2/6]${NC} Installing tsx for TypeScript execution..."
npm install --save-dev tsx
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to install tsx${NC}\n"
    exit 1
fi
echo -e "${GREEN}✓ tsx installed${NC}\n"

echo -e "${BLUE}[3/6]${NC} Generating Prisma client..."
npm run db:generate
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to generate Prisma client${NC}\n"
    exit 1
fi
echo -e "${GREEN}✓ Prisma client generated${NC}\n"

echo -e "${BLUE}[4/6]${NC} Pushing database schema..."
npm run db:push
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to push database schema${NC}\n"
    exit 1
fi
echo -e "${GREEN}✓ Database schema updated${NC}\n"

echo -e "${BLUE}[5/6]${NC} Seeding database with sample matches..."
npm run db:seed
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to seed database${NC}\n"
    exit 1
fi
echo -e "${GREEN}✓ Database seeded with sample data${NC}"
echo -e "${YELLOW}  • 2 LIVE matches${NC}"
echo -e "${YELLOW}  • 4 UPCOMING matches${NC}"
echo -e "${YELLOW}  • 3 COMPLETED matches${NC}\n"

echo -e "${BLUE}[6/6]${NC} Starting development server..."
echo -e "${GREEN}✓ Setup complete!${NC}\n"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Starting NRL Fan Hub...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo -e "${YELLOW}   Next.js:  ${NC}http://localhost:3000"
echo -e "${YELLOW}   WebSocket:${NC} ws://localhost:3001"
echo -e "${YELLOW}   Matches:  ${NC}http://localhost:3000/matches\n"

npm run dev
