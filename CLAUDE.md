# Coffee Journal Fresh - Quick Reference

## Project Overview
React Native 0.80 coffee tasting app - 개인의 커피 취향을 발견하고 공유하는 플랫폼

## Current Focus (2025-07-21)
- Simplified navigation: 3 tabs (Home, Journal, Profile)
- Journal hub consolidates all user data (기록 | 통계)
- 30-day insights system replacing complex analytics
- Data-driven approach (no AI claims until Phase 3)

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
- ✅ Guest mode with mock data
- ✅ Developer mode for testing
- ✅ Bridge error debugging & prevention
- ✅ Smart draft recovery system

## Technical Improvements (2025-07-21)

### React Native Bridge Error Prevention
- **SafeText Component**: Prevents bridge errors from NaN/invalid values
- **Bridge Debugger**: Real-time monitoring and validation of bridge calls
- **RCT Provider Fix**: Comprehensive iOS native component registration safety
- **Parameter Sanitization**: Automatic cleaning of problematic bridge parameters

### Smart Draft Recovery System
- **Intelligent Auto-Save**: Only saves drafts with meaningful data (not empty interactions)
- **Persistent Modal Fix**: Eliminates annoying recovery prompts for trivial changes
- **Draft Debugging Tools**: Easy clearing and inspection of draft storage
- **Improved UX**: Modal only appears for substantial incomplete coffee records

### Error Monitoring & Prevention
- **ErrorContextService**: Fixed circular reference issues, disabled problematic console interception
- **AnalyticsService**: Improved authentication state handling, better error filtering
- **Development Tools**: Global debugging utilities for troubleshooting

### Files Added/Modified
- `src/components/SafeText.tsx` - Bridge-safe text component
- `src/utils/bridgeDebugger.ts` - Bridge error debugging tools
- `src/utils/clearDraftStorage.ts` - Draft management utilities
- `src/stores/tastingStore.ts` - Smart auto-save logic
- `src/services/ErrorContextService.ts` - Console error fixes
- `src/services/AnalyticsService.ts` - Authentication error handling

## Next Steps
1. Configure Google OAuth credentials
2. Beta test with real users
3. Implement achievement UI components
4. A/B testing infrastructure

## Documentation
- Full progress history: `CLAUDE_ARCHIVE_2025-07.md`
- AI strategy: `/docs/AI_STRATEGY_ROADMAP.md`
- Web admin: `/docs/WEB_ADMIN_DASHBOARD_SPEC.md`