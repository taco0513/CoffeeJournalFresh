# Technology Stack

## Frontend Framework

### React Native
- **Version**: 0.80+
- **Language**: TypeScript
- **Platform**: iOS & Android
- **Architecture**: Component-based with hooks

**Key Benefits**:
- Cross-platform development
- Native performance
- Large ecosystem
- Strong TypeScript support

## State Management

### Zustand
- **Type**: Lightweight state management
- **Features**: Simple API, TypeScript support
- **Usage**: Global app state, async actions

**Implementation**:
```typescript
// Store definition
export const useTastingStore = create<TastingStore>((set) => ({
  // State and actions
}));
```

## Database

### Realm (Local)
- **Type**: Local-first database
- **Features**: Object database, offline support
- **Usage**: Tasting records, user data

**Key Features**:
- Offline-first architecture
- Object-oriented queries
- Encryption support
- TypeScript integration

### Supabase (Cloud)
- **Type**: PostgreSQL-based BaaS
- **Features**: Real-time subscriptions, auth
- **Usage**: Cloud sync, data collection, analytics

**Key Features**:
- Real-time synchronization
- Row-level security
- Built-in authentication
- Developer data collection

## Navigation

### Simple State-Based Navigation
- **Type**: Custom state management
- **Features**: TypeScript support, simple transitions
- **Implementation**: No external navigation library

**Navigation Stack**:
```
Home → CoffeeInfo → RoasterNotes → FlavorLevels → Sensory → Result
```

## Development Tools

### TypeScript
- **Version**: 5.x
- **Features**: Static typing, IntelliSense
- **Configuration**: Strict mode enabled

### Metro
- **Purpose**: JavaScript bundler
- **Features**: Fast refresh, code splitting
- **Configuration**: Optimized for React Native

### DevUtils (Development Only)
- **Purpose**: Developer data collection tools
- **Features**: Console-based data collection
- **Usage**: Internal analytics, debugging
- **Security**: Development environment only

## Testing Framework

### Jest
- **Purpose**: Unit testing
- **Features**: Snapshot testing, mocking
- **Coverage**: Comprehensive test coverage

### Detox
- **Purpose**: End-to-end testing
- **Features**: Gray-box testing, device testing
- **Platform**: iOS & Android

## Code Quality

### ESLint
- **Purpose**: Code linting
- **Rules**: Airbnb configuration
- **Integration**: Pre-commit hooks

### Prettier
- **Purpose**: Code formatting
- **Configuration**: Consistent formatting
- **Integration**: IDE plugins

## Build Tools

### Gradle (Android)
- **Purpose**: Android build system
- **Features**: Dependency management
- **Configuration**: Multi-variant builds

### Xcode (iOS)
- **Purpose**: iOS build system
- **Features**: Code signing, provisioning
- **Configuration**: Automated builds

## Performance Monitoring

### Flipper
- **Purpose**: Debug platform
- **Features**: Network inspection, layout debugging
- **Plugins**: Redux, databases

### React Native Performance
- **Tools**: JS profiler, native profiler
- **Metrics**: Render time, memory usage
- **Optimization**: Bundle size, startup time

## Internationalization

### react-i18next
- **Purpose**: Internationalization
- **Features**: Pluralization, interpolation
- **Languages**: Korean, English

## Animation

### React Native Reanimated
- **Purpose**: Native animations
- **Features**: 60fps animations, gesture handling
- **Usage**: Score display, transitions

## Platform-Specific

### iOS
- **Minimum Version**: iOS 12.0
- **Language**: Swift/Objective-C (native modules)
- **Features**: Face ID, Apple Pay integration

### Android
- **Minimum API**: Level 21 (Android 5.0)
- **Language**: Java/Kotlin (native modules)
- **Features**: Fingerprint, Google Pay integration

## Development Environment

### Node.js
- **Version**: 18.x LTS
- **Package Manager**: npm/yarn
- **Scripts**: Build, test, lint

### React Native CLI
- **Purpose**: Project management
- **Features**: Run, build, debug
- **Platform**: Cross-platform

## Data Processing

### Flavor Matching Algorithm
- **Language**: TypeScript
- **Features**: Fuzzy matching, NLP
- **Performance**: Optimized for mobile

**Algorithm Components**:
```typescript
- Text normalization
- Synonym matching
- Semantic analysis
- Scoring algorithm
```

## File Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Simple state-based navigation
├── stores/         # Zustand stores
├── services/       # API and database services
│   ├── realm/      # Realm database services
│   ├── supabase/   # Supabase cloud services
│   └── DataCollectionService.ts  # Developer data collection
├── utils/          # Utility functions
│   └── devUtils.ts # Development tools (dev only)
├── data/           # Static data (flavor wheel)
├── types/          # TypeScript type definitions
└── hooks/          # Custom React hooks
```

## Configuration Files

### TypeScript
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2020",
    "module": "commonjs"
  }
}
```

### Babel
```json
{
  "presets": ["module:metro-react-native-babel-preset"],
  "plugins": ["react-native-reanimated/plugin"]
}
```

### Metro
```javascript
module.exports = {
  resolver: {
    assetExts: ['bin', 'txt', 'jpg', 'png', 'json'],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
```

## Security

### Data Encryption
- **Local Storage**: Realm encryption
- **Network**: HTTPS only
- **Keys**: Secure key storage

### Privacy
- **Data Collection**: Minimal data collection
- **Permissions**: Required permissions only
- **Compliance**: GDPR-ready

## Performance Optimization

### Bundle Optimization
- **Code Splitting**: Dynamic imports
- **Tree Shaking**: Remove unused code
- **Minification**: Production builds

### Memory Management
- **Memory Leaks**: Automated detection
- **Garbage Collection**: Optimized patterns
- **Native Modules**: Efficient bridges

## Future Considerations

### Cloud Integration
- **Backend**: Supabase (PostgreSQL)
- **Database**: Already implemented
- **Authentication**: Supabase Auth
- **Sync**: Real-time synchronization via Supabase
- **Data Analytics**: Developer data collection system

### AI/ML Enhancement
- **TensorFlow Lite**: On-device ML
- **Computer Vision**: Image recognition
- **NLP**: Advanced text processing
- **Recommendation**: Personalized suggestions

### Platform Extensions
- **iOS**: Primary platform
- **Android**: Secondary platform
- **Note**: No web version planned

## Version Control

### Git
- **Platform**: GitHub
- **Branching**: GitFlow
- **Commits**: Conventional commits

### CI/CD
- **Platform**: GitHub Actions
- **Testing**: Automated testing
- **Deployment**: Automated builds

## Documentation

### Code Documentation
- **JSDoc**: Inline documentation
- **TypeScript**: Type documentation
- **README**: Project documentation

### API Documentation
- **Format**: Markdown
- **Generation**: Automated
- **Examples**: Code examples

This technology stack provides a robust foundation for building a high-quality, performant, and maintainable coffee tasting application with room for future growth and enhancement.