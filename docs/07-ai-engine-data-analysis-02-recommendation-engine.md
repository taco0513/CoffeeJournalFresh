# 🤖 개인화 추천 엔진

## 하이브리드 추천 시스템 (HybridRecommender)

협업 필터링, 컨텐츠 기반 필터링, 컨텍스트 인식, 그리고 구독 데이터를 통합한 하이브리드 추천 시스템입니다.

```python
class HybridRecommender:
    """
    협업 필터링 + 컨텐츠 기반 + 컨텍스트 인식 + 구독 데이터 하이브리드 추천
    """
    def __init__(self):
        self.collaborative_filter = CollaborativeFiltering()
        self.content_filter = ContentBasedFiltering()
        self.context_predictor = ContextualBandit()
        self.subscription_analyzer = SubscriptionAnalyzer()  # 신규 추가
        self.explanation_generator = ExplanationGPT()
    
    def recommend(self, user_profile, context, n_recommendations=5):
        # 1. 협업 필터링: 유사한 사용자들의 선호도 기반
        cf_candidates = self.collaborative_filter.get_recommendations(
            user_id=user_profile.id,
            user_taste_dna=user_profile.taste_dna,
            n=50  # 상위 50개 후보
        )
        
        # 2. 컨텐츠 기반: 사용자의 과거 선호도 분석
        cb_scores = self.content_filter.score_items(
            user_history=user_profile.taste_records,
            candidates=cf_candidates,
            weights={
                'flavor_similarity': 0.4,
                'origin_preference': 0.3,
                'roast_level': 0.2,
                'processing_method': 0.1
            }
        )
        
        # 3. 구독 데이터 분석 (신규 추가)
        subscription_insights = self.subscription_analyzer.analyze(
            user_id=user_profile.id,
            subscription_history=user_profile.subscription_history,
            feedback_ratings=user_profile.subscription_ratings
        )
        
        # 구독 패턴 기반 스코어 조정
        subscription_adjusted_scores = self.adjust_scores_by_subscription(
            base_scores=cb_scores,
            subscription_insights=subscription_insights
        )
        
        # 4. 컨텍스트 인식: 현재 상황 고려
        context_scores = self.context_predictor.adjust_scores(
            base_scores=subscription_adjusted_scores,
            context={
                'time_of_day': context.time,
                'weather': context.weather,
                'previous_coffee': context.last_coffee,
                'mood': context.user_mood,
                'subscription_type': context.current_subscription  # 신규 추가
            }
        )
        
        # 5. 앙상블 및 다양성 보장
        final_recommendations = self.ensemble_and_diversify(
            cf_scores=cf_candidates,
            cb_scores=cb_scores,
            context_scores=context_scores,
            subscription_scores=subscription_adjusted_scores,
            diversity_weight=0.2
        )
        
        # 6. 설명 생성 (구독 컨텍스트 포함)
        explanations = self.explanation_generator.generate(
            recommendations=final_recommendations,
            user_profile=user_profile,
            subscription_context=subscription_insights,
            reasoning_path=self.get_reasoning_path()
        )
        
        return [
            {
                'coffee': rec.coffee,
                'score': rec.score,
                'explanation': explanations[rec.id],
                'expected_experience': self.predict_experience(
                    user_profile, rec.coffee
                ),
                'confidence': rec.confidence,
                'subscription_match': self.check_subscription_compatibility(
                    rec.coffee, user_profile.current_subscription
                )
            }
            for rec in final_recommendations[:n_recommendations]
        ]
    
    def adjust_scores_by_subscription(self, base_scores, subscription_insights):
        """구독 이력 기반 점수 조정"""
        adjusted_scores = base_scores.copy()
        
        # 이전 구독 원두와의 유사도 분석
        for coffee_id, score in adjusted_scores.items():
            # 이전에 구독했던 원두와 비슷한 프로필이면 가중치 증가
            similarity_to_liked = subscription_insights.get_similarity_to_liked(coffee_id)
            if similarity_to_liked > 0.7:
                adjusted_scores[coffee_id] *= 1.2
            
            # 블라인드 박스에서 정확히 맞춘 원두 타입이면 가중치 증가
            if coffee_id in subscription_insights.correctly_guessed_profiles:
                adjusted_scores[coffee_id] *= 1.3
            
            # 구독 후 Lab 모드에서 높은 점수를 받은 원두 타입
            if subscription_insights.get_lab_score(coffee_id) > 85:
                adjusted_scores[coffee_id] *= 1.25
        
        return adjusted_scores
```

