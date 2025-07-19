# MVP v0.4.0 "Personal Taste Discovery" - 상세 개발 계획
## 개인 취향 발견에 특화된 첫 번째 출시 버전

---

## 🎯 핵심 목표
**"당신만의 커피 취향을 발견하세요"**
- 막연한 "맛있다"에서 구체적인 향미 표현으로
- 개인 취향 패턴 분석과 시각화
- 성장하는 미각을 실시간으로 추적

---

## 📅 8주 개발 일정

### Week 1-2: 기반 구축 및 데이터 확장
### Week 3-4: UI/UX 개선 및 분석 엔진
### Week 5-6: 게임화 요소 및 학습 도구
### Week 7-8: 통합 테스트 및 출시 준비

---

## 📋 Week 1-2: 기반 구축 (Foundation)

### 🗄️ 데이터베이스 스키마 확장

#### 새로운 테이블 추가
```sql
-- 개인 취향 프로필
CREATE TABLE user_taste_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  -- 향미 선호도 벡터 (86개 플레이버 휠 기반)
  flavor_preferences JSONB DEFAULT '{}',
  
  -- 기본 5미 선호도 (0-10 스케일)
  sweetness_preference FLOAT DEFAULT 5.0,
  acidity_preference FLOAT DEFAULT 5.0,
  bitterness_preference FLOAT DEFAULT 5.0,
  body_preference FLOAT DEFAULT 5.0,
  balance_preference FLOAT DEFAULT 5.0,
  
  -- 개인 통계
  total_tastings INTEGER DEFAULT 0,
  unique_flavors_tried INTEGER DEFAULT 0,
  vocabulary_level INTEGER DEFAULT 1, -- 1-10 레벨
  taste_discovery_rate FLOAT DEFAULT 0.0, -- 0-100%
  
  -- 메타데이터
  last_analysis_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 향미 학습 진행도
CREATE TABLE flavor_learning_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  -- 향미 정보
  flavor_category VARCHAR(50), -- 'fruity', 'nutty', 'floral' 등
  flavor_subcategory VARCHAR(50), -- 'citrus', 'berry', 'stone_fruit' 등
  specific_flavor VARCHAR(50), -- 'lemon', 'orange', 'grapefruit' 등
  
  -- 학습 통계
  exposure_count INTEGER DEFAULT 0, -- 노출 횟수
  identification_count INTEGER DEFAULT 0, -- 식별 성공 횟수
  accuracy_rate FLOAT DEFAULT 0.0, -- 정확도 (0-1)
  confidence_level INTEGER DEFAULT 1, -- 자신감 레벨 (1-5)
  
  -- 학습 데이터
  first_encountered_at TIMESTAMP,
  last_practiced_at TIMESTAMP,
  mastery_achieved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 개인 성취도
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  achievement_type VARCHAR(50), -- 'first_tasting', 'flavor_explorer', 'taste_developer'
  achievement_level INTEGER DEFAULT 1, -- 1-5 레벨
  achievement_data JSONB, -- 추가 데이터 (점수, 날짜 등)
  
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress FLOAT DEFAULT 1.0 -- 달성도 (0-1)
);

-- 일일 통계
CREATE TABLE daily_taste_stats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  stat_date DATE,
  tastings_count INTEGER DEFAULT 0,
  new_flavors_discovered INTEGER DEFAULT 0,
  vocabulary_words_used INTEGER DEFAULT 0,
  taste_accuracy_score FLOAT DEFAULT 0.0,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 기존 테이블 확장
```sql
-- tasting_records 테이블에 개인 분석 데이터 추가
ALTER TABLE tasting_records ADD COLUMN personal_insights JSONB DEFAULT '{}';
ALTER TABLE tasting_records ADD COLUMN vocabulary_used TEXT[] DEFAULT '{}';
ALTER TABLE tasting_records ADD COLUMN difficulty_level INTEGER DEFAULT 1; -- 1-5
ALTER TABLE tasting_records ADD COLUMN learning_points INTEGER DEFAULT 0;
ALTER TABLE tasting_records ADD COLUMN taste_confidence FLOAT DEFAULT 0.5; -- 0-1

