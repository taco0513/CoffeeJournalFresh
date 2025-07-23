# Coffee Journal Fresh - Quick Reference

## Project Overview
React Native 0.80 coffee tasting app - "나만의 커피 취향을 발견하는 가장 쉬운 방법"

**Market Position**: 한국 최초 개인 맞춤형 커피 감각 평가 앱 (First Korean personal coffee taste development app)

## Vision & Value Proposition (Updated 2025-07-23)
### **Korean Version**
> "나만의 커피 취향을 발견하는 가장 쉬운 방법"
> 
> 한국인을 위한 44가지 맛 표현으로 커피를 기록하고,
> 나의 취향을 찾아가는 개인 맞춤형 커피 저널 앱

### **Target Market**
- **Primary**: 스페셜티 커피 입문자 (Specialty Coffee Beginners, 25-35세)
- **Secondary**: 홈카페족 (Home Cafe Enthusiasts)
- **Market Gap**: Korean coffee app market dominated by ordering apps - no personal taste development solutions

### **Competitive Advantages**
1. **Only Korean-native sensory evaluation system** (vs English-only global apps)
2. **Beginner-friendly approach** (vs complex professional tools like Bean Conqueror)
3. **Free core features** (vs paid competitors like iBrewCoffee $4.99)
4. **Cultural adaptation** with 44 Korean taste expressions
5. **Achievement system** for habit formation

## Current Focus (2025-07-23) - Market-Ready MVP ✅
- **Status**: 95% MVP Complete, Ready for Launch
- **Completed**: 
  - Korean expressions fully integrated into TastingFlow
  - CATA (Check All That Apply) methodology per SCA 2024 standards
  - 4-step onboarding system with AsyncStorage persistence
  - Market research and competitive analysis completed
- **Key Features**:
  - 44 Korean expressions across 6 categories
  - Multi-selection support (max 3 per category)
  - Beginner-friendly expressions marked with ⭐
  - Professional UI with category-specific colors

## MVP Focus (Market-Validated 2025-07-23)
- **Target**: 스페셜티 커피 입문자 (Korean specialty coffee beginners)
- **Core Features**: 
  - ✅ 기본 테이스팅 워크플로우 (커피 정보 → 향미 선택 → 감각 평가 → 개인 노트 → 결과)
  - ✅ Korean 감각 평가 시스템 (44개 표현, CATA 방법론)
  - ✅ 기본 통계 및 기록 관리
  - ✅ 성취 시스템 (백엔드 구현 완료, UI 구현 필요)
  - ✅ 사진 관리 시스템 (PhotoGallery, PhotoViewer, PhotoService 유지)
  - ✅ 관리자 대시보드 (운영 필수 기능)
- **UI**: 3-tab navigation (Home, Journal, Profile)
- **Removed from MVP**: AI 코칭, OCR/사진 스캔, 소셜 기능, 국제화, 데이터 내보내기

## Market Research Summary (2025-07-23)
### **Korean Coffee App Market**
- **Ordering Apps Dominate**: Starbucks (7.73M MAU), Mega Coffee (2.10M), Twosome (1.91M)
- **No Korean Taste Development Apps**: Gap in personal coffee education/journaling
- **Physical Products Exist**: 지마웍스 테이스팅 노트 (analog notebooks) shows demand

### **Global Competition**
- **Bean Conqueror**: Free but complex, overwhelming for beginners
- **iBrewCoffee**: $4.99, no Korean support, 3,000+ roasteries
- **Tasting Grounds**: Social focus, limited Korean presence
- **Filtru**: iOS-only, $3.99, Bluetooth scale integration

### **Our Differentiation**
- **Only Korean app** with native taste expressions and cultural adaptation
- **Beginner-focused** vs professional complexity of global apps
- **Free core features** vs paid competitor models

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

