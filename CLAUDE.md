# Coffee Journal Fresh - Quick Reference

## Project Overview
React Native 0.80 coffee tasting app - 개인의 커피 취향을 발견하고 공유하는 플랫폼

## Current Focus (2025-07-22) - Korean Sensory Evaluation System ✅
- **Status**: Implementation completed with full integration
- **Completed**: 
  - Korean expressions fully integrated into TastingFlow
  - CATA (Check All That Apply) methodology per SCA 2024 standards
  - 4-step onboarding system with AsyncStorage persistence
  - Removed intensity ratings for simplified UX
- **Key Features**:
  - 44 Korean expressions across 6 categories
  - Multi-selection support (max 3 per category)
  - Beginner-friendly expressions marked with ⭐
  - Professional UI with category-specific colors

## Statistics System Updates (2025-07-21)
### Home Screen Stats
- "나의 커피 기록" (My Coffee Records) - Total tastings count
- "발견한 로스터리" (Discovered Roasteries) - Unique roastery count
- "나의 업적" (My Achievements) - Achievement points (reduced 10x for MVP balance)

### Journal > Stats Tab
- **기본 통계**: "나의 커피 기록", "발견한 로스터리" (matches Home screen)
- **30일 인사이트**: "많이 마신 원산지", "많이 느낀 향미", "총 테이스팅" (30-day focused)

## MVP Focus (Updated 2025-07-22)
- **Target**: 일반 커피 애호가 (Cafe Mode)
- **Core Features**: 
  - ✅ 기본 테이스팅 워크플로우 (커피 정보 → 향미 선택 → 감각 평가 → 개인 노트 → 결과)
  - ✅ Korean 감각 평가 시스템 (44개 표현, CATA 방법론)
  - ✅ 기본 통계 및 기록 관리
  - ✅ 성취 시스템 (백엔드 구현 완료)
  - ✅ 사진 관리 시스템 (PhotoGallery, PhotoViewer, PhotoService 유지)
  - ✅ 관리자 대시보드 (운영 필수 기능)
  - ✅ 고급 분석/시각화 (personalTaste 컴포넌트 유지)
- **UI**: 3-tab navigation (Home, Journal, Profile)
- **Removed from MVP**: AI 코칭, OCR/사진 스캔, 소셜 기능, 국제화, 데이터 내보내기

## Key Architecture
```
src/
├── screens/          # All app screens
├── components/       # Reusable components
├── services/         # Business logic & API
├── stores/           # Zustand state management
├── hooks/            # Custom React hooks
└── navigation/       # React Navigation setup
```

## Recent Issues & Solutions (2025-07-22)
- ✅ **React Native bridge errors**: Fixed "Malformed calls from JS" with comprehensive solution
- ✅ **Persistent modal bug**: Fixed coffee recording modal appearing constantly  
- ✅ **Console errors**: Resolved ErrorContextService circular reference issues
- ✅ **Analytics errors**: Fixed authentication-related service errors
- ✅ **MVP Beta design**: Removed excessive icons/emojis for professional appearance
- ✅ **Statistics unification**: Unified stats between Home and Journal screens
- ✅ **Achievement point balance**: Reduced all achievement points by 10x for MVP
- ✅ **Home screen accessibility**: Added comprehensive accessibility labels and loading states
- ✅ **Developer mode cleanup**: Removed ~890 lines, consolidated mock data features
- ✅ **Status badge system**: Added developer/beta user indicators
- ✅ **Beta feedback improvements**: Removed animations, improved UX
- ✅ **Mock data system**: Fully functional with 5 test records creation
- ✅ **CoffeeInfoScreen cleanup**: Removed 243 lines of dead code (24% reduction)
- ✅ **Metro bundler issues**: Fixed script URL error by restarting Metro on correct port (8081)
- ✅ **Bridge debugger errors**: Fixed TastingFlowBridge onRequestCategoryPreferencing error by disabling problematic bridge debugger
- ✅ **UnifiedFlavorScreen improvements**: Auto-expansion, level 2 selection, haptic feedback, search highlighting
- **Navigation simplified**: Stats removed from bottom tab
- **TypeScript**: 0 errors (was 319)

## Commands
```bash
# Run iOS
npm start
npx react-native run-ios

# Build for release
cd ios && xcodebuild -workspace CoffeeJournalFresh.xcworkspace -scheme CoffeeJournalFresh -configuration Release

# Development debugging (in simulator console)
clearDraftStorage()        # Clear problematic draft data
inspectDraftStorage()      # Debug draft storage issues
bridgeDebugger.printRecentCalls()  # Debug bridge errors
```

## Key Features
- ✅ Apple/Google Sign-In (Google needs OAuth credentials)
- ✅ Beta feedback system (shake-to-feedback)
- ✅ Analytics & performance monitoring
- ✅ Developer mode for testing
- ✅ Bridge error debugging & prevention
- ✅ Smart draft recovery system
- 🔧 **Achievement System**: Core backend implemented, UI components needed