-- users 테이블에 개인 설정 추가
ALTER TABLE users ADD COLUMN taste_profile_id UUID REFERENCES user_taste_profiles(id);
ALTER TABLE users ADD COLUMN learning_preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN notification_settings JSONB DEFAULT '{}';
```

### 🏗️ 핵심 서비스 구현

#### 1. PersonalTasteAnalysisService.ts
```typescript
export class PersonalTasteAnalysisService {
  // 개인 취향 패턴 분석
  async analyzePersonalTastePattern(userId: string): Promise<TastePattern> {
    // 지난 테이스팅 기록 분석
    // 향미 선호도 계산
    // 성장 추이 분석
    // 취향 발견률 계산
  }
  
  // 개인 추천 생성
  async generatePersonalRecommendations(userId: string): Promise<CoffeeRecommendation[]> {
    // 선호 패턴 기반 추천
    // 새로운 탐험 영역 제안
    // 난이도별 추천
  }
  
  // 성장 추적
  async trackTasteGrowth(userId: string): Promise<GrowthMetrics> {
    // 어휘 확장 추적
    // 정확도 향상 추적
    // 탐험 범위 확장 추적
  }
}
```

#### 2. FlavorLearningEngine.ts
```typescript
export class FlavorLearningEngine {
  // 향미 학습 진행도 업데이트
  async updateFlavorProgress(
    userId: string, 
    flavorData: FlavorIdentification
  ): Promise<void> {
    // 노출 횟수 증가
    // 정확도 계산
    // 자신감 레벨 조정
    // 마스터리 달성 확인
  }
  
  // 개인 맞춤 향미 퀴즈 생성
  async generatePersonalizedQuiz(userId: string): Promise<FlavorQuiz> {
    // 학습 진행도 기반 문제 선별
    // 난이도 조절
    // 반복 학습 필요 영역 우선
  }
  
  // 향미 마스터리 평가
  async evaluateFlavorMastery(
    userId: string, 
    flavorCategory: string
  ): Promise<MasteryLevel> {
    // 노출 대비 정확도
    // 일관성 평가
    // 자신감 평가
  }
}
```

#### 3. AchievementSystem.ts
```typescript
export class AchievementSystem {
  // 성취도 확인 및 업데이트
  async checkAndUpdateAchievements(
    userId: string, 
    action: UserAction
  ): Promise<Achievement[]> {
    // 새로운 성취도 확인
    // 진행중인 성취도 업데이트
    // 알림 생성
  }
  
  // 개인 진행률 계산
  async calculateProgress(
    userId: string, 
    achievementType: string
  ): Promise<ProgressData> {
    // 현재 진행률
    // 다음 목표까지 남은 양
    // 예상 달성 시간
  }
}
```

---

## 📋 Week 3-4: UI/UX 개선 (User Experience)

### 🏠 홈 화면 대대적 개선

#### 새로운 "나의 커피 여정" 섹션
```typescript
// HomeScreen.tsx 주요 섹션들

1. **개인 여정 헤더**
   - 현재 레벨 표시 (예: "Flavor Explorer Lv.3")
   - 다음 레벨까지 진행률 바
   - 이번 주 활동 요약

2. **취향 발견 현황**
   - 취향 발견률 원형 차트 (예: 67%)
   - "새로 발견한 향미" 하이라이트
   - "가장 좋아하는 향미 Top 3"

3. **이번 주 성장**
   - 테이스팅 횟수 vs 목표
   - 새로운 어휘 사용 개수
   - 정확도 향상 지표

4. **맞춤 추천**
   - "다음에 시도해볼 커피"
   - "오늘의 향미 챌린지"
   - "내 취향과 90% 일치하는 커피"

5. **빠른 액션**
   - "새 테이스팅 시작" (기존)
   - "향미 퀴즈 도전"
   - "내 취향 분석 보기"
