# 📐 TastingFlow UX Wireframes & User Journey

## 개요

TastingFlow Cafe Mode의 사용자 경험 설계와 화면별 와이어프레임입니다. 직관적이고 자연스러운 사용자 여정을 제공합니다.

> **UX 목표**: 3분 이내 완료 가능한 간편한 테이스팅 기록

---

## 🎯 User Persona & Journey

### Primary Persona: "커피 애호가 지민"
- **연령**: 28세, 직장인
- **경험**: 카페 방문 주 3-4회, 전문 지식 부족
- **목표**: 개인 취향 발견, 새로운 커피 도전
- **Pain Points**: 복잡한 전문 용어, 시간 부족

### User Journey Map
```
발견 → 호기심 → 시작 → 기록 → 학습 → 성장 → 공유
 ↓      ↓      ↓     ↓     ↓     ↓     ↓
앱설치  첫시작  정보입력 향미선택 결과확인 패턴발견 추천받기
```

---

## 📱 Screen Flow & Navigation

### Overall Flow Architecture
```
Home Screen
    ↓
[새로운 테이스팅 시작]
    ↓
Step 1: Coffee Info ────┐
    ↓                   │
Step 2: Roaster Notes ←─┤ (Skip 가능)
    ↓                   │
Step 3: Flavor Selection
    ↓
Step 4: Sensory Evaluation ←─┤ (Skip 가능)  
    ↓                         │
Step 5: Personal Comment ────┘ (Skip 가능)
    ↓
Step 6: Results & Matching
    ↓
[저장 완료] → Journal/Home
```

### Navigation Patterns
- **Linear Flow**: 논리적 순서 유지
- **Skip Options**: 부담 없는 진행
- **Back Navigation**: 언제든 수정 가능
- **Auto-save**: 실시간 임시저장

---

## 🎨 Wireframe Specifications

### Step 1: Coffee Info
```
┌─────────────────────────────────┐
│ ←    커피 정보 입력    [1/6]     │
├─────────────────────────────────┤
│ ●●●○○○ (Progress dots)          │ 
│                                 │
│ 📸 어떤 커피를 마시고 계신가요?      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 커피 이름 *                  │ │
│ │ [Blue Bottle Ethiopia...]    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 로스터리 *                   │ │
│ │ [Blue Bottle Coffee ▼]      │ │  
│ └─────────────────────────────┘ │
│                                 │
│ ┌──────────────┐ ┌─────────────┐│
│ │ 원산지 (선택)   │ │ 가공법 (선택) ││
│ │ [Ethiopia ▼]  │ │ [Washed ▼]  ││
│ └──────────────┘ └─────────────┘│
│                                 │
│ ┌──────────────┐ ┌─────────────┐│
│ │ 로스팅 정도     │ │ 추출 방법    ││
│ │ [Medium ▼]    │ │ [드립 ▼]    ││
│ └──────────────┘ └─────────────┘│
│                                 │
│ 💡 사진으로 간편 입력              │
│ [📷 패키지 촬영]  [📄 수동 입력]  │
│                                 │
│                    [다음 →]    │
└─────────────────────────────────┘
```

### Step 2: Roaster Notes (Optional)
```
┌─────────────────────────────────┐
│ ←    로스터 노트     [건너뛰기] [2/6] │
├─────────────────────────────────┤
│ ●●●○○○                         │
│                                 │
│ 📝 로스터의 테이스팅 노트가 있나요?    │
│    (패키지나 웹사이트에서 확인)       │
│                                 │
│ [📷 촬영] [🎤 음성] [✏️ 직접입력]  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │ 로스터 노트를 입력하거나         │ │
│ │ 붙여넣어 주세요                 │ │
│ │                             │ │
│ │ 예시: "밝은 산미와 초콜릿의      │ │
│ │ 단맛이 조화로운..."            │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🤖 인식된 키워드:                │
│ [초콜릿] [베리] [밝은 산미]         │
│                                 │
│ [건너뛰기]        [다음 →]      │
└─────────────────────────────────┘
```