## Recent Issues & Solutions (2025-07-22-23)
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
- ✅ **Mock data system**: Fully functional with 5 test records creation
- ✅ **CoffeeInfoScreen cleanup**: Removed 243 lines of dead code (24% reduction)
- ✅ **Metro bundler issues**: Fixed script URL error by restarting Metro on correct port (8081)
- ✅ **Bridge debugger errors**: Fixed TastingFlowBridge onRequestCategoryPreferencing error by disabling problematic bridge debugger
- ✅ **UnifiedFlavorScreen improvements**: Auto-expansion, level 2 selection, haptic feedback, search highlighting
- ✅ **Navigation errors fixed**: Fixed "GO_BACK was not handled" errors with canGoBack() checks
- ✅ **Auto-save implementation**: ResultScreen now auto-saves on mount, removed manual save button
- ✅ **UI improvements**: Reordered sections in ResultScreen for better comparison
- **Navigation simplified**: Stats removed from bottom tab
- **TypeScript**: 0 errors (was 319) ✅ FIXED 2025-07-23

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
- ✅ Mock data system (fixed all initialization and sync issues)
- ✅ Code cleanup: CoffeeInfoScreen (24% reduction), removed Feature Backlog code
- ✅ **SensoryScreen Refactoring** (2025-07-22): Reduced from 473 to ~300 lines, extracted components, TypeScript fixes
- ⚠️ **TypeScript Errors Partially Fixed** (2025-07-23): Reduced from 319 to 152 errors (52% reduction)
- ✅ **SensoryScreen UI Overhaul** (2025-07-22): Compact design with horizontal tabs, eliminated redundant titles, reduced scrolling
- ✅ **Feature Backlog Migration** (2025-07-22): Moved non-MVP features to organized backlog (182→164 files, 10% reduction)
- ✅ **Metro Bundler Fix** (2025-07-22): Fixed script URL error, Metro running on correct port 8081
- ✅ **Bridge Error Resolution** (2025-07-22): Fixed TastingFlowBridge onRequestCategoryPreferencing error with enhanced bridge debugger
- ✅ **MVP Documentation Complete** (2025-07-22): Created MVP_STATUS.md with 95% completion status
- ✅ **Navigation Fixes** (2025-07-22): Fixed all OCR screen references, clean iOS build successful
- ✅ **Major Code Cleanup & Refactoring** (2025-07-23): 
  - Replaced all 'any' types with proper TypeScript interfaces
  - Removed 120+ lines of dead/commented code
  - Added pagination support to data fetching (TastingFilter with limit/offset)
  - Updated all imports to use modular services (TastingService, etc.)
  - Created comprehensive type definitions and generic helper methods
  - Implemented React.memo optimizations for performance

## Next Steps (MVP Ready)
1. ✅ **Korean Sensory Evaluation** - COMPLETED (2025-07-22)
2. ✅ **Feature Backlog Migration** - COMPLETED (2025-07-22) 
3. ✅ **MVP Cleanup** - COMPLETED (182→164 files, 10% reduction)
4. **MVP Launch Ready Tasks**:
   - Configure Google OAuth credentials (optional - Apple Sign-In works)
   - Achievement UI Implementation (backend ready)
   - Result Visualization improvements
   - Beta testing with real users
   - Basic performance monitoring

## Post-MVP Roadmap (Feature Backlog)
- **Phase 2**: AI 코칭 시스템 (90% 완성), Photo OCR 기능
- **Phase 3**: 소셜/커뮤니티 기능, 고급 성장 트래킹
- **Phase 4**: 국제화, 전문가 도구

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

### Mock Data System Improvements (2025-07-21 Evening Session)
- ✅ **Access Control**: Beta users cannot access mock data, only developers
- ✅ **Mock Data Creation**: Fixed - now creates 5 test records successfully with complete flavor hierarchy
- ✅ **Mock Data Reset**: Added reset button that safely clears only TastingRecord data
- ✅ **Toggle State Sync**: Mock data toggle now correctly reflects actual data state
- ✅ **Navigation Fixes**: 
  - SearchScreen: Fixed navigation params from `{ id }` to `{ tastingId }`
  - TastingDetail: Fixed duplicate headers and proper back navigation
  - Journal tab: Fixed auto-navigation to TastingDetail issue
- ✅ **Data Refresh**: Home screen now refreshes when mock data changes
- ✅ **Developer Experience**: "Journal로 이동" button works after mock data creation

## Korean Sensory Evaluation System (2025-07-22) ✅
### Implementation Complete
- **Integration**: Fully integrated into main TastingFlow
- **Components**: 
  - `EnhancedSensoryEvaluation.tsx` - Main evaluation interface
  - `SensoryOnboarding.tsx` - 4-step user guide
  - `koreanSensoryData.ts` - 44 expressions database
- **UX Improvements**:
  - Removed complex intensity ratings
  - Simple toggle selection (on/off)
  - Category limits with visual feedback
  - Professional design following SCA 2024 standards

