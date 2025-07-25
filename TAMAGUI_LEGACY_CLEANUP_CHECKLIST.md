# Tamagui Legacy Style Cleanup Checklist

## Overview

This checklist tracks the cleanup of legacy HIGColors and HIGConstants usage across the codebase. Files are organized by priority and impact.

## 📊 Current Status

**Last Updated**: Phase 3 Complete - Navigation Updated, Legacy Screens Removed

- **Total Files with Legacy Styles**: 61 (9 screens + 52 components)
- **Migrated to Tamagui**: 31 screens (in screens-tamagui/)
- **Legacy Screens Removed**: 22 files (all with Tamagui replacements)
- **Remaining Cleanup**: 61 files

## ✅ Completed: Legacy Screens Removed

The following screens have been successfully removed after updating navigation to use Tamagui versions:

### Priority 1: Core Screens (REMOVED)
- [x] `/src/screens/OnboardingScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/AchievementGalleryScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/DeveloperScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/PersonalTasteDashboard.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/DataTestScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/PerformanceDashboardScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/TastingDetailScreen.tsx` → ✅ Removed, using Tamagui version

### Priority 2: Enhanced Feature Screens (REMOVED)
- [x] `/src/screens/EnhancedHomeCafeScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/LabModeScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/OptimizedUnifiedFlavorScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/ExperimentalDataScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/RoasterNotesScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/SensoryEvaluationScreen.tsx` → ✅ Removed, using Tamagui version

### Priority 3: Analytics & Media Screens (REMOVED)
- [x] `/src/screens/StatsScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/HistoryScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/PhotoGalleryScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/PhotoViewerScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/MarketIntelligenceScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/SearchScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/ProfileSetupScreen.tsx` → ✅ Removed, using Tamagui version

### Flavor Screens (REMOVED)
- [x] `/src/screens/flavor/UnifiedFlavorScreen.tsx` → ✅ Removed, using Tamagui version
- [x] `/src/screens/flavor/UnifiedFlavorScreenDebug.tsx` → ✅ Removed, not needed

## 🎯 Priority 4: Critical Components

### Achievement System
- [ ] `/src/components/achievements/AchievementCard.tsx`
- [ ] `/src/components/achievements/AchievementSummaryCard.tsx`
- [ ] `/src/components/achievements/AchievementNotification.tsx`
- [ ] `/src/components/achievements/CircularProgress.tsx`
- [ ] `/src/components/achievements/ProgressBar.tsx`

### Flavor System
- [ ] `/src/components/flavor/FlavorCategory.tsx`
- [ ] `/src/components/flavor/SelectedFlavors.tsx`
- [ ] `/src/components/flavor/constants.ts`
- [ ] `/src/components/flavor/styles/categoryAccordionStyles.ts`
- [ ] `/src/components/flavor/styles/selectedFlavorsHeaderStyles.ts`

### Sensory Components
- [ ] `/src/components/sensory/CompactSensoryGrid.tsx`
- [ ] `/src/components/sensory/SensoryOnboarding.tsx`
- [ ] `/src/components/sensory/SliderSection.tsx`
- [ ] `/src/components/sensory/MouthfeelButton.tsx`

### Charts & Visualizations
- [ ] `/src/components/charts/BarChart.tsx`
- [ ] `/src/components/charts/RadarChart.tsx`
- [ ] `/src/components/charts/ProgressRing.tsx`
- [ ] `/src/components/results/FlavorNotesVisualization.tsx`
- [ ] `/src/components/results/EnhancedSensoryVisualization.tsx`

## 🎯 Priority 5: Common Components

- [ ] `/src/components/common/Chip.tsx`
- [ ] `/src/components/common/Typography.tsx`
- [ ] `/src/components/common/NavigationButton.tsx`
- [ ] `/src/components/StatusBadge.tsx`
- [ ] `/src/components/LanguageSwitch.tsx`

## 🎯 Priority 6: HomeCafe Components

- [ ] `/src/components/HomeCafePouroverForm.tsx`
- [ ] `/src/components/HomeCafeSimpleForm.tsx`
- [ ] `/src/components/homecafe/EnhancedDripperSelector.tsx`
- [ ] `/src/components/homecafe/GrindSizeGuide.tsx`
- [ ] `/src/components/homecafe/InteractiveBrewTimer.tsx`
- [ ] `/src/components/homecafe/PourPatternGuide.tsx`
- [ ] `/src/components/homecafe/RecipeTemplateSelector.tsx`

## 🎯 Priority 7: Remaining Screens

### Auth Screens
- [ ] `/src/screens/auth/SignInScreen.tsx`
- [ ] `/src/screens/auth/SignUpScreen.tsx`

### Admin Screens
- [ ] `/src/screens/admin/AdminDashboardScreen.tsx`
- [ ] `/src/screens/admin/AdminCoffeeEditScreen.tsx`
- [ ] `/src/screens/admin/AdminFeedbackScreen.tsx`

### Other Screens
- [ ] `/src/screens/LegalScreen.tsx`
- [ ] `/src/screens/BetaTestingScreen.tsx`

## 📝 Cleanup Process

For each file:

1. **Check if Tamagui version exists** in `/src/screens-tamagui/`
   - If yes → Update navigation to use Tamagui version
   - If no → Migrate the component to Tamagui

2. **For components without Tamagui versions**:
   - Create styled components using Tamagui
   - Replace HIGColors with Tamagui tokens
   - Replace HIGConstants with spacing/size tokens
   - Add TypeScript types with GetProps
   - Test functionality

3. **Update imports** in parent components/screens

4. **Remove legacy file** once all references are updated

## 🔧 Quick Reference

### Color Replacements
```typescript
HIGColors.blue → $cupBlue
HIGColors.systemGreen → $green9
HIGColors.systemRed → $red9
HIGColors.label → $color
HIGColors.systemBackground → $background
```

### Spacing Replacements
```typescript
HIGConstants.SPACING_SM → $sm
HIGConstants.SPACING_MD → $md
HIGConstants.SPACING_LG → $lg
```

### Font Size Replacements
```typescript
HIGConstants.FONT_SIZE_TITLE → $4
HIGConstants.FONT_SIZE_BODY → $3
HIGConstants.FONT_SIZE_CAPTION → $2
```

## 🎯 Goal

Remove all imports and usage of:
- `HIGColors`
- `HIGConstants`
- `StyleSheet.create()`
- Legacy style files in `/src/styles/`

Replace with:
- Tamagui design tokens
- Styled components
- Unified theme system