```

#### PersonalTasteDashboard.tsx (새 화면)
```typescript
export const PersonalTasteDashboard = () => {
  return (
    <ScrollView>
      {/* 개인 프로필 카드 */}
      <TasteProfileCard 
        level={userLevel}
        progress={progressData}
        tasteType="Fruity Explorer" // 개인 타입
      />
      
      {/* 취향 레이더 차트 */}
      <FlavorRadarChart 
        preferences={flavorPreferences}
        interactive={true}
      />
      
      {/* 성장 타임라인 */}
      <GrowthTimeline 
        milestones={growthMilestones}
        currentWeek={currentWeek}
      />
      
      {/* 향미 마스터리 맵 */}
      <FlavorMasteryMap 
        categories={flavorCategories}
        masteryLevels={masteryData}
        onCategoryTap={onFlavorCategorySelect}
      />
      
      {/* 개인 통계 */}
      <PersonalStatsGrid 
        stats={personalStats}
        comparisonData={benchmarkData}
      />
    </ScrollView>
  );
};
```

### 🎨 새로운 UI 컴포넌트

#### 1. TasteProfileCard.tsx
```typescript
interface TasteProfileCardProps {
  level: number;
  progress: ProgressData;
  tasteType: string;
  onLevelTap?: () => void;
}

// 개인 레벨과 타입을 보여주는 카드
// 진행률 바와 다음 목표 표시
// 탭하면 상세 레벨 정보로 이동
```

#### 2. FlavorRadarChart.tsx
```typescript
interface FlavorRadarChartProps {
  preferences: FlavorPreferences;
  interactive?: boolean;
  showComparison?: boolean;
  comparisonData?: FlavorPreferences;
}

// 6각형 또는 8각형 레이더 차트
// 주요 향미 카테고리별 선호도
// 인터랙티브 툴팁으로 상세 정보
// 평균 대비 비교 옵션
```

#### 3. GrowthTimeline.tsx
```typescript
interface GrowthTimelineProps {
  milestones: GrowthMilestone[];
  currentWeek: number;
  onMilestoneTap?: (milestone: GrowthMilestone) => void;
}

// 주간별 성장 타임라인
// 주요 발견과 성취 표시
// 미래 목표 미리보기
// 애니메이션으로 성장 과정 시각화
```

#### 4. FlavorMasteryMap.tsx
```typescript
interface FlavorMasteryMapProps {
  categories: FlavorCategory[];
  masteryLevels: MasteryLevel[];
  layout?: 'grid' | 'wheel' | 'tree';
  onCategorySelect?: (category: string) => void;
}

// 플레이버 휠 기반 마스터리 맵
// 카테고리별 숙련도 색상 코딩
// 탭하면 해당 카테고리 상세로
// 애니메이션으로 진행률 표시
```

### 📱 네비게이션 개선

#### 탭 바 아이콘 업데이트
```typescript
// 새로운 아이콘과 라벨
Home: "여정" (Journey) - 🗺️
Journal: "기록" (Records) - 📖  
Stats: "성장" (Growth) - 📈
Profile: "프로필" (Profile) - 👤

// 홈 탭에 알림 배지 추가
- 새로운 성취도 달성시
- 맞춤 추천 업데이트시
- 주간 리포트 준비시
```

---

## 📋 Week 5-6: 게임화 및 학습 도구 (Gamification)

### 🎮 향미 학습 미니게임

#### 1. FlavorWheelQuizScreen.tsx
```typescript
// "이 향미를 찾아보세요" 게임
export const FlavorWheelQuizScreen = () => {
  const [currentQuestion, setCurrentQuestion] = useState<FlavorQuestion>();
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  
  return (
    <View style={styles.container}>
      {/* 게임 헤더 */}
      <QuizHeader 
        score={score}
        streak={streak}
        timeLeft={timeLeft}
        level={difficulty}
      />
      
      {/* 향미 설명 카드 */}
      <FlavorDescriptionCard 
        description={currentQuestion.description}
        hints={currentQuestion.hints}
        difficulty={currentQuestion.difficulty}
      />
      
      {/* 선택지 (플레이버 휠 스타일) */}
      <FlavorWheelSelector 
        options={currentQuestion.options}
        onSelect={handleFlavorSelect}
        layout="wheel" // 또는 "grid"
      />
      
      {/* 진행률 및 보상 */}
      <QuizProgress 
        currentQuestion={questionIndex}
        totalQuestions={totalQuestions}
        earnedPoints={earnedPoints}
      />
    </View>
  );
};
```

#### 2. TastingChallengeScreen.tsx
```typescript
// 일일/주간 테이스팅 챌린지
export const TastingChallengeScreen = () => {
  return (
    <ScrollView>
      {/* 오늘의 챌린지 */}
      <DailyChallengeCard 
        challenge={todayChallenge}
        progress={challengeProgress}
        reward={challengeReward}
        onStart={startChallenge}
      />
      
      {/* 주간 목표 */}
      <WeeklyGoalsSection 
        goals={weeklyGoals}
        onGoalSelect={selectGoal}
      />
      
      {/* 성취도 트래커 */}
      <AchievementTracker 
        achievements={userAchievements}
        onAchievementTap={showAchievementDetail}
      />
      
      {/* 리더보드 (개인 순위) */}
      <PersonalLeaderboard 
        userRank={userRank}
        topPerformers={topPerformers}
        category="taste_accuracy"
      />
    </ScrollView>
  );
};
```

### 🏆 성취도 시스템

#### Achievement 타입 정의
```typescript
interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  progress: number; // 0-1
  unlockedAt?: Date;
}

