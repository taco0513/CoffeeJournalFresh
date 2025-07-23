#!/bin/bash

# Fix for Xcode 16 sandbox issues with Hermes framework
DERIVED_DATA=$(find ~/Library/Developer/Xcode/DerivedData -name "CupNote-*" -type d | head -1)

if [ -z "$DERIVED_DATA" ]; then
    echo "DerivedData not found"
    exit 0  # Exit successfully to not break the build
fi

APP_FRAMEWORKS="$DERIVED_DATA/Build/Products/Debug-iphonesimulator/CupNote.app/Frameworks"
HERMES_SOURCE="/Users/zimo_mbp16_m1max/Projects/CupNote/ios/Pods/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64_x86_64-simulator/hermes.framework"

echo "Creating Frameworks directory..."
mkdir -p "$APP_FRAMEWORKS" 2>/dev/null || true

# Check if hermes framework already exists and has content
if [ -f "$APP_FRAMEWORKS/hermes.framework/hermes" ]; then
    echo "Hermes framework already exists"
    exit 0
fi

echo "Removing old framework if exists..."
rm -rf "$APP_FRAMEWORKS/hermes.framework" 2>/dev/null || true

echo "Copying Hermes framework..."
if [ -d "$HERMES_SOURCE" ]; then
    # Try to copy, ignore errors
    cp -R "$HERMES_SOURCE" "$APP_FRAMEWORKS/" 2>/dev/null || true
    
    # Check if copy was successful
    if [ -f "$APP_FRAMEWORKS/hermes.framework/hermes" ]; then
        echo "Hermes framework copied successfully"
    else
        echo "Warning: Could not copy Hermes framework (might be sandbox restricted)"
    fi
else
    echo "Hermes framework source not found at: $HERMES_SOURCE"
fi

echo "Done!"
exit 0  # Always exit successfully