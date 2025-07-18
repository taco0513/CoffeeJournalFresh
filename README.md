# Coffee Tasting Journal

> **"나만의 커피 테이스팅 여정을 기록하고, 미각 언어를 키워가는 개인 커피 저널"**

A React Native app that helps you document your personal coffee journey, develop your palate language, and track your tasting experiences with professional-grade tools and insights.

> 📱 **iOS**: ✅ v0.3.0 Working - Core personal journal features  
> 🤖 **Android**: 📅 Planned - After iOS feature completion  
> ✅ **Latest Update**: July 18, 2025 - Focus on core journal functionality

## 🚀 Features

### ✅ Currently Working
- **Bottom Tab Navigation**: Home, Stats, Community, and Profile tabs
- **Coffee Tasting Flow**: Complete form with flavor profiles and ratings
- **Photo Gallery**: Grid view with lightbox photo viewer
- **Statistics Dashboard**: Visual charts for consumption patterns
- **Modern UI Design**: iOS Human Interface Guidelines compliant
- **Community UI**: Complete UI implementation (backend integration pending)

### 🔄 In Development - Core Features
- **Supabase Data Sync**: Personal data backup and sync
- **Advanced Filtering**: Search by flavor, origin, brew method
- **Personal Coffee Library**: Organize and track your coffee collection
- **Tasting Notes Enhancement**: Rich text editing and categorization
- **Brew Timer**: Track extraction times
- **Offline-First Architecture**: Seamless sync when online

### 📋 Backlog / Future Features
- **Community Backend Integration**: Social features, following, comments
- **Push Notifications**: Review interactions and updates
- **OCR Scanning**: Quick coffee info input from labels
- **Android Support**: Cross-platform compatibility
- **Social Features**: Share tasting notes with friends

## 📱 Screenshots

*Coming soon...*

## 🛠️ Tech Stack

- **Framework**: React Native 0.80.1
- **Language**: TypeScript
- **State Management**: Zustand
- **Database**: Realm (prepared, not active)
- **Navigation**: Simple state-based (no React Navigation)
- **Platform**: iOS (Android planned)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Xcode 15+
- iOS Simulator or physical device

### Installation

```bash
# Clone the repository
git clone https://github.com/taco0513/CoffeeJournalFresh.git
cd CoffeeJournalFresh

# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Start Metro
npm start

# Run on iOS
npm run ios
# or for physical device
npm run ios-device
```

## 📁 Project Structure

```
CoffeeJournalFresh/
├── App.tsx                    # Main app with navigation
├── src/
│   ├── stores/               # Zustand state management
│   ├── models/               # Realm database models (prepared)
│   ├── services/             # Business logic
│   └── contexts/             # React contexts
├── ios/                      # iOS native code
└── docs/                     # Documentation
```

## 🐛 Known Issues

1. **RCTEventEmitter Warning**: Harmless warning that doesn't affect functionality
2. **Data Persistence**: Currently only saves in memory (lost on app restart)
3. **Realm Integration**: Prepared but needs iOS configuration debugging

## 📈 Development Progress

### UI Improvements (Completed July 18, 2025)
- ✅ Phase 1: Bottom Tab Navigation Implementation
- ✅ Phase 2: Screen Layout & Component Design
- ✅ Phase 3: Photo Gallery & Viewer Features
- ✅ Phase 4: Community UI (Backend integration postponed)
- ✅ Phase 5: Statistics & Data Visualization

### Current Focus Areas
- 🎯 **Core Journal Features**: Personal coffee tracking and analysis
- 🎯 **Data Persistence**: Local storage for offline-first experience
- 🎯 **User Experience**: Smooth, intuitive tasting workflow
- 🎯 **Analytics**: Personal insights and progress tracking

### Project Status
- ✅ Core UI/UX: Complete with modern design
- 🔄 Data Persistence: Active Development
- 📋 Community Backend: In Backlog
- 📋 OCR Features: In Backlog
- 📅 Android Support: Future Release

## 🤝 Contributing

This is an active development project focused on iOS first, Android second. No web version planned.

## 📝 License

MIT License

---

**Current Focus**: iOS app development. Making it stable and feature-rich before expanding to Android.