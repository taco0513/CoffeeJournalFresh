# 🚀 TastingFlow Implementation Guide

## 개요

TastingFlow Cafe Mode의 6단계 구현을 위한 실무 가이드입니다. 각 단계별 우선순위, 기술 스택, 구현 순서를 명확히 제시합니다.

> **MVP 목표**: 3개월 내 Cafe Mode 완성, 일반 커피 애호가 대상

---

## 📋 Implementation Priority Matrix

### P0 (Critical - MVP Core)
1. **Step 1**: Coffee Info - 기본 정보 입력 (필수)
2. **Step 2**: Flavor Selection - 개인 취향 발견 (필수)
3. **Step 3**: Sensory Evaluation - 감각 평가 (필수)
4. **Step 6**: Result Matching - 성장 추적 (필수)

### P1 (Important - MVP Enhancement) 
5. **Step 4**: Personal Note - 개인 메모 (선택)
6. **Step 5**: Roaster Notes - 전문가 노트 비교 (선택)

---

## 🏗️ Architecture Overview

```
TastingFlow/
├── screens/
│   ├── CoffeeInfoStep.tsx          # Step 1
│   ├── FlavorSelectionStep.tsx     # Step 2
│   ├── SensoryEvaluationStep.tsx   # Step 3
│   ├── PersonalNoteStep.tsx        # Step 4
│   ├── RoasterNotesStep.tsx        # Step 5
│   └── ResultMatchingStep.tsx      # Step 6
├── components/
│   ├── common/
│   │   ├── StepHeader.tsx
│   │   ├── ProgressBar.tsx
│   │   └── NavigationButtons.tsx
│   ├── coffee-info/
│   ├── flavor-selection/
│   ├── sensory-evaluation/
│   ├── personal-note/
│   ├── roaster-notes/
│   └── result-matching/
├── services/
│   ├── TastingFlowService.ts       # Core business logic
│   ├── OCRService.ts               # Image processing
│   ├── FlavorRecommendationEngine.ts
│   └── PersonalizationService.ts
├── stores/
│   └── TastingFlowStore.ts         # Zustand state
└── types/
    └── TastingFlow.ts              # TypeScript interfaces
```

---

## 🚀 Implementation Plan

### Week 1-2: Core Infrastructure
```typescript
// 1. 기본 타입 정의
interface TastingSession {
  id: string;
  coffeeInfo: CoffeeInfo;
  flavorSelection?: FlavorSelection;
  sensoryEvaluation?: SensoryEvaluation;
  personalNote?: PersonalNote;
  roasterNotes?: RoasterNotes;
  results?: TastingResults;
  
  // 메타데이터
  createdAt: Date;
  completedAt?: Date;
  currentStep: TastingStep;
  userId: string;
}

// 2. 상태 관리 (Zustand)
interface TastingFlowState {
  currentSession: TastingSession | null;
  progress: number; // 0-100
  
  // Actions
  startNewSession: (coffeeInfo: CoffeeInfo) => void;
  updateStep: (step: TastingStep, data: any) => void;
  completeSession: () => void;
  
  // Navigation
  goToStep: (step: number) => void;
  goNext: () => void;
  goPrevious: () => void;
}
```

### Week 3-4: Step 1 - Coffee Info (P0)
```typescript
// CoffeeInfoStep 구현 우선순위
const implementation = {
  week3: [
    "기본 폼 UI (수동 입력)",
    "유효성 검증",
    "자동완성 (roastery, origin)",
    "다음 단계 연결"
  ],
  week4: [
    "OCR 기본 기능 (optional)",
    "이미지 갤러리 선택",
    "진행률 표시",
    "드래프트 저장"
  ]
};

// 핵심 컴포넌트
const CoffeeInfoStep: React.FC = () => {
  return (
    <StepContainer step={1} title="커피 정보">
      <CoffeeInfoForm />
      <AutoCompleteHelper />
      <OCRScanner /> {/* Phase 2 */}
      <NavigationButtons />
    </StepContainer>
  );
};
```