## 구독 데이터 분석기

```python
class SubscriptionAnalyzer:
    """원두 구독 데이터 분석기"""
    def __init__(self):
        self.pattern_recognizer = SubscriptionPatternRecognizer()
        self.preference_evolution = PreferenceEvolution()
    
    def analyze(self, user_id, subscription_history, feedback_ratings):
        """구독 이력 분석하여 인사이트 도출"""
        insights = {
            'preferred_origins': self._analyze_origin_preferences(subscription_history),
            'flavor_evolution': self._track_flavor_evolution(subscription_history, feedback_ratings),
            'blind_test_performance': self._analyze_blind_test_results(user_id),
            'monthly_diversity_score': self._calculate_diversity_preference(subscription_history),
            'correctly_guessed_profiles': self._get_correctly_guessed_coffees(user_id),
            'lab_mode_engagement': self._analyze_lab_usage_with_subscriptions(user_id)
        }
        
        # 구독 타입별 선호도 분석
        subscription_type_preferences = {
            'monthly_pick': self._analyze_monthly_pick_satisfaction(user_id),
            'my_choice': self._analyze_choice_patterns(user_id),
            'blind_box': self._analyze_blind_box_performance(user_id)
        }
        
        insights['subscription_preferences'] = subscription_type_preferences
        
        return insights
    
    def get_similarity_to_liked(self, coffee_id):
        """좋아했던 구독 원두와의 유사도 계산"""
        # 실제 구현에서는 벡터 유사도 계산
        return 0.75  # 예시 값
    
    def get_lab_score(self, coffee_id):
        """Lab 모드에서의 평균 점수"""
        # 실제 구현에서는 DB에서 조회
        return 88  # 예시 값
```

## 컨텍스트 인식 추천

```python
class ContextualBandit:
    """
    컨텍스트 인식 추천을 위한 Contextual Bandit 모델
    사용자의 현재 상황에 따라 추천을 조정
    """
    def __init__(self):
        self.context_embedder = ContextEmbedder()
        self.reward_predictor = RewardPredictor()
        self.exploration_rate = 0.1
    
    def adjust_scores(self, base_scores, context):
        """현재 컨텍스트에 따라 점수 조정"""
        context_vector = self.context_embedder.encode(context)
        
        adjusted_scores = {}
        for coffee_id, base_score in base_scores.items():
            # 컨텍스트와 커피의 매치도 예측
            context_match = self.reward_predictor.predict(
                coffee_id=coffee_id,
                context=context_vector
            )
            
            # Thompson Sampling으로 탐험과 활용 균형
            if np.random.random() < self.exploration_rate:
                # 탐험: 새로운 조합 시도
                adjusted_scores[coffee_id] = base_score * (0.8 + 0.4 * np.random.random())
            else:
                # 활용: 예측된 매치도 사용
                adjusted_scores[coffee_id] = base_score * context_match
        
        return adjusted_scores
```

## 설명 생성기

