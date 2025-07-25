# CupNote Beta Testing Guide

## 🎯 Overview

Welcome to CupNote's dual-market beta testing program! This guide covers everything you need to know about testing our Korean-first coffee tasting app with simultaneous US beta market support.

**CupNote (컵노트)**: "나만의 커피 취향을 발견하는 가장 쉬운 방법" (The easiest way to discover your unique coffee taste profile)

---

## 🌍 Dual-Market Strategy

### Korean Primary Market (한국 시장)
- **Status**: Production-ready primary market
- **Language**: Korean (한국어)
- **Target Users**: 10,000 users
- **Features**: Full feature set including Lab Mode
- **Focus**: Complete coffee tasting experience with Korean sensory expressions

### US Beta Market (미국 베타 시장)
- **Status**: Beta testing phase
- **Language**: English
- **Target Users**: 500 beta testers
- **Features**: Core features excluding Lab Mode (initially)
- **Focus**: Validation of international market fit and English UX

---

## 🚀 Getting Started

### For Korean Market Users
1. **App Language**: Automatically detects Korean locale
2. **Features Available**: All MVP features including Lab Mode
3. **Feedback**: Standard feedback channels (in-app, email, KakaoTalk)
4. **Support**: Korean customer support available

### For US Beta Market Users
1. **App Language**: Automatically detects non-Korean locale → English
2. **Features Available**: Core features (Cafe Mode, Home Cafe Mode)
3. **Feedback**: Enhanced beta feedback tools (in-app, email, Discord)
4. **Support**: English beta support with direct developer access

---

## 📱 Installation & Setup

### Prerequisites
- iOS 13.0+ or Android 8.0+
- 2GB+ available storage
- Internet connection for initial setup

### Installation Steps
1. **Download from App Store/Google Play** (when available)
2. **Sign in with Apple ID or Google Account**
3. **Complete 4-step onboarding**:
   - Welcome & market detection
   - Sensory evaluation tutorial
   - Mode selection (Cafe/Home Cafe/Lab)
   - Preferences setup
4. **Start your first coffee tasting!**

### Market Detection
The app automatically detects your market based on:
- Device locale setting
- Country code (KR = Korean market, others = US Beta)
- Language preference (Korean vs English)

---

## 🎨 Features to Test

### Core Features (Both Markets)
- ✅ **Apple/Google Sign-In**: Authentication and account management
- ✅ **Coffee Information Entry**: Roastery, origin, brew method, etc.
- ✅ **Korean Sensory Evaluation**: 44 expressions across 6 categories
- ✅ **Flavor Selection**: 3-level hierarchy with smart search
- ✅ **Result Visualization**: Comprehensive tasting results
- ✅ **Achievement System**: 12 achievement categories with Korean localization
- ✅ **Performance Monitoring**: Real-time app performance tracking

### Mode-Specific Features

#### Cafe Mode (카페 모드)
- **Purpose**: For coffee shop visits
- **Data**: Basic coffee info + sensory evaluation
- **Time**: ~3-5 minutes per tasting
- **Target**: Casual coffee drinkers

#### Home Cafe Mode (홈카페 모드)
- **Purpose**: For home brewing enthusiasts
- **Data**: Equipment, recipe, brewing parameters
- **Dripper Support**: 10 popular drippers (V60, Kalita Wave, Chemex, etc.)
- **Features**: Recipe tracking, experiment notes, extraction timer
- **Time**: ~5-8 minutes per tasting
- **Target**: Home baristas and brewing enthusiasts

#### Lab Mode (랩 모드) - Korean Market Only
- **Purpose**: Professional-level analysis
- **Data**: Detailed cupping protocol, precise measurements
- **Features**: Comparative tasting, batch analysis
- **Time**: ~10-15 minutes per session
- **Target**: Coffee professionals and serious enthusiasts

### Beta-Specific Features
- ✅ **Beta Testing Dashboard**: Comprehensive testing tools
- ✅ **Feedback Collection**: In-app feedback with screenshots
- ✅ **Performance Dashboard**: Real-time performance monitoring
- ✅ **Market Intelligence**: Coffee industry data integration
- ✅ **Deployment Monitoring**: Rollout status and metrics

