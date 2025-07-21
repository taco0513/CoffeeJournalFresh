# Feature Backlog Migration Log

## Date: 2025-07-22

## Files Moved to Feature Backlog

### Phase 2 - Post MVP (AI Coaching)
**Moved from `src/services/` to `feature_backlog/phase2_post_mvp/ai_coaching/`:**
- `LiteAICoachService.ts` (1,014 lines) - Main AI coaching service
- `FlavorLearningEngine.ts` (771 lines) - Flavor learning with quizzes  
- `PersonalTasteAnalysisService.ts` (786 lines) - Personal taste analysis

**Moved from `src/components/` to `feature_backlog/phase2_post_mvp/ai_coaching/`:**
- `coach/` (entire directory)
  - `CoachFeedbackModal.tsx`
  - `CoachInsightBanner.tsx`  
  - `CoachTipCard.tsx`

### Phase 2 - Post MVP (Photo OCR)
**Moved to `feature_backlog/phase2_post_mvp/photo_ocr/`:**
- `src/screens/OCRScanScreen.tsx`
- `src/screens/OCRResultScreen.tsx`
- `src/services/OCRService.ts`
- `src/utils/ocrParser.ts`
- `src/utils/coffeeParser.ts`

### Phase 3 - Growth Features (Social Community)
**Moved to `feature_backlog/phase3_growth/social_community/`:**
- `src/screens/CommunityReviewScreen.tsx`
- `src/screens/ShareReviewScreen.tsx`
- `src/screens/CommunityFeedScreen.tsx`

### Phase 4 - Professional Features (Internationalization)
**Moved to `feature_backlog/phase4_professional/internationalization/`:**
- `src/components/LanguageSwitch.tsx`
- `src/i18n/` (entire directory)
- `src/utils/i18n.ts`

## Files Completely Deleted
- `src/services/ExportService.ts` - Data export functionality (per user request)

## Code Updates Made

### 1. Updated Import References
**File:** `src/services/personalTaste/index.ts`
- Commented out exports for moved services
- Updated `PersonalTasteServices` interface
- Modified `initializePersonalTasteServices` function

**Changes:**
```typescript
// Before
export { PersonalTasteAnalysisService } from '../PersonalTasteAnalysisService';
export { FlavorLearningEngine } from '../FlavorLearningEngine';

// After  
// export { PersonalTasteAnalysisService } from '../PersonalTasteAnalysisService'; // Moved to backlog
// export { FlavorLearningEngine } from '../FlavorLearningEngine'; // Moved to backlog
```

### 2. Updated Documentation
**File:** `src/utils/console-migration.md`
- Marked ExportService as removed from migration list

## Features Kept in MVP (Per User Request)
- Photo management (`PhotoGalleryScreen`, `PhotoViewerScreen`, `PhotoService`)
- Admin dashboard (`src/screens/admin/`)
- Advanced analytics/visualization (`src/components/personalTaste/`)

## Impact Assessment
- **Code Reduction**: Moved ~2,500+ lines of code to backlog
- **Dependency Cleanup**: AI services and complex features removed from MVP
- **Build Performance**: Should improve due to fewer imports and services
- **Maintainability**: Simplified MVP focus on core coffee tasting features

## Restoration Instructions
To restore any moved feature:
1. Move files back from `feature_backlog/` to original `src/` locations
2. Uncomment import/export statements in affected files
3. Update navigation routes if screen components were moved
4. Test integration with current MVP codebase
5. Update dependencies in package.json if needed

## Next Steps
1. Test MVP build after cleanup
2. Remove unused dependencies from package.json
3. Update navigation to remove references to moved screens
4. Clean up any remaining import errors