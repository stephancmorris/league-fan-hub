#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step, total, message) {
  log(`\n[${step}/${total}] ${message}`, 'blue')
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green')
}

function logError(message) {
  log(`✗ ${message}`, 'red')
}

function logWarning(message) {
  log(`  ${message}`, 'yellow')
}

function runCommand(command, errorMessage) {
  try {
    execSync(command, { stdio: 'inherit' })
    return true
  } catch (error) {
    logError(errorMessage)
    return false
  }
}

async function main() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  log('   NRL Fan Hub - Setup with Sample Data', 'blue')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue')

  // Check for .env file
  const envPath = path.join(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) {
    logError('Error: .env file not found')
    logWarning('Please create a .env file with your database and Auth0 configuration')
    logWarning('See .env.example for required variables\n')
    process.exit(1)
  }

  // Step 1: Install dependencies
  logStep(1, 6, 'Installing dependencies...')
  if (!runCommand('npm install --legacy-peer-deps', 'Failed to install dependencies')) {
    process.exit(1)
  }
  logSuccess('Dependencies installed\n')

  // Step 2: Install tsx
  logStep(2, 6, 'Installing tsx for TypeScript execution...')
  if (!runCommand('npm install --save-dev tsx', 'Failed to install tsx')) {
    process.exit(1)
  }
  logSuccess('tsx installed\n')

  // Step 3: Generate Prisma client
  logStep(3, 6, 'Generating Prisma client...')
  if (!runCommand('npm run db:generate', 'Failed to generate Prisma client')) {
    process.exit(1)
  }
  logSuccess('Prisma client generated\n')

  // Step 4: Push database schema
  logStep(4, 6, 'Pushing database schema...')
  if (!runCommand('npm run db:push', 'Failed to push database schema')) {
    process.exit(1)
  }
  logSuccess('Database schema updated\n')

  // Step 5: Seed database
  logStep(5, 6, 'Seeding database with sample matches...')
  if (!runCommand('npm run db:seed', 'Failed to seed database')) {
    process.exit(1)
  }
  logSuccess('Database seeded with sample data')
  logWarning('• 2 LIVE matches')
  logWarning('• 4 UPCOMING matches')
  logWarning('• 3 COMPLETED matches\n')

  // Step 6: Start dev server
  logStep(6, 6, 'Starting development server...')
  logSuccess('Setup complete!\n')

  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  log('🚀 Starting NRL Fan Hub...', 'green')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue')
  logWarning('   Next.js:   http://localhost:3000')
  logWarning('   WebSocket: ws://localhost:3001')
  logWarning('   Matches:   http://localhost:3000/matches\n')

  // Start the dev server (this will block)
  runCommand('npm run dev', 'Failed to start development server')
}

main().catch((error) => {
  logError(`Unexpected error: ${error.message}`)
  process.exit(1)
})
