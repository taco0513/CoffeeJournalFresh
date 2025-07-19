# MVP v0.4.0 "Personal Taste Discovery" with Lite AI Coach - 상세 개발 계획
## 개인 취향 발견 + AI 코치 지원 버전

---

## 🎯 핵심 목표
**"당신만의 커피 취향을 발견하세요 - AI 코치와 함께"**
- 막연한 "맛있다"에서 구체적인 향미 표현으로
- 개인 취향 패턴 분석과 시각화
- 성장하는 미각을 실시간으로 추적
- 🆕 **AI 코치가 제공하는 맞춤형 가이드와 피드백**

---

## 🤖 Lite AI Coach 기능

### 핵심 특징
- **맞춤형 가이드**: 개인 데이터 기반 실시간 조언
- **스마트 피드백**: 테이스팅 후 상세 분석 제공
- **학습 지원**: 퀴즈 힌트, 향미 설명, 연습 제안
- **일일 인사이트**: 개인화된 팁과 동기부여
- **비침투적 UX**: 자연스럽게 녹아든 코칭

### 통합 포인트
1. **홈 화면**: 일일 인사이트 배너
2. **테이스팅 전**: 커피별 맞춤 팁
3. **향미 선택 중**: 컨텍스트 힌트
4. **테이스팅 후**: 상세 피드백 모달
5. **학습 게임**: 프로그레시브 힌트

---

## 📅 8주 개발 일정 (AI Coach 포함)

### Week 1-2: 기반 구축 및 데이터 확장 ✅
- 데이터베이스 스키마 (완료)
- PersonalTasteAnalysisService (완료)
- FlavorLearningEngine (완료)
- AchievementSystem (완료)
- 🆕 **LiteAICoachService (완료)**

### Week 3-4: UI/UX 개선 및 분석 엔진
- 홈 화면 "나의 커피 여정" + **AI 인사이트**
- PersonalTasteDashboard 화면
- 향미 시각화 컴포넌트
- 🆕 **Coach UI 컴포넌트 통합**

### Week 5-6: 게임화 요소 및 학습 도구
- 향미 퀴즈 게임 + **AI 힌트 시스템**
- 성취도 시스템 UI
- 학습 도구 + **AI 추천 경로**

### Week 7-8: 통합 테스트 및 출시 준비
- 전체 플로우 테스트
- AI Coach 효과성 측정
- 성능 최적화
- 베타 테스트

---

## 📋 Week 1-2: 기반 구축 (Foundation) - 완료 ✅

### 🗄️ 데이터베이스 스키마 확장
[기존 내용 유지]

### 🏗️ 핵심 서비스 구현

#### 4. LiteAICoachService.ts (신규)
```typescript
export class LiteAICoachService {
  // 테이스팅 가이드 생성
  async getTastingGuidance(userId: string, coffeeInfo: CoffeeInfo): Promise<TastingGuidance>
  
  // 테이스팅 후 피드백
  async provideFeedback(userId: string, tastingData: TastingData): Promise<CoachFeedback>
  
  // 일일 인사이트
  async getDailyInsight(userId: string): Promise<DailyInsight>
  
  // 학습 경로 생성
  async generateLearningPath(userId: string): Promise<LearningPath>
  
  // 퀴즈 힌트
  async getQuizHint(userId: string, context: QuizContext): Promise<string>
}
```

---

## 📋 Week 3-4: UI/UX 개선 (User Experience) + AI Coach

### 🏠 홈 화면 대대적 개선

#### 새로운 "나의 커피 여정" 섹션 with AI Coach
```typescript
// HomeScreen.tsx 주요 섹션들

1. **AI 코치 인사이트 배너** (최상단)
   - 일일 개인화 메시지
   - 제안 액션 버튼
   - 관련 성취도 힌트

2. **개인 여정 헤더**
   - 현재 레벨 표시
   - AI 예측 다음 마일스톤
   - 이번 주 활동 요약

3. **취향 발견 현황**
   - 취향 발견률 원형 차트
   - AI가 추천하는 다음 탐험 영역
   - "가장 좋아하는 향미 Top 3"

4. **AI 맞춤 추천**
   - "오늘의 추천 커피" (AI 선정)
   - "당신을 위한 향미 챌린지"
   - 추천 이유 설명
```

### 🎨 새로운 AI Coach UI 컴포넌트

#### 1. CoachTipCard.tsx ✅
- 우선순위별 색상 구분
- 액션 버튼 포함
- 자동 숨김 옵션
- 애니메이션 효과

#### 2. CoachInsightBanner.tsx ✅
- 홈 화면 상단 배너
- 개인화된 일일 메시지
- 제안 액션 연결
- 성취도 힌트

#### 3. CoachFeedbackModal.tsx ✅
- 테이스팅 후 상세 피드백
- 점수 시각화
- 강점/개선점 분석
- 맞춤형 팁 제공

---

## 📋 Week 5-6: 게임화 및 학습 도구 (Gamification) + AI Support

