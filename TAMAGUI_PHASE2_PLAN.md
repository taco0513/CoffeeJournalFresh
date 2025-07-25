# Tamagui Phase 2 - Component Migration Plan

## 🎯 목표
공통 컴포넌트들을 Tamagui로 마이그레이션하여 일관된 디자인 시스템 구축

## 📊 현재 상태 분석

### 이미 Tamagui로 마이그레이션된 컴포넌트
- ✅ AutocompleteInputTamagui
- ✅ HomeCafeSimpleFormTamagui

### 마이그레이션 필요한 주요 컴포넌트

#### 1. **Button 컴포넌트** (우선순위: 높음)
- `NavigationButton.tsx` - 네비게이션용 버튼
- `FloatingFeedbackButton.tsx` - 플로팅 액션 버튼
- `FloatingDummyDataButton.tsx` - 개발자 모드 버튼
- `MouthfeelButton.tsx` - 감각 평가 버튼

#### 2. **Card 컴포넌트** (우선순위: 높음)
- `AchievementCard.tsx` - 업적 카드
- `AchievementSummaryCard.tsx` - 업적 요약 카드
- `InsightCard.tsx` - 인사이트 카드
- `TasteProfileCard.tsx` - 취향 프로필 카드

#### 3. **Input/Form 컴포넌트** (우선순위: 중간)
- `AutocompleteInput.tsx` → Tamagui 버전 이미 존재
- `HomeCafeForm.tsx` - 홈카페 폼
- `HomeCafePouroverForm.tsx` - 푸어오버 폼
- `LabModeForm.tsx` - 랩 모드 폼

#### 4. **기타 UI 컴포넌트** (우선순위: 중간)
- `Chip.tsx` - 칩/태그 컴포넌트
- `Toast.tsx` - 토스트 메시지
- `SkeletonLoader.tsx` - 스켈레톤 로더
- `Typography.tsx` - 타이포그래피

#### 5. **모달/오버레이** (우선순위: 낮음)
- `AddCoffeeModal.tsx` - 커피 추가 모달
- `CameraModal.tsx` - 카메라 모달
- `CoffeeDiscoveryAlert.tsx` - 알림 모달

## 🔄 마이그레이션 순서

### Phase 2.1 - Core Components (1주차)
1. **NavigationButton** → Tamagui Button
2. **Chip** → Tamagui styled component
3. **Toast** → Tamagui Toast
4. **Typography** → Tamagui Text variants

### Phase 2.2 - Card Components (2주차)
1. **Base Card Template** 생성
2. **InsightCard** 마이그레이션
3. **AchievementCard** 마이그레이션
4. **나머지 Card** 컴포넌트들

### Phase 2.3 - Form Components (3주차)
1. **Input Base Components** 정리
2. **Form 컴포넌트** 통합
3. **Validation** 시스템 구축

### Phase 2.4 - HIGColors 제거 (4주차)
1. **HIGColors → Tamagui tokens** 매핑
2. **전체 코드베이스** 교체
3. **다크 모드** 지원 추가

## 📁 새로운 폴더 구조

```
src/
├── components-tamagui/     # 새로운 Tamagui 컴포넌트
│   ├── buttons/           # Button 관련
│   ├── cards/             # Card 관련
│   ├── forms/             # Form/Input 관련
│   ├── feedback/          # Toast, Alert 등
│   └── index.ts           # 중앙 export
├── components/            # 기존 컴포넌트 (점진적 교체)
└── components-legacy/     # 교체된 컴포넌트 아카이브
```

## 🚀 시작하기

### 1단계: NavigationButton 마이그레이션
```typescript
// Before (React Native)
<TouchableOpacity style={styles.button}>
  <Text>Back</Text>
</TouchableOpacity>

// After (Tamagui)
<Button 
  icon={ChevronLeft}
  variant="ghost"
  size="$3"
>
  Back
</Button>
```

### 2단계: 공통 Button 스타일 정의
- Primary, Secondary, Ghost variants
- Size tokens: $1-$5
- Icon support
- Loading states

## ✅ 성공 지표
- 모든 Button 컴포넌트 통합
- HIGColors 완전 제거
- 다크 모드 지원
- 번들 사이즈 10% 감소
- 일관된 디자인 시스템

---

**시작일**: 2025년 1월 25일
**예상 완료**: 4주 (2월 말)
**우선순위**: NavigationButton → Chip → Cards → Forms