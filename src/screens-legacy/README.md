# Legacy Screens - Pre-Tamagui Implementation

This folder contains the original React Native screen implementations that have been replaced by Tamagui versions.

## Status: ARCHIVED ⚠️

These files are kept for reference only. The active implementations are in `src/screens-tamagui/`.

## Migrated Screens

The following screens have been successfully migrated to Tamagui and their original versions moved here:

- **HomeScreen.tsx** → `screens-tamagui/core/HomeScreen.tsx`
- **ModeSelectionScreen.tsx** → `screens-tamagui/core/ModeSelectionScreen.tsx`
- **CoffeeInfoScreen.tsx** → `screens-tamagui/tasting/CoffeeInfoScreen.tsx`
- **SensoryScreen.tsx** → `screens-tamagui/tasting/SensoryScreen.tsx`
- **PersonalCommentScreen.tsx** → `screens-tamagui/tasting/PersonalCommentScreen.tsx`
- **ResultScreen.tsx** → `screens-tamagui/tasting/ResultScreen.tsx`
- **HomeCafeScreen.tsx** → `screens-tamagui/tasting/HomeCafeScreen.tsx`
- **JournalIntegratedScreen.tsx** → `screens-tamagui/journal/JournalIntegratedScreen.tsx`
- **ProfileScreen.tsx** → `screens-tamagui/profile/ProfileScreen.tsx`

## Why Keep These Files?

1. **Reference**: Useful for comparing implementations during debugging
2. **Rollback**: Emergency fallback if issues arise with Tamagui versions
3. **History**: Preserves the evolution of the codebase
4. **Component Dependencies**: Some components may still reference patterns from these files

## ⚠️ DO NOT USE IN PRODUCTION

The app navigation has been updated to use Tamagui screens. Using these legacy screens will cause:
- Inconsistent UI/UX
- Missing features from Tamagui migration
- Potential crashes due to outdated dependencies

## Deletion Timeline

These files can be safely deleted after:
- [ ] 30 days of stable production use of Tamagui screens
- [ ] All component dependencies have been verified
- [ ] Team consensus on permanent migration

---

**Archived**: January 25, 2025  
**Reason**: Tamagui migration Phase 1 complete