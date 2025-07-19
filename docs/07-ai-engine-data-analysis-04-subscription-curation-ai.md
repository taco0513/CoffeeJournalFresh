# 🤖 구독 원두 큐레이션 AI

## 월별 원두 큐레이션 시스템

구독자들을 위한 지능형 원두 선별 및 큐레이션 AI 시스템입니다.

```python
class SubscriptionCurationAI:
    """월별 원두 큐레이션 AI 시스템"""
    
    def __init__(self):
        self.user_preference_model = UserPreferenceModel()
        self.market_trend_analyzer = MarketTrendAnalyzer()
        self.roastery_matcher = RoasteryMatcher()
        self.diversity_optimizer = DiversityOptimizer()
    
    def curate_monthly_selection(self, month, year):
        """이달의 추천 4종 큐레이션"""
        # 1. 시즌 트렌드 분석
        seasonal_trends = self.market_trend_analyzer.get_seasonal_trends(month)
        
        # 2. 사용자 전체 선호도 분석
        global_preferences = self.user_preference_model.get_aggregate_preferences()
        
        # 3. 지난달 피드백 반영
        last_month_feedback = self.analyze_last_month_feedback(month - 1, year)
        
        # 4. 다양성 최적화
        selection_criteria = {
            'origins': ['다양한 대륙에서 최소 3개'],
            'processing': ['워시드, 내추럴, 기타 각 1개 이상'],
            'roast_levels': ['라이트, 미디엄 균형'],
            'flavor_profiles': ['과일, 초콜릿, 플로럴 등 다양하게']
        }
        
        # 5. 로스터리 로테이션 고려
        available_roasteries = self.get_available_roasteries(month)
        
        # 6. 최종 선정
        selected_coffees = self.diversity_optimizer.select_optimal_set(
            candidates=self.get_all_candidates(available_roasteries),
            criteria=selection_criteria,
            user_preferences=global_preferences,
            seasonal_trends=seasonal_trends,
            n_selections=4
        )
        
        return {
            'selections': selected_coffees,
            'theme': self.generate_monthly_theme(month, selected_coffees),
            'expected_satisfaction': self.predict_satisfaction_score(selected_coffees),
            'diversity_score': self.calculate_diversity_score(selected_coffees)
        }
    
    def personalize_recommendations(self, user_id, available_coffees):
        """'내가 고르기' 개인화 추천"""
        user_profile = self.user_preference_model.get_user_profile(user_id)
        
        # 구독 이력 기반 추천
        recommendations = []
        
        for coffee in available_coffees:
            score = self.calculate_personal_match_score(
                coffee=coffee,
                user_profile=user_profile,
                factors={
                    'taste_dna_match': 0.3,
                    'past_ratings': 0.25,
                    'exploration_factor': 0.2,  # 새로운 경험 권장
                    'lab_performance': 0.15,
                    'social_influence': 0.1  # 비슷한 취향 사용자들의 선호
                }
            )
            
            recommendations.append({
                'coffee': coffee,
                'match_score': score,
                'reasons': self.generate_recommendation_reasons(coffee, user_profile, score)
            })
        
        return sorted(recommendations, key=lambda x: x['match_score'], reverse=True)
    
    def optimize_blind_box_challenge(self, participants_count):
        """블라인드 박스 5종 최적 구성"""
        # 난이도 균형 맞추기
        difficulty_distribution = {
            'easy': 1,      # 명확한 특징
            'medium': 2,    # 보통 난이도
            'hard': 1,      # 구별 어려움
            'expert': 1     # 전문가 레벨
        }
        
        # 교육적 가치 극대화
        educational_goals = {
            'processing_comparison': '같은 산지, 다른 프로세싱',
            'origin_comparison': '다른 산지, 비슷한 프로필',
            'roast_level_impact': '같은 원두, 다른 로스팅'
        }
        
        selected_set = self.select_blind_box_coffees(
            difficulty_distribution=difficulty_distribution,
            educational_goals=educational_goals,
            expected_participants=participants_count
        )
        
        return {
            'coffees': selected_set,
            'difficulty_score': self.calculate_overall_difficulty(selected_set),
            'educational_value': self.assess_educational_value(selected_set),
            'expected_guess_rate': self.predict_guess_rate(selected_set)
        }
```

## 시장 트렌드 분석기

