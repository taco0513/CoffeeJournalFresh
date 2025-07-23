# Home Cafe Mode UX/UI Design Guidelines
*Coffee Journal Fresh - Korean Market Adaptation*

## 🎯 Design Philosophy

**Core Principle**: "Simple experimentation for Korean home cafe enthusiasts"

### Cultural Considerations
- **Apartment Living**: Compact equipment, limited storage
- **Aesthetic Focus**: Instagram/SNS sharing culture (547,000+ posts)
- **Learning Curve**: Beginner-friendly vs. complex international apps
- **Korean Language**: Native terminology and cultural context

---

## 👥 User Personas (Home Cafe Mode)

### Primary: 홈카페 입문자 (Home Cafe Beginners)
- **Age**: 25-35, 58% female, 42% male
- **Equipment**: 1-2 brewing methods, basic grinder
- **Goals**: Learn consistent brewing, improve taste
- **Pain Points**: Information overload, inconsistent results
- **Usage**: 2-3 times per week, weekend experimentation

### Secondary: 홈카페 애호가 (Home Cafe Enthusiasts)
- **Age**: 30-40, equipment collectors
- **Equipment**: Multiple brewing methods, premium gear
- **Goals**: Perfect recipes, share experiences
- **Pain Points**: Recipe organization, progress tracking
- **Usage**: Daily brewing, active social sharing

### Tertiary: 경제적 홈카페족 (Economic Home Brewers)
- **Motivation**: Replace cafe visits (cost savings)
- **Equipment**: Budget-friendly options
- **Goals**: Cafe-quality coffee at home
- **Usage**: Daily routine, efficiency focused

---

## 🎨 Visual Design System

### Color Palette (Home Cafe Specific)
```css
/* Warm, cozy home atmosphere */
--home-cafe-primary: #8B4513;    /* Warm brown */
--home-cafe-secondary: #D2B48C;  /* Beige */
--home-cafe-accent: #CD853F;     /* Peru */
--home-cafe-background: #FFF8DC; /* Cornsilk */
--home-cafe-text: #2F1B14;       /* Dark brown */
```

### Typography
- **Headers**: Warm, friendly tone
- **Instructions**: Clear, step-by-step language
- **Numbers**: Prominent display for measurements
- **Korean Typography**: 나눔스퀘어, 맑은고딕 for readability

### Iconography
```
V60: ⏳ (funnel shape)
Chemex: 🧪 (lab beaker)
AeroPress: 💨 (air/pressure)
French Press: ☕ (classic coffee)
Espresso: ☕ (strong coffee)
Other: 🔧 (customization)
```

---

## 📱 Screen Design Specifications

### ModeSelectionScreen
**Layout**: Two card design
```
┌─────────────────────────────┐
│     Coffee Journal Fresh     │
├─────────────────────────────┤
│  어디서 커피를 마시나요?      │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │   ☕     │ │   🏠     │  │
│  │ 카페에서  │ │ 집에서   │  │
│  │ (인기)   │ │ 홈카페   │  │
│  └──────────┘ └──────────┘  │
│                             │
│  각 모드에 맞는 기록 방식을   │
│  제공합니다                  │
└─────────────────────────────┘
```

**Interaction**:
- **Haptic Feedback**: Selection시 가벼운 진동
- **Visual State**: 선택시 카드 확대 + 색상 변경
- **Next Button**: 선택 후 하단에 나타남

### HomeCafeScreen
**Progress**: 2/7 (30% - 향미 선택 전)
**Layout**: Tabbed sections with validation

```
┌─────────────────────────────┐
│ ←  홈카페 정보    건너뛰기  │
├─────────────────────────────┤
│ ████░░░░░░░░░░░░░░░░ 2/7   │
├─────────────────────────────┤
│                             │
│ 🏠 홈카페 정보               │
│ 사용한 장비와 레시피를       │
│ 기록해보세요                 │
│                             │
│ [Scrollable Form Content]    │
│                             │
│ ┌─ 추출 도구 ─────────────┐ │
│ │ V60  케멕스  에어로     │ │
│ │ 프렌치 에스프레소 기타   │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─ 레시피 ───────────────┐ │
│ │ 원두량: [20]g          │ │
│ │ 물량: [320]g           │ │
│ │ 비율: 1:16 (자동계산)   │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│        [다음 단계]           │
└─────────────────────────────┘
```

### HomeCafeForm Component Design

#### 1. Equipment Selection (장비 선택)
**Design**: 6-grid button layout
- **Visual**: Icon + Korean label
- **State**: Unselected (gray) → Selected (blue border + background)
- **Validation**: Required field, highlight if empty
- **Help**: Brief description on selection

#### 2. Recipe Input (레시피 입력)
**Layout**: Two-column numeric inputs
- **Dose/Water**: Large numeric inputs with units
- **Ratio Display**: Auto-calculated, prominent display
- **Temperature**: Numeric with °C unit
- **Time**: Seconds input with timer icon

#### 3. Experiment Notes (실험 노트)
**Design**: Expandable text areas
- **Previous Change**: Single line input
- **Result**: Multi-line (3 rows)
- **Next Experiment**: Single line input
- **Placeholder**: Helpful examples in Korean

---

## 🔄 User Flow Design

### Complete Home Cafe Flow (Updated 2025-07-23)
```
Home Screen
    ↓ (커피 기록하기)
ModeSelection
    ↓ (홈카페 선택)
CoffeeInfo (no cafe name field)
    ↓ (커피 정보 입력) - 14%
HomeCafe (equipment + recipe)
    ↓ (홈카페 정보 입력) - 29%
UnifiedFlavor
    ↓ (향미 선택) - 43%
ExperimentalData (quantitative measurement)
    ↓ (실험 데이터 수집) - 57%
SensoryEvaluation (Korean expressions)
    ↓ (한국식 감각 평가) - 71%
PersonalComment
    ↓ (개인 노트) - 86%
Result (+ home cafe data display) - 100%
```

