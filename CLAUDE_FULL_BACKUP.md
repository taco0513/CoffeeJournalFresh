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

## Recent Issues & Solutions
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
```

## Key Features
- ✅ Apple/Google Sign-In (Google needs OAuth credentials)
- ✅ Beta feedback system (shake-to-feedback)
- ✅ Analytics & performance monitoring
- ✅ Guest mode with mock data
- ✅ Developer mode for testing

## Next Steps
1. Configure Google OAuth credentials
2. Beta test with real users
3. Implement achievement UI components
4. A/B testing infrastructure

## Documentation
- Full progress history: `CLAUDE_ARCHIVE_2025-07.md`
- AI strategy: `/docs/AI_STRATEGY_ROADMAP.md`
- Web admin: `/docs/WEB_ADMIN_DASHBOARD_SPEC.md`