```python
class ExplanationGPT:
    """
    추천 이유를 자연스러운 언어로 설명하는 생성 모델
    """
    def __init__(self):
        self.language_model = AutoModelForCausalLM.from_pretrained('coffee-gpt')
        self.template_manager = TemplateManager()
    
    def generate(self, recommendations, user_profile, subscription_context, reasoning_path):
        """추천 이유 설명 생성"""
        explanations = {}
        
        for rec in recommendations:
            # 추천 이유 수집
            reasons = self._collect_reasons(rec, user_profile, subscription_context)
            
            # 템플릿 기반 설명 생성
            if rec.score > 0.9:
                template = self.template_manager.get_template('perfect_match')
            elif rec.score > 0.7:
                template = self.template_manager.get_template('good_match')
            else:
                template = self.template_manager.get_template('exploration')
            
            # GPT로 자연스러운 설명 생성
            explanation = self._generate_natural_language(
                template=template,
                reasons=reasons,
                coffee_profile=rec.coffee.profile,
                user_context=user_profile.current_context
            )
            
            explanations[rec.id] = explanation
        
        return explanations
    
    def _collect_reasons(self, recommendation, user_profile, subscription_context):
        """추천 이유 수집"""
        reasons = []
        
        # 맛 유사도
        if recommendation.flavor_match > 0.8:
            reasons.append({
                'type': 'flavor_match',
                'detail': '좋아하시는 플로럴 계열과 잘 맞아요'
            })
        
        # 구독 이력 기반
        if recommendation.coffee.id in subscription_context.correctly_guessed_profiles:
            reasons.append({
                'type': 'subscription_success',
                'detail': '블라인드 박스에서 정확히 맞추셨던 스타일이에요'
            })
        
        # 탐험 추천
        if recommendation.exploration_score > 0.7:
            reasons.append({
                'type': 'exploration',
                'detail': '새로운 맛의 영역을 탐험해보세요'
            })
        
        return reasons
```

## 다양성 최적화

```python
class DiversityOptimizer:
    """
    추천 리스트의 다양성을 보장하는 최적화 모듈
    """
    def __init__(self):
        self.diversity_metrics = DiversityMetrics()
    
    def ensemble_and_diversify(self, cf_scores, cb_scores, context_scores, 
                               subscription_scores, diversity_weight):
        """앙상블 스코어 계산 및 다양성 최적화"""
        # 1. 앙상블 스코어 계산
        ensemble_scores = {}
        for coffee_id in cf_scores.keys():
            ensemble_scores[coffee_id] = (
                0.3 * cf_scores.get(coffee_id, 0) +
                0.3 * cb_scores.get(coffee_id, 0) +
                0.2 * context_scores.get(coffee_id, 0) +
                0.2 * subscription_scores.get(coffee_id, 0)
            )
        
        # 2. 다양성을 고려한 최종 선택
        selected = []
        candidates = sorted(ensemble_scores.items(), key=lambda x: x[1], reverse=True)
        
        for coffee_id, score in candidates:
            if not selected:
                selected.append(coffee_id)
            else:
                # 기존 선택과의 다양성 계산
                diversity_score = self.diversity_metrics.calculate_diversity(
                    coffee_id, selected
                )
                
                # 다양성을 고려한 최종 점수
                final_score = score * (1 - diversity_weight) + diversity_score * diversity_weight
                
                # 임계값 이상이면 추가
                if final_score > 0.6:
                    selected.append(coffee_id)
        
        return selected
```

## 주요 특징

### 1. **다중 추천 전략 통합**
- 협업 필터링: 유사한 사용자들의 선호도 활용
- 컨텐츠 기반: 사용자의 과거 이력 분석
- 컨텍스트 인식: 현재 상황 고려
- 구독 데이터: 구독 이력과 피드백 반영

### 2. **구독 데이터 활용**
- 구독 이력 기반 개인화 강화
- 블라인드 박스 성과 분석
- Lab 모드 사용 패턴과 연계
- 구독 타입별 선호도 반영

### 3. **설명 가능한 추천**
- 추천 이유를 명확히 설명
- 사용자 맥락에 맞는 자연스러운 언어 생성
- 구독 컨텍스트를 반영한 설명

### 4. **다양성과 정확도의 균형**
- 정확한 추천과 새로운 경험의 균형
- Thompson Sampling으로 탐험과 활용 조절
- 다양성 메트릭을 통한 최적화