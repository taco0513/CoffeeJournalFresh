# 커피 기록 Flow v.통합.1

## 개요
커피 테이스팅 기록 프로세스를 7개 화면에서 4개 화면으로 간소화하고, 모바일 UX를 최적화하는 통합 개선안.

## 현재 문제점 분석

### 1. 프로세스 복잡도
- **7개 화면** 거쳐야 완료 (너무 길음)
- 향미 선택만 **3개 화면** 분리 (과도한 세분화)
- 진행률 표시 오류 (FlavorLevel2: 4/7, 실제는 5/7)

### 2. UX 문제점
- 필수/선택 항목 구분 불명확
- 작은 터치 타겟 (모바일 최적화 부족)
- 이전 선택 내용 확인 불가
- 검색 기능 부재 (148개 향미 중 탐색 어려움)

### 3. 데이터 입력 비효율
- CoffeeInfoScreen에 10개+ 필드 (과도한 정보)
- 자동완성 트리거 일관성 없음 (1자 vs 2자)
- 스마트 기본값 부재

## 개선된 Flow 설계

### 화면 구성 (7개 → 4개)

```
1. BasicInfoScreen (기본 정보)
   - 커피명 (필수)
   - 로스터리
   - 온도 선택
   - 간단 정보만 입력

2. UnifiedFlavorScreen (통합 향미 선택)
   - 검색 기능
   - 확장 가능한 카테고리
   - 선택 경로 실시간 표시
   - 인기/최근 사용 퀵 액세스

3. EvaluationScreen (평가 통합)
   - 센서리 평가
   - 개인 코멘트
   - 하나의 화면에서 처리

4. ReviewSaveScreen (검토 및 저장)
   - 입력 내용 요약
   - 수정 가능
   - 매칭 점수 미리보기
```

### 네비게이션 개선
- 좌우 스와이프로 단계 이동
- 하단 진행바 + 단계 점프 가능
- 뒤로가기 시 자동 저장

## UnifiedFlavorScreen 상세 설계

### UI 구조

```tsx
<SafeAreaView>
  {/* 1. 상단 검색바 */}
  <SearchBar>
    🔍 "블랙베리, 초콜릿 검색..."
    [필터] [정렬]
  </SearchBar>

  {/* 2. 선택된 향미 표시 */}
  <SelectedFlavors>
    [🍓 Fruity > Berry > Blackberry ×]
    [🍫 Nutty/Cocoa > Dark Chocolate ×]
    + 2개 더 추가 가능
  </SelectedFlavors>

  {/* 3. 확장 가능한 카테고리 */}
  <ScrollView>
    <CategoryAccordion
      title="🍓 Fruity (과일향)"
      count={12}
      expanded={true}
      subCategories={['Berry', 'Citrus', 'Dried Fruit']}
      flavors={flavorsBySubCategory}
    />
    {/* 8개 더 카테고리... */}
  </ScrollView>

  {/* 4. 빠른 접근 탭 */}
  <QuickAccessTabs>
    [⭐ 인기] [🕐 최근] [💝 즐겨찾기]
  </QuickAccessTabs>
</SafeAreaView>
```

### 카테고리별 색상 시스템

```typescript
const CATEGORY_COLORS = {
  'Fruity': '#FF6B6B',        // 빨강
  'Sour/Fermented': '#FFD93D', // 노랑  
  'Green/Vegetative': '#4CAF50', // 초록
  'Roasted': '#8B4513',        // 갈색
  'Spices': '#FF8C00',         // 주황
  'Nutty/Cocoa': '#D2691E',    // 초콜릿
  'Sweet': '#FFB6C1',          // 분홍
  'Floral': '#9370DB',         // 보라
  'Other': '#9E9E9E'           // 회색
};
```

### 인터랙션 디자인

1. **아코디언 방식**
   - 카테고리 탭 → 서브카테고리 표시
   - 서브카테고리 선택 → 해당 향미 그리드

2. **검색 우선**
   - 실시간 검색으로 148개 향미 중 빠른 탐색
   - 한글/영문 모두 지원

3. **선택 피드백**
   - 선택 시 햅틱 피드백
   - 선택 경로 즉시 표시
   - 최대 5개 제한 시각화

## 구현 계획

### Phase 1: 기반 작업
1. UnifiedFlavorScreen 컴포넌트 생성
2. 향미 데이터 구조 리팩토링
3. 검색 인덱싱 구현

### Phase 2: UI 구현
1. 아코디언 카테고리 컴포넌트
2. 검색바 및 필터링
3. 선택된 향미 칩 UI

### Phase 3: Flow 통합
1. Navigation 구조 변경
2. 기존 3개 화면 대체
3. 데이터 마이그레이션

### Phase 4: 최적화
1. 성능 최적화 (메모이제이션)
2. 애니메이션 추가
3. 접근성 개선

## 예상 효과

### 사용성 개선
- 완료까지 탭 수: **약 60% 감소**
- 평균 완료 시간: **3분 → 1.5분**
- 중도 이탈률: **30% → 10% 예상**

### 기술적 이점
- 코드 중복 제거 (3개 화면 → 1개)
- 상태 관리 단순화
- 유지보수성 향상

## 다음 단계

1. UnifiedFlavorScreen 프로토타입 구현
2. 사용자 테스트 (A/B 테스트)
3. 피드백 반영 및 개선
4. 전체 Flow 적용

---

작성일: 2025-07-21
버전: v.통합.1
상태: 구현 대기