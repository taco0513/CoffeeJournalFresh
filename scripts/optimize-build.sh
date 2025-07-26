#!/bin/bash

echo "🚀 CupNote Build Optimization Script"
echo "===================================="

# 1. Clean previous builds
echo "🧹 Cleaning previous builds..."
cd ios && xcodebuild clean && cd ..
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# 2. Clear Metro cache
echo "🗑️  Clearing Metro cache..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 5
kill $METRO_PID

# 3. Optimize Realm
echo "🔧 Optimizing Realm size..."
node scripts/optimize-realm.js

# 4. Remove dev dependencies for production
echo "📦 Optimizing node_modules..."
npm prune --production --legacy-peer-deps

# 5. Pod install with optimizations
echo "🍎 Installing iOS dependencies..."
cd ios
pod install --repo-update
cd ..

# 6. Build release version
echo "🏗️  Building optimized release..."
cd ios
xcodebuild -workspace CupNote.xcworkspace \
  -scheme CupNote \
  -configuration Release \
  -sdk iphoneos \
  -derivedDataPath build \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  ONLY_ACTIVE_ARCH=NO \
  EXCLUDED_ARCHS="armv7"

# 7. Check final app size
echo "📊 Checking final app size..."
APP_PATH="build/Build/Products/Release-iphoneos/CupNote.app"
if [ -d "$APP_PATH" ]; then
  APP_SIZE=$(du -sh "$APP_PATH" | cut -f1)
  echo "✅ Final app size: $APP_SIZE"
else
  echo "❌ Build failed - app not found"
fi

echo "🎉 Optimization complete!"