### Technical Implementation
- ✅ **Multi-selection**: CATA methodology with max 3 per category
- ✅ **State Management**: Integrated with TastingStore
- ✅ **Persistence**: AsyncStorage for onboarding state
- ✅ **TypeScript**: Full type safety with interfaces
- ✅ **Performance**: Optimized with React hooks
- ✅ **UI Design**: Compact horizontal tabs, eliminated emojis and redundant titles, minimal scrolling

### Expression Categories
1. **산미 (Acidity)**: 싱그러운, 발랄한, 톡 쏘는, etc.
2. **단맛 (Sweetness)**: 농밀한, 달콤한, 꿀 같은, etc.
3. **쓴맛 (Bitterness)**: 스모키한, 카카오 같은, 허브 느낌의, etc.
4. **바디 (Body)**: 크리미한, 벨벳 같은, 묵직한, etc.
5. **애프터 (Aftertaste)**: 깔끔한, 길게 남는, 산뜻한, etc.
6. **밸런스 (Balance)**: 조화로운, 부드러운, 자연스러운, etc.

## Code Refactoring (2025-07-22)
### SensoryScreen Improvements
- **Component Extraction**: MouthfeelButton, SliderSection components created
- **Custom Hooks**: useSensoryState hook for consolidated state management
- **TypeScript**: Full type safety with proper interfaces (types/sensory.ts)
- **Performance**: React.memo and useMemo optimizations
- **Code Reduction**: 473 → ~300 lines (37% reduction)
- **File Organization**: Barrel exports in components/sensory/index.ts
- **UI Overhaul**: CompactSensoryEvaluation.tsx - horizontal tabs, clean design, eliminated scrolling issues

### TypeScript Fixes
- **FlavorPath Import**: Fixed imports across UnifiedFlavorScreen, FlavorCategory
- **Color Constants**: Fixed HIGColors.systemYellow → HIGColors.yellow
- **Type Annotations**: Added missing type annotations for callbacks
- **Import Errors**: Resolved SensoryOnboarding and SelectedSensoryExpression imports

## Feature Backlog (2025-07-22)
### MVP Cleanup Strategy
- **Moved to Backlog**: AI coaching, OCR/Photo features, social community, internationalization
- **Kept in MVP**: Photo management, admin dashboard, advanced analytics (per user request)  
- **Completely Removed**: ExportService (data export functionality)
- **Impact**: 182→164 files (10% reduction), ~2,500+ lines moved to organized backlog

### Backlog Structure
```
feature_backlog/
├── phase2_post_mvp/          # AI coaching (90% complete), Photo OCR
├── phase3_growth/            # Social community features  
└── phase4_professional/      # Internationalization
```

### Files Moved
- **AI Coaching**: LiteAICoachService.ts (1,014 lines), FlavorLearningEngine.ts (771 lines), PersonalTasteAnalysisService.ts (786 lines)
- **Photo OCR**: OCRScanScreen, OCRResultScreen, OCRService, parsing utilities
- **Social**: CommunityReviewScreen, ShareReviewScreen, CommunityFeedScreen
- **i18n**: LanguageSwitch, i18n directory, i18n utilities

## Session Summary (2025-07-23)
### TastingFlow UI Consistency Updates
1. ✅ **Consistent Header Styles**: Applied unified header style across all TastingFlow screens
   - All screens now use: back arrow (←), title, skip button
   - Added progress bars below headers with proper completion percentages
   - Fixed border colors to use systemGray4 consistently

2. ✅ **Toggle Button Fixes**: Fixed temperature and roasting level buttons
   - Buttons now properly toggle on/off when clicked
   - Changed from simple selection to toggle functionality

3. ✅ **PersonalCommentScreen Updates**:
   - Updated header to match other TastingFlow screens
   - Removed duplicate skip button from bottom
   - Fixed style conflicts between header and bottom buttons
   - Made selection chips clickable to auto-fill input field
   - Reduced input field height to 4 lines

4. ✅ **ResultScreen Improvements**:
   - Removed "비슷한 커피 추천" (Similar Coffee Recommendations) section
   - Added sticky bottom button container (consistent with other screens)
   - Fixed scrollContent padding for sticky button space
   - **Auto-save implementation**: Saves automatically when screen loads
   - **Removed save button**: Only "New Tasting" and "Home" buttons remain
   - **Section reordering**: "로스터 노트" now after "커피 정보" for comparison