// 성취도 카테고리
enum AchievementType {
  // 기본 진행
  FIRST_STEPS = 'first_steps', // 첫 테이스팅, 첫 주간 등
  CONSISTENCY = 'consistency', // 연속 기록, 정기적 사용
  
  // 향미 탐험
  FLAVOR_EXPLORER = 'flavor_explorer', // 새 향미 발견
  TASTE_ACCURACY = 'taste_accuracy', // 정확도 관련
  VOCABULARY = 'vocabulary', // 어휘 확장
  
  // 개인 성장
  LEVEL_UP = 'level_up', // 레벨 업 관련
  MASTERY = 'mastery', // 특정 영역 마스터
  PERSONAL_BEST = 'personal_best', // 개인 기록
  
  // 특별 성취
  SEASONAL = 'seasonal', // 시즌 이벤트
  HIDDEN = 'hidden', // 숨겨진 성취도
  COLLECTOR = 'collector', // 수집 관련
}
```

#### 구체적인 성취도 예시
```typescript
const ACHIEVEMENTS: Achievement[] = [
  // 첫 걸음 시리즈
  {
    id: 'first_tasting',
    type: AchievementType.FIRST_STEPS,
    title: '첫 한 모금',
    description: '첫 번째 커피 테이스팅을 완료하세요',
    icon: '☕',
    rarity: 'common',
    requirements: [{ type: 'tasting_count', value: 1 }],
    rewards: [{ type: 'points', value: 100 }]
  },
  
  // 향미 탐험 시리즈
  {
    id: 'flavor_explorer_bronze',
    type: AchievementType.FLAVOR_EXPLORER,
    title: '향미 탐험가 브론즈',
    description: '10가지 서로 다른 향미를 발견하세요',
    icon: '🗺️',
    rarity: 'common',
    requirements: [{ type: 'unique_flavors', value: 10 }],
    rewards: [{ type: 'badge', value: 'flavor_explorer_bronze' }]
  },
  
  // 정확도 시리즈
  {
    id: 'taste_master',
    type: AchievementType.TASTE_ACCURACY,
    title: '미각 마스터',
    description: '향미 퀴즈에서 90% 이상 정확도 달성',
    icon: '🎯',
    rarity: 'epic',
    requirements: [{ type: 'quiz_accuracy', value: 0.9 }],
    rewards: [{ type: 'title', value: 'Taste Master' }]
  },
  
  // 숨겨진 성취
  {
    id: 'early_bird',
    type: AchievementType.HIDDEN,
    title: '얼리버드',
    description: '오전 7시 이전에 커피 테이스팅',
    icon: '🌅',
    rarity: 'rare',
    requirements: [{ type: 'tasting_time', value: '07:00' }],
    rewards: [{ type: 'points', value: 500 }]
  }
];
```

### 📚 학습 도구

#### 1. VocabularyBuilderScreen.tsx
```typescript
// 개인 맞춤 어휘 확장 도구
export const VocabularyBuilderScreen = () => {
  return (
    <View>
      {/* 개인 어휘 레벨 */}
      <VocabularyLevelCard 
        currentLevel={vocabularyLevel}
        wordsKnown={wordsKnown}
        nextLevelRequirement={nextLevelWords}
      />
      
      {/* 오늘의 새 단어 */}
      <DailyWordCard 
        word={dailyWord}
        definition={wordDefinition}
        examples={wordExamples}
        onPractice={practiceWord}
      />
      
      {/* 복습 필요한 단어들 */}
      <ReviewWordsSection 
        words={reviewWords}
        onWordSelect={startWordReview}
      />
      
      {/* 카테고리별 어휘 */}
      <CategoryVocabulary 
        categories={flavorCategories}
        onCategorySelect={exploreCategory}
      />
    </View>
  );
};
```

#### 2. ProgressTrackingScreen.tsx
```typescript
// 개인 성장 추적 전용 화면
export const ProgressTrackingScreen = () => {
  return (
    <ScrollView>
      {/* 전체 성장 개요 */}
      <GrowthOverviewCard 
        startDate={userJoinDate}
        totalDays={totalActiveDays}
        overallProgress={overallProgress}
      />
      
      {/* 주간별 성장 차트 */}
      <WeeklyGrowthChart 
        data={weeklyProgressData}
        metrics={['accuracy', 'vocabulary', 'diversity']}
      />
      
      {/* 향미별 마스터리 진행률 */}
      <FlavorMasteryGrid 
        categories={flavorCategories}
        masteryLevels={masteryData}
        onCategoryTap={showCategoryDetail}
      />
      
      {/* 개인 기록 */}
      <PersonalRecordsSection 
        records={personalRecords}
        onRecordTap={showRecordHistory}
      />
    </ScrollView>
  );
};
```

---

## 📋 Week 7-8: 통합 및 출시 준비 (Integration & Launch)

### 🔧 시스템 통합

#### 1. 기존 테이스팅 플로우 개선
```typescript
// 기존 플로우에 개인 학습 요소 추가

