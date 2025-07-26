#!/bin/bash

echo "Removing all emojis from source files..."

# Remove emojis from component files
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/☕//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/📊//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🚀//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/✨//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/💡//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🏆//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🌟//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🎯//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/📷//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/💧//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🪨//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/⚫//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🍃//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🍋//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🍊//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🔥//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🌱//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🍫//g'
find src/components -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/⚖️//g'

# Remove from screens
find src/screens-tamagui -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/📊//g'
find src/screens-tamagui -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🚀//g'
find src/screens-tamagui -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/✨//g'

# Remove from services
find src/services -name "*.ts" | xargs sed -i '' 's/🔄//g'
find src/services -name "*.ts" | xargs sed -i '' 's/🌍//g'
find src/services -name "*.ts" | xargs sed -i '' 's/🔤//g'
find src/services -name "*.ts" | xargs sed -i '' 's/🏃//g'
find src/services -name "*.ts" | xargs sed -i '' 's/🐌//g'
find src/services -name "*.ts" | xargs sed -i '' 's/🟢//g'
find src/services -name "*.ts" | xargs sed -i '' 's/🔴//g'

# Clean up Logger output with backticks
find src -name "*.ts" -o -name "*.tsx" | xargs perl -pi -e 's/Logger\.(debug|info|warn|error)\(`[^`]*[\x{1F300}-\x{1F9FF}]//g'

echo "Comprehensive emoji removal complete!"