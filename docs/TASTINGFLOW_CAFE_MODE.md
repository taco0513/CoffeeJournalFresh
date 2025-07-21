# 🍃 TastingFlow - Cafe Mode (MVP Phase 1)

## 개요

Cafe Mode는 일반 커피 애호가를 대상으로 한 **간단하고 접근 가능한** 테이스팅 플로우입니다. 복잡한 전문가 도구 없이도 개인의 커피 취향을 발견하고 기록할 수 있도록 설계되었습니다.

> **🎯 현재 상태**: MVP Phase 1에서 구현 중인 핵심 기능입니다.

---

## 🎯 설계 철학

### 핵심 원칙
- **접근성**: 커피 전문 지식 없이도 사용 가능
- **단순성**: 복잡하지 않은 직관적 인터페이스  
- **격려**: 틀림이 아닌 개성으로 인정
- **성장**: 점진적인 향미 어휘 확장

### 대상 사용자
- 커피를 좋아하는 일반인
- 테이스팅 초보자
- 개인 취향 발견에 관심 있는 사람
- 간단한 기록을 원하는 사용자

---

## 📋 TastingFlow 단계

### 전체 플로우 구조
```
1. Coffee Info (필수)
   ↓
2. Roaster Notes (선택)
   ↓  
3. Flavor Selection (선택)
   ↓
4. Sensory Evaluation (선택)
   ↓
5. Personal Comment (선택)
   ↓
6. Result & Matching (필수)
```

### 단계별 상세 설명

#### 1. ☕ Coffee Info (필수)
**목적**: 기본 커피 정보 입력

**입력 필드**:
```typescript
interface CoffeeInfo {
  coffeeName: string;          // 커피 이름
  roastery: string;           // 로스터리
  origin?: string;            // 원산지 (선택)
  process?: string;           // 가공법 (선택)
  roastLevel?: string;        // 로스팅 레벨 (선택)
  brewMethod?: string;        // 추출 방법 (선택)
}
```

**특징**:
- 간단한 자동완성 기능
- OCR 스캔 지원 (커피 봉투 촬영)
- 필수 필드 최소화 (이름, 로스터리만)

#### 2. 📝 Roaster Notes (선택)
**목적**: 로스터의 공식 테이스팅 노트 입력

**기능**:
- 자유 텍스트 입력
- 나중에 개인 평가와 비교용
- 건너뛰기 가능

#### 3. 🎨 Flavor Selection (선택)
**목적**: 개인이 느낀 향미 선택

**사용자 레벨별 차이**:

##### 🌱 초보자 (Beginner)
```typescript
interface BeginnerFlavorSelection {
  categories: ['Fruity', 'Nutty', 'Chocolate', 'Floral', 'Other'];
  maxSelection: 3;
  showDescriptions: true;
  guides: "처음 느껴지는 맛을 선택해보세요";
}
```

**UI**:
- 5개 큰 카테고리 카드
- 각 카테고리별 설명 포함
- 최대 3개까지 선택

##### 🌿 중급자 (Intermediate)
```typescript  
interface IntermediateFlavorSelection {
  useFlavorWheel: true;
  maxSelection: 5;
  subcategories: true;
  personalLibrary: true;  // 즐겨 사용하는 향미
}
```

**UI**:
- 기본 향미 휠 인터페이스
- 2단계 선택 (카테고리 → 세부 향미)
- 개인 향미 라이브러리 접근

##### 🌳 Expert (Phase 2에서 Lab Mode로 이동)
현재 Cafe Mode에서는 중급자 수준까지만 지원

#### 4. 👅 Sensory Evaluation (선택)
**목적**: 감각적 특성 평가

**사용자 레벨별 차이**:

##### 🌱 초보자
```typescript
interface BeginnerSensory {
  presets: ['Light', 'Medium', 'Full'];
  description: "입안의 느낌을 선택해보세요";
  optional: true;
}
```

**UI**: 3개 프리셋 버튼으로 간단 선택

##### 🌿 중급자  
```typescript
interface IntermediateSensory {
  attributes: {
    body: { range: [1, 5], step: 0.5 },
    acidity: { range: [1, 5], step: 0.5 },  
    sweetness: { range: [1, 5], step: 0.5 },
    finish: { range: [1, 5], step: 0.5 }
  };
}
```

**UI**: 슬라이더를 이용한 세부 조절

#### 5. 💭 Personal Comment (선택)
**목적**: 개인적인 소감이나 메모

**기능**:
- 자유 텍스트 입력
- 음성 입력 지원 (Phase 2)
- 사진 첨부 가능