### Cafe Mode Flow (Comparison)
```
CoffeeInfo → UnifiedFlavor → Sensory (Korean only) → PersonalComment → Result
   17%         33%            50%                     67%            100%
```

### Navigation Patterns
- **Back Button**: Always available, maintains state
- **Skip Button**: Available but validated at next step
- **Progress Bar**: Linear progress indication
- **Auto-Save**: Draft preservation on navigation

---

## 📝 Content Strategy

### Microcopy Guidelines

#### Encouraging Tone
```
❌ "필수 항목을 입력하세요"
✅ "맛있는 커피를 위해 조금만 더 입력해주세요"

❌ "잘못된 입력입니다"
✅ "다시 확인해주세요"

❌ "실패했습니다"
✅ "다시 시도해보세요"
```

#### Educational Context
```
그라인더 설정: "더 굵게/곱게 조절할 때 참고하세요"
물온도: "일반적으로 93°C가 적당해요"
추출시간: "2-3분이 보통이에요"
```

#### Cultural Adaptation
```
V60 → "브이식스티 (가장 인기)"
Chemex → "케멕스 (깔끔한 맛)"
AeroPress → "에어로프레스 (간편함)"
French Press → "프렌치프레스 (진한 맛)"
```

### Help System
- **Contextual Tips**: Each input field has brief guidance
- **Progressive Disclosure**: Advanced options hidden initially
- **Visual Examples**: Coffee-to-water ratio visualization
- **Error Prevention**: Real-time validation with friendly messages

---

## 📊 Interaction Design

### Form Validation Strategy
```typescript
// Real-time validation
const validateHomeCafeData = {
  equipment: {
    brewingMethod: required,
    grinder: optional
  },
  recipe: {
    doseIn: required && positive && realistic(10-50),
    waterAmount: required && positive && realistic(150-800),
    waterTemp: optional && range(80-100),
    totalBrewTime: required && positive
  },
  notes: optional
}
```

### Auto-Enhancement Features
- **Ratio Calculation**: Automatic dose:water ratio display
- **Smart Defaults**: Method-specific default values
- **Input Assistance**: Numeric keyboards for measurements
- **Unit Display**: Clear g/ml/°C/sec labeling

### Error States
- **Empty Required**: Gentle highlight + helpful message
- **Invalid Range**: "일반적으로 20-30g를 사용해요"
- **Connection Error**: "인터넷 연결을 확인해주세요"

---

## 🎨 Animation & Feedback

### Micro-Interactions
- **Button Press**: 0.1s scale down + haptic
- **Form Focus**: Smooth border color transition
- **Calculation**: Number counting animation for ratios
- **Success**: Checkmark animation on completion

### Progress Feedback
- **Loading States**: Coffee bean bouncing animation
- **Progress Bar**: Smooth fill animation
- **Completion**: Celebration micro-animation

### Accessibility
- **VoiceOver**: All elements properly labeled in Korean
- **Touch Targets**: Minimum 44pt touch targets
- **Color Contrast**: WCAG AA compliance
- **Motion**: Respects reduced motion preferences

---

## 📱 Responsive Design

### Device Considerations
- **iPhone SE**: Compact layout, larger touch targets
- **iPhone 14**: Standard layout reference
- **iPad**: Two-column layout for form sections

### Korean Input Optimization
- **Keyboard**: Korean/English switching hints
- **AutoComplete**: Common Korean coffee terms
- **Search**: Korean phonetic search support

---

## 🔍 Usability Testing Guidelines

### Test Scenarios
1. **First-time Setup**: Complete home cafe flow from start
2. **Recipe Adjustment**: Modify existing recipe
3. **Equipment Change**: Switch between brewing methods
4. **Error Recovery**: Handle validation errors gracefully

### Success Metrics
- **Task Completion**: >85% complete home cafe flow
- **Time to Complete**: <3 minutes for experienced users
- **Error Rate**: <5% validation errors
- **Satisfaction**: >4.0/5.0 user rating

### Korean User Testing
- **Language Preference**: Test with Korean-only users
- **Cultural Context**: Test coffee terminology understanding
- **Device Usage**: Test on Korean market devices (Samsung/LG)

---

## 🚀 Implementation Priorities

### Phase 1 (MVP) ✅
- [x] Basic equipment selection (6 methods)
- [x] Essential recipe inputs (dose, water, temp, time)
- [x] Auto-ratio calculation
- [x] Form validation
- [x] Korean localization

### Phase 2 (Post-MVP)
- [ ] Equipment database integration
- [ ] Recipe templates and presets
- [ ] Timer integration
- [ ] Recipe comparison tools
- [ ] Social sharing features

### Phase 3 (Advanced)
- [ ] Bluetooth scale integration
- [ ] Recipe optimization suggestions
- [ ] Community recipe database
- [ ] Video tutorial integration
- [ ] Equipment purchase links

---

## 📈 Analytics & Optimization

### Key Metrics
- **Mode Selection Rate**: Cafe vs Home Cafe mode usage
- **Form Completion**: Drop-off points in home cafe flow
- **Feature Usage**: Most/least used equipment types
- **User Retention**: Return usage after first home cafe entry

### A/B Testing Opportunities
- **Equipment Icons**: Different visual representations
- **Form Layout**: Single vs. multi-step approach
- **Validation Timing**: Real-time vs. submit validation
- **Help Content**: Brief vs. detailed explanations

This comprehensive UX guideline ensures Home Cafe Mode provides an optimal experience for Korean users while maintaining the app's core philosophy of simplicity and beginner-friendliness.