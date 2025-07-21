# Coffee Journal Fresh - Quick Reference

## Project Overview
React Native 0.80 coffee tasting app - 개인의 커피 취향을 발견하고 공유하는 플랫폼

## Current Focus (2025-07-22) - Sensory Evaluation System Enhancement
- **Status**: Comprehensive sensory evaluation analysis completed
- **Completed**: Korean coffee expressions integration plan, UI/UX improvements, enhanced flavor selection
- **Navigation**: Clean 3-tab structure with enhanced TastingFlow integration
- **Sensory System**: Korean CSV expressions (44 terms, 6 categories) ready for implementation

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

## Next Steps
1. **Sensory Evaluation Integration** - Priority 1 (2 weeks implementation)
   - Integrate Korean expressions into TastingStore
   - Create unified sensory component 
   - Add result visualization with Korean expressions
2. Configure Google OAuth credentials  
3. **Achievement UI Implementation** - Ready for MVP (backend 90% complete)
4. Beta test with real users
5. A/B testing infrastructure

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

## Sensory Evaluation System Analysis (2025-07-22)
### Korean Coffee Expressions Integration
- **CSV Data**: 44 sensory expressions across 6 categories (산미, 단맛, 쓴맛, 바디, 애프터, 밸런스)
- **Cultural Adaptation**: 64% beginner-friendly expressions marked with ⭐
- **Visual Enhancement**: Emoji + color coding for each category
- **Implementation Ready**: Data structure and UI components prepared

### Current Implementation Status
- ✅ **koreanSensoryData.ts**: Complete expression database with intensity mapping
- ✅ **UnifiedFlavorScreen**: Enhanced with progressive disclosure (Level 1 → 2 → 3)
- ✅ **UI Components**: Multiple sensory evaluation components created
- ⚠️ **Integration Gap**: Korean expressions not connected to main TastingFlow
- ❌ **Result Display**: Missing Korean expression visualization in results

### Technical Quality Assessment
- **Grade**: B+ (Strong foundation, needs integration)
- **Architecture**: Excellent TypeScript interfaces, React Native best practices
- **UX Design**: Culturally appropriate, beginner-friendly approach
- **Performance**: Optimized with useMemo, proper callback handling

### Priority Actions (2 weeks)
1. **High Priority**: Integrate Korean expressions into TastingStore (3 days)
2. **High Priority**: Create unified sensory component (5 days) 
3. **High Priority**: Add result visualization (4 days)
4. **Medium Priority**: Implement smart recommendations (3 days)
5. **Low Priority**: Advanced features and performance optimization (3 days)

## Documentation
- Progress archive: `CLAUDE_ARCHIVE_2025-07.md`
- Sensory evaluation analysis: Session 2025-07-22