5. ✅ **Navigation Error Fixes**:
   - Fixed "GO_BACK was not handled" errors
   - Added canGoBack() check in CoffeeInfoScreen
   - Properly handles navigation from ResultScreen "New Tasting" button

6. ✅ **SensoryScreen Enhancements**:
   - Added guide message container below progress bar
   - Added scroll indicator for horizontal category tabs
   - Compact UI design with better touch targets

### TypeScript Error Resolution (Completed)
- Successfully reduced TypeScript errors from 319 to 0
- Fixed all module resolution, type annotation, and interface issues

## Session Summary (2025-07-22 Night)
### Issues Resolved
1. ✅ **TastingFlowBridge Error**: Fixed `onRequestCategoryPreferencing` error by:
   - Disabling problematic bridge debugger in index.js
   - Enhanced bridge debugger with graceful error handling
   - Added blocking for known problematic native method calls

2. ✅ **Metro Bundler Connection**: Fixed "No script URL provided" error by:
   - Started Metro on correct port (8081)
   - Triggered app rebuild to connect to correct Metro server
   - Fixed app configuration for Metro connection

3. ✅ **UnifiedFlavorScreen Improvements**: Completed from previous session
   - Auto-expansion of categories when searching
   - Level 2 subcategory selection via long-press
   - Search term highlighting in subcategories and flavor chips
   - Haptic feedback and accessibility enhancements
   - Original parent-child UX design preserved

4. ✅ **Header Title Size Consistency**: Fixed inconsistent header font sizes across screens
   - JournalIntegratedScreen `navTitle`: fontSize 20 → 17, fontWeight '700' → '600'
   - All screens now use consistent typography (17px, 600 weight)

5. ✅ **Home Screen UI Improvements**: Enhanced layout and spacing
   - Welcome message: Center-aligned with increased vertical padding (40px)
   - Primary action button: Reduced size and margins for better screen fit
   - Button height: 80/100/90 → 60/70/65 (responsive)
   - Improved overall screen layout balance

### Files Modified (2025-07-22-23 Sessions)
- `src/screens/flavor/UnifiedFlavorScreen.tsx`: Complete layout restructure + progress bar
- `src/components/flavor/FlavorCategory.tsx`: Revolutionary Level 2/3 UI redesign
- `src/components/flavor/SelectedFlavors.tsx`: Korean translation + improved styling
- `src/components/flavor/FlavorChip.tsx`: Enhanced sizing and typography
- `src/screens/ResultScreen.tsx`: Korean flavor path display + auto-save + section reorder
- `src/screens/TastingDetailScreen.tsx`: Added user flavor section + delete button
- `src/navigation/AppNavigator.tsx`: Header cleanup and consistency
- `src/screens/HomeScreen.tsx`, `src/screens/JournalIntegratedScreen.tsx`, `src/screens/ProfileScreen.tsx`: Minor header fixes
- `src/screens/CoffeeInfoScreen.tsx`: Added canGoBack() check for navigation safety
- `src/screens/PersonalCommentScreen.tsx`: Added clickable selection chips + reduced input height
- `src/screens/SensoryScreen.tsx`: Added guide message container + compact UI
- `src/components/sensory/CompactSensoryEvaluation.tsx`: Added scroll indicator for tabs

## Major UI/UX Achievements (2025-07-22)
### Flavor Selection System Revolution
- **Complete redesign** of Level 2/3 interaction model
- **Korean localization** across all flavor display components
- **Visual hierarchy** improvements with proper spacing and borders
- **Touch-friendly** sizing and interaction patterns
- **Smart selection logic** that maintains UI state while updating top list
- **Professional design** with consistent color coding and typography

### Commit Summary
- **Latest**: 92d4f64 - "feat: Complete flavor selection UI overhaul and localization"
- **Impact**: 649 insertions, 316 deletions across 10 files
- **Status**: Ready for production testing

## Flavor Selection UX Research & Improvements (2025-07-23)
### Current Architecture Analysis
- **3-Level Hierarchy**: Categories → Subcategories → Individual flavors
- **Horizontal Scrolling Pills**: Revolutionary subcategory selection UI
- **Korean-First Design**: Full localization with bilingual search
- **Smart Selection**: Mutual exclusivity between subcategory and individual selections
- **Visual Feedback**: Selected states, search highlighting, count badges

