#!/bin/bash
# Aurora Deployment Script - Linux/macOS
# Usage: ./deploy.sh [environment]
# Environments: staging, production

set -e

ENVIRONMENT=${1:-staging}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Aurora Deployment - $ENVIRONMENT"
echo "=================================="

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "   Supported: staging, production"
    exit 1
fi

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [[ $NODE_VERSION -lt 18 ]]; then
    echo "❌ Node.js version 18+ required (found: $NODE_VERSION)"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo "✅ npm $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci

# Run lint check
echo ""
echo "🔍 Running lint check..."
npm run lint:strict

# Build production artifact
echo ""
echo "🔨 Building production artifact..."
npm run build:ci

# Validate build
if [[ ! -d ".next-build" ]]; then
    echo "❌ Build failed: .next-build directory not found"
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""

# Environment-specific deployment
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "⚠️  PRODUCTION DEPLOYMENT"
    echo "=================================="
    read -p "Are you sure? This will deploy to production. Type 'yes' to confirm: " confirm
    if [[ "$confirm" != "yes" ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Create deployment archive
echo ""
echo "📦 Creating deployment package..."
ARCHIVE_NAME="aurora-build-$(date +%Y%m%d-%H%M%S).tar.gz"
tar --exclude node_modules --exclude .git --exclude .next-dev -czf "$ARCHIVE_NAME" \
    .next-build/ package.json package-lock.json .env.example

echo "✅ Archive created: $ARCHIVE_NAME"
echo ""

# Deployment instructions
cat << EOF
================================
✅ DEPLOYMENT READY
================================

Environment: $ENVIRONMENT
Archive: $ARCHIVE_NAME
Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)

Next Steps:
1. Transfer archive to target server
2. Extract: tar -xzf $ARCHIVE_NAME
3. Set environment variables (.env.local)
4. Run migrations: npm run db:migrate
5. Start server: npm start

Or use automated deployment:
  - Vercel: git push to main branch (auto-deploy)
  - Docker: docker build -t aurora:latest .
  - K8s: kubectl apply -f k8s-manifest.yaml

Health Check:
  curl https://yourdomain/api/health

Rollback:
  Keep this archive for quick rollback if needed
EOF

echo ""
echo "🎉 Deployment preparation complete!"
