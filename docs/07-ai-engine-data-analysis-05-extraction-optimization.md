# 🤖 추출 최적화 시스템

## 베이지안 최적화 기반 추출 모델

물리 모델과 신경망을 결합한 하이브리드 추출 최적화 시스템입니다.

```python
class ExtractionOptimizer:
    """
    베이지안 최적화 + 물리 모델 + 신경망 예측 하이브리드
    """
    def __init__(self):
        self.physics_model = CoffeeExtractionPhysics()
        self.neural_predictor = TastePredictor()
        self.bayesian_opt = BayesianOptimization()
        self.uncertainty_estimator = UncertaintyQuantification()
    
    def optimize_extraction(self, target_profile, constraints):
        """목표 맛 프로필을 위한 최적 추출 레시피 찾기"""
        
        # 1. 탐색 공간 정의
        search_space = {
            'temperature': Real(85, 96, name='temperature'),
            'grind_size': Integer(200, 800, name='grind_size'),
            'ratio': Real(1/14, 1/18, name='ratio'),
            'time': Integer(120, 300, name='time'),
            'agitation': Categorical(['none', 'gentle', 'moderate'], name='agitation')
        }
        
        # 2. 목적 함수 정의
        def objective(params):
            # 물리 모델로 추출 메트릭 계산
            extraction_metrics = self.physics_model.simulate(
                coffee_mass=constraints['dose'],
                water_mass=constraints['dose'] * params['ratio'],
                temperature=params['temperature'],
                grind_size=params['grind_size'],
                time=params['time']
            )
            
            # 신경망으로 맛 프로필 예측
            predicted_taste = self.neural_predictor.predict(
                extraction_params=params,
                extraction_metrics=extraction_metrics,
                coffee_profile=constraints['coffee_profile']
            )
            
            # 목표와의 유사도 계산
            similarity = self.calculate_similarity(
                predicted_taste, 
                target_profile,
                weights=constraints.get('importance_weights', None)
            )
            
            # 불확실성 페널티
            uncertainty = self.uncertainty_estimator.estimate(params)
            
            return similarity - 0.1 * uncertainty
        
        # 3. 베이지안 최적화 실행
        optimizer = BayesianOptimizer(
            dimensions=list(search_space.values()),
            base_estimator='GP',  # Gaussian Process
            acq_func='EI',        # Expected Improvement
            n_initial_points=10
        )
        
        # 최적화 실행
        for i in range(50):
            next_point = optimizer.ask()
            f_val = objective(dict(zip(search_space.keys(), next_point)))
            optimizer.tell(next_point, f_val)
            
            # 조기 종료 조건
            if optimizer.get_result().fun > 0.95:
                break
        
        # 4. 결과 해석 및 신뢰 구간
        optimal_params = dict(zip(
            search_space.keys(), 
            optimizer.get_result().x
        ))
        
        confidence_intervals = self.calculate_confidence_intervals(
            optimizer, optimal_params
        )
        
        # 5. 실용적 가이드 생성
        practical_guide = self.generate_practical_guide(
            optimal_params,
            constraints,
            confidence_intervals
        )
        
        return {
            'optimal_parameters': optimal_params,
            'expected_taste': self.neural_predictor.predict(optimal_params),
            'confidence_intervals': confidence_intervals,
            'optimization_path': optimizer.get_result().func_vals,
            'practical_guide': practical_guide,
            'alternative_recipes': self.get_pareto_optimal_solutions(optimizer)
        }
```

## 커피 추출 물리 모델

```python
class CoffeeExtractionPhysics:
    """커피 추출의 물리적 과정을 시뮬레이션"""
    
    def __init__(self):
        self.diffusion_model = DiffusionModel()
        self.thermal_model = ThermalModel()
        self.particle_model = ParticleModel()
    
    def simulate(self, coffee_mass, water_mass, temperature, grind_size, time):
        """추출 과정 물리 시뮬레이션"""
        
        # 1. 입자 크기 분포 모델링
        particle_distribution = self.particle_model.generate_distribution(
            grind_size=grind_size,
            coffee_mass=coffee_mass
        )
        
        # 2. 열전달 모델링
        thermal_profile = self.thermal_model.simulate_heat_transfer(
            initial_temp=temperature,
            water_mass=water_mass,
            coffee_mass=coffee_mass,
            time_steps=time
        )
        
        # 3. 확산 과정 모델링
        extraction_curve = self.diffusion_model.simulate_extraction(
            particle_distribution=particle_distribution,
            thermal_profile=thermal_profile,
            water_mass=water_mass,
            extraction_time=time
        )
        
        # 4. 추출 메트릭 계산
        metrics = {
            'extraction_yield': self._calculate_extraction_yield(extraction_curve),
            'tds': self._calculate_tds(extraction_curve, water_mass),
            'strength': self._calculate_strength(extraction_curve),
            'extraction_rate': self._calculate_extraction_rate(extraction_curve),
            'uniformity': self._calculate_uniformity(particle_distribution, extraction_curve)
        }
        
        return metrics
    
    def _calculate_extraction_yield(self, extraction_curve):
        """추출률 계산 (추출된 고형분 / 전체 고형분)"""
        total_extracted = np.trapz(extraction_curve['rate'], extraction_curve['time'])
        return min(total_extracted / extraction_curve['total_solubles'] * 100, 30)
    
    def _calculate_tds(self, extraction_curve, water_mass):
        """총 용존 고형분 농도 계산"""
        total_extracted_mass = np.trapz(extraction_curve['rate'], extraction_curve['time'])
        return total_extracted_mass / water_mass * 100
```

