#!/bin/bash

# Coffee Journal Fresh - App Screenshots Script
# 앱의 모든 주요 화면들을 자동으로 스크린샷으로 저장합니다.

echo "📸 Coffee Journal Fresh - Screenshots"
echo "===================================="

# Create screenshots directory
SCREENSHOTS_DIR="./screenshots"
mkdir -p $SCREENSHOTS_DIR

# Function to take screenshot with delay
take_screenshot() {
    local filename=$1
    local description=$2
    echo "📸 Taking screenshot: $description"
    xcrun simctl io booted screenshot "$SCREENSHOTS_DIR/$filename"
    sleep 2
}

# Take initial screenshots
echo "📱 Starting screenshot capture..."

# 1. Home Screen (already visible)
take_screenshot "01-home-screen.png" "Home Screen"

# Note: The following screenshots would require manual navigation
# or automated UI testing framework like Appium/Detox

echo ""
echo "🎯 Manual Navigation Required:"
echo "To capture all screens, please manually navigate to each screen and run:"
echo ""
echo "2. Journal Screen:"
echo "   xcrun simctl io booted screenshot $SCREENSHOTS_DIR/02-journal-screen.png"
echo ""
echo "3. Stats Screen:"
echo "   xcrun simctl io booted screenshot $SCREENSHOTS_DIR/03-stats-screen.png"
echo ""
echo "4. Profile Screen:"
echo "   xcrun simctl io booted screenshot $SCREENSHOTS_DIR/04-profile-screen.png"
echo ""
echo "5. Coffee Info Entry:"
echo "   xcrun simctl io booted screenshot $SCREENSHOTS_DIR/05-coffee-info.png"
echo ""
echo "6. Flavor Selection:"
echo "   xcrun simctl io booted screenshot $SCREENSHOTS_DIR/06-flavor-selection.png"
echo ""
echo "7. Sensory Evaluation:"
echo "   xcrun simctl io booted screenshot $SCREENSHOTS_DIR/07-sensory-evaluation.png"
echo ""
echo "8. Personal Taste Dashboard:"
echo "   xcrun simctl io booted screenshot $SCREENSHOTS_DIR/08-personal-taste.png"
echo ""
echo "9. Data Test Screen:"
echo "   xcrun simctl io booted screenshot $SCREENSHOTS_DIR/09-data-test.png"
echo ""
echo "10. Developer Screen:"
echo "    xcrun simctl io booted screenshot $SCREENSHOTS_DIR/10-developer-screen.png"
echo ""

echo "✅ Screenshot script completed!"
echo "📁 Screenshots saved to: $SCREENSHOTS_DIR/"
echo ""
echo "🔧 Tip: You can also use the iOS Simulator menu:"
echo "   Device > Screenshot (Cmd+S)"