### Week 5-6: Step 2 - Flavor Selection (P0)
```typescript
// FlavorSelection 구현 계획
const flavorImplementation = {
  week5: [
    "향미 카테고리 구조 구현",
    "카테고리 열림/닫힘 토글",
    "기본 선택/해제 로직",
    "최대 5개 제한",
    "선택된 향미 상단 표시 (Sticky Header)"
  ],
  week6: [
    "실시간 검색 기능",
    "개인 라이브러리 연동",
    "애니메이션 및 햅틱 피드백",
    "전체 삭제 기능",
    "상태 저장 및 복구"
  ]
};

// 주요 컴포넌트 구조
const FlavorSelectionStep: React.FC = () => {
  const [selectedFlavors, setSelectedFlavors] = useState<SelectedFlavor[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    Object.keys(flavorCategories) // Cafe Mode: 모든 카테고리 기본 열림
  );
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <StepContainer step={2} title="향미 선택">
      <ProgressIndicator current={2} total={6} />
      <SelectedFlavorsHeader 
        flavors={selectedFlavors}
        onRemove={handleRemoveFlavor}
        onClearAll={handleClearAll}
      />
      <SearchBar 
        value={searchQuery}
        onChange={setSearchQuery}
      />
      <FlavorCategories
        categories={flavorCategories}
        expandedCategories={expandedCategories}
        selectedFlavors={selectedFlavors}
        onToggleCategory={toggleCategory}
        onSelectFlavor={handleSelectFlavor}
        maxSelection={5}
      />
      <NavigationButtons />
    </StepContainer>
  );
};

// 우선순위별 기능
const features = {
  P0: "카테고리 선택, 기본 UI",
  P1: "향미 휠, 검색",
  P2: "AI 추천, 상세 분석"
};
```

### Week 7-8: Step 6 - Result Matching (P0)
```typescript
// 결과 화면 구현
const resultImplementation = {
  core: [
    "개인 선택 향미 표시",
    "기본 성취 배지",
    "다음 추천 커피",
    "데이터 저장"
  ],
  enhanced: [
    "로스터 노트 비교 (Step 2 완성 후)",
    "성장 그래프",
    "소셜 공유",
    "상세 분석"
  ]
};
```

### Week 9-10: Step 4 - Sensory Evaluation (P1)
```typescript
// 감각 평가 구현
const sensoryImplementation = {
  beginner: {
    ui: "3개 프리셋 (Light/Medium/Full)",
    data: "단순화된 점수",
    time: "30초 완료 목표"
  },
  intermediate: {
    ui: "4개 슬라이더 (Body/Acidity/Sweetness/Finish)", 
    data: "정밀 점수 (1-10)",
    features: "온도 변화 추적"
  }
};
```

### Week 11-12: Step 5 - Personal Comment (P1)
```typescript
// 개인 코멘트 구현
const commentImplementation = {
  basic: [
    "자유 텍스트 입력",
    "글자 수 카운터",
    "임시저장 기능"
  ],
  advanced: [
    "음성 메모 (optional)",
    "사진 첨부",
    "감정 태그",
    "AI 작성 도우미"
  ]
};
```

---

## 🎨 Component Implementation Patterns

### 1. 재사용 가능한 기본 컴포넌트

```typescript
// StepContainer - 모든 단계에서 공통 사용
interface StepContainerProps {
  step: number;
  title: string;
  subtitle?: string;
  canSkip?: boolean;
  children: React.ReactNode;
}

const StepContainer: React.FC<StepContainerProps> = ({
  step, title, subtitle, canSkip, children
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StepHeader step={step} title={title} subtitle={subtitle} />
      <ProgressBar current={step} total={6} />
      
      <ScrollView style={styles.content}>
        {children}
      </ScrollView>
      
      <NavigationFooter 
        onBack={() => navigateBack()}
        onNext={() => navigateNext()}
        onSkip={canSkip ? () => skipStep() : undefined}
      />
    </SafeAreaView>
  );
};
```

### 2. 상태 관리 패턴

```typescript
// TastingFlowStore.ts - Zustand 스토어
export const useTastingFlowStore = create<TastingFlowState>((set, get) => ({
  currentSession: null,
  currentStep: 1,
  
  // 세션 시작
  startNewSession: (coffeeInfo: CoffeeInfo) => set(state => ({
    currentSession: {
      id: generateId(),
      coffeeInfo,
      currentStep: 1,
      createdAt: new Date(),
      userId: getCurrentUserId()
    }
  })),
  
  // 단계별 데이터 업데이트
  updateStep: (step: TastingStep, data: any) => set(state => ({
    currentSession: state.currentSession ? {
      ...state.currentSession,
      [getStepDataKey(step)]: data,
      currentStep: step
    } : null
  })),
  
  // 자동 저장 (실시간)
  autoSave: async () => {
    const session = get().currentSession;
    if (session) {
      await RealmService.saveTastingDraft(session);
    }
  }
}));
```

### 3. 네비게이션 패턴

```typescript
// TastingFlowNavigator.ts
const TastingFlowNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="CoffeeInfo"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false // 단계별 순서 강제
      }}
    >
      <Stack.Screen name="CoffeeInfo" component={CoffeeInfoStep} />
      <Stack.Screen name="RoasterNotes" component={RoasterNotesStep} />
      <Stack.Screen name="FlavorSelection" component={FlavorSelectionStep} />
      <Stack.Screen name="SensoryEvaluation" component={SensoryEvaluationStep} />
      <Stack.Screen name="PersonalComment" component={PersonalCommentStep} />
      <Stack.Screen name="ResultMatching" component={ResultMatchingStep} />
    </Stack.Navigator>
  );
};
```