## 신경망 맛 예측 모델

```python
class TastePredictor:
    """추출 변수로부터 맛 프로필 예측하는 신경망"""
    
    def __init__(self):
        self.model = self._build_model()
        self.feature_scaler = StandardScaler()
        self.target_scaler = StandardScaler()
    
    def _build_model(self):
        """맛 예측 신경망 구조"""
        model = nn.Sequential(
            # 입력층: 추출 변수 + 커피 프로필
            nn.Linear(15, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            
            # 은닉층 1: 복잡한 상호작용 학습
            nn.Linear(128, 256),
            nn.ReLU(),
            nn.BatchNorm1d(256),
            nn.Dropout(0.3),
            
            # 은닉층 2: 맛 특성 매핑
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            
            # 출력층: 맛 프로필 (산미, 단맛, 쓴맛, 바디감, 후미 등)
            nn.Linear(128, 8),
            nn.Sigmoid()  # 0-1 범위로 정규화
        )
        return model
    
    def predict(self, extraction_params, extraction_metrics, coffee_profile):
        """추출 조건으로부터 맛 프로필 예측"""
        
        # 1. 특성 벡터 구성
        features = self._construct_features(
            extraction_params, extraction_metrics, coffee_profile
        )
        
        # 2. 정규화
        features_scaled = self.feature_scaler.transform([features])
        
        # 3. 예측
        with torch.no_grad():
            features_tensor = torch.FloatTensor(features_scaled)
            prediction = self.model(features_tensor)
            
        # 4. 역정규화 및 해석
        taste_profile = self.target_scaler.inverse_transform(prediction.numpy())[0]
        
        return {
            'acidity': taste_profile[0],
            'sweetness': taste_profile[1],
            'bitterness': taste_profile[2],
            'body': taste_profile[3],
            'aftertaste': taste_profile[4],
            'balance': taste_profile[5],
            'complexity': taste_profile[6],
            'cleanliness': taste_profile[7]
        }
    
    def _construct_features(self, extraction_params, extraction_metrics, coffee_profile):
        """특성 벡터 구성"""
        features = [
            # 추출 변수
            extraction_params['temperature'],
            extraction_params['grind_size'],
            extraction_params['ratio'],
            extraction_params['time'],
            1 if extraction_params['agitation'] == 'gentle' else 0,
            1 if extraction_params['agitation'] == 'moderate' else 0,
            
            # 추출 메트릭
            extraction_metrics['extraction_yield'],
            extraction_metrics['tds'],
            extraction_metrics['strength'],
            extraction_metrics['uniformity'],
            
            # 커피 프로필
            coffee_profile['acidity_potential'],
            coffee_profile['sweetness_potential'],
            coffee_profile['body_potential'],
            coffee_profile['roast_level'],
            coffee_profile['origin_altitude']
        ]
        
        return features
```

## 불확실성 정량화

```python
class UncertaintyQuantification:
    """예측 불확실성 정량화"""
    
    def __init__(self):
        self.ensemble_models = [TastePredictor() for _ in range(5)]
        self.gaussian_process = GaussianProcessRegressor()
    
    def estimate(self, extraction_params):
        """추출 조건에 대한 예측 불확실성 추정"""
        
        # 1. 앙상블 모델로 예측 분산 계산
        predictions = []
        for model in self.ensemble_models:
            pred = model.predict(extraction_params)
            predictions.append(list(pred.values()))
        
        predictions = np.array(predictions)
        prediction_variance = np.var(predictions, axis=0)
        
        # 2. 가우시안 프로세스로 모델 불확실성 추정
        gp_uncertainty = self.gaussian_process.predict(
            [list(extraction_params.values())], 
            return_std=True
        )[1]
        
        # 3. 총 불확실성 계산
        total_uncertainty = np.sqrt(
            np.mean(prediction_variance) + gp_uncertainty[0]**2
        )
        
        return {
            'total_uncertainty': total_uncertainty,
            'prediction_variance': prediction_variance,
            'model_uncertainty': gp_uncertainty[0],
            'confidence_level': 1 - total_uncertainty
        }
```

## 실용적 가이드 생성기

