#!/bin/bash
# Deployment Rollback Script
# Usage: ./scripts/rollback.sh [deployment-url-or-id]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 NRL Fan Hub Deployment Rollback${NC}"
echo "========================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI is not installed${NC}"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${RED}Error: Not logged in to Vercel${NC}"
    echo "Run: vercel login"
    exit 1
fi

# Get deployment to rollback to
DEPLOYMENT_ID=$1

if [ -z "$DEPLOYMENT_ID" ]; then
    echo -e "${YELLOW}No deployment specified. Showing recent deployments:${NC}"
    echo ""
    vercel ls nrl-fan-hub --prod --limit 10
    echo ""
    echo "Usage: ./scripts/rollback.sh [deployment-url-or-id]"
    exit 0
fi

echo -e "${YELLOW}Preparing to rollback to: ${DEPLOYMENT_ID}${NC}"
echo ""

# Confirm rollback
read -p "Are you sure you want to promote this deployment to production? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Rollback cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Starting rollback...${NC}"

# Promote deployment
if vercel promote "$DEPLOYMENT_ID" --prod --yes; then
    echo ""
    echo -e "${GREEN}✅ Rollback successful!${NC}"
    echo ""
    echo "Production is now running: $DEPLOYMENT_ID"
    echo ""
    echo "Verify deployment:"
    echo "  - Health check: curl https://nrl-fan-hub.vercel.app/healthz"
    echo "  - View logs: vercel logs --prod"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Rollback failed${NC}"
    echo "Check Vercel dashboard for details"
    exit 1
fi
