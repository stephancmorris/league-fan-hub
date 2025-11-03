#!/bin/bash

# NRL Fan Hub - Interactive Setup Script
# This script will guide you through setting up your local development environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Welcome message
clear
print_header "NRL Fan Hub - Local Setup"
echo "This script will help you set up your local development environment."
echo "Estimated time: 10-15 minutes"
echo ""
read -p "Press Enter to continue..."

# Step 1: Check Prerequisites
print_header "Step 1: Checking Prerequisites"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js is installed ($NODE_VERSION)"
else
    print_error "Node.js is not installed"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm is installed ($NPM_VERSION)"
else
    print_error "npm is not installed"
    exit 1
fi

# Check PostgreSQL or Docker
POSTGRES_METHOD=""
if command -v psql &> /dev/null; then
    print_success "PostgreSQL is installed (using local PostgreSQL)"
    POSTGRES_METHOD="local"
elif command -v docker &> /dev/null; then
    print_success "Docker is installed (will use Docker for PostgreSQL)"
    POSTGRES_METHOD="docker"
else
    print_error "Neither PostgreSQL nor Docker is installed"
    echo "Please install one of the following:"
    echo "  - PostgreSQL: https://www.postgresql.org/download/"
    echo "  - Docker: https://www.docker.com/get-started"
    exit 1
fi

# Check openssl
if command -v openssl &> /dev/null; then
    print_success "openssl is installed"
else
    print_error "openssl is not installed"
    exit 1
fi

echo ""
read -p "All prerequisites satisfied! Press Enter to continue..."

# Step 2: Install Dependencies
print_header "Step 2: Installing Dependencies"

print_info "Cleaning old dependencies..."
rm -rf node_modules package-lock.json 2>/dev/null || true

print_info "Installing npm packages (this may take 2-3 minutes)..."
npm install

if [ $? -ne 0 ]; then
    print_error "npm install failed. You may need to fix permissions."
    print_info "Try running: sudo chown -R $USER:$(id -gn) ."
    exit 1
fi

print_success "Dependencies installed successfully!"
echo ""
read -p "Press Enter to continue..."

# Step 3: Generate Auth0 Secret
print_header "Step 3: Generate Auth0 Secret"

print_info "Generating secure Auth0 secret..."
AUTH0_SECRET=$(openssl rand -hex 32)
print_success "Auth0 secret generated!"
echo ""
echo "Your AUTH0_SECRET:"
echo -e "${GREEN}${AUTH0_SECRET}${NC}"
echo ""
echo "This will be automatically added to your .env.local file."
echo ""
read -p "Press Enter to continue..."

# Step 4: Auth0 Configuration
print_header "Step 4: Auth0 Configuration"

echo "Now you need to set up Auth0. Please follow these steps:"
echo ""
echo "1. Go to https://auth0.com and sign up/log in"
echo "2. Create a new application:"
echo "   - Click Applications → Applications → Create Application"
echo "   - Name: NRL Fan Hub"
echo "   - Type: Regular Web Application"
echo "   - Click Create"
echo ""
echo "3. In the Settings tab, configure these URLs:"
echo "   Allowed Callback URLs:    http://localhost:3000/api/auth/callback"
echo "   Allowed Logout URLs:      http://localhost:3000"
echo "   Allowed Web Origins:      http://localhost:3000"
echo ""
echo "4. Click Save Changes"
echo ""
read -p "Press Enter when you've completed the Auth0 setup..."

# Get Auth0 credentials
print_info "Please enter your Auth0 credentials:"
echo ""

read -p "Auth0 Domain (e.g., dev-abc123.us.auth0.com): " AUTH0_DOMAIN
while [[ -z "$AUTH0_DOMAIN" ]]; do
    print_error "Domain cannot be empty"
    read -p "Auth0 Domain: " AUTH0_DOMAIN
done

read -p "Auth0 Client ID: " AUTH0_CLIENT_ID
while [[ -z "$AUTH0_CLIENT_ID" ]]; do
    print_error "Client ID cannot be empty"
    read -p "Auth0 Client ID: " AUTH0_CLIENT_ID
done

