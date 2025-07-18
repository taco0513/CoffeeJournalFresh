# Coffee Tasting Journal

A comprehensive progressive web app (PWA) and mobile app for coffee enthusiasts to record, analyze, and track their coffee tasting experiences with AI-powered flavor matching.

> 🌐 **Web Version**: ✅ **Ready for Testing** - Full-featured web app available at http://localhost:3000  
> 📱 **Mobile Version**: ✅ **iOS Ready** - React Native version working, renamed to CoffeeJournalFresh  
> ✅ **Current Features**: Complete tasting workflow, IndexedDB storage, OCR-ready interface

## 🚀 Features

### ✅ 현재 사용 가능
- **7-Step Tasting Flow**: Systematic coffee evaluation process
- **OCR Scanning**: Quick coffee info input with camera
- **Smart Autocomplete**: Contextual suggestions based on previous entries
- **AI-Powered Matching**: Intelligent comparison between roaster notes and user selections
- **Flavor Wheel Integration**: Based on SCA (Specialty Coffee Association) flavor wheel
- **Bilingual Support**: Korean and English language support
- **Local Storage**: Offline-first with Realm database
- **Match Scoring**: Sophisticated algorithm combining flavor (60%) and sensory (40%) attributes
- **Comparison Data**: View how others rated the same coffee

### 🔄 개발 중
- **Cloud Sync**: Cross-device synchronization with Supabase
- **User Authentication**: Personal coffee journey tracking
- **Developer Data Collection**: Internal analytics system for coffee trends
- **Photo Attachments**: Add coffee/cafe photos to tastings

## 📱 Screenshots

*Coming soon...*

## 🛠️ Tech Stack

### Web Version (Primary)
- **Frontend**: Next.js 15 with TypeScript
- **State Management**: Zustand
- **Database**: IndexedDB (Browser Storage)
- **UI Framework**: Tailwind CSS
- **OCR**: Web APIs (Camera + Tesseract.js ready)
- **Platform**: Progressive Web App (PWA)

### Mobile Version (iOS Ready)
- **Frontend**: React Native 0.80.1 with TypeScript
- **State Management**: Zustand
- **Database**: Realm (Local-first)
- **Navigation**: Simple state-based navigation (no React Navigation)
- **Platform**: iOS working, Android pending
- **Status**: JavaScript bridge error fixed, builds and runs successfully

## 🚀 Quick Start

### Web Version (Recommended)
```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Mobile Version (iOS - Ready)
```bash
# Install dependencies
npm install

# iOS Device (requires Xcode setup)
npm run ios-device

# iOS Simulator
npm run ios

# Note: Project renamed to CoffeeJournalFresh for iOS
# All path configuration issues resolved
# JavaScript bridge error fixed
```

## 📚 Documentation

- [Features](./FEATURES.md) - Detailed feature specifications
- [Tech Stack](./TECH-STACK.md) - Technical implementation details
- [Setup Guide](./docs/SETUP.md) - Development environment setup
- [Architecture](./docs/05-ARCHITECTURE.md) - System architecture overview
- [Data Collection](./DATA_COLLECTION_README.md) - Developer data collection system

## 🔄 Workflow

1. **Coffee Info** → Enter comprehensive coffee details (cafe, roastery, name, origin, variety, altitude, process, roast level, temperature)
2. **Photo Upload** → OCR-ready photo upload for automatic data extraction
3. **Roaster Notes** → Input roaster's flavor descriptions
4. **Flavor Selection** → 4-level hierarchical flavor selection
5. **Sensory Evaluation** → Rate body, acidity, sweetness, finish, mouthfeel
6. **Results** → View match score, community comparison, and similar coffees

## 🎯 Match Algorithm

- **Flavor Matching (60%)**: Compares roaster notes with user selections
- **Sensory Matching (40%)**: Evaluates sensory attribute alignment
- **Score Range**: 0-100% matching accuracy
- **Bilingual Processing**: Supports Korean and English terms

## 📊 Key Metrics

- **Match Score**: Overall tasting accuracy
- **Flavor Score**: Flavor profile matching
- **Sensory Score**: Sensory attribute alignment
- **Historical Tracking**: View past tasting performance

## 🔧 Development

This project uses:
- React Native 0.80.1
- React 19.1.0
- TypeScript for type safety
- Zustand for state management
- Realm for local data persistence
- Supabase for cloud sync and data collection
- SCA flavor wheel for standardized flavor terminology
- Simple state-based navigation (no React Navigation for stability)

### Developer Tools
- **DevUtils**: Console tools for data collection (development only)
- **DataCollectionService**: Internal analytics system
- **Supabase Admin**: Database management

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.