// CoffeeInfoScreen.tsx
- OCR 결과를 개인 취향과 비교
- "이 커피는 당신 취향과 85% 일치" 표시
- 예상 선호도 미리 표시

// FlavorSelectionScreens.tsx
- 개인 학습 진행도에 따른 난이도 조절
- 자주 선택하는 향미는 상단에 표시
- 새로운 향미에는 "새로운 발견!" 뱃지

// SensoryScreen.tsx
- 개인 평균과 비교하여 편차 표시
- "평소보다 산미를 높게 평가했네요" 피드백
- 일관성 점수 실시간 계산

// ResultScreen.tsx
- 개인 취향 분석 결과 추가
- "새로 발견한 향미" 하이라이트
- 다음 추천 커피 제안
- 학습 포인트 획득 애니메이션
```

#### 2. 데이터 흐름 최적화
```typescript
// 실시간 분석 파이프라인
TastingRecord 저장 
→ PersonalTasteAnalysisService.updateProfile()
→ FlavorLearningEngine.processLearning()
→ AchievementSystem.checkAchievements()
→ UI 업데이트 (애니메이션 포함)

// 백그라운드 배치 작업
- 일일 통계 계산 (자정)
- 주간 리포트 생성 (일요일)
- 개인 추천 업데이트 (매일 오전)
- 성취도 진행률 재계산 (실시간)
```

### 📊 분석 및 추적

#### Analytics 이벤트 추가
```typescript
// 개인 취향 관련 이벤트
Analytics.track('personal_taste_discovered', {
  flavor_category: 'fruity',
  confidence_level: 0.8,
  user_level: 3,
  discovery_method: 'guided_tasting'
});

Analytics.track('achievement_unlocked', {
  achievement_id: 'flavor_explorer_bronze',
  achievement_type: 'flavor_explorer',
  user_level: 3,
  days_since_join: 14
});

Analytics.track('quiz_completed', {
  quiz_type: 'flavor_wheel',
  score: 0.85,
  time_taken: 120,
  difficulty_level: 2
});

// 사용자 행동 패턴
Analytics.track('dashboard_viewed', {
  section: 'personal_growth',
  time_spent: 45,
  interactions: 3
});
```

#### 성공 지표 측정 준비
```typescript
// KPI 대시보드용 메트릭
interface MVP_v0_4_0_Metrics {
  // 핵심 지표
  daily_active_users: number;
  taste_discovery_rate: number; // 목표: 80%
  session_duration_avg: number; // 목표: 8분
  
