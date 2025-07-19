# Coffee Tasting Journey - Evolution Plan
## MVP v0.3.0 → Personal Taste, Shared Journey

### 🎯 핵심 철학 전환
**From**: 단순 커피 일기 앱
**To**: "Personal Taste, Shared Journey" - 개인의 고유한 취향 발견 + 커뮤니티와 함께하는 성장

---

## 📋 Phase 1: Personal Taste 강화 (1-2개월)

### Week 1-2: 개인 취향 발견 시스템
#### 🎯 목표
기존 테이스팅 기록을 "개인 취향 발견" 관점으로 재구성

#### 🔧 구현 사항
1. **개인 대시보드 개선**
   ```typescript
   // 새로운 컴포넌트
   - PersonalTasteDashboard.tsx
   - TastePatternAnalysis.tsx
   - PreferenceRadarChart.tsx
   ```

2. **취향 분석 알고리즘**
   ```typescript
   // 새로운 서비스
   - TasteAnalysisService.ts
   - PersonalPreferenceEngine.ts
   ```

3. **UI 개선**
   - 홈 화면에 "나의 커피 여정" 섹션 추가
   - "개인 취향 발견률" 진행 표시
   - "이번 주 새로 발견한 향미" 하이라이트

### Week 3-4: 표현 능력 게임화
#### 🎮 미니게임 시스템
1. **플레이버 휠 학습게임**
   ```typescript
   // 새로운 화면
   - FlavorWheelGameScreen.tsx
   - TastingQuizScreen.tsx
   - VocabularyProgressScreen.tsx
   ```

2. **성장 추적**
   - 사용 어휘 확장 통계
   - 표현 정확도 점수
   - 월간 성장 리포트

#### 📊 데이터 확장
```sql
-- 새로운 테이블
CREATE TABLE user_taste_profile (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  preference_vector JSONB, -- 향미 선호도 벡터
  vocabulary_level INTEGER, -- 표현 능력 레벨
  taste_dna JSONB, -- 개인 미각 DNA
  updated_at TIMESTAMP
);

CREATE TABLE flavor_learning_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  flavor_category VARCHAR(50),
  accuracy_score FLOAT,
  attempts_count INTEGER,
  mastery_level INTEGER
);
```

---

## 📋 Phase 2: Shared Journey 시작 (2-3개월)

### Week 5-8: 기본 커뮤니티 연결
#### 👥 소셜 기능 추가
1. **다른 사용자 노트 보기**
   ```typescript
   // 새로운 컴포넌트
   - CommunityNotesView.tsx
   - SimilarTastingCard.tsx
   - AnonymizedUserProfile.tsx
   ```

2. **취향 유사도 매칭**
   ```typescript
   // 새로운 서비스
   - TasteSimilarityEngine.ts
   - CommunityMatchingService.ts
   ```

#### 🔒 프라이버시 보호
- 모든 공유는 선택적 (opt-in)
- 개인정보 익명화
- 상세한 개인정보 제어

### Week 9-12: 소셜 학습 도구
#### 🎓 함께 배우는 시스템
1. **전문가 노트 비교**
   ```typescript
   // 새로운 기능
   - ExpertComparison.tsx
   - RoasterNoteAnalysis.tsx
   - ProfessionalFeedback.tsx
   ```

2. **커뮤니티 챌린지**
   - 주간 테이스팅 챌린지
   - 월간 향미 탐험
   - 시즌별 이벤트

#### 📈 데이터 확장
```sql
-- 커뮤니티 관련 테이블
CREATE TABLE community_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  interaction_type VARCHAR(20), -- 'view', 'like', 'compare'
  tasting_record_id UUID REFERENCES tasting_records(id),
  created_at TIMESTAMP
);

CREATE TABLE taste_similarity_scores (
  id UUID PRIMARY KEY,
  user_a_id UUID REFERENCES users(id),
  user_b_id UUID REFERENCES users(id),
  similarity_score FLOAT,
  calculated_at TIMESTAMP
);
```

---

## 📋 Phase 3: 구독 서비스 준비 (3-6개월)

### Month 4-5: Lab Pro 개발
#### 🔬 고급 분석 도구
1. **프리미엄 분석 기능**
   ```typescript
   // Lab Pro 전용 컴포넌트
   - AdvancedTastingAnalysis.tsx
   - BlindTastingMode.tsx
   - ExtractionVariableAnalysis.tsx
   - PersonalCoffeeCoach.tsx
   ```