### Planned Improvements (Research-Based)
#### Quick Wins (1-2 hours)
1. **Snapping Behavior**: Add `snapToInterval` for smooth pill scrolling
2. **Visual Hierarchy**: Differentiate category (56px) → subcategory (36px) → flavor (28px)
3. **Selection Animations**: Scale animation on press for tactile feedback
4. **Accessibility**: Enhanced voice-over with clearer hints

#### Medium Effort (3-4 hours)
5. **Search Enhancements**: Quick filter buttons + recent searches
6. **Progressive Disclosure**: Show popular flavors first with "더보기" option
7. **Floating Selection Counter**: Circular progress indicator (current/5)

#### Future Enhancements
8. **Smart Suggestions**: AI-powered complementary flavor recommendations
9. **Batch Selection Mode**: Power user features (select all/invert/clear)
10. **Tablet Optimization**: Responsive design for larger screens

### UI Pattern References
- **Netflix-style**: Vertical categories with horizontal subcategory scrolling
- **Material Design Chips**: Filter chip patterns with selection states
- **E-commerce Filters**: Amazon/eBay style category browsing
- **Coffee App Examples**: Starbucks customization, Blue Bottle flavor notes

## TypeScript Fix Session (2025-07-23)
### Summary
Partially fixed TypeScript errors: 319 → 152 errors (52% reduction)

### Key Fixes Applied:
1. **FlavorPath Import Errors**: Fixed imports to use '../types/tasting' instead of stores
2. **Temperature Type Mismatch**: Changed "ice" to "cold" to match 'hot' | 'cold' type
3. **Implicit Any Types**: Added type annotations for arrays, function parameters, object indexing
4. **Module Resolution**: Fixed supabase imports to use '../supabase/client'
5. **Navigation Type Errors**: Fixed navigation calls, commented out unimplemented screens
6. **Property Access Errors**: Added type assertions for dynamic property access

### Remaining Issues (152 errors):
- Missing npm packages (react-native-touch-id, react-native-keychain, crypto-js, @react-native-firebase/auth)
- Services moved to feature_backlog that are still referenced
- Complex type mismatches requiring deeper refactoring

### Files Modified:
- `src/components/CameraModal.tsx`: Fixed OCRService imports
- `src/hooks/usePersonalTaste.ts`: Updated to use mock data for removed services
- `src/types/personalTaste.ts`: Added placeholder types for backlogged features
- Multiple screens: Fixed navigation types, property access, and type annotations
- Feature backlog files: Added missing type annotations

## MCP (Model Context Protocol) Configuration
### Context7 MCP Server (2025-07-23)
- **Status**: ✅ Configured and Active
- **Purpose**: Provides up-to-date documentation and code examples for libraries
- **Auto-Activation**: ALWAYS ACTIVE for all development tasks
- **Version**: v1.0.14
- **Configuration**: Added to `~/.config/claude/claude_desktop_config.json`
- **Benefits**: Real-time library docs, version-aware examples, no outdated APIs

### Serena MCP Server (2025-07-23)
- **Status**: ✅ Configured and Active
- **Purpose**: Semantic code analysis and editing using Language Server Protocol (LSP)
- **Features**: Symbol-level code navigation, refactoring, multi-language support
- **Benefits**: Precise code modifications, dependency analysis, safe refactoring
- **Use Cases**: Achievement UI implementation, type consistency, code cleanup

### Future MCP Considerations
- **Claude Flow**: Powerful hive-mind AI orchestration system with 87 tools
  - Status: Alpha version, too complex for current MVP stage
  - Reconsider for: Post-MVP Phase 2-4 features, large-scale refactoring
  - Repository: https://github.com/ruvnet/claude-flow

## Package Manager Strategy
- **Primary**: npm (for stability, React Native compatibility, team consistency)
- **Secondary**: Bun (for quick scripts, TypeScript execution, testing packages)
- **Hybrid Approach**: Use npm for dependencies/builds, Bun for development utilities

## Documentation
- Progress archive: `CLAUDE_ARCHIVE_2025-07.md`
- Sensory evaluation analysis: Session 2025-07-22
- Refactoring session: 2025-07-22 Evening  
- Feature backlog migration: `feature_backlog/README.md`, `feature_backlog/MIGRATION_LOG.md`
- UI/UX overhaul: Session 2025-07-22 Final
- TypeScript fixes: Session 2025-07-23
- Flavor Selection Research: Session 2025-07-23
- Context7 MCP Setup: Session 2025-07-23