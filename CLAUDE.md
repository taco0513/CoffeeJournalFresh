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

## MVP Focus
- **Target**: 일반 커피 애호가 (Cafe Mode)
- **Core**: 기본 테이스팅, 향미 선택, 개인 기록, 성취 시스템
- **UI**: 3-tab navigation (Home, Journal, Profile)

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

## Recent Issues & Solutions (2025-07-21)
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
- **Metro bundler issues**: Restart simulator or rebuild from Xcode
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

## Next Steps
1. ✅ **Korean Sensory Evaluation** - COMPLETED (2025-07-22)
2. **Result Visualization** - Display selected Korean expressions in results screen
3. Configure Google OAuth credentials  
4. **Achievement UI Implementation** - Ready for MVP (backend 90% complete)
5. Beta test with real users
6. A/B testing infrastructure

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

### Expression Categories
1. **산미 (Acidity)**: 싱그러운, 발랄한, 톡 쏘는, etc.
2. **단맛 (Sweetness)**: 농밀한, 달콤한, 꿀 같은, etc.
3. **쓴맛 (Bitterness)**: 스모키한, 카카오 같은, 허브 느낌의, etc.
4. **바디 (Body)**: 크리미한, 벨벳 같은, 묵직한, etc.
5. **애프터 (Aftertaste)**: 깔끔한, 길게 남는, 산뜻한, etc.
6. **밸런스 (Balance)**: 조화로운, 부드러운, 자연스러운, etc.

## Documentation
- Progress archive: `CLAUDE_ARCHIVE_2025-07.md`
- Sensory evaluation analysis: Session 2025-07-22