## Technical Status
- ✅ React Native bridge error prevention system
- ✅ Smart draft recovery and modal fix
- ✅ Error monitoring and analytics improvements  
- ✅ Statistics system unification
- ✅ Achievement point rebalancing
- ✅ Home screen accessibility improvements
- ✅ Developer mode streamlining (56% code reduction in DeveloperScreen.tsx)
- ✅ Status badge component for user role indication
- ✅ Mock data system (fixed all initialization and sync issues)
- ✅ Code cleanup: CoffeeInfoScreen (24% reduction), removed Feature Backlog code
- ✅ **SensoryScreen Refactoring** (2025-07-22): Reduced from 473 to ~300 lines, extracted components, TypeScript fixes
- ✅ **TypeScript Errors Fixed**: FlavorPath imports, missing annotations, undefined color constants
- ✅ **SensoryScreen UI Overhaul** (2025-07-22): Compact design with horizontal tabs, eliminated redundant titles, reduced scrolling
- ✅ **Feature Backlog Migration** (2025-07-22): Moved non-MVP features to organized backlog (182→164 files, 10% reduction)
- ✅ **Metro Bundler Fix** (2025-07-22): Fixed script URL error, Metro running on correct port 8081
- ✅ **Bridge Error Resolution** (2025-07-22): Fixed TastingFlowBridge onRequestCategoryPreferencing error with enhanced bridge debugger
- ✅ **MVP Documentation Complete** (2025-07-22): Created MVP_STATUS.md with 95% completion status
- ✅ **Navigation Fixes** (2025-07-22): Fixed all OCR screen references, clean iOS build successful

## Next Steps (MVP Ready)
1. ✅ **Korean Sensory Evaluation** - COMPLETED (2025-07-22)
2. ✅ **Feature Backlog Migration** - COMPLETED (2025-07-22) 
3. ✅ **MVP Cleanup** - COMPLETED (182→164 files, 10% reduction)
4. **MVP Launch Ready Tasks**:
   - Configure Google OAuth credentials (optional - Apple Sign-In works)
   - Achievement UI Implementation (backend ready)
   - Result Visualization improvements
   - Beta testing with real users
   - Basic performance monitoring

## Post-MVP Roadmap (Feature Backlog)
- **Phase 2**: AI 코칭 시스템 (90% 완성), Photo OCR 기능
- **Phase 3**: 소셜/커뮤니티 기능, 고급 성장 트래킹
- **Phase 4**: 국제화, 전문가 도구

## Achievement System Status
- ✅ **Backend**: Core system implemented with balanced point values
- ✅ **Phase 1**: 12 basic achievements defined and functional
- 🔧 **UI**: Need achievement cards, progress bars, notification system

## Developer Mode Improvements (2025-07-21)
### Completed
- ✅ **Code Cleanup**: Reduced DeveloperScreen.tsx from 1,586 to 695 lines (56% reduction)
- ✅ **Feature Consolidation**: Removed duplicate mock data functions, unified into single toggle
- ✅ **Status Badge**: Added cycling developer/beta user indicator (StatusBadge.tsx)
- ✅ **UI Polish**: Removed excessive animations from beta feedback system
- ✅ **Switch Controls**: Fixed Alert integration with controlled Switch components
- ✅ **Error Handling**: Enhanced error reporting for development workflows

### Components Modified
- `src/screens/DeveloperScreen.tsx` - Major cleanup and consolidation
- `src/components/StatusBadge.tsx` - New reusable status indicator
- `src/navigation/AppNavigator.tsx` - Added status badge to headers
- `src/components/feedback/FloatingFeedbackButton.tsx` - Removed animations

### Mock Data System Improvements (2025-07-21 Evening Session)
- ✅ **Access Control**: Beta users cannot access mock data, only developers
- ✅ **Mock Data Creation**: Fixed - now creates 5 test records successfully with complete flavor hierarchy
- ✅ **Mock Data Reset**: Added reset button that safely clears only TastingRecord data
- ✅ **Toggle State Sync**: Mock data toggle now correctly reflects actual data state
- ✅ **Navigation Fixes**: 
  - SearchScreen: Fixed navigation params from `{ id }` to `{ tastingId }`
  - TastingDetail: Fixed duplicate headers and proper back navigation
  - Journal tab: Fixed auto-navigation to TastingDetail issue
- ✅ **Data Refresh**: Home screen now refreshes when mock data changes
- ✅ **Developer Experience**: "Journal로 이동" button works after mock data creation

## Korean Sensory Evaluation System (2025-07-22) ✅
### Implementation Complete
- **Integration**: Fully integrated into main TastingFlow
- **Components**: 
  - `EnhancedSensoryEvaluation.tsx` - Main evaluation interface
  - `SensoryOnboarding.tsx` - 4-step user guide
  - `koreanSensoryData.ts` - 44 expressions database
