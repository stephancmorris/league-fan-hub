#!/bin/bash
# Vercel Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environments: preview (default), production

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 NRL Fan Hub Deployment Script${NC}"
echo "===================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI is not installed${NC}"
    echo ""
    echo "Install it with:"
    echo "  npm install -g vercel"
    echo ""
    echo "Or using the project's dev dependency:"
    echo "  npx vercel"
    exit 1
fi

# Check if user is logged in
echo -e "${BLUE}Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Not logged in to Vercel. Initiating login...${NC}"
    vercel login
    echo ""
fi

CURRENT_USER=$(vercel whoami)
echo -e "${GREEN}✓ Logged in as: ${CURRENT_USER}${NC}"
echo ""

# Get deployment environment
ENVIRONMENT=${1:-preview}

case $ENVIRONMENT in
    preview|staging|dev)
        DEPLOY_TARGET="preview"
        DEPLOY_FLAG=""
        echo -e "${BLUE}Deploying to: Preview/Staging${NC}"
        ;;
    production|prod)
        DEPLOY_TARGET="production"
        DEPLOY_FLAG="--prod"
        echo -e "${YELLOW}Deploying to: Production${NC}"
        ;;
    *)
        echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
        echo "Usage: ./scripts/deploy.sh [preview|production]"
        exit 1
        ;;
esac

echo ""

# Run pre-deployment checks
echo -e "${BLUE}Running pre-deployment checks...${NC}"
echo ""

# Check if .env.local exists (for local testing)
if [ ! -f .env.local ] && [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Warning: No .env.local or .env file found${NC}"
    echo "Make sure environment variables are configured in Vercel dashboard"
    echo ""
fi

# Run linting
echo -e "${BLUE}1/4 Running ESLint...${NC}"
if npm run lint; then
    echo -e "${GREEN}✓ Linting passed${NC}"
else
    echo -e "${RED}✗ Linting failed${NC}"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 1
    fi
fi
echo ""

# Run type checking
echo -e "${BLUE}2/4 Running TypeScript type check...${NC}"
if npm run type-check; then
    echo -e "${GREEN}✓ Type checking passed${NC}"
else
    echo -e "${RED}✗ Type checking failed${NC}"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 1
    fi
fi
echo ""

# Run tests
echo -e "${BLUE}3/4 Running tests...${NC}"
if npm test -- --passWithNoTests; then
    echo -e "${GREEN}✓ Tests passed${NC}"
else
    echo -e "${RED}✗ Tests failed${NC}"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 1
    fi
fi
echo ""

# Build check
echo -e "${BLUE}4/4 Running build check...${NC}"
if npm run build; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    echo "Deployment cannot proceed with a failed build"
    exit 1
fi
echo ""

# Production deployment confirmation
if [ "$DEPLOY_TARGET" = "production" ]; then
    echo -e "${YELLOW}⚠️  You are about to deploy to PRODUCTION${NC}"
    echo ""
    echo "Current git branch: $(git rev-parse --abbrev-ref HEAD)"
    echo "Latest commit: $(git log -1 --oneline)"
    echo ""
    read -p "Are you sure you want to continue? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 0
    fi
    echo ""
fi

# Deploy to Vercel
echo -e "${GREEN}Deploying to Vercel...${NC}"
echo ""

if vercel $DEPLOY_FLAG --yes; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ Deployment successful!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Get deployment URL
    if [ "$DEPLOY_TARGET" = "production" ]; then
        echo "Production URL: https://nrl-fan-hub.vercel.app"
    else
        echo "Preview URL: Check the output above for the deployment URL"
    fi

    echo ""
    echo "Next steps:"
    echo "  1. Verify deployment: curl https://nrl-fan-hub.vercel.app/healthz"
    echo "  2. Check logs: vercel logs --prod"
    echo "  3. Monitor: https://vercel.com/dashboard"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Deployment failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check Vercel dashboard: https://vercel.com/dashboard"
    echo "  2. Verify environment variables are set"
    echo "  3. Check build logs: vercel logs"
    echo ""
    exit 1
fi
