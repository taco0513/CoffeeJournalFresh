# Coffee Journal Fresh - Complete User Flow Testing Checklist

## 🎯 Testing Status: 
- **App Running**: ✅ iPhone 16 Simulator
- **Metro Bundler**: ✅ Running on port 8081
- **Build Status**: ✅ Production ready

---

## 🔐 1. Authentication Flow Testing ✅ COMPLETED

### a) Guest Mode Flow:
- [ ] App opens to SignInScreen
- [ ] Tap "Skip" or "게스트로 둘러보기" 
- [ ] Verify all main tabs accessible with mock data
- [ ] Check guest notices appear on appropriate screens
- [ ] Test language toggle (Korean ↔ English)

### b) Apple Sign-In Flow:
- [ ] Tap "Sign in with Apple" button
- [ ] Verify "Apple Sign-In only works on real devices" message shows in simulator
- [ ] On real device: Complete Apple authentication flow

---

## 🧭 2. Main Navigation Testing 🔄 IN PROGRESS

### Home Tab Testing:
- [ ] **Header Elements**: BETA badge, language toggle, coffee shop icon
- [ ] **Main Stats Cards**: 
  - [ ] Total tastings count
  - [ ] Average match score
  - [ ] Favorite roaster
  - [ ] Quality score
- [ ] **Discovery Section**: 
  - [ ] Coffee discovery alerts
  - [ ] New coffee notifications
  - [ ] Achievement badges
- [ ] **Action Buttons**:
  - [ ] "시작하기" tasting button navigation
  - [ ] Quick stats navigation
- [ ] **Analytics Tracking**: Screen view events

### Journal Tab Testing:
- [ ] **Navigation Bar**: Consistent design with Home
- [ ] **Coffee Records Display**:
  - [ ] Unified card design with score badges
  - [ ] Color coding: 85%+ green, 70%+ orange, <70% red
  - [ ] Coffee name, roaster, date display
  - [ ] No "매칭률" label (clean minimal design)
- [ ] **Filtering & Search**: 
  - [ ] Date range filtering
  - [ ] Roaster filtering
  - [ ] Search functionality
- [ ] **Empty State**: Guest mode vs authenticated mode
- [ ] **Card Interactions**: Tap to view details

### Stats Tab Testing:
- [ ] **Personal Statistics**:
  - [ ] Charts and visualizations
  - [ ] Achievement progress display
  - [ ] Flavor preference analysis
  - [ ] Coffee consumption patterns
- [ ] **Guest Mode**: Mock statistics display
- [ ] **Data Insights**: Quality scores, match rates
- [ ] **Interactive Elements**: Chart interactions

### Profile Tab Testing:
- [ ] **User Information**: Display name, level, verification status
- [ ] **Navigation Options**:
  - [ ] "나의 커피 여정" → PersonalTasteDashboard
  - [ ] Settings access
  - [ ] Developer mode (if admin)
- [ ] **Guest Mode**: Login prompts and mock profile
- [ ] **Language Settings**: Korean/English toggle

---

## ☕ 3. Coffee Tasting Flow (End-to-End) 🔄 PENDING

### Coffee Selection Phase:
- [ ] **Smart AutoComplete**:
  - [ ] Type 2 characters in roastery field → Supabase search triggers
  - [ ] Type 2 characters in coffee name → filtered coffee list
  - [ ] Real-time dropdown suggestions
- [ ] **Auto-Fill System**:
  - [ ] Coffee selection → auto-populate origin, variety, process
  - [ ] Altitude, roaster notes auto-fill
  - [ ] Smart coffee name parsing (e.g., "에티오피아 예가체프 G1")
- [ ] **새 커피 등록**: Add new coffee option when no matches

### Tasting Journey:
- [ ] **Sensory Evaluation Steps**:
  - [ ] Aroma assessment (Fragrance/Aroma)
  - [ ] Flavor wheel navigation (Level 1, 2, 3)
  - [ ] Acidity, Body, Finish evaluation
  - [ ] Overall impression scoring
- [ ] **Draft Functionality**:
  - [ ] Save draft mid-tasting
  - [ ] Resume from draft
  - [ ] Draft recovery modal
- [ ] **Completion & Submission**:
  - [ ] Final score calculation
  - [ ] Analytics event tracking
  - [ ] Return to journal/home

### Data Validation:
- [ ] **Required Fields**: Proper validation
- [ ] **Score Ranges**: Realistic score constraints
- [ ] **Database Storage**: Verify data persistence

---

## 🎯 4. Personal Taste Discovery 🔄 PENDING

### Personal Taste Dashboard:
- [ ] **Navigation**: Profile → "나의 커피 여정" → PersonalTasteDashboard
- [ ] **Back Navigation**: Returns to ProfileMain (not goBack())
- [ ] **Data Display**:
  - [ ] Taste patterns visualization
  - [ ] Data-driven insights (no "AI" terminology)
  - [ ] Quality score metrics
  - [ ] Growth timeline
- [ ] **Guest Mode**: Mock personal taste data

### Quiz System:
- [ ] **PersonalTasteQuiz Access**: From dashboard
- [ ] **Quiz Flow**:
  - [ ] Interactive questions
  - [ ] Progress tracking
  - [ ] Hint system
  - [ ] Real-time scoring
- [ ] **Results Screen**:
  - [ ] Detailed analysis
  - [ ] Flavor category proficiency
  - [ ] Growth recommendations
  - [ ] Achievement unlocking
- [ ] **Navigation**: Quiz → Results → Dashboard