### Step 3: Flavor Selection (Core)
```
┌─────────────────────────────────┐
│ ←    향미 선택     [건너뛰기] [3/6]  │
├─────────────────────────────────┤
│ ●●●●○○                         │
│                                 │
│ 🎨 어떤 맛이 느껴지시나요?           │
│     최대 3개까지 선택해주세요        │
│                                 │
│ ┌─────────┐ ┌─────────┐        │
│ │   🍎    │ │   🥜    │        │
│ │  과일향   │ │  견과류   │        │
│ │ Sweet &  │ │ Nutty &  │        │
│ │ Fruity   │ │ Roasted  │        │
│ │  ✓선택됨  │ │         │        │
│ └─────────┘ └─────────┘        │
│                                 │
│ ┌─────────┐ ┌─────────┐        │
│ │   🍫    │ │   🌸    │        │
│ │  초콜릿   │ │  꽃향    │        │
│ │ Rich &   │ │ Light &  │        │
│ │ Sweet    │ │ Fragrant │        │
│ │  ✓선택됨  │ │         │        │
│ └─────────┘ └─────────┘        │
│                                 │
│        ┌─────────┐              │
│        │   ❓    │              │
│        │  기타   │              │
│        │ Others  │              │
│        └─────────┘              │
│                                 │
│ 💡 선택됨: 과일향, 초콜릿 (2/3)      │
│                                 │
│ [이전 ←]          [다음 →]      │
└─────────────────────────────────┘

<!-- 중급자 모드 -->
┌─────────────────────────────────┐
│ ←  상세 향미 선택 (5개까지)  [3/6]  │
├─────────────────────────────────┤
│ ●●●●○○                         │
│                                 │
│ 🔍 [검색 입력창...]              │
│                                 │
│ 📚 내 향미 라이브러리              │
│ [베리] [초콜릿] [꿀] [견과류]       │
│                                 │
│ 🎨 향미 휠                      │
│ ┌─────────────────────────────┐ │
│ │    [과일향 영역]               │ │
│ │  🍓베리 🍎사과 🍊감귤          │ │
│ │  🍑체리 🍑복숭아              │ │
│ └─────────────────────────────┘ │
│                                 │
│ 선택된 향미:                     │
│ 🍓베리(강도4) 🍫초콜릿(강도3)      │
│ 🌰견과류(강도2)                 │
│                                 │
│ [이전 ←]          [다음 →]      │
└─────────────────────────────────┘
```

### Step 4: Sensory Evaluation
```
┌─────────────────────────────────┐
│ ←    감각 평가     [건너뛰기] [4/6]  │
├─────────────────────────────────┤
│ ●●●●●○                         │
│                                 │
│ 👅 커피의 감각적 특성을 평가해주세요   │
│                                 │
│ <!-- 초보자 모드 -->              │
│ 💡 간단한 느낌을 선택해주세요        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🟢 가벼워요 (Light)           │ │
│ │ 산뜻하고 부드러운 느낌          │ │
│ │        ✓ 선택됨              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🟡 적당해요 (Medium)          │ │
│ │ 균형잡힌 바디감               │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🟤 진해요 (Full)             │ │
│ │ 묵직하고 진한 느낌             │ │
│ └─────────────────────────────┘ │
│                                 │
│ [이전 ←]          [다음 →]      │
└─────────────────────────────────┘

<!-- 중급자 모드 -->
┌─────────────────────────────────┐
│ ←    상세 감각 평가    [건너뛰기] [4/6]│
├─────────────────────────────────┤
│ ●●●●●○                         │
│                                 │
│ 바디 (Body)      가벼움 ●●●●○ 진함 │
│ 산미 (Acidity)   약함  ●●○○○ 강함 │
│ 단맛 (Sweetness) 약함  ●●●○○ 강함 │
│ 여운 (Finish)    짧음  ●●●●○ 긺  │
│                                 │
│ 🌡️ 온도별 변화 (선택사항)          │
│ ┌─────────────────────────────┐ │
│ │ 뜨거울 때: 산미가 강해요         │ │
│ │ 식으면서: 단맛이 더 느껴져요      │ │
│ └─────────────────────────────┘ │
│                                 │
│ [이전 ←]          [다음 →]      │
└─────────────────────────────────┘
```

