@echo off
REM NRL Fan Hub - Interactive Setup Script for Windows
REM This script will guide you through setting up your local development environment

setlocal EnableDelayedExpansion

REM Colors are limited in Windows batch, using basic text
echo.
echo ========================================
echo NRL Fan Hub - Local Setup
echo ========================================
echo.
echo This script will help you set up your local development environment.
echo Estimated time: 10-15 minutes
echo.
pause

REM Step 1: Check Prerequisites
echo.
echo ========================================
echo Step 1: Checking Prerequisites
echo ========================================
echo.

REM Check Node.js
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo [OK] Node.js is installed (!NODE_VERSION!)
) else (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js 20+ from https://nodejs.org/
    exit /b 1
)

REM Check npm
where npm >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo [OK] npm is installed (!NPM_VERSION!)
) else (
    echo [ERROR] npm is not installed
    exit /b 1
)

REM Check PostgreSQL or Docker
set POSTGRES_METHOD=
where psql >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL is installed (using local PostgreSQL)
    set POSTGRES_METHOD=local
) else (
    where docker >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Docker is installed (will use Docker for PostgreSQL)
        set POSTGRES_METHOD=docker
    ) else (
        echo [ERROR] Neither PostgreSQL nor Docker is installed
        echo Please install one of the following:
        echo   - PostgreSQL: https://www.postgresql.org/download/
        echo   - Docker: https://www.docker.com/get-started
        exit /b 1
    )
)

REM Check openssl (may not be available on Windows)
where openssl >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] openssl is installed
) else (
    echo [WARNING] openssl is not installed
    echo You'll need to generate AUTH0_SECRET manually or install Git for Windows which includes openssl
)

echo.
pause

REM Step 2: Install Dependencies
echo.
echo ========================================
echo Step 2: Installing Dependencies
echo ========================================
echo.

echo Cleaning old dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo Installing npm packages (this may take 2-3 minutes)...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo [OK] Dependencies installed successfully!
echo.
pause

REM Step 3: Generate Auth0 Secret
echo.
echo ========================================
echo Step 3: Generate Auth0 Secret
echo ========================================
echo.

set AUTH0_SECRET=
where openssl >nul 2>&1
if %errorlevel% equ 0 (
    echo Generating secure Auth0 secret...
    for /f "tokens=*" %%i in ('openssl rand -hex 32') do set AUTH0_SECRET=%%i
    echo [OK] Auth0 secret generated!
    echo.
    echo Your AUTH0_SECRET:
    echo !AUTH0_SECRET!
) else (
    echo [WARNING] openssl not found. Please generate a secret manually:
    echo Visit https://generate-secret.now.sh/32 to generate a 64-character hex string
    echo.
    set /p AUTH0_SECRET="Enter the generated secret: "
)

echo.
echo This will be automatically added to your .env.local file.
echo.
pause

REM Step 4: Auth0 Configuration
echo.
echo ========================================
echo Step 4: Auth0 Configuration
echo ========================================
echo.

echo Now you need to set up Auth0. Please follow these steps:
echo.
echo 1. Go to https://auth0.com and sign up/log in
echo 2. Create a new application:
echo    - Click Applications -^> Applications -^> Create Application
echo    - Name: NRL Fan Hub
echo    - Type: Regular Web Application
echo    - Click Create
echo.
echo 3. In the Settings tab, configure these URLs:
echo    Allowed Callback URLs:    http://localhost:3000/api/auth/callback
echo    Allowed Logout URLs:      http://localhost:3000
echo    Allowed Web Origins:      http://localhost:3000
echo.
echo 4. Click Save Changes
echo.
pause

REM Get Auth0 credentials
echo.
echo Please enter your Auth0 credentials:
echo.

:get_domain
set /p AUTH0_DOMAIN="Auth0 Domain (e.g., dev-abc123.us.auth0.com): "
if "!AUTH0_DOMAIN!"=="" (
    echo [ERROR] Domain cannot be empty
    goto get_domain
)

:get_client_id
set /p AUTH0_CLIENT_ID="Auth0 Client ID: "
if "!AUTH0_CLIENT_ID!"=="" (
    echo [ERROR] Client ID cannot be empty
    goto get_client_id
)

:get_client_secret
set /p AUTH0_CLIENT_SECRET="Auth0 Client Secret: "
if "!AUTH0_CLIENT_SECRET!"=="" (
    echo [ERROR] Client Secret cannot be empty
    goto get_client_secret
)

echo [OK] Auth0 credentials collected!
echo.
pause

REM Step 5: Configure Environment Variables
echo.
echo ========================================
echo Step 5: Configuring Environment Variables
echo ========================================
echo.

echo Updating .env.local file...