### Achievement System:
- [ ] **Achievement Types**: 15+ achievement categories
- [ ] **Progress Tracking**: Real-time updates
- [ ] **Coffee Discovery**: Explorer badges (Lv.1/2/3)
- [ ] **Notifications**: Achievement unlock alerts

---

## 🔍 5. Coffee Discovery & Admin Features 🔄 PENDING

### Coffee Catalog:
- [ ] **Search & Discovery**: 40+ initial coffee entries
- [ ] **Community Database**: User submissions
- [ ] **Auto-completion**: Roaster-based search
- [ ] **새 커피 등록**: Community contribution system

### Admin Interface (hello@zimojin.com only):
- [ ] **Access Control**: Admin-only visibility
- [ ] **Coffee Management**:
  - [ ] Review pending submissions
  - [ ] Approve/reject/edit operations
  - [ ] Bulk operations
- [ ] **Statistics**: Real-time admin dashboard
- [ ] **Notifications**: Admin workflow alerts

### Reward System:
- [ ] **Discovery Alerts**: New coffee notifications
- [ ] **Achievement Badges**: Coffee explorer rewards
- [ ] **Progress Tracking**: Home screen indicators

---

## 💬 6. Beta Feedback System 🔄 PENDING

### Shake-to-Feedback:
- [ ] **Shake Detection**: 2-second threshold
- [ ] **Modal Trigger**: Automatic feedback popup
- [ ] **Device Compatibility**: iOS and Android
- [ ] **Accidental Prevention**: Proper threshold settings

### Floating Feedback Button:
- [ ] **Visibility**: Always accessible overlay
- [ ] **Draggable Position**: Avoid UI obstruction
- [ ] **Design**: Semi-transparent coffee theme
- [ ] **Animation**: Press feedback effects

### Feedback Modal:
- [ ] **Categories**: Bug Report, Improvement, Feature Idea, Praise
- [ ] **Priority Levels**: Low, Medium, High
- [ ] **Content**: 500 character limit text input
- [ ] **Device Info**: Automatic attachment (OS, version, model)
- [ ] **Offline Support**: Queue management
- [ ] **Submission**: Supabase beta_feedback table

---

## 🛠️ 7. Developer Mode Features 🔄 PENDING

### Access & Setup:
- [ ] **Access**: Profile → 개발자 모드
- [ ] **Feature Toggles**: Debug settings, performance metrics
- [ ] **Quick Login**: Bypass authentication for testing
- [ ] **Test User**: Level 10, verified, moderator privileges

### Test Data Generation:
- [ ] **Coffee Tastings**: 15 comprehensive test records
- [ ] **Premium Coffee Shops**: Blue Bottle, Fritz, Anthracite, etc.
- [ ] **Diverse Chains**: Starbucks, Paul Bassett, Hollys, etc.
- [ ] **Realistic Data**: Complete flavor profiles, match scores
- [ ] **One-Click Addition**: Easy test data insertion

### Persistent Settings:
- [ ] **AsyncStorage**: Settings survive app restarts
- [ ] **Clean Toggle**: Dev mode entry resets other settings
- [ ] **Exit Behavior**: Return to production state

---

## ⚠️ 8. Error Scenarios & Edge Cases 🔄 PENDING

### Network & Connectivity:
- [ ] **Offline Mode**: App functionality without internet
- [ ] **Network Errors**: Graceful error handling
- [ ] **Retry Logic**: Exponential backoff implementation
- [ ] **Queue Management**: Offline feedback storage

### Data & State Management:
- [ ] **Empty States**: No journal entries, no stats
- [ ] **Invalid Inputs**: Form validation edge cases
- [ ] **Memory Pressure**: Large data sets, image handling
- [ ] **App Lifecycle**: Background/foreground transitions

### User Experience:
- [ ] **Loading States**: Proper loading indicators
- [ ] **Error Messages**: User-friendly error communication
- [ ] **Graceful Degradation**: Feature unavailability handling
- [ ] **Performance**: Smooth animations, responsive UI

---

## 📊 Analytics & Performance Monitoring

### AnalyticsService Testing:
- [ ] **Screen Tracking**: Automatic screen view events
- [ ] **User Actions**: Button clicks, feature usage
- [ ] **Session Management**: Session start/end tracking
- [ ] **Offline Queue**: Event storage and sync

### Performance Monitoring:
- [ ] **Crash Reporting**: Automatic crash detection
- [ ] **Response Times**: API performance tracking
- [ ] **Memory Monitoring**: Memory usage alerts
- [ ] **Error Boundaries**: React error handling

---

## 🎯 Manual Testing Instructions

### For Simulator Testing:
1. **Start Testing**: Open simulator, begin with authentication
2. **Navigation Flow**: Test each tab systematically
3. **Feature Flow**: Complete tasting → personal taste → feedback
4. **Edge Cases**: Test empty states, errors, offline mode

### For Device Testing:
1. **Apple Sign-In**: Test real authentication flow
2. **Shake Detection**: Test feedback shake functionality
3. **Performance**: Real device performance validation
4. **Push Notifications**: If implemented

---

## ✅ Testing Completion Checklist

- [ ] All authentication flows working
- [ ] All navigation tabs functional
- [ ] Complete tasting flow operational
- [ ] Personal taste system working
- [ ] Coffee discovery features active
- [ ] Feedback system responsive
- [ ] Developer mode accessible
- [ ] Error handling graceful
- [ ] Analytics tracking active
- [ ] Performance within limits

---

**Total Test Cases**: ~100+ individual test scenarios
**Estimated Testing Time**: 2-3 hours comprehensive testing
**Critical Path**: Authentication → Navigation → Tasting → Personal Taste