```python
class MarketTrendAnalyzer:
    """커피 시장 트렌드 및 시즌성 분석"""
    
    def __init__(self):
        self.trend_predictor = TrendPredictor()
        self.seasonal_analyzer = SeasonalAnalyzer()
        
    def get_seasonal_trends(self, month):
        """월별 시즌 트렌드 분석"""
        seasonal_preferences = {
            'spring': {  # 3-5월
                'flavor_trends': ['floral', 'bright', 'fruity'],
                'processing_trends': ['washed', 'honey'],
                'origin_trends': ['ethiopia', 'guatemala', 'colombia']
            },
            'summer': {  # 6-8월
                'flavor_trends': ['citrus', 'tea-like', 'light'],
                'processing_trends': ['washed', 'natural_light'],
                'origin_trends': ['kenya', 'rwanda', 'panama']
            },
            'autumn': {  # 9-11월
                'flavor_trends': ['nutty', 'caramel', 'balanced'],
                'processing_trends': ['honey', 'pulped_natural'],
                'origin_trends': ['brazil', 'honduras', 'mexico']
            },
            'winter': {  # 12-2월
                'flavor_trends': ['chocolate', 'rich', 'full_body'],
                'processing_trends': ['natural', 'anaerobic'],
                'origin_trends': ['indonesia', 'peru', 'nicaragua']
            }
        }
        
        season = self._get_season(month)
        base_trends = seasonal_preferences[season]
        
        # 최근 데이터로 트렌드 보정
        recent_trends = self.trend_predictor.get_recent_trends()
        adjusted_trends = self._adjust_with_recent_data(base_trends, recent_trends)
        
        return adjusted_trends
    
    def analyze_competitor_offerings(self):
        """경쟁사 구독 박스 분석"""
        competitors = ['blue_bottle', 'counter_culture', 'intelligentsia']
        
        competitor_analysis = {}
        for competitor in competitors:
            offerings = self._scrape_competitor_data(competitor)
            competitor_analysis[competitor] = {
                'popular_origins': self._extract_origins(offerings),
                'price_range': self._calculate_price_range(offerings),
                'unique_features': self._identify_unique_features(offerings)
            }
        
        # 차별화 포인트 도출
        differentiation_opportunities = self._find_gaps(competitor_analysis)
        
        return {
            'competitor_analysis': competitor_analysis,
            'differentiation_opportunities': differentiation_opportunities
        }
```

## 다양성 최적화 엔진

```python
class DiversityOptimizer:
    """구독 박스 다양성 최적화"""
    
    def __init__(self):
        self.similarity_calculator = CoffeeSimilarityCalculator()
        self.constraint_optimizer = ConstraintOptimizer()
    
    def select_optimal_set(self, candidates, criteria, user_preferences, 
                          seasonal_trends, n_selections=4):
        """최적 다양성을 가진 원두 셋 선정"""
        
        # 1. 제약 조건 정의
        constraints = self._define_constraints(criteria)
        
        # 2. 목적 함수 정의
        def objective_function(selection):
            scores = {
                'diversity': self._calculate_diversity_score(selection),
                'user_satisfaction': self._predict_user_satisfaction(
                    selection, user_preferences
                ),
                'seasonal_fit': self._calculate_seasonal_fit(
                    selection, seasonal_trends
                ),
                'educational_value': self._assess_educational_value(selection)
            }
            
            # 가중합으로 최종 점수 계산
            weights = {'diversity': 0.3, 'user_satisfaction': 0.4, 
                      'seasonal_fit': 0.2, 'educational_value': 0.1}
            
            return sum(scores[key] * weights[key] for key in scores)
        
        # 3. 유전 알고리즘으로 최적화
        optimizer = GeneticAlgorithm(
            population_size=100,
            mutation_rate=0.1,
            crossover_rate=0.8,
            generations=50
        )
        
        optimal_selection = optimizer.optimize(
            candidates=candidates,
            objective_function=objective_function,
            constraints=constraints,
            selection_size=n_selections
        )
        
        return optimal_selection
    
    def _calculate_diversity_score(self, selection):
        """선정된 원두들의 다양성 점수 계산"""
        diversity_metrics = []
        
        # 원산지 다양성
        origins = [coffee.origin for coffee in selection]
        origin_diversity = len(set(origins)) / len(origins)
        diversity_metrics.append(origin_diversity)
        
        # 프로세싱 다양성
        processings = [coffee.processing for coffee in selection]
        processing_diversity = len(set(processings)) / len(processings)
        diversity_metrics.append(processing_diversity)
        
        # 맛 프로필 다양성 (벡터 거리 기반)
        taste_vectors = [coffee.taste_vector for coffee in selection]
        avg_pairwise_distance = self._calculate_avg_pairwise_distance(taste_vectors)
        diversity_metrics.append(avg_pairwise_distance)
        
        # 로스팅 레벨 다양성
        roast_levels = [coffee.roast_level for coffee in selection]
        roast_diversity = len(set(roast_levels)) / len(roast_levels)
        diversity_metrics.append(roast_diversity)
        
        return np.mean(diversity_metrics)
```

