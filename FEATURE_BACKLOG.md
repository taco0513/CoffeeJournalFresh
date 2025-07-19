# Coffee Journal Fresh - Feature Backlog

This document tracks features and improvements deferred from the initial beta release.

## High Priority (Post-Beta)

### 1. Community Features
- **Status**: UI exists but uses mock data only
- **Files**: 
  - `src/screens/CommunityFeedScreen.tsx`
  - `src/screens/CommunityReviewScreen.tsx`
  - `src/navigation/AppNavigator.tsx` (Community tab commented out)
- **Requirements**:
  - Supabase integration for community posts
  - Real photo sharing functionality
  - User interactions (likes, comments)
  - Content moderation

### 2. Settings Screen
- **Status**: Shows placeholder alert
- **Location**: `src/screens/ProfileScreen.tsx` (lines 100-108, commented out)
- **Requirements**:
  - User preferences (notifications, privacy)
  - App appearance settings
  - Data management options
  - Account settings

### 3. Help & Support
- **Status**: Shows placeholder alert
- **Location**: `src/screens/ProfileScreen.tsx` (lines 116-123, commented out)
- **Requirements**:
  - In-app documentation
  - FAQ section
  - Contact support
  - App version info

## Medium Priority

### 4. Location Permission
- **Status**: Empty description in iOS Info.plist
- **Location**: `ios/CoffeeJournalFresh/Info.plist`
- **Action**: Remove empty NSLocationWhenInUseUsageDescription or implement location features

### 5. Google Sign-In
- **Status**: Service implemented but needs configuration
- **Files**:
  - `src/services/supabase/googleAuth.ts` (needs client ID)
  - `src/screens/auth/SignInScreen.tsx` (UI commented out)
- **Requirements**:
  - Google OAuth configuration in Supabase
  - Real Google client ID
  - Testing on devices

### 6. Password Reset
- **Status**: Shows "이 기능은 준비 중입니다" alert
- **Location**: `src/screens/auth/SignInScreen.tsx`
- **Requirements**:
  - Supabase password reset flow
  - Email templates
  - Reset confirmation screen

### 7. Share Review Feature
- **Status**: Navigation commented out
- **Location**: `src/navigation/AppNavigator.tsx` (lines 139-143)
- **Files**: `src/screens/ShareReviewScreen.tsx`
- **Requirements**:
  - Social sharing integration
  - Export formats (image, text)

### 8. Photo Gallery
- **Status**: Navigation commented out
- **Location**: `src/screens/ProfileScreen.tsx` (lines 93-99)
- **Files**: 
  - `src/screens/PhotoGalleryScreen.tsx`
  - `src/screens/PhotoViewerScreen.tsx`

## Low Priority

### 9. Language Inconsistencies
- **Status**: Mix of Korean hardcoded strings and English UI
- **Action**: Implement proper i18n throughout the app
- **Note**: LanguageSwitch component exists but not fully utilized

### 10. TypeScript Errors
- **Status**: 112 errors (mostly property mismatches)
- **Impact**: Non-blocking for functionality
- **Types of errors**:
  - Property name mismatches (35%)
  - Missing type declarations (20%)
  - Type mismatches (25%)
  - Undefined property access (20%)

### 11. Android Release Signing
- **Status**: Using debug keystore for release builds
- **Location**: `android/app/build.gradle` (line 103)
- **Action**: Generate proper release keystore before Play Store submission

### 12. Non-null Assertions
- **Status**: Unsafe assertions in PhotoService and RealmService
- **Files**:
  - `src/services/PhotoService.ts` (lines 94-99, 135-140)
  - `src/services/RealmService.ts` (lines 330-331, 511, 601, 642)
- **Action**: Add proper null checks

### 13. Apple Sign-In Error Handling
- **Status**: Missing error handling in device support check
- **Location**: `src/screens/auth/SignInScreen.tsx` (useEffect)
- **Action**: Add try-catch for `appleAuth.isSupported()`

## Completed TODOs in Code
The codebase contains several TODO comments for Supabase integration that appear to be completed:
- `src/stores/useUserStore.ts`: Multiple TODOs for Supabase integration (lines 370, 381, 389, 399, 430)
- These can be removed as the integration is working

## Notes
- All incomplete features have been properly commented out or hidden for the beta release
- The app focuses on core coffee journaling functionality for initial testing
- Social/community features will be the primary focus post-beta based on user feedback