---

## 🔧 Technical Implementation Details

### 데이터 흐름
```
User Input → Component State → Store → Auto-save → Realm DB
                                ↓
Navigation → Next Step → Load Data → Populate UI
```

### 상태 동기화
```typescript
// 실시간 저장 (3초 디바운스)
const useAutoSave = () => {
  const { currentSession, autoSave } = useTastingFlowStore();
  
  useDebouncedEffect(() => {
    if (currentSession) {
      autoSave();
    }
  }, [currentSession], 3000);
};
```

### 에러 처리
```typescript
// 단계별 유효성 검증
const validateStep = (step: number, data: any): ValidationResult => {
  const validators = {
    1: validateCoffeeInfo,
    2: validateRoasterNotes, // optional
    3: validateFlavorSelection,
    4: validateSensoryEvaluation,
    5: validatePersonalComment, // optional
    6: validateResults
  };
  
  return validators[step]?.(data) || { isValid: true };
};
```

---

## 📱 UI/UX Implementation Guidelines

### 디자인 시스템
```typescript
// Theme.ts - 일관된 디자인
export const tastingFlowTheme = {
  colors: {
    primary: '#8B4513',      // Coffee brown
    secondary: '#D2B48C',    // Light coffee
    accent: '#FF6B35',       // Warm accent
    background: '#FFF8DC',   // Cream white
    text: '#2F1B14'         // Dark brown
  },
  
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32
  },
  
  typography: {
    stepTitle: { fontSize: 24, fontWeight: 'bold' },
    stepSubtitle: { fontSize: 16, color: 'gray' },
    body: { fontSize: 14, lineHeight: 20 }
  }
};
```

### 접근성 가이드라인
```typescript
// 모든 터치 가능한 요소 최소 44pt
const TouchableElement = styled.TouchableOpacity`
  min-height: 44px;
  min-width: 44px;
`;

// VoiceOver 지원
<Text accessibilityRole="header" accessibilityLabel="커피 정보 입력">
  Step 1: Coffee Info
</Text>
```

---

## 🧪 Testing Strategy

### 단계별 테스트 체크리스트

```typescript
// Step 1 Tests
describe('CoffeeInfoStep', () => {
  test('필수 필드 유효성 검증');
  test('자동완성 기능');
  test('다음 단계 네비게이션');
  test('드래프트 저장/복구');
});

// Integration Tests
describe('TastingFlow Integration', () => {
  test('전체 플로우 완주');
  test('중간 이탈 후 재시작');
  test('데이터 무결성 검증');
});
```

### 성능 측정
```typescript
// 단계별 목표 성능
const performanceTargets = {
  loadTime: '< 1초',        // 단계 로딩 시간
  inputResponse: '< 300ms', // 입력 반응 속도
  autoSave: '< 2초',        // 저장 완료 시간
  navigation: '< 500ms'     // 화면 전환
};
```

---

## 📊 Success Metrics & Analytics

### 핵심 지표
```typescript
interface TastingFlowAnalytics {
  completion: {
    overallRate: number;      // 전체 완료율
    stepDropoff: number[];    // 단계별 이탈률
    averageTime: number;      // 평균 소요시간
  };
  
  engagement: {
    skipRate: number[];       // 단계별 건너뛰기율
    editRate: number;         // 수정 빈도
    returnRate: number;       // 재시작률
  };
  
  quality: {
    dataCompleteness: number; // 데이터 완성도
    userSatisfaction: number; // 만족도 점수
    errorRate: number;        // 오류 발생률
  };
}
```

---

## 🚀 Deployment & Rollout Plan

### Phase 1: MVP (Month 1-3)
- ✅ Core 3 steps (1,3,6) 구현
- ✅ 기본 UI/UX 완성
- ✅ 자동저장 기능
- ✅ 기본 분석 기능

### Phase 2: Enhancement (Month 4-6)
- ✅ 전체 6단계 완성
- ✅ OCR 기능 추가
- ✅ 개인화 추천 시스템
- ✅ 커뮤니티 기능

### Phase 3: Advanced (Month 7-12)
- ✅ AI 기반 분석
- ✅ 소셜 기능 확장
- ✅ 전문가 모드 (Lab Mode)
- ✅ 다국어 지원

---

이 구현 가이드를 따라 단계적으로 진행하면 3개월 내 MVP 출시가 가능합니다. 각 단계별 우선순위와 기술적 복잡도를 고려하여 효율적인 개발이 가능하도록 설계되었습니다.