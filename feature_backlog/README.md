# Feature Backlog

This directory contains features that have been moved out of the MVP but are valuable for future development phases.

## Structure

### Phase 2 - Post MVP (High Priority)
- **ai_coaching/**: AI coaching system (90% complete)
  - `LiteAICoachService.ts` - Main AI coaching service (1,014 lines)
  - `FlavorLearningEngine.ts` - Flavor learning with quizzes (771 lines)
  - `PersonalTasteAnalysisService.ts` - Personal taste analysis (786 lines)
  - `coach/` - Coach UI components

- **photo_ocr/**: Photo and OCR capabilities
  - OCR text extraction from coffee packaging
  - Camera integration for coffee bag photos
  - Intelligent text parsing

### Phase 3 - Growth Features (Medium Priority)
- **social_community/**: Social and community features
  - Community reviews and sharing
  - Social interaction features
  - Community feed

### Phase 4 - Professional Features (Lower Priority)
- **internationalization/**: Multi-language support
  - Language switching
  - i18n framework and utilities

## Features Kept in MVP

The following were requested to be kept in MVP:
- Photo management (`PhotoGalleryScreen`, `PhotoViewerScreen`, `PhotoService`)
- Admin dashboard (`src/screens/admin/`)
- Advanced analytics/visualization (`personalTaste/` components)

## Features Completely Removed

- `ExportService.ts` - Data export functionality (completely deleted)

## Restoration Instructions

To restore a feature from backlog:
1. Move files back to their original `src/` locations
2. Update import paths in any dependent files
3. Add back to navigation if needed
4. Test integration with current codebase

## MVP Focus

By moving these features to backlog, the MVP now focuses on:
- Core coffee tasting workflow
- Basic statistics
- Essential user profile features
- Simplified UI without complex animations