### 🎮 향미 학습 미니게임 with AI

#### FlavorWheelQuizScreen with AI Hints
```typescript
export const FlavorWheelQuizScreen = () => {
  const [hints, setHints] = useState<string[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  
  const requestHint = async () => {
    const hint = await coachService.getQuizHint(
      userId, 
      question.type, 
      question.category,
      hintLevel + 1
    );
    setHints([...hints, hint]);
    setHintLevel(prev => prev + 1);
  };
  
  return (
    <View>
      {/* 퀴즈 콘텐츠 */}
      
      {/* AI 힌트 섹션 */}
      <AIHintSection 
        hints={hints}
        remainingHints={3 - hintLevel}
        onRequestHint={requestHint}
      />
    </View>
  );
};
```

### 📚 AI 강화 학습 도구

#### PersonalLearningPath.tsx
```typescript
// AI가 생성한 개인 학습 경로
export const PersonalLearningPath = () => {
  const { learningPath } = useLiteAICoach();
  
  return (
    <View>
      <Text>현재 집중 영역: {learningPath.currentFocus}</Text>
      <Text>다음 목표: {learningPath.nextMilestone}</Text>
      <Text>예상 소요 시간: {learningPath.estimatedTime}</Text>
      
      {learningPath.exercises.map(exercise => (
        <ExerciseCard 
          key={exercise.id}
          exercise={exercise}
          onStart={() => startExercise(exercise)}
        />
      ))}
    </View>
  );
};
```

---

## 📋 Week 7-8: 통합 및 출시 준비 (Integration & Launch)

### 🔧 AI Coach 통합 체크리스트

#### 테이스팅 플로우 강화
- [ ] CoffeeInfoScreen에 사전 가이드 추가
- [ ] FlavorSelection에 힌트 시스템 통합
- [ ] ResultScreen에 피드백 모달 연결
- [ ] 학습 포인트 계산 및 표시

#### 데이터 파이프라인
- [ ] 실시간 분석 → AI Coach 연결
- [ ] 피드백 루프 구현
- [ ] 성과 측정 메트릭 설정

### 📊 AI Coach 성공 지표

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| **팁 활용률** | 60% | 표시된 팁 중 액션 실행 비율 |
| **피드백 완독률** | 80% | 피드백 모달 완전 스크롤 비율 |
| **힌트 효과성** | +20% | 힌트 사용 시 정답률 향상 |
| **학습 경로 준수** | 50% | 제안된 연습 실행 비율 |
| **만족도** | 4.5/5 | 사용자 평가 |

---

## ✅ 전체 완료 체크리스트

### Week 1-2 (완료) ✅
- [x] 데이터베이스 스키마 확장
- [x] PersonalTasteAnalysisService 구현
- [x] FlavorLearningEngine 구현
- [x] AchievementSystem 구현
- [x] LiteAICoachService 구현
- [x] Coach UI 컴포넌트 생성

### Week 3-4 (예정)
- [ ] 홈 화면 AI 인사이트 통합
- [ ] PersonalTasteDashboard 완성
- [ ] Coach 컴포넌트 통합
- [ ] 네비게이션 개선

### Week 5-6 (예정)
- [ ] AI 힌트가 있는 향미 퀴즈
- [ ] 성취도 시스템 UI
- [ ] AI 학습 경로 화면
- [ ] 챌린지 시스템

### Week 7-8 (예정)
- [ ] 전체 시스템 통합
- [ ] AI Coach 효과성 테스트
- [ ] 성능 최적화
- [ ] 베타 출시

---

## 🎯 AI Coach로 강화된 사용자 경험

### Before (AI Coach 없음)
```
사용자: "이 커피에서 무슨 맛을 찾아야 할지 모르겠어..."
앱: [단순 플레이버 휠 표시]
결과: 추측으로 선택, 학습 효과 낮음
```

### After (AI Coach 있음)
```
AI Coach: "이 에티오피아 커피는 당신이 좋아하는 과일향이 특징이에요! 
          특히 블루베리를 찾아보세요. 첫 모금에서 단맛과 함께 느껴질 거예요."
          
사용자: [자신감 있게 블루베리 선택]

AI Coach: "정확해요! 👍 당신의 과일향 식별 능력이 15% 향상되었네요.
          다음엔 블루베리와 라즈베리의 차이도 구분해보세요!"
          
결과: 명확한 학습, 동기부여, 지속적 성장
```

---

## 🚀 다음 단계 (Post-MVP)

1. **음성 노트**: 테이스팅 설명을 음성으로 기록
2. **고급 대화형 AI**: 채팅 인터페이스로 질문-답변
3. **그룹 학습**: AI가 진행하는 온라인 커핑 세션
4. **AR 통합**: 카메라로 커피 봉투 스캔 시 즉시 가이드

AI Coach와 함께하는 MVP v0.4.0으로 사용자의 커피 여정이 더욱 풍부하고 의미있게 진화합니다! 🎯☕🤖