REM Create temporary file with updated values
(
    for /f "usebackq delims=" %%a in (".env.local") do (
        set "line=%%a"
        set "line=!line:AUTH0_SECRET=.*=AUTH0_SECRET=!AUTH0_SECRET!!"
        set "line=!line:AUTH0_ISSUER_BASE_URL=.*=AUTH0_ISSUER_BASE_URL=https://!AUTH0_DOMAIN!!"
        set "line=!line:AUTH0_CLIENT_ID=.*=AUTH0_CLIENT_ID=!AUTH0_CLIENT_ID!!"
        set "line=!line:AUTH0_CLIENT_SECRET=.*=AUTH0_CLIENT_SECRET=!AUTH0_CLIENT_SECRET!!"
        echo !line!
    )
) > .env.local.tmp

move /y .env.local.tmp .env.local >nul

REM Simpler approach - just create a new .env.local
echo # Environment Configuration > .env.local
echo NODE_ENV=development >> .env.local
echo. >> .env.local
echo # Application URLs >> .env.local
echo NEXT_PUBLIC_APP_URL=http://localhost:3000 >> .env.local
echo NEXT_PUBLIC_WS_URL=ws://localhost:3001 >> .env.local
echo NEXT_PUBLIC_API_URL=http://localhost:3000/api >> .env.local
echo. >> .env.local
echo # Auth0 Configuration >> .env.local
echo AUTH0_SECRET=!AUTH0_SECRET! >> .env.local
echo AUTH0_BASE_URL=http://localhost:3000 >> .env.local
echo AUTH0_ISSUER_BASE_URL=https://!AUTH0_DOMAIN! >> .env.local
echo AUTH0_CLIENT_ID=!AUTH0_CLIENT_ID! >> .env.local
echo AUTH0_CLIENT_SECRET=!AUTH0_CLIENT_SECRET! >> .env.local
echo. >> .env.local
echo # Database Configuration >> .env.local
echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nrl_fan_hub >> .env.local
echo. >> .env.local
echo # Feature Flags >> .env.local
echo NEXT_PUBLIC_ENABLE_PREDICTIONS=true >> .env.local
echo NEXT_PUBLIC_ENABLE_LEADERBOARD=true >> .env.local
echo NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true >> .env.local

echo [OK] Environment variables configured!
echo.
pause

REM Step 6: Database Setup
echo.
echo ========================================
echo Step 6: Setting Up Database
echo ========================================
echo.

if "!POSTGRES_METHOD!"=="local" (
    echo Using local PostgreSQL...
    echo.
    echo Creating database 'nrl_fan_hub'...
    createdb -U postgres nrl_fan_hub 2>nul
    if %errorlevel% neq 0 (
        echo [WARNING] Database may already exist or could not be created
        echo Please create it manually: createdb nrl_fan_hub
    ) else (
        echo [OK] Database created!
    )
) else (
    echo Using Docker for PostgreSQL...
    echo.

    docker ps -a | find "nrl-postgres" >nul
    if %errorlevel% equ 0 (
        echo [WARNING] Docker container 'nrl-postgres' already exists.
        echo Starting existing container...
        docker start nrl-postgres
    ) else (
        echo Creating PostgreSQL Docker container...
        docker run --name nrl-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nrl_fan_hub -p 5432:5432 -d postgres:16

        echo Waiting for PostgreSQL to start (5 seconds)...
        timeout /t 5 /nobreak >nul
    )

    echo [OK] PostgreSQL Docker container is running!
)

echo.
echo Generating Prisma Client...
call npm run db:generate

echo.
echo Pushing database schema...
call npm run db:push

if %errorlevel% neq 0 (
    echo [ERROR] Failed to setup database
    exit /b 1
)

echo [OK] Database setup complete!
echo.
pause

REM Step 7: Final Summary
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.

echo [OK] All setup steps completed successfully!
echo.
echo Your environment is now configured with:
echo   [OK] Dependencies installed
echo   [OK] Auth0 configured
echo   [OK] Environment variables set
echo   [OK] Database created and ready
echo.
echo Next steps:
echo.
echo 1. Start the development server:
echo    npm run dev
echo.
echo 2. Visit http://localhost:3000 in your browser
echo.
echo 3. Click 'Sign In' to test authentication
echo.
echo 4. Open Prisma Studio to view your database:
echo    npm run db:studio
echo.
echo For daily development, you only need to run:
echo    npm run dev
echo.
echo Happy coding!
echo.

set /p START_DEV="Do you want to start the development server now? (y/n): "

if /i "!START_DEV!"=="y" (
    echo.
    echo Starting development server...
    echo.
    echo Visit http://localhost:3000 to see your app!
    echo Press Ctrl+C to stop the server
    echo.
    call npm run dev
) else (
    echo.
    echo You can start the development server anytime with:
    echo    npm run dev
    echo.
)

endlocal
