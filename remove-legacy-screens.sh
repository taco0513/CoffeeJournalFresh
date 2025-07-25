#!/bin/bash

# Script to remove legacy screen files that have been migrated to Tamagui
# Generated from TAMAGUI_LEGACY_CLEANUP_CHECKLIST.md

echo "🗑️  Removing legacy screen files that have been migrated to Tamagui..."

# List of files to remove (all have Tamagui replacements)
FILES_TO_REMOVE=(
  # Core screens
  "src/screens/AchievementGalleryScreen.tsx"
  "src/screens/DataTestScreen.tsx"
  "src/screens/DeveloperScreen.tsx"
  "src/screens/OnboardingScreen.tsx"
  "src/screens/PersonalTasteDashboard.tsx"
  "src/screens/TastingDetailScreen.tsx"
  
  # Enhanced features
  "src/screens/EnhancedHomeCafeScreen.tsx"
  "src/screens/ExperimentalDataScreen.tsx"
  "src/screens/LabModeScreen.tsx"
  "src/screens/OptimizedUnifiedFlavorScreen.tsx"
  "src/screens/RoasterNotesScreen.tsx"
  "src/screens/SensoryEvaluationScreen.tsx"
  
  # Analytics & Media
  "src/screens/HistoryScreen.tsx"
  "src/screens/MarketIntelligenceScreen.tsx"
  "src/screens/PhotoGalleryScreen.tsx"
  "src/screens/PhotoViewerScreen.tsx"
  "src/screens/SearchScreen.tsx"
  "src/screens/StatsScreen.tsx"
  
  # Utilities
  "src/screens/PerformanceDashboardScreen.tsx"
  "src/screens/ProfileSetupScreen.tsx"
  
  # Flavor screens (UnifiedFlavorScreen is migrated)
  "src/screens/flavor/UnifiedFlavorScreen.tsx"
  "src/screens/flavor/UnifiedFlavorScreenDebug.tsx"
)

# Counter for removed files
REMOVED_COUNT=0

# Remove each file
for FILE in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$FILE" ]; then
    rm "$FILE"
    echo "✅ Removed: $FILE"
    ((REMOVED_COUNT++))
  else
    echo "⏭️  Already removed or not found: $FILE"
  fi
done

echo ""
echo "📊 Summary:"
echo "   - Total files removed: $REMOVED_COUNT"
echo "   - Legacy screens remaining: 6 (admin, auth, legal, beta testing)"
echo ""
echo "🎉 Legacy screen cleanup complete!"
echo ""
echo "Note: The following screens are still needed and NOT removed:"
echo "  - src/screens/admin/* (3 files)"
echo "  - src/screens/auth/* (2 files)"
echo "  - src/screens/BetaTestingScreen.tsx"
echo "  - src/screens/LegalScreen.tsx"