### Step 5: Personal Comment
```
┌─────────────────────────────────┐
│ ←    개인 메모     [건너뛰기] [5/6]  │
├─────────────────────────────────┤
│ ●●●●●●○                        │
│                                 │
│ ✍️ 개인적인 느낌을 자유롭게 적어주세요 │
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │ 오늘 마신 커피에 대한          │ │
│ │ 솔직한 느낌을 적어주세요        │ │
│ │                             │ │
│ │ 예시: "처음엔 시큼했는데       │ │
│ │ 식으니까 달달해졌어요.         │ │
│ │ 다음에 또 마시고 싶은 맛!"     │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                       (127/500) │
│                                 │
│ 🎤 [음성 메모]   📷 [사진 추가]   │
│                                 │
│ 😊 오늘 기분:                   │
│ [☕편안] [😋맛있음] [🤔호기심]     │
│ [😍사랑] [🙄보통] [😵어려움]      │
│                                 │
│ 💡 AI 도우미: "따뜻한 느낌으로     │
│    표현하면 어떨까요?"            │
│                                 │
│ [이전 ←]          [완료 →]      │
└─────────────────────────────────┘
```

### Step 6: Results & Matching
```
┌─────────────────────────────────┐
│ ←      테이스팅 완료!     [6/6]   │
├─────────────────────────────────┤
│ ●●●●●●●                        │
│                                 │
│ 🎉 훌륭해요! 테이스팅을 완료했어요   │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📊 나의 선택                 │ │
│ │ 향미: 🍓베리, 🍫초콜릿        │ │
│ │ 바디: 가벼움 ●●●○○           │ │
│ │ 산미: 적당함 ●●●○○           │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🎯 로스터 노트와 비교             │
│ ┌─────────────────────────────┐ │
│ │ 일치도: 75% 🎯              │ │
│ │ ✅ 베리 ✅ 초콜릿 ❌ 꽃향    │ │
│ │ 새로운 발견: 견과류 향미!      │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🏆 획득한 배지                  │
│ [🔍 향미 탐험가] [☕ 일관된 테이스터] │
│                                 │
│ 📈 성장 포인트: +15pts          │
│ 💡 다음 추천: "Guatemala SHB"   │
│                                 │
│ [🔄 다시 하기] [📱 공유] [✅ 완료] │
└─────────────────────────────────┘
```

---

## 🎨 Visual Design Guidelines

### Color Palette
```css
/* Primary Colors */
--coffee-primary: #8B4513;    /* Rich brown */
--coffee-secondary: #D2B48C;  /* Light tan */
--coffee-accent: #FF6B35;     /* Warm orange */

/* Background & Text */
--bg-primary: #FFFEF7;        /* Cream white */
--bg-secondary: #F5F5DC;      /* Beige */
--text-primary: #2F1B14;      /* Dark brown */
--text-secondary: #8B7355;    /* Medium brown */

/* Status Colors */
--success: #4CAF50;           /* Green */
--warning: #FF9800;           /* Orange */  
--error: #F44336;             /* Red */
--info: #2196F3;              /* Blue */
```

### Typography Scale
```css
/* Headers */
h1 { font-size: 28px; font-weight: bold; }
h2 { font-size: 22px; font-weight: 600; }
h3 { font-size: 18px; font-weight: 600; }

/* Body Text */
body { font-size: 16px; line-height: 1.5; }
small { font-size: 14px; }
caption { font-size: 12px; color: #8B7355; }
```

### Spacing System
```css
/* 8pt Grid System */
--space-xs: 4px;   /* 0.5 units */
--space-sm: 8px;   /* 1 unit */
--space-md: 16px;  /* 2 units */
--space-lg: 24px;  /* 3 units */
--space-xl: 32px;  /* 4 units */
--space-2xl: 48px; /* 6 units */
```

---

## 📐 Component Design Patterns

### Card Components
```
┌─────────────────────────────────┐
│ 🏷️ Category Card                │
│                                 │
│        🍎                      │
│       과일향                     │
│    Sweet & Fruity               │
│                                 │
│    [✓ Selected State]           │
└─────────────────────────────────┘

Specs:
- Size: 140x120px
- Border-radius: 12px
- Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Selection: Border + Background change
```