2. **구독 관리 시스템**
   ```typescript
   // 구독 관련 서비스
   - SubscriptionService.ts
   - PaymentProcessor.ts
   - PremiumFeatureGate.ts
   ```

### Month 6: 원두 구독 플랫폼
#### 📦 큐레이션 서비스
1. **원두 구독 시스템**
   ```typescript
   // 구독 관련 화면
   - SubscriptionPlanScreen.tsx
   - MonthlyBoxScreen.tsx
   - QRScanIntegration.tsx
   ```

2. **구독자 커뮤니티**
   - 같은 원두 구독자 매칭
   - 월간 구독자 이벤트
   - 프리미엄 콘텐츠

---

## 🗄️ 데이터베이스 진화 계획

### Phase 1 Extensions
```sql
-- 개인 취향 관련
ALTER TABLE users ADD COLUMN taste_profile_id UUID;
ALTER TABLE tasting_records ADD COLUMN personal_insights JSONB;
ALTER TABLE tasting_records ADD COLUMN vocabulary_used TEXT[];

-- 게임화 요소
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_type VARCHAR(50),
  unlocked_at TIMESTAMP
);
```

### Phase 2 Extensions
```sql
-- 소셜 기능
ALTER TABLE tasting_records ADD COLUMN is_public BOOLEAN DEFAULT false;
ALTER TABLE tasting_records ADD COLUMN community_interactions_count INTEGER DEFAULT 0;

-- 커뮤니티 기능
CREATE TABLE community_challenges (
  id UUID PRIMARY KEY,
  title VARCHAR(100),
  description TEXT,
  start_date DATE,
  end_date DATE,
  participants_count INTEGER DEFAULT 0
);
```

### Phase 3 Extensions
```sql
-- 구독 서비스
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_type VARCHAR(20), -- 'lab_pro', 'coffee_box'
  status VARCHAR(20), -- 'active', 'paused', 'cancelled'
  started_at TIMESTAMP,
  next_billing_date DATE
);

CREATE TABLE coffee_boxes (
  id UUID PRIMARY KEY,
  month_year VARCHAR(7), -- '2025-08'
  theme VARCHAR(100),
  coffee_count INTEGER,
  qr_codes JSONB -- QR 코드와 커피 정보 매핑
);
```

---

## 🎯 성공 지표 (KPI)

### Phase 1 목표
- **개인 취향 발견률**: 신규 사용자의 80%가 첫 달 내 선호 패턴 3개 이상 식별
- **표현 능력 향상**: 3개월 사용자의 사용 어휘 50% 증가
- **앱 참여도**: 평균 세션 시간 3분 → 8분 증가

### Phase 2 목표
- **커뮤니티 참여**: 활성 사용자의 60%가 월 1회 이상 다른 사용자와 교류
- **취향 매칭**: 70% 이상 유사도 사용자 매칭 성공률 80%
- **소셜 기능 사용률**: 테이스팅 기록의 40%가 커뮤니티 기능 활용

### Phase 3 목표
- **구독 전환율**: 무료 사용자의 15%가 유료 구독 전환
- **Lab Pro 활성화**: 구독자의 85% 이상이 주간 1회 이상 Lab Pro 사용
- **수익 목표**: MRR $10,000 달성

---

## 🚀 즉시 시작 가능한 작업

### 오늘부터 시작
1. **홈 화면 개선**: "나의 커피 여정" 섹션 추가
2. **개인 통계 강화**: 취향 패턴 기본 분석 구현
3. **문서 업데이트**: 모든 기존 문서에 새로운 비전 반영

### 이번 주 내 완료
1. **데이터 모델 확장**: 개인 취향 관련 테이블 추가
2. **기본 UI 컴포넌트**: PersonalTasteDashboard 구현
3. **분석 알고리즘**: 기본 선호도 패턴 인식 로직

### 2주 내 목표
1. **플레이버 휠 게임**: 첫 번째 미니게임 완성
2. **성장 추적**: 개인 발전 시각화 대시보드
3. **베타 테스트**: Personal Taste 기능 내부 테스트

---

이 계획으로 현재 MVP를 점진적으로 "Personal Taste, Shared Journey" 플랫폼으로 진화시킬 수 있습니다. 어떤 부분부터 시작하고 싶으신가요?