  // 참여도 지표
  quiz_completion_rate: number;
  achievement_unlock_rate: number;
  daily_challenge_participation: number;
  
  // 학습 효과 지표
  vocabulary_growth_rate: number;
  taste_accuracy_improvement: number;
  flavor_diversity_expansion: number;
  
  // 리텐션 지표
  day_1_retention: number;
  day_7_retention: number; // 목표: 40%
  day_30_retention: number; // 목표: 20%
}
```

### 🚀 출시 준비

#### 1. 베타 테스트 계획
```
Week 7: 내부 테스트
- 팀 내부 테스트 (개발자, 디자이너)
- 기본 기능 동작 확인
- 크리티컬 버그 수정

Week 8: 클로즈드 베타
- 친구/지인 20명 초대
- 실제 사용 시나리오 테스트
- 피드백 수집 및 개선

출시 직전: 오픈 베타
- 커피 커뮤니티 50명 초대
- 최종 사용성 테스트
- 성능 최적화
```

#### 2. 온보딩 플로우 개선
```typescript
// 새로운 사용자를 위한 개선된 온보딩

1. 환영 화면
   - "Personal Taste Discovery" 컨셉 소개
   - 3-4개 스크린으로 핵심 가치 전달

2. 첫 테이스팅 가이드
   - 단계별 상세 안내
   - 각 단계의 의미와 중요성 설명
   - 실시간 도움말 제공

3. 개인 설정
   - 커피 경험 레벨 선택
   - 학습 목표 설정
   - 알림 선호도 설정

4. 첫 번째 분석 결과
   - 첫 테이스팅 기반 초기 프로필 생성
   - "앞으로의 여정" 미리보기
   - 다음 할 일 안내
```

#### 3. 마케팅 준비
```
출시 메시지:
"당신만의 커피 취향을 발견하는 여정이 시작됩니다"

타겟 채널:
- 인스타그램: #커피취향테스트 캠페인
- 커피 커뮤니티: 베타 테스터 모집
- 바리스타 네트워크: 전문가 추천

핵심 기능 어필:
- 개인 맞춤 분석
- 게임화된 학습
- 성장하는 미각
- 데이터 기반 추천
```

---

## ✅ 완료 체크리스트

### Week 1-2 완료 기준
- [ ] 데이터베이스 스키마 확장 완료
- [ ] 핵심 서비스 3개 구현 완료
- [ ] 기존 테이스팅 플로우 연동 테스트
- [ ] 기본 분석 로직 동작 확인

### Week 3-4 완료 기준
- [ ] 홈 화면 "나의 커피 여정" 섹션 완성
- [ ] PersonalTasteDashboard 화면 완성
- [ ] 주요 UI 컴포넌트 4개 구현
- [ ] 네비게이션 개선 완료

### Week 5-6 완료 기준
- [ ] 향미 퀴즈 게임 완성
- [ ] 성취도 시스템 구현 완료
- [ ] 일일/주간 챌린지 기능
- [ ] 개인 학습 도구 완성

### Week 7-8 완료 기준
- [ ] 전체 시스템 통합 완료
- [ ] 베타 테스트 완료
- [ ] 성능 최적화 완료
- [ ] 출시 준비 (스토어 등록, 마케팅)

---

## 🎯 성공 지표 목표

| 지표 | 현재 (v0.3.0) | 목표 (v0.4.0) | 측정 방법 |
|------|---------------|---------------|-----------|
| **DAU** | ~50명 | 500명 | Analytics |
| **세션 시간** | 3분 | 8분 | 사용자 행동 추적 |
| **취향 발견률** | - | 80% | 첫 달 내 선호 패턴 3개 이상 |
| **7일 리텐션** | 20% | 40% | 코호트 분석 |
| **30일 리텐션** | 5% | 20% | 코호트 분석 |
| **퀴즈 완성률** | - | 70% | 게임 참여 통계 |

이 세분화된 계획으로 MVP v0.4.0을 체계적으로 개발할 수 있습니다. 어떤 주차부터 시작하시겠습니까?