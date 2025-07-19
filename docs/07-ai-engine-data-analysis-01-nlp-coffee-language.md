# 🤖 커피 특화 자연어 처리 (NLP)

## 커피 특화 AI의 핵심: 감성 어휘와 비유 표현 이해

커피 테이스팅은 단순한 맛 표현을 넘어 **감성적이고 추상적인 어휘**, 그리고 **비유적 표현**으로 가득합니다. "우아한", "무거운", "밝은" 같은 추상적 표현과 "벨벳 같은", "햇살 같은" 같은 비유 표현들이 실제로는 구체적인 맛과 연결되어 있죠. 우리의 AI는 이런 **커피만의 언어**를 깊이 이해합니다.

### 감성 어휘 이해 예시:
- 사용자: "이 커피는 정말 **우아하고 밝아요**"
- AI 이해: 우아함 → 섬세한 플로럴, 균형잡힌 산미 / 밝음 → 시트러스, 과일향
- AI 피드백: "우아함에서 느껴지는 플로럴 노트를 잘 캐치하셨네요! 밝은 느낌은 아마 에티오피아 특유의 시트러스 계열일 거예요."

### 비유 표현 이해 예시:
- 사용자: "**벨벳 같은** 질감에 **햇살 같은** 산미가 있어요"
- AI 이해: 벨벳 → 부드럽고 실키한 마우스필 / 햇살 → 밝고 투명한 산미
- AI 피드백: "벨벳처럼 부드러운 질감을 느끼셨군요! 그 실키한 느낌은 좋은 로스팅의 증거예요. 햇살 같은 산미라니, 정말 시적인 표현이네요!"

## 커피 감성 어휘 임베딩 모델

```python
class CoffeeSensoryEmbedding:
    """
    커피 특화 감성 어휘 임베딩 모델
    일반 Word2Vec + 커피 도메인 특화 학습 + 비유 표현 처리
    """
    def __init__(self):
        # 사전 학습된 일반 Word2Vec (한국어/영어)
        self.general_w2v_ko = Word2Vec.load('general_korean_w2v')
        self.general_w2v_en = Word2Vec.load('general_english_w2v')
        
        # 비유 표현 추출기
        self.simile_extractor = SimileExtractor()
        
        # 커피 특화 감성 어휘 사전
        self.coffee_sensory_dict = {
            'texture': {
                'ko': ['실키한', '크리미한', '벨벳같은', '거친', '부드러운', '묵직한', '가벼운'],
                'en': ['silky', 'creamy', 'velvety', 'rough', 'smooth', 'heavy', 'light']
            },
            'brightness': {
                'ko': ['밝은', '어두운', '투명한', '탁한', '맑은', '깨끗한'],
                'en': ['bright', 'dark', 'transparent', 'opaque', 'clear', 'clean']
            },
            'character': {
                'ko': ['우아한', '야생적인', '세련된', '투박한', '섬세한', '대담한'],
                'en': ['elegant', 'wild', 'sophisticated', 'rustic', 'delicate', 'bold']
            },
            'complexity': {
                'ko': ['복잡한', '단순한', '레이어드한', '균형잡힌', '조화로운'],
                'en': ['complex', 'simple', 'layered', 'balanced', 'harmonious']
            }
        }
        
        # 감성 어휘와 구체적 맛의 관계 매핑
        self.sensory_taste_relations = {
            'bright': ['citrus', 'floral', 'tea-like', 'fruity'],
            'heavy': ['chocolate', 'nutty', 'earthy', 'woody'],
            'elegant': ['delicate', 'refined', 'balanced', 'subtle'],
            'wild': ['funky', 'fermented', 'intense', 'exotic'],
            '밝은': ['시트러스', '플로럴', '과일향', '상큼한'],
            '무거운': ['초콜릿', '너티', '흙내음', '우디'],
            '우아한': ['섬세한', '정제된', '균형잡힌', '은은한']
        }
        
        # 커피 도메인 특화 학습된 임베딩
        self.coffee_specific_embeddings = self._train_coffee_embeddings()
        
    def encode(self, text):
        """
        텍스트에서 감성 어휘와 비유 표현을 추출하고 벡터화
        """
        # 1. 감성 어휘 추출
        sensory_words = self._extract_sensory_words(text)
        
        # 2. 비유 표현 추출 및 변환
        simile_features = self.simile_extractor.extract_and_convert(text)
        
        # 3. 일반 Word2Vec과 커피 특화 임베딩 결합
        embeddings = []
        
        # 감성 어휘 임베딩
        for word in sensory_words:
            if word in self.coffee_specific_embeddings:
                embeddings.append(self.coffee_specific_embeddings[word])
            elif word in self.general_w2v_ko.vocab:
                embeddings.append(self.general_w2v_ko[word])
            else:
                embeddings.append(self._handle_oov(word))
        
        # 비유 표현에서 추출된 특성 임베딩
        for feature in simile_features:
            if feature in self.coffee_specific_embeddings:
                embeddings.append(self.coffee_specific_embeddings[feature])
        
        # 4. 평균 풀링으로 문장 임베딩 생성
        if embeddings:
            return np.mean(embeddings, axis=0)
        else:
            return np.zeros(64)  # 기본 벡터
            
    def _train_coffee_embeddings(self):
        """
        커피 전문 코퍼스로 추가 학습
        - 로스터 노트
        - 큐그레이더 평가
        - 전문가 리뷰
        """
        # 실제로는 대규모 커피 전문 텍스트로 학습
        # 여기서는 개념적 구현
        return {}
        
    def _extract_sensory_words(self, text):
        """
        텍스트에서 감성 어휘 추출
        """
        sensory_words = []
        for category, words in self.coffee_sensory_dict.items():
            for word in words['ko'] + words['en']:
                if word in text:
                    sensory_words.append(word)
        return sensory_words
```