- **UX Improvements**:
  - Removed complex intensity ratings
  - Simple toggle selection (on/off)
  - Category limits with visual feedback
  - Professional design following SCA 2024 standards

### Technical Implementation
- ✅ **Multi-selection**: CATA methodology with max 3 per category
- ✅ **State Management**: Integrated with TastingStore
- ✅ **Persistence**: AsyncStorage for onboarding state
- ✅ **TypeScript**: Full type safety with interfaces
- ✅ **Performance**: Optimized with React hooks
- ✅ **UI Design**: Compact horizontal tabs, eliminated emojis and redundant titles, minimal scrolling

### Expression Categories
1. **산미 (Acidity)**: 싱그러운, 발랄한, 톡 쏘는, etc.
2. **단맛 (Sweetness)**: 농밀한, 달콤한, 꿀 같은, etc.
3. **쓴맛 (Bitterness)**: 스모키한, 카카오 같은, 허브 느낌의, etc.
4. **바디 (Body)**: 크리미한, 벨벳 같은, 묵직한, etc.
5. **애프터 (Aftertaste)**: 깔끔한, 길게 남는, 산뜻한, etc.
6. **밸런스 (Balance)**: 조화로운, 부드러운, 자연스러운, etc.

## Code Refactoring (2025-07-22)
### SensoryScreen Improvements
- **Component Extraction**: MouthfeelButton, SliderSection components created
- **Custom Hooks**: useSensoryState hook for consolidated state management
- **TypeScript**: Full type safety with proper interfaces (types/sensory.ts)
- **Performance**: React.memo and useMemo optimizations
- **Code Reduction**: 473 → ~300 lines (37% reduction)
- **File Organization**: Barrel exports in components/sensory/index.ts
- **UI Overhaul**: CompactSensoryEvaluation.tsx - horizontal tabs, clean design, eliminated scrolling issues

### TypeScript Fixes
- **FlavorPath Import**: Fixed imports across UnifiedFlavorScreen, FlavorCategory
- **Color Constants**: Fixed HIGColors.systemYellow → HIGColors.yellow
- **Type Annotations**: Added missing type annotations for callbacks
- **Import Errors**: Resolved SensoryOnboarding and SelectedSensoryExpression imports

## Feature Backlog (2025-07-22)
### MVP Cleanup Strategy
- **Moved to Backlog**: AI coaching, OCR/Photo features, social community, internationalization
- **Kept in MVP**: Photo management, admin dashboard, advanced analytics (per user request)  
- **Completely Removed**: ExportService (data export functionality)
- **Impact**: 182→164 files (10% reduction), ~2,500+ lines moved to organized backlog

### Backlog Structure
```
feature_backlog/
├── phase2_post_mvp/          # AI coaching (90% complete), Photo OCR
├── phase3_growth/            # Social community features  
└── phase4_professional/      # Internationalization
```

### Files Moved
- **AI Coaching**: LiteAICoachService.ts (1,014 lines), FlavorLearningEngine.ts (771 lines), PersonalTasteAnalysisService.ts (786 lines)
- **Photo OCR**: OCRScanScreen, OCRResultScreen, OCRService, parsing utilities
- **Social**: CommunityReviewScreen, ShareReviewScreen, CommunityFeedScreen
- **i18n**: LanguageSwitch, i18n directory, i18n utilities

## Session Summary (2025-07-22 Night)
### Issues Resolved
1. ✅ **TastingFlowBridge Error**: Fixed `onRequestCategoryPreferencing` error by:
   - Disabling problematic bridge debugger in index.js
   - Enhanced bridge debugger with graceful error handling
   - Added blocking for known problematic native method calls

2. ✅ **Metro Bundler Connection**: Fixed "No script URL provided" error by:
   - Started Metro on correct port (8081)
   - Triggered app rebuild to connect to correct Metro server
   - Fixed app configuration for Metro connection

3. ✅ **UnifiedFlavorScreen Improvements**: Completed from previous session
   - Auto-expansion of categories when searching
   - Level 2 subcategory selection via long-press
   - Search term highlighting in subcategories and flavor chips
   - Haptic feedback and accessibility enhancements
   - Original parent-child UX design preserved

### Files Modified
- `index.js`: Disabled bridge debugger import
- `src/utils/bridgeDebugger.ts`: Enhanced error handling and blocking
- `src/components/flavor/FlavorCategory.tsx`: Maintained original long-press design
- `src/screens/flavor/UnifiedFlavorScreen.tsx`: Search and selection improvements

## Documentation
- Progress archive: `CLAUDE_ARCHIVE_2025-07.md`
- Sensory evaluation analysis: Session 2025-07-22
- Refactoring session: 2025-07-22 Evening  
- Feature backlog migration: `feature_backlog/README.md`, `feature_backlog/MIGRATION_LOG.md`
- Bridge error fix: Session 2025-07-22 Night