---

## 🧪 Testing Scenarios

### Scenario 1: First-Time User Journey
**Time**: 15-20 minutes
**Focus**: Onboarding experience and first tasting

1. **Install and launch app**
2. **Complete onboarding flow**
3. **Sign in with preferred method**
4. **Create first tasting record**:
   - Choose Cafe Mode
   - Enter coffee information
   - Complete sensory evaluation
   - Add personal notes
   - Review results
5. **Explore achievement progress**

**Expected Outcomes**:
- Smooth onboarding without confusion
- Clear understanding of app purpose
- Successful first tasting completion
- Achievement unlocked feedback

### Scenario 2: Home Cafe Brewing Session
**Time**: 20-25 minutes
**Focus**: Home Cafe Mode functionality

1. **Start new tasting in Home Cafe Mode**
2. **Enter coffee details**
3. **Select dripper and filter type**
4. **Input brewing recipe**:
   - Dose, water amount, temperature
   - Bloom time and technique
   - Total brew time
5. **Use extraction timer with lap times**
6. **Add experiment notes**
7. **Complete sensory evaluation**
8. **Review brewing analytics**

**Expected Outcomes**:
- Intuitive recipe input interface
- Functional extraction timer
- Clear brewing data visualization
- Useful experiment tracking

### Scenario 3: Search and Discovery
**Time**: 10-15 minutes
**Focus**: Flavor search and data exploration

1. **Navigate to Journal tab**
2. **Use search functionality**:
   - Search by coffee name
   - Filter by roastery
   - Filter by flavor notes
3. **Explore flavor hierarchy**:
   - Browse categories
   - Select subcategories
   - Search specific flavors
4. **View tasting details**
5. **Compare multiple tastings**

**Expected Outcomes**:
- Fast search performance (<100ms)
- Accurate search results
- Intuitive filter interface
- Clear tasting comparison

### Scenario 4: Performance Testing
**Time**: 30+ minutes
**Focus**: App performance under various conditions

1. **Create 10+ tasting records**
2. **Test with poor network conditions**
3. **Test rapid navigation between screens**
4. **Test background/foreground app switching**
5. **Test device rotation and multitasking**
6. **Monitor performance dashboard**

**Expected Outcomes**:
- Consistent performance across scenarios
- Graceful handling of network issues
- No crashes or memory leaks
- Performance metrics within targets

### Scenario 5: Multilingual Testing (US Beta)
**Time**: 20 minutes
**Focus**: English language experience

1. **Verify English interface**
2. **Test language switching**
3. **Complete full tasting flow in English**
4. **Verify US coffee industry data**:
   - US roaster suggestions
   - American flavor terminology
   - US brewing method preferences
5. **Submit beta feedback**

**Expected Outcomes**:
- Complete English localization
- Accurate US market data
- Functional feedback system
- Cultural appropriateness

---

## 🐛 Bug Reporting & Feedback

### What to Report

#### Critical Issues (🚨 High Priority)
- App crashes or freezes
- Data loss or corruption
- Authentication failures
- Payment processing errors (future)
- Security vulnerabilities

#### Performance Issues (⚡ Medium Priority)
- Slow loading times (>3 seconds)
- UI lag or stuttering
- Memory leaks
- Battery drain
- Network timeout errors

#### UX/UI Issues (🎨 Medium Priority)
- Confusing navigation
- Text cutoff or overlap
- Button not responding
- Inconsistent design
- Accessibility problems

#### Feature Requests (💡 Low Priority)
- New functionality ideas
- Workflow improvements
- Additional integrations
- UI/UX enhancements

### How to Report

#### In-App Feedback (Recommended)
1. **Shake device** or tap feedback button
2. **Select issue category**
3. **Choose severity level**
4. **Describe the issue**:
   - What you were doing
   - What you expected
   - What actually happened
   - Steps to reproduce
5. **Attach screenshot if helpful**
6. **Submit feedback**

#### Beta Testing Dashboard
1. **Navigate to Profile → Beta Testing**
2. **Tap "Report Bug" or "Submit Feedback"**
3. **Fill out detailed form**
4. **Track feedback status**

