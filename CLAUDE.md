# Coffee Journal Fresh - Quick Reference

## Project Overview
React Native 0.80 coffee tasting app - 개인의 커피 취향을 발견하고 공유하는 플랫폼

## Current Focus (2025-07-21) - MVP Polish & Testing
- **Status**: Statistics unified, developer tools optimized, achievement backend ready
- **Active Issue**: Mock data system (Realm initialization timing) - blocking developer testing
- **Next Priority**: Achievement UI implementation (backend 90% complete)
- **Navigation**: Clean 3-tab structure (Home, Journal, Profile) with consistent statistics

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
- 🔧 **Realm initialization**: Mock data toggle partially working (1/5 records successful)
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
- 🔧 Mock data system (needs Realm initialization fix)

## Next Steps
1. **Fix Mock Data System** - Resolve Realm initialization issues for developer testing
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

### Current Issue
- 🔧 **Mock Data Toggle**: Partially working (1/5 records save successfully)
- **Root Cause**: Realm database initialization timing issues
- **Impact**: Affects developer testing workflows

## Documentation
- Progress archive: `CLAUDE_ARCHIVE_2025-07.md`