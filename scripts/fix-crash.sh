#!/bin/bash
# Fix React Native crash due to nil NSClassFromString returns

echo "🔧 Fixing RCTThirdPartyComponentsProvider.mm..."

# Navigate to the iOS directory
cd "$(dirname "$0")/../ios" || exit 1

# Run the Ruby fix script
if [ -f "fix_rct_provider.rb" ]; then
    ruby fix_rct_provider.rb
else
    echo "❌ fix_rct_provider.rb not found!"
    exit 1
fi

echo "✅ Fix applied successfully!"