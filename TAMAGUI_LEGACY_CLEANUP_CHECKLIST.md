# Tamagui Legacy Style Cleanup Checklist

## Overview

This checklist tracks the cleanup of legacy HIGColors and HIGConstants usage across the codebase. Files are organized by priority and impact.

## 📊 Current Status

- **Total Files with Legacy Styles**: 77 (25 screens + 52 components)
- **Migrated to Tamagui**: 31 screens (in screens-tamagui/)
- **Remaining Cleanup**: 77 files

## 🎯 Priority 1: Core Screens (Already Migrated to Tamagui)

These screens have Tamagui versions but the legacy versions are still in use:

- [ ] `/src/screens/OnboardingScreen.tsx` → Use `/src/screens-tamagui/core/OnboardingScreen.tsx`
- [ ] `/src/screens/AchievementGalleryScreen.tsx` → Use `/src/screens-tamagui/core/AchievementGalleryScreen.tsx`
- [ ] `/src/screens/DeveloperScreen.tsx` → Use `/src/screens-tamagui/core/DeveloperScreen.tsx`
- [ ] `/src/screens/PersonalTasteDashboard.tsx` → Use `/src/screens-tamagui/core/PersonalTasteDashboard.tsx`
- [ ] `/src/screens/DataTestScreen.tsx` → Use `/src/screens-tamagui/utilities/DataTestScreen.tsx`
- [ ] `/src/screens/PerformanceDashboardScreen.tsx` → Use `/src/screens-tamagui/utilities/PerformanceDashboardScreen.tsx`

## 🎯 Priority 2: Enhanced Feature Screens (Already Migrated)

- [ ] `/src/screens/EnhancedHomeCafeScreen.tsx` → Use `/src/screens-tamagui/enhanced/EnhancedHomeCafeScreen.tsx`
- [ ] `/src/screens/LabModeScreen.tsx` → Use `/src/screens-tamagui/enhanced/LabModeScreen.tsx`
- [ ] `/src/screens/OptimizedUnifiedFlavorScreen.tsx` → Use `/src/screens-tamagui/enhanced/OptimizedUnifiedFlavorScreen.tsx`

## 🎯 Priority 3: Analytics & Media Screens (Already Migrated)

- [ ] `/src/screens/StatsScreen.tsx` → Use `/src/screens-tamagui/analytics/StatsScreen.tsx`
- [ ] `/src/screens/HistoryScreen.tsx` → Use `/src/screens-tamagui/analytics/HistoryScreen.tsx`
- [ ] `/src/screens/PhotoGalleryScreen.tsx` → Use `/src/screens-tamagui/analytics/PhotoGalleryScreen.tsx`
- [ ] `/src/screens/PhotoViewerScreen.tsx` → Use `/src/screens-tamagui/analytics/PhotoViewerScreen.tsx`
- [ ] `/src/screens/MarketIntelligenceScreen.tsx` → Use `/src/screens-tamagui/analytics/MarketIntelligenceScreen.tsx`

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