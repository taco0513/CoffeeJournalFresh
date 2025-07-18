# Coffee Journal Fresh

A React Native mobile app for coffee enthusiasts to record and track their coffee tasting experiences.

> 📱 **iOS**: ✅ v0.2.0 Working - Functional tasting flow with in-memory storage  
> 🤖 **Android**: 📅 Planned - After iOS feature completion  
> ✅ **Latest Update**: July 18, 2025 - Working iOS app with form validation

## 🚀 Features

### ✅ Currently Working
- **Coffee Information Input**: Name, roastery, origin, brew method
- **Flavor Selection**: 12 flavor options with visual feedback
- **Form Validation**: Required field validation with alerts
- **Tasting History**: View past tastings with dates
- **In-Memory Storage**: Data persists during app session
- **Simple Navigation**: Stable state-based navigation (no crashes)

### 🔄 In Development
- **Persistent Storage**: Fix Realm or implement AsyncStorage
- **Scoring System**: Body, acidity, sweetness, finish ratings
- **SCA Flavor Wheel**: Professional 4-level flavor hierarchy
- **Photo Capture**: Add coffee bag photos to tastings
- **Search & Filter**: Find specific tastings in history
- **Export Data**: CSV/JSON export functionality
- **Statistics**: Coffee consumption insights

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

- ✅ Phase 1: Basic UI and navigation (Complete)
- 🔄 Phase 2: Core features and persistence (In Progress)
- 📅 Phase 3: Advanced features (Planned)
- 📅 Phase 4: Android support (Future)

## 🤝 Contributing

This is an active development project focused on iOS first, Android second. No web version planned.

## 📝 License

MIT License

---

**Current Focus**: iOS app development. Making it stable and feature-rich before expanding to Android.