### Button Hierarchy
```
Primary Button:   [     다음     ]  (Full width, coffee brown)
Secondary Button: [    이전     ]   (Outline, medium priority)  
Text Button:      건너뛰기           (Minimal, low priority)
Icon Button:      📷               (Square, 44x44px min)
```

### Input Fields
```
┌─────────────────────────────────┐
│ Label *                         │
│ [Placeholder text...        ] │
│ Helper text                     │
└─────────────────────────────────┘

States:
- Default: Light border
- Focus: Coffee brown border + shadow
- Error: Red border + error message
- Success: Green border + checkmark
```

---

## 🔄 Interaction Patterns

### Gesture Support
- **Tap**: Primary selection action
- **Long Press**: Show definitions/help
- **Swipe Left/Right**: Navigate between steps (disabled for data integrity)
- **Pull to Refresh**: Reload current step data
- **Double Tap**: Quick selection shortcuts

### Haptic Feedback
```typescript
// Selection feedback
HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Medium);

// Error feedback  
HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Error);

// Success feedback
HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Success);
```

### Animation Timing
- **Micro-interactions**: 150-300ms (button press, selection)
- **Screen transitions**: 300-500ms (slide, fade)
- **Loading states**: 800ms+ (skeleton, spinner)
- **Success celebrations**: 1000ms+ (confetti, achievement)

---

## 📱 Responsive Behavior

### Screen Size Adaptations
```css
/* Small phones (iPhone SE) */
@media (max-width: 375px) {
  .category-grid { grid-template-columns: repeat(2, 1fr); }
  .step-title { font-size: 20px; }
}

/* Large phones (iPhone Pro Max) */ 
@media (min-width: 414px) {
  .category-grid { grid-template-columns: repeat(3, 1fr); }
  .step-container { padding: 24px; }
}

/* Tablets */
@media (min-width: 768px) {
  .step-container { max-width: 600px; margin: 0 auto; }
  .category-grid { grid-template-columns: repeat(4, 1fr); }
}
```

### Accessibility Features
- **VoiceOver**: All elements properly labeled
- **Dynamic Type**: Text scales with system settings  
- **High Contrast**: Alternative color scheme
- **Reduced Motion**: Disable animations when requested
- **Touch Targets**: Minimum 44x44pt tap areas

---

## 🧭 Navigation UX Details

### Progress Indication
```
Step Indicators:
●●●○○○  (Filled dots for completed steps)

Progress Bar:
[████████████████████░░░░░░░░] 67%

Contextual Progress:
"Step 3 of 6: Flavor Selection"
```

### Error Prevention
- **Required Field Indicators**: Red asterisk (*)
- **Real-time Validation**: Immediate feedback
- **Confirmation Dialogs**: For destructive actions
- **Auto-save**: Prevent data loss
- **Back Button Warning**: "Changes will be saved as draft"

### Loading States
```
Skeleton Loading:
┌─────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░                │
│                                 │
│ ░░░░░░░   ░░░░░░░               │
│ ░░░░░░░   ░░░░░░░               │
│                                 │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░       │
└─────────────────────────────────┘
```

---

## 📊 UX Success Metrics

### Usability Metrics
```typescript
interface UXMetrics {
  completion: {
    stepCompletionRate: number[];    // 각 단계 완료율
    overallCompletionTime: number;   // 전체 소요시간
    errorRecoveryTime: number;       // 오류 복구 시간
  };
  
  satisfaction: {
    easeOfUse: number;              // 사용 용이성 (1-5)
    satisfaction: number;           // 만족도 (1-5)  
    likelyToRecommend: number;      // 추천 의향 (NPS)
  };
  
  efficiency: {
    tapCount: number;               // 목표 완료까지 탭 수
    keystrokes: number;             // 입력 효율성
    navigationErrors: number;       // 네비게이션 실수
  };
}
```

### Target Benchmarks
- **Task Success Rate**: >90%
- **Average Completion Time**: <5분
- **User Satisfaction**: >4.2/5.0
- **Error Rate**: <5%
- **Return Usage**: >70% (7일 내 재사용)

---

이 UX 와이어프레임 가이드를 통해 사용자 중심의 직관적인 테이스팅 플로우를 구현할 수 있습니다. 각 화면의 목적과 사용자의 멘탈 모델을 고려하여 최적의 경험을 제공합니다.