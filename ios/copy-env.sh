#!/bin/bash
# This script copies the .env file to the correct location for react-native-config

# Navigate to the project root
cd "$SRCROOT/.."

# Copy .env file to the build folder
if [ -f .env ]; then
  cp .env "$SRCROOT/../node_modules/react-native-config/ios/ReactNativeConfig/BuildDotenvConfig.rb"
  echo "✅ .env file copied for react-native-config"
else
  echo "⚠️  Warning: .env file not found. Using default values."
fi