#### 6. 📊 Result & Matching (필수)
**목적**: 결과 확인 및 성장 추적

**표시 내용**:
```typescript
interface CafeResult {
  personalScore: number;           // 개인 만족도
  roasterMatching?: number;        // 로스터 노트와의 일치도
  encouragement: string;           // 격려 메시지
  growthIndicator: string;         // 성장 지표
  suggestions: string[];           // 다음 추천사항
}
```

**특징**:
- 격려 중심의 피드백
- "틀림"이 아닌 "개성" 강조
- 점진적 성장 추적

---

## 🎯 사용자 경험 (UX) 가이드

### 진행 방식
- **유연한 건너뛰기**: 부담 없이 원하는 단계만 완료
- **되돌아가기**: 언제든 이전 단계로 복귀 가능
- **저장 & 나중에**: 중간 저장하고 나중에 완료

### 가이드 메시지
```typescript
const cafeGuideMessages = {
  coffeeInfo: "커피 봉투에 적힌 정보를 입력해주세요",
  roasterNotes: "로스터의 설명을 적어두면 나중에 비교해볼 수 있어요",
  flavor: "처음 느껴지는 맛을 선택해보세요. 정답은 없어요!",
  sensory: "입안의 느낌에 집중해보세요",
  comment: "오늘의 커피는 어떠셨나요?",
  result: "당신만의 특별한 감각을 발견했어요!"
};
```

### 격려 시스템
```typescript
const encouragementSystem = {
  lowMatching: "사람마다 느끼는 맛이 달라요. 당신의 표현도 정답이에요!",
  mediumMatching: "75% 일치도? 훌륭해요! 🎉", 
  highMatching: "로스터와 비슷하게 느끼셨네요! 감각이 정말 좋으세요!",
  firstTime: "첫 테이스팅을 완료하셨어요! 멋진 시작이에요!",
  progress: "지난번보다 더 세세하게 표현하셨네요! 👏"
};
```

---

## 🔧 기술적 구현

### 상태 관리
```typescript
interface TastingState {
  currentStep: number;
  userLevel: 'beginner' | 'intermediate';
  data: {
    coffeeInfo: CoffeeInfo;
    roasterNotes?: string;
    flavors?: string[];
    sensory?: SensoryData;  
    comment?: string;
  };
  progress: {
    completedSteps: number[];
    skippedSteps: number[];
    totalSteps: 6;
  };
}
```

### 플로우 제어
```typescript
class CafeTastingFlow {
  // 단계 간 이동
  nextStep(): void;
  previousStep(): void;
  skipStep(): void;
  
  // 저장 & 복구
  saveDraft(): void;
  loadDraft(): TastingState | null;
  
  // 레벨별 UI 조정
  getUIConfig(userLevel: UserLevel): UIConfig;
  
  // 결과 계산
  calculateResult(): CafeResult;
}
```

---

## 📈 성장 추적

### 개인 발전 지표
- **향미 어휘 확장**: 사용한 향미 단어 수 추적
- **기록 주기**: 테이스팅 빈도 분석  
- **상세도 증가**: 기록의 완성도 측정
- **일관성**: 비슷한 커피에 대한 평가 일관성

### 격려 시스템
- 성장을 수치가 아닌 **여정**으로 표현
- 개인의 고유한 취향 발견 과정 강조
- 커뮤니티와의 자연스러운 연결

---

## 🎨 UI/UX 디자인 원칙

### Visual Design
- **따뜻한 컬러**: 커피를 연상시키는 브라운 톤
- **큰 터치 영역**: 모바일 친화적 인터페이스
- **최소한의 텍스트**: 아이콘과 비주얼 중심

### Interaction Design  
- **즉시 피드백**: 선택 시 바로 반응
- **부드러운 전환**: 단계 간 자연스러운 애니메이션
- **실수 복구**: 언제든 수정 가능

### Accessibility
- **간단한 언어**: 전문 용어 최소화
- **선택적 깊이**: 원하는 만큼만 상세히
- **다양한 입력**: 터치, 음성, OCR 등

---

## 🚀 향후 발전 방향

### Phase 1 (현재)
- ✅ 기본 플로우 구현
- ✅ 초보자/중급자 레벨 지원
- 🔧 격려 시스템 강화

### Phase 2 연계점
- 고급 사용자는 Lab Mode로 자연스러운 전환
- Cafe Mode 데이터를 Lab Mode에서 활용
- 모드 간 사용자 경험 일관성 유지

---

이 문서는 Cafe Mode TastingFlow의 완전한 명세서입니다. 개발팀은 이 문서를 기반으로 사용자 친화적인 테이스팅 경험을 구현할 수 있습니다.