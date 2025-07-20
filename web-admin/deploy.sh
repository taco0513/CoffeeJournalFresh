#!/bin/bash

# Coffee Journal Admin - Production Deployment Script
# This script sets up and deploys the web admin dashboard to Vercel

set -e

echo "☕ Coffee Journal Admin - Production Deployment"
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -f "next.config.mjs" ]; then
    echo "❌ Error: Please run this script from the web-admin directory"
    exit 1
fi

# Build and type check
echo "🔍 Running type check..."
npm run type-check

echo "🏗️ Building for production..."
npm run build

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up custom domain in Vercel dashboard"
echo "2. Configure environment variables in Vercel"
echo "3. Set up Supabase production database"
echo "4. Configure admin user accounts"
echo "5. Test the production deployment"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"
echo "📚 Documentation: See DEPLOYMENT.md for detailed setup"