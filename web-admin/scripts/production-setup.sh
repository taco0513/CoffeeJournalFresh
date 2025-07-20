#!/bin/bash

# Coffee Journal Admin - Complete Production Setup Script
# This script automates the entire production deployment process

set -e

echo "☕ Coffee Journal Admin - Production Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
print_step "Checking prerequisites..."

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -f "next.config.mjs" ]; then
    print_error "Please run this script from the web-admin directory"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_success "Prerequisites check passed"

# Install dependencies
print_step "Installing dependencies..."
npm ci
print_success "Dependencies installed"

# Type check
print_step "Running type check..."
if npm run type-check; then
    print_success "Type check passed"
else
    print_warning "Type check failed, but continuing..."
fi

# Build the project
print_step "Building for production..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Check if Vercel CLI is installed
print_step "Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    print_success "Vercel CLI installed"
fi

# Login to Vercel (if not already logged in)
print_step "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please login:"
    vercel login
fi

print_success "Vercel authentication verified"

# Environment variables setup
print_step "Environment variables setup..."
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Creating from template..."
    cp .env.example .env.production
    print_warning "Please edit .env.production with your actual values before deploying"
else
    print_success ".env.production exists"
fi

# Deploy to Vercel
print_step "Deploying to Vercel..."
echo ""
echo "This will deploy your Coffee Journal Admin Dashboard to production."
echo "Make sure you have:"
echo "1. ✅ Configured your .env.production file"
echo "2. ✅ Set up your Supabase production database"
echo "3. ✅ Configured admin user accounts"
echo ""
read -p "Continue with deployment? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if vercel --prod; then
        print_success "Deployment completed successfully!"
        echo ""
        echo "🎉 Your Coffee Journal Admin Dashboard is now live!"
        echo ""
        echo "📋 Next steps:"
        echo "1. Configure environment variables in Vercel dashboard"
        echo "2. Set up custom domain (optional)"
        echo "3. Run database setup scripts in Supabase"
        echo "4. Create admin user accounts"
        echo "5. Test the production deployment"
        echo ""
        echo "🔗 Useful links:"
        echo "• Vercel Dashboard: https://vercel.com/dashboard"
        echo "• Supabase Dashboard: https://supabase.com/dashboard"
        echo "• Documentation: See DEPLOYMENT.md for detailed instructions"
        echo ""
    else
        print_error "Deployment failed"
        exit 1
    fi
else
    print_warning "Deployment cancelled"
    echo "When you're ready to deploy, run: vercel --prod"
fi

echo ""
print_success "Production setup script completed!"
echo ""
echo "📚 For detailed setup instructions, see:"
echo "• DEPLOYMENT.md - Complete deployment guide"
echo "• scripts/setup-production-db.sql - Database setup"
echo "• scripts/setup-admin-users.sql - Admin user configuration"
echo ""
echo "🆘 Need help? Check the troubleshooting section in DEPLOYMENT.md"