```python
class PracticalGuideGenerator:
    """실제 사용 가능한 추출 가이드 생성"""
    
    def __init__(self):
        self.equipment_adapter = EquipmentAdapter()
        self.step_generator = StepGenerator()
    
    def generate_practical_guide(self, optimal_params, constraints, confidence_intervals):
        """실용적인 추출 가이드 생성"""
        
        # 1. 장비별 적응
        equipment_specific = self.equipment_adapter.adapt_to_equipment(
            params=optimal_params,
            equipment_type=constraints.get('equipment', 'v60')
        )
        
        # 2. 단계별 가이드 생성
        step_by_step = self.step_generator.generate_steps(
            params=equipment_specific,
            coffee_info=constraints['coffee_profile']
        )
        
        # 3. 주의사항 및 팁
        tips_and_warnings = self._generate_tips(
            params=optimal_params,
            confidence=confidence_intervals
        )
        
        # 4. 트러블슈팅 가이드
        troubleshooting = self._generate_troubleshooting(optimal_params)
        
        return {
            'equipment_settings': equipment_specific,
            'step_by_step_guide': step_by_step,
            'expected_result': self._describe_expected_taste(optimal_params),
            'tips_and_warnings': tips_and_warnings,
            'troubleshooting': troubleshooting,
            'adjustment_guidelines': self._generate_adjustment_guidelines(optimal_params)
        }
    
    def _generate_adjustment_guidelines(self, params):
        """맛 조정 가이드라인 생성"""
        guidelines = {
            'too_sour': {
                'temperature': '+2°C',
                'grind_size': '더 굵게',
                'time': '+30초',
                'explanation': '추출을 늘려 단맛을 더 뽑아내세요'
            },
            'too_bitter': {
                'temperature': '-2°C',
                'grind_size': '더 굵게',
                'time': '-30초',
                'explanation': '과추출을 방지하세요'
            },
            'too_weak': {
                'grind_size': '더 곱게',
                'ratio': '1:15로 조정',
                'explanation': '농도를 높이세요'
            },
            'too_strong': {
                'grind_size': '더 굵게',
                'ratio': '1:17로 조정',
                'explanation': '농도를 낮추세요'
            }
        }
        
        return guidelines
```

## 파레토 최적 해 탐색

```python
class ParetoOptimalSolver:
    """다목적 최적화를 통한 파레토 최적 해 탐색"""
    
    def __init__(self):
        self.nsga2 = NSGA2Algorithm()
    
    def find_pareto_optimal_recipes(self, target_profile, constraints):
        """파레토 최적 추출 레시피들 탐색"""
        
        # 1. 다목적 함수 정의
        objectives = [
            self._taste_similarity_objective,
            self._extraction_efficiency_objective,
            self._consistency_objective,
            self._ease_of_reproduction_objective
        ]
        
        # 2. NSGA-II로 다목적 최적화
        pareto_front = self.nsga2.optimize(
            objectives=objectives,
            constraints=constraints,
            population_size=100,
            generations=50
        )
        
        # 3. 파레토 해들을 사용자 친화적으로 분류
        categorized_solutions = {
            'beginner_friendly': self._filter_beginner_solutions(pareto_front),
            'precision_focused': self._filter_precision_solutions(pareto_front),
            'robust_recipes': self._filter_robust_solutions(pareto_front),
            'experimental': self._filter_experimental_solutions(pareto_front)
        }
        
        return categorized_solutions
    
    def _taste_similarity_objective(self, params, target_profile):
        """맛 유사도 목적함수"""
        predicted_taste = self.taste_predictor.predict(params)
        return cosine_similarity(predicted_taste, target_profile)
    
    def _extraction_efficiency_objective(self, params):
        """추출 효율성 목적함수"""
        extraction_metrics = self.physics_model.simulate(params)
        return extraction_metrics['extraction_yield'] / 22  # 이상적 추출률로 정규화
    
    def _consistency_objective(self, params):
        """재현성 목적함수 (변수 민감도 기반)"""
        sensitivity = self._calculate_parameter_sensitivity(params)
        return 1 / (1 + sensitivity)  # 민감도가 낮을수록 높은 점수
    
    def _ease_of_reproduction_objective(self, params):
        """재현 용이성 목적함수"""
        complexity_score = (
            abs(params['temperature'] - 90) / 10 +  # 90도 기준 편차
            abs(params['grind_size'] - 400) / 400 +  # 중간 분쇄도 기준
            abs(params['time'] - 180) / 180  # 3분 기준
        )
        return 1 / (1 + complexity_score)
```

## 주요 특징

### 1. **하이브리드 모델링**
- 물리 모델: 추출 과정의 과학적 시뮬레이션
- 신경망: 복잡한 맛-추출 관계 학습
- 베이지안 최적화: 효율적 탐색

### 2. **불확실성 고려**
- 예측 불확실성 정량화
- 신뢰 구간 제공
- 위험 인식 최적화

### 3. **실용적 가이드**
- 장비별 맞춤 설정
- 단계별 실행 가이드
- 트러블슈팅 지원

### 4. **다목적 최적화**
- 맛, 효율성, 재현성 동시 고려
- 파레토 최적 해 제시
- 사용자 레벨별 분류

### 5. **적응형 학습**
- 사용자 피드백 반영
- 지속적 모델 개선
- 개인화된 최적화