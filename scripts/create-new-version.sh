#!/bin/bash

# 새 버전 앱 생성 스크립트
# Usage: ./create-new-version.sh [new-app-name] [new-bundle-id]

NEW_APP_NAME=${1:-"CupNoteV2"}
NEW_BUNDLE_ID=${2:-"com.cupnote.v2"}
NEW_FOLDER_NAME="${NEW_APP_NAME}-$(date +%Y%m%d)"

echo "🚀 Creating new app version: $NEW_APP_NAME"
echo "📦 Bundle ID: $NEW_BUNDLE_ID"
echo "📁 Folder: $NEW_FOLDER_NAME"

# 1. 프로젝트 복사
echo "📋 Copying project..."
cp -r . "../$NEW_FOLDER_NAME"
cd "../$NEW_FOLDER_NAME"

# 2. 정리
echo "🧹 Cleaning up..."
rm -rf .git
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/build
rm -rf android/build
rm -rf android/app/build
rm -rf .expo
rm -rf coverage
rm -rf artifacts

# 3. package.json 업데이트
echo "📝 Updating package.json..."
sed -i '' "s/\"name\": \".*\"/\"name\": \"$NEW_APP_NAME\"/" package.json
sed -i '' "s/\"displayName\": \".*\"/\"displayName\": \"$NEW_APP_NAME\"/" package.json

# 4. app.json 업데이트 (있는 경우)
if [ -f "app.json" ]; then
    echo "📝 Updating app.json..."
    sed -i '' "s/\"name\": \".*\"/\"name\": \"$NEW_APP_NAME\"/" app.json
    sed -i '' "s/\"displayName\": \".*\"/\"displayName\": \"$NEW_APP_NAME\"/" app.json
fi

# 5. iOS 번들 ID 변경
echo "📱 Updating iOS bundle ID..."
find ios -name "*.pbxproj" -exec sed -i '' "s/com\.cupnote\.app/$NEW_BUNDLE_ID/g" {} \;
find ios -name "Info.plist" -exec sed -i '' "s/com\.cupnote\.app/$NEW_BUNDLE_ID/g" {} \;

# 6. Android 패키지명 변경
echo "🤖 Updating Android package name..."
sed -i '' "s/applicationId \".*\"/applicationId \"$NEW_BUNDLE_ID\"/" android/app/build.gradle
sed -i '' "s/<string name=\"app_name\">.*<\/string>/<string name=\"app_name\">$NEW_APP_NAME<\/string>/" android/app/src/main/res/values/strings.xml

# 7. Git 초기화
echo "🔄 Initializing new git repository..."
git init
git add .
git commit -m "Initial commit for $NEW_APP_NAME"

echo "✅ Done! New app created at: $(pwd)"
echo ""
echo "Next steps:"
echo "1. cd $(pwd)"
echo "2. npm install (or yarn install)"
echo "3. cd ios && pod install"
echo "4. npx react-native run-ios (or run-android)"
echo ""
echo "⚠️  Don't forget to:"
echo "- Update Firebase/Supabase configurations"
echo "- Change app icons and splash screens"
echo "- Update API endpoints if needed"
echo "- Configure new signing certificates"