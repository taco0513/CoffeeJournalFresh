# Coffee Journal AI Strategy Roadmap (Mode-Based Development)

## Executive Summary
Coffee Journal은 단계적 AI 도입을 통해 정직하고 지속가능한 개인화 서비스를 제공합니다. MVP에서는 🍃 Cafe Mode에 집중하여 AI 용어를 제거하고 데이터 기반 통계에 집중하며, Phase 2에서 🔬 Lab Mode와 함께 진정한 AI 기능을 도입합니다.

## 🎯 핵심 원칙

1. **정직함**: AI라고 부를 수 있을 때까지 기다리기
2. **가치 중심**: 기술보다 사용자 가치 우선
3. **점진적 발전**: 데이터와 함께 성장
4. **투명성**: 어떻게 작동하는지 설명

## 📊 3단계 AI 전략

### Phase 1: Foundation 🍃 Cafe Mode (MVP ~ 6개월)
**목표**: 데이터 수집 기반 구축 및 기본 통계 제공 (Cafe Mode 집중)

#### 주요 기능
```typescript
interface BasicAnalytics {
  favoriteRoaster: string;              // 가장 많이 방문한 로스터
  preferredFlavorProfile: string[];     // 선호 향미 프로필
  averageCuppingScore: number;          // 평균 매칭 점수
  tastingFrequency: number;             // 주간 테이스팅 빈도
  qualityScore: number;                 // 기록 품질 점수
}
```

#### 구현 내용
- ✅ "AI" 용어 완전 제거
- ✅ "개인 통계", "취향 분석" 용어 사용
- ✅ 데이터 기반 인사이트 제공
- ✅ 투명한 통계 표시

#### 사용자 커뮤니케이션
```
"현재 234개의 테이스팅 데이터 기반"
"더 많은 기록이 쌓이면 더 정확해져요"
```

### Phase 2: Smart Patterns 🔬 Lab Mode (6개월 ~ 1년)  
**목표**: 패턴 인식 및 기본 추천 시스템 + Lab Mode 전문가 기능 도입

#### 필요 조건
- 사용자 1,000명 이상
- 테이스팅 기록 10,000개 이상
- 다양한 커피/로스터 데이터

#### 주요 기능
```typescript
interface PatternRecognition {
  // Cafe Mode 고도화
  tasteEvolution: TrendAnalysis;        // 취향 변화 추세
  seasonalPreferences: SeasonalPattern; // 계절별 선호도
  similarUserGroups: ClusteringResult;  // 비슷한 취향 그룹
  basicRecommendations: Coffee[];       // 기본 추천
  
  // Lab Mode 전문가 기능
  blindTastingMode: BlindTastingConfig; // 블라인드 테이스팅
  extractionLab: ExtractionAnalysis;    // 추출 실험실
  professionalAnalysis: AdvancedMetrics; // 전문가급 분석
}
```

#### 기술 스택
- 간단한 클러스터링 (K-means)
- 시계열 분석
- 협업 필터링 기초
- A/B 테스트 프레임워크

### Phase 3: True AI (1년 이후)
**목표**: 진정한 AI 기반 개인화

#### 필요 조건
- 사용자 10,000명 이상
- 테이스팅 기록 100,000개 이상
- 충분한 사용자 피드백 데이터

#### 주요 기능
```typescript
interface AIPersonalization {
  personalizedRecommendations: MLRecommendation[];  // ML 기반 추천
  flavorPrediction: NeuralNetworkResult;           // 향미 예측
  communityInsights: CollaborativeFiltering;       // 커뮤니티 인사이트
  adaptiveLearning: ReinforcementLearning;        // 적응형 학습
}
```

#### 기술 스택
- TensorFlow Lite (모바일 최적화)
- 협업 필터링 고도화
- 자연어 처리 (테이스팅 노트)
- 강화학습 (사용자 피드백 기반)

## 🛠️ 구현 로드맵

### 즉시 실행 (MVP)
- [x] LiteAI Coach 제거
- [x] 모든 "AI" 용어를 "스마트", "데이터 기반"으로 변경
- [ ] 기본 통계 대시보드 구현
- [ ] 데이터 수집 인프라 강화

### 3개월 내
- [ ] 사용자 행동 추적 시스템
- [ ] A/B 테스트 프레임워크
- [ ] 기본 패턴 분석 프로토타입

### 6개월 내
- [ ] 사용자 1,000명 달성
- [ ] 클러스터링 알고리즘 구현
- [ ] 베타 추천 시스템 출시

### 1년 후
- [ ] ML 모델 훈련 파이프라인
- [ ] 실시간 추천 엔진
- [ ] AI 기능 정식 출시

## 📈 성공 지표

### Phase 1
- 일일 활성 사용자 (DAU): 100명
- 평균 테이스팅/사용자: 10개
- 데이터 품질: 80% 완성도

### Phase 2
- 추천 클릭률: 15%
- 사용자 만족도: 4.0/5.0
- 기능 사용률: 60%

### Phase 3
- AI 추천 정확도: 75%
- 사용자 리텐션: 40% (3개월)
- NPS 점수: 50+

## 🚀 기술 준비사항

### 데이터 인프라
```typescript
interface DataInfrastructure {
  collection: {
    explicit: UserPreferences[];      // 명시적 선호도
    implicit: UserBehavior[];         // 암묵적 신호
    contextual: EnvironmentData[];    // 상황 정보
  };
  storage: {
    primary: "Supabase";
    analytics: "Google Analytics";
    ml_data: "BigQuery";
  };
  privacy: {
    anonymization: boolean;
    consent: GDPR_Compliant;
    retention: "2 years";
  };
}
```

### 모델 아키텍처 (Phase 3)
```python
# 향미 예측 모델 예시
class FlavorPredictionModel:
    def __init__(self):
        self.embedding_dim = 64
        self.num_flavors = 86  # SCA Flavor Wheel
        
    def build_model(self):
        # User embedding
        user_input = Input(shape=(1,))
        user_embedding = Embedding(num_users, self.embedding_dim)(user_input)
        
        # Coffee embedding
        coffee_input = Input(shape=(num_features,))
        coffee_dense = Dense(self.embedding_dim, activation='relu')(coffee_input)
        
        # Combine and predict
        combined = Concatenate()([user_embedding, coffee_dense])
        hidden = Dense(128, activation='relu')(combined)
        output = Dense(self.num_flavors, activation='sigmoid')(hidden)
        
        return Model([user_input, coffee_input], output)
```

## 💡 주요 고려사항

### 1. 데이터 품질
- 모든 테이스팅에 최소 3개 이상 향미 선택 권장
- 감각 평가 (body, acidity 등) 필수화
- 이미지 업로드 장려 (향후 비전 AI용)

### 2. 사용자 교육
- 왜 데이터가 필요한지 설명
- 개인정보 보호 정책 명확화
- 진행 상황 투명하게 공유

### 3. 기술 부채 관리
- 서비스 아키텍처 확장 가능하게 설계
- 테스트 커버리지 80% 이상 유지
- 문서화 철저히

## 🎯 결론

Coffee Journal은 **정직하고 점진적인 AI 도입**을 통해 사용자에게 진정한 가치를 제공합니다. 

- **단기**: 데이터 수집과 기본 통계
- **중기**: 패턴 인식과 스마트 기능
- **장기**: 진정한 AI 기반 개인화

이를 통해 "커피를 통한 개인의 취향 발견과 성장"이라는 핵심 가치를 실현합니다.