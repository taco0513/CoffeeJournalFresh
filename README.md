# Coffee Tasting Journal

> **"나 혼자 커피를 즐기는 걸 넘어서, 전문가·친구들이 느낀 감각의 세계를 배우고, 내 미각 언어를 키워가는 소셜 테이스팅 앱"**

A React Native app that transforms solitary coffee drinking into a social learning experience, helping you develop your palate language by connecting with the sensory world of experts and fellow coffee lovers.

> 📱 **iOS**: ✅ v0.3.0 Working - Complete UI redesign with community features  
> 🤖 **Android**: 📅 Planned - After iOS feature completion  
> ✅ **Latest Update**: July 18, 2025 - Major UI overhaul with 5 phases completed

## 🚀 Features

### ✅ Currently Working
- **Bottom Tab Navigation**: Home, Stats, Community, and Profile tabs
- **Coffee Tasting Flow**: Complete form with flavor profiles and ratings
- **Photo Gallery**: Grid view with lightbox photo viewer
- **Community Feed**: Browse and discover coffee reviews from others
- **Statistics Dashboard**: Visual charts for consumption patterns
- **Review Sharing**: Create and share detailed coffee reviews
- **User Profiles**: Personal statistics and tasting history
- **Modern UI Design**: iOS Human Interface Guidelines compliant

### 🔄 In Development
- **Persistent Storage**: AsyncStorage implementation
- **Advanced Filtering**: Search by flavor, origin, brew method
- **Social Features**: Follow users, like reviews, comments
- **Data Export**: CSV/JSON export functionality
- **Cloud Sync**: Supabase backend integration
- **Push Notifications**: Review interactions and updates

### 🎯 Future Plans
- **Android Support**: Cross-platform compatibility
- **OCR Scanning**: Quick coffee info input from labels
- **Cloud Sync**: Backup data with Supabase
- **Brew Timer**: Track extraction times
- **Social Features**: Share tasting notes

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
- ✅ Phase 4: Community & Social Features
- ✅ Phase 5: Statistics & Data Visualization

### Overall Project Status
- ✅ Core UI/UX: Complete with modern design
- 🔄 Data Persistence: In Progress
- 📅 Backend Integration: Planned
- 📅 Android Support: Future

## 🤝 Contributing

This is an active development project focused on iOS first, Android second. No web version planned.

## 📝 License

MIT License

---

**Current Focus**: iOS app development. Making it stable and feature-rich before expanding to Android.