#### Email Support
- **Korean Market**: support@cupnote.app
- **US Beta Market**: beta@cupnote.app
- **Subject format**: [BETA] Brief description
- **Include**: Device info, app version, detailed description

#### Discord Community (US Beta)
- **Join**: https://discord.gg/cupnote-beta
- **Channel**: #bug-reports or #feedback
- **Format**: Use provided templates

### Feedback Template

```
**Issue Type**: Bug / Feature Request / Improvement
**Severity**: Critical / High / Medium / Low
**Market**: Korean / US Beta
**Device**: iPhone 14 / Samsung Galaxy S23
**OS Version**: iOS 17.0 / Android 13
**App Version**: 1.0.0 (build 1)

**Description**:
Brief description of the issue

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Result**:
What should have happened

**Actual Result**:
What actually happened

**Additional Context**:
Any other relevant information

**Screenshots**:
[Attach if helpful]
```

---

## 📊 Testing Metrics & KPIs

### Performance Targets
- **App Launch Time**: <3 seconds
- **Screen Transition**: <500ms
- **Search Performance**: <100ms
- **Data Sync**: <2 seconds
- **Crash Rate**: <0.1%
- **Memory Usage**: <150MB average

### User Experience Metrics
- **Onboarding Completion**: >90%
- **First Tasting Completion**: >80%
- **Daily Active Users**: Track growth
- **Session Length**: 5-10 minutes average
- **Feature Adoption**: Monitor usage per feature

### Market-Specific KPIs

#### Korean Market
- **User Satisfaction**: >4.5/5 stars
- **Feature Usage**: Lab Mode adoption rate
- **Language Accuracy**: Korean expression understanding
- **Cultural Fit**: Feedback on Korean coffee culture alignment

#### US Beta Market
- **Beta Engagement**: Feedback submission rate
- **Feature Validation**: Core feature usage
- **Market Fit**: US coffee culture adaptation
- **Retention Rate**: 7-day and 30-day retention

---

## 🔄 Beta Testing Phases

### Phase 1: Internal Alpha (Week 1-2)
- **Participants**: Development team + close contacts
- **Users**: 20 testers (10 Korean, 10 US)
- **Focus**: Critical bug fixes, basic functionality
- **Success Criteria**: No critical bugs, core features working

### Phase 2: Closed Beta (Week 3-6)
- **Participants**: Invited coffee enthusiasts
- **Users**: 100 testers (60 Korean, 40 US)
- **Focus**: Feature completeness, user experience
- **Success Criteria**: <5 medium bugs, positive UX feedback

### Phase 3: Open Beta (Week 7-10)
- **Participants**: Public beta via TestFlight/Play Console
- **Users**: 500 testers (300 Korean, 200 US)
- **Focus**: Scalability, performance, market validation
- **Success Criteria**: Performance targets met, market fit validated

### Phase 4: Soft Launch (Week 11-12)
- **Participants**: Limited regional release
- **Users**: 2,000 users (1,500 Korean, 500 US)
- **Focus**: Final polish, marketing validation
- **Success Criteria**: Ready for full market launch

---

## 🛠️ Technical Information

### System Requirements
- **iOS**: 13.0 or later
- **Android**: API level 26 (Android 8.0) or later
- **RAM**: 3GB recommended
- **Storage**: 500MB available space
- **Network**: WiFi or cellular data

### App Architecture
- **Framework**: React Native 0.80
- **Database**: Realm (local) + Supabase (sync)
- **Authentication**: Apple Sign-In + Google OAuth
- **Analytics**: Custom performance monitoring
- **Language**: TypeScript with strict type checking

### Performance Monitoring
The app includes comprehensive performance monitoring:
- **Real-time metrics**: Response times, memory usage, crash detection
- **Dashboard access**: Profile → Developer Mode → Performance Dashboard
- **Automatic reporting**: Critical issues reported automatically
- **Local storage**: Performance data cached locally for analysis

### Privacy & Security
- **Data Encryption**: All data encrypted at rest and in transit
- **Privacy Policy**: Available in app and website
- **Data Retention**: User controls data retention period
- **GDPR Compliance**: Full compliance for international users
- **No Tracking**: No third-party tracking or advertising

---

## 💬 Community & Support

### Communication Channels