## 블라인드 박스 최적화

```python
class BlindBoxOptimizer:
    """블라인드 박스 구성 최적화"""
    
    def __init__(self):
        self.difficulty_assessor = DifficultyAssessor()
        self.educational_designer = EducationalDesigner()
    
    def design_challenge_set(self, target_difficulty, educational_goals):
        """교육적 가치와 적절한 난이도의 블라인드 박스 구성"""
        
        # 1. 난이도별 원두 풀 생성
        coffee_pools = {
            'easy': self._get_easy_coffees(),      # 뚜렷한 특징
            'medium': self._get_medium_coffees(),  # 보통 난이도
            'hard': self._get_hard_coffees(),      # 미묘한 차이
            'expert': self._get_expert_coffees()   # 전문가용
        }
        
        # 2. 교육적 페어링 설계
        educational_pairs = self.educational_designer.create_learning_pairs(
            goals=educational_goals,
            available_coffees=coffee_pools
        )
        
        # 3. 최적 조합 찾기
        optimal_set = self._optimize_combination(
            educational_pairs=educational_pairs,
            target_difficulty=target_difficulty,
            set_size=5
        )
        
        # 4. 힌트 시스템 설계
        hints = self._design_progressive_hints(optimal_set)
        
        return {
            'coffee_set': optimal_set,
            'difficulty_distribution': self._analyze_difficulty(optimal_set),
            'educational_value': self._assess_educational_impact(optimal_set),
            'hints': hints,
            'expected_success_rate': self._predict_success_rate(optimal_set)
        }
    
    def _design_progressive_hints(self, coffee_set):
        """단계별 힌트 시스템 설계"""
        hints = {}
        
        for i, coffee in enumerate(coffee_set):
            hints[f'coffee_{i+1}'] = {
                'level_1': f"이 원두는 {coffee.continent} 대륙에서 왔어요",
                'level_2': f"{coffee.processing} 프로세싱을 거쳤어요",
                'level_3': f"{coffee.altitude}m 고도에서 재배되었어요",
                'level_4': f"주요 맛은 {coffee.primary_flavor}계열이에요",
                'answer': f"{coffee.origin} {coffee.farm_name}"
            }
        
        return hints
```

## 사용자 만족도 예측

```python
class SatisfactionPredictor:
    """구독 박스 만족도 예측 모델"""
    
    def __init__(self):
        self.satisfaction_model = XGBoostRegressor()
        self.feature_extractor = FeatureExtractor()
    
    def predict_satisfaction(self, user_profile, coffee_selection):
        """사용자의 구독 박스 만족도 예측"""
        
        # 1. 특성 추출
        features = self.feature_extractor.extract_features(
            user_profile=user_profile,
            coffee_selection=coffee_selection
        )
        
        # 2. 만족도 예측
        predicted_satisfaction = self.satisfaction_model.predict([features])[0]
        
        # 3. 세부 만족도 분석
        detailed_analysis = {
            'overall_satisfaction': predicted_satisfaction,
            'taste_match': self._predict_taste_match(user_profile, coffee_selection),
            'novelty_score': self._calculate_novelty(user_profile, coffee_selection),
            'educational_value': self._assess_learning_potential(user_profile, coffee_selection),
            'price_satisfaction': self._evaluate_price_value(coffee_selection)
        }
        
        # 4. 개선 제안
        improvement_suggestions = self._generate_improvements(
            detailed_analysis, user_profile
        )
        
        return {
            'prediction': detailed_analysis,
            'confidence': self._calculate_confidence(features),
            'improvements': improvement_suggestions
        }
```

## 주요 특징

### 1. **지능형 큐레이션**
- 시즌 트렌드와 사용자 선호도 균형
- 다양성과 만족도 최적화
- 교육적 가치 고려

### 2. **개인화 추천**
- 구독 이력 기반 개인화
- Lab 모드 성과 반영
- 탐험과 안전함의 균형

### 3. **블라인드 박스 최적화**
- 적절한 난이도 분배
- 교육적 페어링 설계
- 단계별 힌트 시스템

### 4. **만족도 예측**
- 다차원 만족도 분석
- 실시간 피드백 반영
- 지속적 개선 제안

### 5. **시장 분석 통합**
- 경쟁사 분석
- 트렌드 예측
- 차별화 포인트 도출