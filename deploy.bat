@echo off
REM Aurora Deployment Script - Windows
REM Usage: deploy.bat [environment]
REM Environments: staging, production

setlocal enabledelayedexpansion

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=staging

if "%ENVIRONMENT%"!="staging" if "%ENVIRONMENT%"!="production" (
    echo ❌ Invalid environment: %ENVIRONMENT%
    echo    Supported: staging, production
    exit /b 1
)

echo 🚀 Aurora Deployment - %ENVIRONMENT%
echo ==================================

REM Check prerequisites
echo 📋 Checking prerequisites...

for /f "tokens=*" %%i in ('node -v 2^>nul') do set NODE_VERSION=%%i
if "%NODE_VERSION%"=="" (
    echo ❌ Node.js not found. Please install Node.js 18+
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v 2^>nul') do set NPM_VERSION=%%i
if "%NPM_VERSION%"=="" (
    echo ❌ npm not found. Please install npm
    exit /b 1
)

echo ✅ %NODE_VERSION%
echo ✅ npm %NPM_VERSION%

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm ci
if %ERRORLEVEL% neq 0 (
    echo ❌ npm ci failed
    exit /b 1
)

REM Run lint check
echo.
echo 🔍 Running lint check...
call npm run lint:strict
if %ERRORLEVEL% neq 0 (
    echo ❌ Lint check failed
    exit /b 1
)

REM Build production artifact
echo.
echo 🔨 Building production artifact...
call npm run build:ci
if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed
    exit /b 1
)

REM Validate build
if not exist ".next-build" (
    echo ❌ Build failed: .next-build directory not found
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.

REM Environment-specific confirmation
if "%ENVIRONMENT%"=="production" (
    echo ⚠️  PRODUCTION DEPLOYMENT
    echo ==================================
    set /p confirm="Are you sure? This will deploy to production. Type 'yes' to confirm: "
    if not "!confirm!"=="yes" (
        echo ❌ Deployment cancelled
        exit /b 1
    )
)

REM Create deployment archive
echo.
echo 📦 Creating deployment package...

for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set ARCHIVE_NAME=aurora-build-%mydate%-%mytime%.zip

REM Create ZIP archive using PowerShell
powershell -Command "& {Add-Type -AssemblyName System.IO.Compression.FileSystem; @('.next-build', 'package.json', 'package-lock.json', '.env.example') | Where-Object {Test-Path $_} | ForEach-Object {[System.IO.Compression.ZipFile]::CreateFromDirectory((Resolve-Path $_).Path, '%ARCHIVE_NAME%', [System.IO.Compression.CompressionLevel]::Optimal, $true)}}"

if exist "%ARCHIVE_NAME%" (
    echo ✅ Archive created: %ARCHIVE_NAME%
) else (
    echo ⚠️  Archive creation skipped (manual packaging required)
)

echo.
echo ==================================================
echo ✅ DEPLOYMENT READY
echo ==================================================
echo.
echo Environment: %ENVIRONMENT%
if exist "%ARCHIVE_NAME%" (
    echo Archive: %ARCHIVE_NAME%
)
echo Timestamp: %date% %time%
echo.
echo Next Steps:
echo 1. Transfer build to target server
echo 2. Set environment variables (.env.local)
echo 3. Run migrations: npm run db:migrate
echo 4. Start server: npm start
echo.
echo Or use automated deployment:
echo   - Vercel: git push to main branch (auto-deploy)
echo   - Docker: docker build -t aurora:latest .
echo   - IIS: Configure Node.js app pool or use iisnode
echo.
echo Health Check:
echo   curl https://yourdomain/api/health
echo.
echo 🎉 Deployment preparation complete!
echo.