read -p "Auth0 Client Secret: " AUTH0_CLIENT_SECRET
while [[ -z "$AUTH0_CLIENT_SECRET" ]]; do
    print_error "Client Secret cannot be empty"
    read -p "Auth0 Client Secret: " AUTH0_CLIENT_SECRET
done

print_success "Auth0 credentials collected!"
echo ""
read -p "Press Enter to continue..."

# Step 5: Configure Environment Variables
print_header "Step 5: Configuring Environment Variables"

print_info "Updating .env.local file..."

# Update .env.local with actual values
sed -i.bak "s|AUTH0_SECRET=.*|AUTH0_SECRET=${AUTH0_SECRET}|" .env.local
sed -i.bak "s|AUTH0_ISSUER_BASE_URL=.*|AUTH0_ISSUER_BASE_URL=https://${AUTH0_DOMAIN}|" .env.local
sed -i.bak "s|AUTH0_CLIENT_ID=.*|AUTH0_CLIENT_ID=${AUTH0_CLIENT_ID}|" .env.local
sed -i.bak "s|AUTH0_CLIENT_SECRET=.*|AUTH0_CLIENT_SECRET=${AUTH0_CLIENT_SECRET}|" .env.local

# Remove backup file
rm .env.local.bak

print_success "Environment variables configured!"
echo ""
read -p "Press Enter to continue..."

# Step 6: Database Setup
print_header "Step 6: Setting Up Database"

if [ "$POSTGRES_METHOD" = "local" ]; then
    print_info "Using local PostgreSQL..."

    # Check if database exists
    if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw nrl_fan_hub; then
        print_warning "Database 'nrl_fan_hub' already exists. Skipping creation."
    else
        print_info "Creating database 'nrl_fan_hub'..."
        createdb nrl_fan_hub 2>/dev/null || {
            print_warning "Could not create database with default user. Trying with postgres user..."
            createdb -U postgres nrl_fan_hub || {
                print_error "Failed to create database. Please create it manually:"
                echo "  createdb nrl_fan_hub"
                exit 1
            }
        }
        print_success "Database created!"
    fi
else
    print_info "Using Docker for PostgreSQL..."

    # Check if container exists
    if docker ps -a | grep -q nrl-postgres; then
        print_warning "Docker container 'nrl-postgres' already exists."
        print_info "Starting existing container..."
        docker start nrl-postgres || true
    else
        print_info "Creating PostgreSQL Docker container..."
        docker run --name nrl-postgres \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=nrl_fan_hub \
            -p 5432:5432 \
            -d postgres:16

        print_info "Waiting for PostgreSQL to start (5 seconds)..."
        sleep 5
    fi

    print_success "PostgreSQL Docker container is running!"
fi

echo ""
print_info "Generating Prisma Client..."
npm run db:generate

echo ""
print_info "Pushing database schema..."
npm run db:push

print_success "Database setup complete!"
echo ""
read -p "Press Enter to continue..."

# Step 7: Final Summary
print_header "Setup Complete!"

echo -e "${GREEN}✓ All setup steps completed successfully!${NC}"
echo ""
echo "Your environment is now configured with:"
echo "  ✓ Dependencies installed"
echo "  ✓ Auth0 configured"
echo "  ✓ Environment variables set"
echo "  ✓ Database created and ready"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the development server:"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo "2. Visit http://localhost:3000 in your browser"
echo ""
echo "3. Click 'Sign In' to test authentication"
echo ""
echo "4. Open Prisma Studio to view your database:"
echo -e "   ${BLUE}npm run db:studio${NC}"
echo ""
echo "For daily development, you only need to run:"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo "Happy coding! 🎉"
echo ""

# Ask if user wants to start dev server
read -p "Do you want to start the development server now? (y/n): " START_DEV

if [[ "$START_DEV" =~ ^[Yy]$ ]]; then
    echo ""
    print_info "Starting development server..."
    echo ""
    echo "Visit http://localhost:3000 to see your app!"
    echo "Press Ctrl+C to stop the server"
    echo ""
    npm run dev
else
    echo ""
    print_info "You can start the development server anytime with:"
    echo -e "   ${BLUE}npm run dev${NC}"
    echo ""
fi
