#!/bin/bash

# Script to remove emojis from source files

echo "Removing emojis from Logger messages..."

# Remove common debug/info emojis
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/Logger\.debug.*🔧/Logger.debug/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/Logger\.debug.*📊/Logger.debug/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/Logger\.debug.*🔍/Logger.debug/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/Logger\.debug.*✅/Logger.debug/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/Logger\.debug.*🏁/Logger.debug/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/Logger\.debug.*🚀/Logger.debug/g'

# Remove error emojis
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/Logger\.error.*❌/Logger.error/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/Logger\.debug.*⚠️/Logger.debug/g'

# Remove emojis from specific Logger calls
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/Logger\.debug('🔧 /Logger.debug('/g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/Logger\.debug('📊 /Logger.debug('/g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/Logger\.debug('🔍 /Logger.debug('/g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/Logger\.debug('✅ /Logger.debug('/g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/Logger\.debug('⚠️ /Logger.debug('/g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/Logger\.error('❌ /Logger.error('/g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/Logger\.debug(\`🔧 /Logger.debug(\`/g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/Logger\.debug(\`📊 /Logger.debug(\`/g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/Logger\.debug(\`🔍 /Logger.debug(\`/g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/Logger\.debug(\`✅ /Logger.debug(\`/g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/Logger\.debug(\`⚠️ /Logger.debug(\`/g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/Logger\.error(\`❌ /Logger.error(\`/g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/Logger\.debug(\`🏁 /Logger.debug(\`/g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/Logger\.debug(\`🚀 /Logger.debug(\`/g"

# Remove emojis from navigation comments
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\/\/ 🎉 /\/\/ /g'

# Remove emojis from test/performance messages
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🟢//g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🔴//g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🚨//g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🏃//g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🐌//g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/🎉//g'

echo "Emoji removal complete!"