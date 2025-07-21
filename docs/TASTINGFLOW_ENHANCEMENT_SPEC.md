# TastingFlow Enhancement Specification
## 커피 테이스팅 플로우 개선 사양서

> **⚠️ Mode Separation Notice**: 이 문서의 일부 고급 기능들은 Lab Mode (Phase 2)로 분류됩니다.
> MVP는 Cafe Mode에만 집중합니다.

### 📋 목차
1. [개요](#개요)
2. [설계 원칙](#설계-원칙)
3. [사용자 경험 레벨](#사용자-경험-레벨)
4. [향미 탐색 시스템](#향미-탐색-시스템)
5. [플로우 유연성](#플로우-유연성)
6. [개인화 기능](#개인화-기능)
7. [프로토타입 구현 가이드](#프로토타입-구현-가이드)

---

## 개요

### 현재 상태
- 7단계의 선형적 플로우 (Coffee Info → Roaster Notes → Flavor → Sensory → Comment → Result)
- 모든 사용자에게 동일한 경험 제공
- 아코디언 기반 향미 선택 UI

### 개선 목표
- **주관적 경험 존중**: 개인의 독특한 미각 경험을 강조
- **세분화된 단계 유지**: 각 단계의 고유한 가치 보존
- **유연한 진행**: 필수/선택 단계 구분 및 나중에 추가 가능
- **개인화된 도구**: 사용자 레벨에 맞는 인터페이스 제공

---

## 설계 원칙

### 1. Mindful Tasting (마음챙김 테이스팅)
```
- 속도보다 품질 중시
- 각 단계에서 충분한 시간 제공
- "천천히 음미하세요" 메시지 강조
```

### 2. Personal Journey (개인적 여정)
```
- 타인의 평가나 인기도 배제
- 개인의 미각 발견 과정 지원
- 자신만의 향미 언어 구축
```

### 3. Progressive Disclosure (점진적 공개)
```
- 중급자 수준으로 통일된 인터페이스 제공
- 모든 사용자가 동일한 기능 사용
- 전문가 기능은 Lab Mode (Phase 2)로 분리
```

---

## 사용자 경험 (중급자 수준 통일)

### 🌿 Unified Experience
```typescript
interface UnifiedFeatures {
  // 전체 향미 휠
  fullFlavorWheel: true,
  maxFlavors: 5,
  
  // 상세 조정
  detailedSensory: {
    body: { min: 1, max: 5, step: 0.5 },
    acidity: { min: 1, max: 5, step: 0.5 },
    sweetness: { min: 1, max: 5, step: 0.5 },
    finish: { min: 1, max: 5, step: 0.5 }
  },
  
  // 비교 기능
  comparisons: {
    previousTastings: true,
    averageScores: false  // 개인 평균만
  },
  
  // 가이드 메시지
  guides: {
    coffeeInfo: "커피 봉투에 적힌 정보를 입력해주세요",
    flavor: "처음 느껴지는 맛을 선택해보세요. 정답은 없어요!",
    sensory: "입안의 느낌에 집중해보세요"
  }
}
```

### 🌳 Expert (전문가) - 🔬 Lab Mode (Phase 2)
> **⚠️ Lab Mode Features - Phase 2에서 구현 예정**

```typescript
interface ExpertFeatures {
  // 고급 기능 (Lab Mode)
  blindMode: true,  // 로스터 노트 숨기기
  
  // 추가 노트 필드 (Lab Mode)
  advancedNotes: {
    extraction: string,
    brewMethod: string,
    waterTemperature: number,
    brewTime: string,
    grindSize: string
  },
  
  // 상세 비교 (Lab Mode)
  detailedComparisons: {
    overlayMode: true,
    historicalTrends: true,
    flavorEvolution: true  // 시간에 따른 맛 변화
  },
  
  // 커스텀 속성 (Lab Mode)
  customAttributes: true
}
```

---

## 향미 탐색 시스템

### Visual Flavor Wheel (시각적 향미 휠)
```typescript
interface FlavorWheelProps {
  userLevel: 'beginner' | 'intermediate' | 'expert';
  selectedFlavors: string[];
  recentFlavors: string[];
  savedFlavors: string[];  // 북마크한 향미
}

// 구조
FlavorWheel
├── Center: 선택된 향미 표시
├── Inner Ring: 대분류 (Fruity, Nutty, etc.)
├── Middle Ring: 중분류 (Berry, Citrus, etc.)
└── Outer Ring: 세분류 (Blackberry, Lemon, etc.)
```

### Smart Search (스마트 검색)
```typescript
interface FlavorSearchProps {
  // 실시간 검색
  searchQuery: string;
  debounceDelay: 300;  // 검색 디바운스 지연
  
  // 자동완성
  autoComplete: {
    recentlyUsed: string[],
    contextual: string[],  // 같은 origin/process의 커피에서 발견된 향미
    phonetic: boolean      // 발음 기반 검색 (예: "베리" → "Berry")
  },
  
  // 검색 결과 하이라이팅
  highlighting: {
    enabled: true,
    highlightColor: '#FFE082'
  },
  
  // 향미 설명
  flavorDescriptions: {
    onHover: boolean,
    examples: string[]     // "Blackberry: 진한 보라색 베리의 달콤하고 약간 신맛"
  }
}
```

### Personal Flavor Library (개인 향미 라이브러리)
```typescript
interface PersonalFlavorLibrary {
  // 향미 북마크
  bookmarkedFlavors: {
    flavor: string,
    count: number,
    lastUsed: Date,
    notes?: string
  }[],
  
  // 향미 연결
  flavorConnections: {
    [flavor: string]: string[]  // 함께 선택된 향미들
  },
  
  // 개인 향미 노트
  personalDescriptions: {
    [flavor: string]: string    // 나만의 설명
  }
}
```

---

## 플로우 유연성

### Required vs Optional Steps
```typescript
enum StepStatus {
  REQUIRED = 'required',
  OPTIONAL = 'optional',
  SKIPPED = 'skipped',
  COMPLETED = 'completed',
  INCOMPLETE = 'incomplete'
}

interface TastingStep {
  id: string;
  name: string;
  status: StepStatus;
  canRevisit: boolean;
  data?: any;
}

const TASTING_STEPS: TastingStep[] = [
  { id: 'coffee-info', name: 'Coffee Info', status: StepStatus.REQUIRED },
  { id: 'flavors', name: 'Flavor Selection', status: StepStatus.REQUIRED },
  { id: 'sensory', name: 'Sensory Evaluation', status: StepStatus.REQUIRED },
  { id: 'personal-note', name: 'Personal Note', status: StepStatus.OPTIONAL },
  { id: 'roaster-notes', name: 'Roaster Notes', status: StepStatus.OPTIONAL },
  { id: 'result', name: 'Result', status: StepStatus.REQUIRED }
];
```

### Late Addition (나중에 추가하기)
```typescript
interface LateAdditionFeature {
  // 결과 화면에서 추가 가능한 항목들
  editableAfterSave: {
    flavors: true,
    sensory: true,
    personalNote: true,
    photos: true
  },
  
  // 알림
  reminders: {
    afterHours: 24,
    message: "어제 마신 커피의 향미를 더 추가해보시겠어요?"
  }
}
```

---

## 개인화 기능

### Contextual History (맥락적 히스토리)
```typescript
interface TastingContext {
  // 비교 가능한 이전 기록들
  comparisons: {
    sameCoffee: TastingRecord[],
    sameRoaster: TastingRecord[],
    sameOrigin: TastingRecord[],
    sameProcess: TastingRecord[]
  },
  
  // 개인 트렌드
  personalTrends: {
    favoriteOrigins: string[],
    flavorPreferences: FlavorTrend[],
    sensoryPreferences: SensoryProfile
  }
}
```

### Language Personalization (언어 개인화)
```typescript
const PERSONALIZED_COPY = {
  // 기존
  popular: "인기 있는 향미",
  recommended: "추천 향미",
  average: "평균 점수",
  
  // 개선
  popular: "내가 자주 찾은 향미",
  recommended: "이전에 발견한 향미",
  average: "나의 평균 점수",
  
  // 추가
  exploration: "아직 시도하지 않은 향미",
  growth: "향미 어휘가 3개 늘었어요!"
};
```

### Achievement Integration (세분화)
```typescript
interface TastingAchievements {
  // 단계별 업적
  stepAchievements: {
    'first-roaster-note': "첫 로스터 노트 읽기",
    'flavor-explorer': "10가지 다른 향미 발견",
    'sensory-master': "50회 감각 평가 완료"
  },
  
  // 성장 업적
  growthAchievements: {
    'vocabulary-expansion': "향미 어휘 20개 달성",
    'consistent-taster': "일주일 연속 테이스팅",
    'origin-explorer': "5개 다른 산지 커피 시음"
  }
}
```

---

## 프로토타입 구현 가이드

### 1. Enhanced Progress Bar
```typescript
interface EnhancedProgressBarProps {
  steps: TastingStep[];
  currentStep: number;
}

const EnhancedProgressBar = ({ steps, currentStep }: EnhancedProgressBarProps) => {
  return (
    <View style={styles.progressContainer}>
      {steps.map((step, index) => (
        <View key={step.id} style={styles.stepIndicator}>
          <View style={[
            styles.stepDot,
            step.status === StepStatus.REQUIRED && styles.requiredDot,
            step.status === StepStatus.COMPLETED && styles.completedDot,
            index === currentStep && styles.currentDot
          ]} />
          <Text style={styles.stepLabel}>{step.name}</Text>
        </View>
      ))}
    </View>
  );
};
```

### 2. Flavor Wheel Component
```typescript
const FlavorWheel = ({ onSelectFlavor }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  
  return (
    <Svg width={300} height={300}>
      {/* Center circle for selected flavors */}
      <Circle cx={150} cy={150} r={50} fill="#f0f0f0" />
      
      {/* Category rings */}
      {FLAVOR_CATEGORIES.map((category, index) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setSelectedCategory(category)}
        >
          <Path
            d={createArcPath(index, FLAVOR_CATEGORIES.length, 60, 100)}
            fill={category.color}
            opacity={selectedCategory?.id === category.id ? 1 : 0.7}
          />
          <Text>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </Svg>
  );
};
```

### 3. Personal Flavor Library
```typescript
const PersonalFlavorLibrary = () => {
  const [bookmarkedFlavors, setBookmarkedFlavors] = useState([]);
  const [showAddNote, setShowAddNote] = useState(false);
  
  return (
    <View style={styles.libraryContainer}>
      <Text style={styles.sectionTitle}>내 향미 라이브러리</Text>
      
      <ScrollView horizontal>
        {bookmarkedFlavors.map(flavor => (
          <TouchableOpacity
            key={flavor.id}
            style={styles.flavorCard}
            onLongPress={() => setShowAddNote(flavor)}
          >
            <Text style={styles.flavorName}>{flavor.name}</Text>
            <Text style={styles.flavorCount}>×{flavor.count}</Text>
            {flavor.personalNote && (
              <Text style={styles.personalNote}>{flavor.personalNote}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
```

### 4. Context-Aware Hints
```typescript
const ContextualHint = ({ screen, tastingHistory }) => {
  const hint = getContextualHint(screen, tastingHistory);
  
  if (!hint) return null;
  
  return (
    <Animated.View style={[styles.hintContainer, fadeInAnimation]}>
      <Text style={styles.hintIcon}>{hint.icon}</Text>
      <Text style={styles.hintText}>{hint.text}</Text>
      {hint.dismissible && (
        <TouchableOpacity onPress={dismissHint}>
          <Text>×</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};
```

---

## 웹 프로토타입 구현 요청사항

웹 Claude에게 다음 기능들을 포함한 인터랙티브 프로토타입을 요청하세요:

1. **Unified Interface**
   - 모든 사용자를 위한 통일된 인터페이스
   - 중급자 수준의 기능 제공

2. **Enhanced Progress Bar**
   - 필수/선택 단계 시각적 구분
   - 현재 위치 표시
   - 건너뛴 단계 표시

3. **Flavor Selection Interface**
   - 플레이버 휠 UI
   - 2단계 선택 (카테고리 → 세부 향미)
   - 최대 5개 선택

4. **Personal Flavor Library**
   - 북마크 기능
   - 개인 노트 추가
   - 사용 빈도 표시

5. **Contextual Features**
   - 같은 커피/로스터/산지 비교
   - 개인 트렌드 시각화
   - 성장 지표 표시

이 문서를 기반으로 React Native 프로토타입을 만들어 실제 앱에 적용할 수 있습니다.