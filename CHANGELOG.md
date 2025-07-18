# Changelog

## [0.2.0] - 2025-07-18

### Added
- Real TextInput components for coffee information entry
- Flavor selection with visual feedback (12 flavor options)
- Form validation with required field indicators
- Zustand state management for app-wide state
- In-memory data persistence during app session
- Tasting history view with date tracking
- Total tastings counter on home screen
- Success/error alerts for user feedback
- Realm database models (Coffee, TastingSession) - prepared but not active
- RealmService for database operations - prepared but not active

### Fixed
- JavaScript bridge error by removing problematic dependencies
- Removed unsupported CSS gap property
- Simplified navigation to avoid React Navigation crashes
- App now runs stable on both simulator and physical device

### Technical
- Simple state-based navigation (no React Navigation)
- Minimal dependencies for stability
- TypeScript support throughout
- Clean architecture with separated concerns (stores, models, services)

## [0.1.0] - 2025-07-18

### Initial Setup
- React Native 0.80.1 project initialization
- iOS configuration and build setup
- Basic 5-screen navigation structure
- Coffee-themed UI design
- Placeholder components for all screens

### Known Issues
- RCTEventEmitter warning appears but doesn't affect functionality
- Realm database integration prepared but needs debugging for iOS