#!/bin/bash

# Setup Google OAuth for Android - Coffee Journal Fresh
# This script helps configure Google Sign-In for Android

set -e

echo "🤖 Setting up Google OAuth for Android..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "android/app/build.gradle" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    echo "Expected to find: android/app/build.gradle"
    exit 1
fi

echo -e "${BLUE}📋 Current Android setup status:${NC}"

# Check Android package name
PACKAGE_NAME=$(grep "applicationId" android/app/build.gradle | sed 's/.*"\(.*\)".*/\1/')
echo -e "${BLUE}📦 Package name: ${PACKAGE_NAME}${NC}"

# Check if Google Sign-In package is installed
if [ -d "node_modules/@react-native-google-signin" ]; then
    echo -e "${GREEN}✅ Google Sign-In package is installed${NC}"
else
    echo -e "${YELLOW}⚠️  Google Sign-In package not found, installing...${NC}"
    npm install @react-native-google-signin/google-signin
fi

# Check for google-services.json
if [ -f "android/app/google-services.json" ]; then
    echo -e "${GREEN}✅ google-services.json found${NC}"
else
    echo -e "${YELLOW}⚠️  google-services.json not found${NC}"
    echo "You'll need to download this from Firebase Console"
fi

# Check build.gradle for Google Services plugin
if grep -q "com.google.gms.google-services" android/app/build.gradle; then
    echo -e "${GREEN}✅ Google Services plugin configured in app/build.gradle${NC}"
else
    echo -e "${YELLOW}⚠️  Adding Google Services plugin to app/build.gradle${NC}"
    
    # Add plugin to the top of build.gradle
    if ! grep -q "id 'com.google.gms.google-services'" android/app/build.gradle; then
        # Create a backup
        cp android/app/build.gradle android/app/build.gradle.backup
        
        # Add the plugin after the android application plugin
        sed -i.tmp '/id "com.android.application"/a\
    id "com.google.gms.google-services"
' android/app/build.gradle
        
        rm android/app/build.gradle.tmp
        echo -e "${GREEN}✅ Added Google Services plugin to app/build.gradle${NC}"
    fi
fi

# Check project level build.gradle
if grep -q "com.google.gms:google-services" android/build.gradle; then
    echo -e "${GREEN}✅ Google Services classpath configured in project build.gradle${NC}"
else
    echo -e "${YELLOW}⚠️  Adding Google Services classpath to project build.gradle${NC}"
    
    # Create a backup
    cp android/build.gradle android/build.gradle.backup
    
    # Add classpath to dependencies
    sed -i.tmp '/classpath.*android.tools.build:gradle/a\
        classpath "com.google.gms:google-services:4.4.0"
' android/build.gradle
    
    rm android/build.gradle.tmp
    echo -e "${GREEN}✅ Added Google Services classpath to project build.gradle${NC}"
fi

# Generate SHA-1 fingerprint for debug keystore
echo -e "${BLUE}🔑 Generating SHA-1 fingerprint for debug keystore:${NC}"
if [ -f "android/app/debug.keystore" ]; then
    SHA1=$(keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep "SHA1:" | cut -d' ' -f3)
    echo -e "${GREEN}Debug SHA-1: ${SHA1}${NC}"
else
    echo -e "${YELLOW}⚠️  Debug keystore not found, generating...${NC}"
    keytool -genkey -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
    SHA1=$(keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep "SHA1:" | cut -d' ' -f3)
    echo -e "${GREEN}Generated debug SHA-1: ${SHA1}${NC}"
fi

echo -e "${BLUE}📝 Next steps for Android:${NC}"
echo "1. Go to Google Cloud Console (https://console.cloud.google.com)"
echo "2. Create Android OAuth client:"
echo "   - Application type: Android"
echo "   - Package name: ${PACKAGE_NAME}"
echo "   - SHA-1 certificate fingerprint: ${SHA1}"
echo "3. Download google-services.json and place in android/app/"
echo "4. Add your Android client ID to .env:"
echo "   GOOGLE_OAUTH_ANDROID_CLIENT_ID=your_android_client_id.apps.googleusercontent.com"
echo "5. Clean and rebuild: cd android && ./gradlew clean && cd .. && npx react-native run-android"

echo -e "${GREEN}🚀 Android Google OAuth setup script completed!${NC}"

# Check if we can provide the reversed client ID
if [ -f ".env" ]; then
    ANDROID_CLIENT_ID=$(grep "GOOGLE_OAUTH_ANDROID_CLIENT_ID" .env | cut -d '=' -f2)
    if [ ! -z "$ANDROID_CLIENT_ID" ]; then
        echo -e "${BLUE}💡 Your Android client ID is configured in .env${NC}"
    fi
fi