#!/bin/bash

# Setup Google OAuth for iOS - CupNote
# This script helps configure Google Sign-In for iOS

set -e

echo "🔧 Setting up Google OAuth for iOS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "ios/CupNote/Info.plist" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    echo "Expected to find: ios/CupNote/Info.plist"
    exit 1
fi

echo -e "${BLUE}📋 Current setup status:${NC}"

# Check if Google Sign-In package is installed
if [ -d "node_modules/@react-native-google-signin" ]; then
    echo -e "${GREEN}✅ Google Sign-In package is installed${NC}"
else
    echo -e "${YELLOW}⚠️  Google Sign-In package not found, installing...${NC}"
    npm install @react-native-google-signin/google-signin
fi

# Check if Info.plist has Google URL scheme
if grep -q "GOOGLE_REVERSED_CLIENT_ID" ios/CupNote/Info.plist; then
    echo -e "${GREEN}✅ Info.plist is configured for Google Sign-In${NC}"
else
    echo -e "${RED}❌ Info.plist missing Google Sign-In configuration${NC}"
    echo "Please add the Google URL scheme to Info.plist"
fi

# Check for pods
if [ -f "ios/Podfile.lock" ]; then
    echo -e "${GREEN}✅ CocoaPods dependencies are installed${NC}"
else
    echo -e "${YELLOW}⚠️  Installing CocoaPods dependencies...${NC}"
    cd ios && pod install && cd ..
fi

echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Complete Google Cloud Console setup (see docs/GOOGLE_CLOUD_SETUP_GUIDE.md)"
echo "2. Add your credentials to .env file:"
echo "   GOOGLE_OAUTH_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com"
echo "   GOOGLE_OAUTH_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com"
echo "3. Add GOOGLE_REVERSED_CLIENT_ID to Xcode build settings:"
echo "   - Open ios/CupNote.xcworkspace in Xcode"
echo "   - Select CupNote target"
echo "   - Go to Build Settings > User-Defined"
echo "   - Add GOOGLE_REVERSED_CLIENT_ID = com.googleusercontent.apps.YOUR_CLIENT_ID_NUMBER"
echo "4. Rebuild the app: npx react-native run-ios"

echo -e "${GREEN}🚀 iOS Google OAuth setup script completed!${NC}"

# Function to extract client ID from environment
extract_client_id() {
    if [ -f ".env" ]; then
        local ios_client_id=$(grep "GOOGLE_OAUTH_IOS_CLIENT_ID" .env | cut -d '=' -f2)
        if [ ! -z "$ios_client_id" ]; then
            # Extract the number part before the first dot
            local client_id_number=$(echo "$ios_client_id" | cut -d '.' -f1)
            echo -e "${BLUE}💡 Your GOOGLE_REVERSED_CLIENT_ID should be:${NC}"
            echo "   com.googleusercontent.apps.${client_id_number}"
        fi
    fi
}

extract_client_id