#### Korean Market
- **Email**: support@cupnote.app (한국어 지원)
- **KakaoTalk**: @cupnote (업무시간 내 응답)
- **Website**: https://cupnote.app/ko

#### US Beta Market
- **Email**: beta@cupnote.app (English support)
- **Discord**: https://discord.gg/cupnote-beta
- **Website**: https://cupnote.app/en

### Beta Community Guidelines
1. **Be Respectful**: Constructive feedback only
2. **Be Specific**: Detailed bug reports help us fix issues faster
3. **Be Patient**: We'll respond to all feedback within 48 hours
4. **Be Collaborative**: Help other testers when possible
5. **Keep It Confidential**: Don't share beta builds publicly

### Support Hours
- **Korean Market**: 9:00-18:00 KST (weekdays)
- **US Beta Market**: 9:00-17:00 PST (weekdays)
- **Emergency Issues**: 24/7 monitoring for critical bugs

---

## 🏆 Recognition & Rewards

### Beta Tester Benefits
- **Early Access**: First to try new features
- **Direct Impact**: Your feedback shapes the product
- **Community Access**: Exclusive beta tester community
- **Recognition**: Beta tester badge in final app
- **Special Offers**: Discounts on future premium features

### Top Contributors
- **Monthly Recognition**: Highlighted in community
- **Special Beta Builds**: Access to experimental features
- **Product Team Access**: Direct communication with developers
- **Beta Graduation**: Invitation to future beta programs

---

## 📝 Feedback Collection System

### Automated Collection
- **Performance Metrics**: Automatically collected and analyzed
- **Crash Reports**: Sent automatically with user consent
- **Usage Analytics**: Anonymous usage patterns tracked
- **Error Logs**: Technical errors reported for debugging

### Manual Feedback
- **In-App Forms**: Structured feedback collection
- **Rating Prompts**: Periodic satisfaction surveys
- **Feature Requests**: Dedicated feature request system
- **User Interviews**: One-on-one feedback sessions (selected users)

### Feedback Processing
1. **Immediate Triage**: Critical issues escalated immediately
2. **Weekly Review**: All feedback reviewed weekly
3. **Monthly Summary**: Trends and patterns identified
4. **Quarterly Planning**: Feedback incorporated into roadmap

---

## 🚀 Launch Preparation

### Pre-Launch Checklist
- [ ] All critical bugs resolved
- [ ] Performance targets achieved
- [ ] Localization completed and tested
- [ ] Marketing materials prepared
- [ ] App Store assets ready
- [ ] Analytics and monitoring configured
- [ ] Customer support trained
- [ ] Legal compliance verified

### Success Metrics for Launch
- **Technical**: <0.1% crash rate, <3s launch time
- **User Experience**: >4.5 stars, >80% onboarding completion
- **Market Fit**: >70% daily active user retention
- **Feedback**: >4.0 average satisfaction score

### Post-Launch Monitoring
- **First 24 Hours**: Intensive monitoring and rapid response
- **First Week**: Daily metrics review and optimization
- **First Month**: Full feature adoption analysis
- **Ongoing**: Continuous improvement based on user feedback

---

## 📞 Contact Information

### Development Team
- **Project Lead**: [Developer Contact]
- **Beta Coordinator**: beta@cupnote.app
- **Technical Support**: support@cupnote.app

### Emergency Contacts
- **Critical Issues**: +82-10-XXXX-XXXX (Korea)
- **Critical Issues**: +1-XXX-XXX-XXXX (US)
- **Security Issues**: security@cupnote.app

---

## 📚 Additional Resources

### Documentation
- **API Documentation**: https://docs.cupnote.app
- **Privacy Policy**: https://cupnote.app/privacy
- **Terms of Service**: https://cupnote.app/terms

### Coffee Resources
- **SCA Standards**: https://sca.coffee/research/coffee-standards
- **Brewing Guides**: In-app educational content
- **Coffee Dictionary**: Korean-English coffee terminology

---

**Thank you for participating in CupNote's beta testing program! Your feedback is invaluable in creating the best coffee tasting experience for both Korean and international markets.**

**함께 더 나은 커피 앱을 만들어 주셔서 감사합니다! 🙏☕**