## 비유 표현 추출 및 해석

```python
class SimileExtractor:
    """
    한국어 비유 표현 추출 및 해석
    "~같은", "~같이", "~처럼" 패턴을 찾아 커피 맛 특성으로 변환
    """
    def __init__(self):
        # 비유 표현 정규식 패턴
        self.simile_patterns = {
            'korean': re.compile(r'([가-힣\s]{1,20})\s*(?:같은|같이|처럼)\s*([가-힣\s]{0,20})'),
            'english': re.compile(r'([a-zA-Z\s]{1,20})\s*(?:like|as)\s*([a-zA-Z\s]{0,20})')
        }
        
        # 비유 대상 → 커피 특성 매핑
        self.simile_to_coffee_mapping = {
            # 질감 관련
            '벨벳': {
                'attributes': ['부드러운', '실키한', '크리미한'],
                'intensity': 'medium',
                'category': 'texture'
            },
            '실크': {
                'attributes': ['매끄러운', '가벼운', '섬세한'],
                'intensity': 'light',
                'category': 'texture'
            },
            '버터': {
                'attributes': ['크리미한', '진한', '부드러운'],
                'intensity': 'heavy',
                'category': 'texture'
            },
            
            # 자연 현상 관련
            '햇살': {
                'attributes': ['밝은', '투명한', '상큼한', '따뜻한'],
                'intensity': 'bright',
                'category': 'brightness'
            },
            '비': {
                'attributes': ['쏟아지는', '강렬한', '풍부한'],
                'intensity': 'intense',
                'category': 'character'
            },
            '바람': {
                'attributes': ['가벼운', '상쾌한', '시원한'],
                'intensity': 'light',
                'category': 'character'
            },
            
            # 식품 관련
            '꿀': {
                'attributes': ['달콤한', '진한', '부드러운'],
                'intensity': 'sweet',
                'category': 'taste'
            },
            '초콜릿': {
                'attributes': ['진한', '부드러운', '달콤쌉싸름한'],
                'intensity': 'rich',
                'category': 'taste'
            },
            '와인': {
                'attributes': ['복잡한', '깊은', '숙성된'],
                'intensity': 'complex',
                'category': 'character'
            },
            
            # 추상적 표현
            '음악': {
                'attributes': ['조화로운', '리드미컬한', '균형잡힌'],
                'intensity': 'balanced',
                'category': 'complexity'
            },
            '그림': {
                'attributes': ['다채로운', '복잡한', '레이어드한'],
                'intensity': 'complex',
                'category': 'complexity'
            }
        }
        
    def extract_and_convert(self, text):
        """
        텍스트에서 비유 표현을 추출하고 커피 특성으로 변환
        """
        extracted_features = []
        
        # 한국어 비유 표현 추출
        for match in self.simile_patterns['korean'].finditer(text):
            simile_object = match.group(1).strip()
            context = match.group(2).strip()
            
            # 비유 대상이 매핑에 있는 경우
            for key, mapping in self.simile_to_coffee_mapping.items():
                if key in simile_object:
                    extracted_features.extend(mapping['attributes'])
                    
                    # 컨텍스트 분석으로 추가 특성 추출
                    if context:
                        additional_features = self._analyze_context(context, mapping['category'])
                        extracted_features.extend(additional_features)
        
        return list(set(extracted_features))  # 중복 제거
    
    def _analyze_context(self, context, category):
        """
        비유 표현의 문맥을 분석하여 추가 특성 추출
        """
        additional_features = []
        
        # 강도 표현
        intensity_words = {
            '강한': ['강렬한', '진한'],
            '약한': ['은은한', '가벼운'],
            '부드러운': ['실키한', '매끄러운'],
            '거친': ['텁텁한', '날카로운']
        }
        
        for word, features in intensity_words.items():
            if word in context:
                additional_features.extend(features)
        
        return additional_features
    
    def generate_feedback(self, original_text, extracted_features):
        """
        사용자의 비유 표현에 대한 AI 피드백 생성
        """
        similes_found = []
        
        for match in self.simile_patterns['korean'].finditer(original_text):
            simile_expr = match.group(0)
            similes_found.append(simile_expr)
        
        if similes_found:
            feedback = f"'{similes_found[0]}'라는 표현이 정말 인상적이에요! "
            
            # 추출된 특성을 바탕으로 구체적인 피드백
            if '부드러운' in extracted_features:
                feedback += "그 부드러운 질감은 좋은 로스팅과 추출의 결과예요. "
            if '밝은' in extracted_features:
                feedback += "밝은 느낌은 높은 고도에서 자란 원두의 특징이죠. "
            if '복잡한' in extracted_features:
                feedback += "복잡한 맛의 레이어를 느끼셨다니, 미각이 발달하고 있어요! "
            
            return feedback
        
        return ""
```

## 주요 특징

### 1. **커피 특화 언어 이해**
- 일반 Word2Vec + 커피 도메인 특화 학습
- 감성 어휘 → 구체적 맛 매핑
- 비유 표현 → 커피 특성 변환

### 2. **이중 언어 지원**
- 한국어/영어 감성 어휘 모두 지원
- 각 언어별 비유 표현 패턴 인식
- 크로스 언어 임베딩 지원

### 3. **실시간 피드백 생성**
- 사용자의 표현을 즉시 이해하고 격려
- 비유 표현에 대한 구체적인 피드백
- 성장 포인트 제시

### 4. **확장 가능한 구조**
- 새로운 감성 어휘 추가 가능
- 비유 표현 매핑 확장 가능
- 다국어 지원 확장 가능