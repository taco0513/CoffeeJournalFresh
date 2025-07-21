# 🍃 Cafe Mode - Step 2: Roaster Notes 상세 명세서

## 개요

Roaster Notes는 Cafe Mode TastingFlow의 **두 번째 단계**로, 로스터가 제공한 공식 테이스팅 노트를 기록하는 **선택적 단계**입니다. 이후 개인 평가와 비교하여 일치도를 측정하는 기준점이 됩니다.

> **MVP 우선순위**: P1 (Important) - 사용자 경험을 크게 향상시키는 기능

---

## 🎯 설계 목표

### 핵심 원칙
- **선택성**: 부담 없이 건너뛸 수 있는 단계
- **참고성**: 정답이 아닌 비교 기준으로 활용
- **효율성**: 빠른 입력과 스마트한 파싱
- **학습성**: 전문 용어 학습 도구로 활용

### 사용자 목표
- ✅ 로스터 노트를 쉽게 기록 (3분 이내)
- ✅ 전문 용어를 자연스럽게 학습
- ✅ 나중에 개인 평가와 비교할 기준 마련
- ✅ 원하면 건너뛰고 다음 단계 진행

---

## 📋 데이터 구조

### 기본 인터페이스
```typescript
interface RoasterNotes {
  // 원본 텍스트 (필수)
  rawText: string;                    // 로스터 노트 원문
  
  // 파싱된 정보 (자동 추출)
  parsedInfo?: {
    flavors: ParsedFlavor[];          // 추출된 향미들
    descriptors: ParsedDescriptor[];   // 감각 묘사어들
    roastLevel?: string;              // 로스팅 레벨
    origin?: string;                  // 원산지 재확인
    process?: string;                 // 가공법 재확인
    altitude?: number;                // 재배 고도
    variety?: string;                 // 품종
  };
  
  // 메타데이터
  inputMethod: 'manual' | 'ocr' | 'photo' | 'voice';
  language: 'ko' | 'en';             // 원문 언어
  confidence: number;                // 파싱 신뢰도 (0-1)
  processingTime: number;            // 처리 시간 (ms)
  
  // 사용자 편집
  userEdited: boolean;               // 사용자가 수정했는지
  customTags: string[];              // 사용자 추가 태그
}

// 파싱된 향미 정보
interface ParsedFlavor {
  text: string;                      // 원본 텍스트 ("bright acidity")
  category: string;                  // 카테고리 ("acidity")
  subcategory?: string;              // 세부 카테고리 ("citric")
  intensity?: number;                // 강도 (1-5)
  confidence: number;                // 파싱 신뢰도
  position: [number, number];        // 원문에서의 위치
}

// 파싱된 묘사어 정보  
interface ParsedDescriptor {
  text: string;                      // 원본 텍스트
  type: DescriptorType;             // 묘사어 유형
  confidence: number;
}

enum DescriptorType {
  FLAVOR = 'flavor',                // 향미 ("berry")
  TEXTURE = 'texture',              // 질감 ("smooth")  
  INTENSITY = 'intensity',          // 강도 ("bright")
  QUALITY = 'quality',              // 품질 ("clean")
  TEMPORAL = 'temporal'             // 시간성 ("lingering")
}
```

### 다국어 지원
```typescript
interface MultiLanguageNotes {
  original: {
    text: string;
    language: 'ko' | 'en' | 'auto-detect';
  };
  
  translation?: {
    text: string;
    targetLanguage: 'ko' | 'en';
    translationMethod: 'ai' | 'crowdsource' | 'professional';
    confidence: number;
  };
  
  glossary: {
    [term: string]: {
      definition: string;
      examples: string[];
      relatedTerms: string[];
    };
  };
}
```

---

## 🎨 사용자 인터페이스

### 기본 화면 구성
```
┌─────────────────────────────┐
│ ← [뒤로]    로스터 노트   [건너뛰기] │
├─────────────────────────────┤
│                           │
│  📝 로스터의 테이스팅 노트를      │
│     입력해주세요               │
│                           │
│  💡 커피 봉투나 웹사이트에서    │
│     찾을 수 있어요             │
│                           │
│  ┌─────────────────────────┐ │
│  │ 📷  🎤  📄             │ │ 
│  │ 촬영  음성  직접입력       │ │
│  └─────────────────────────┘ │
│                           │
│  ┌─────────────────────────┐ │
│  │                       │ │
│  │  여기에 로스터 노트를        │ │
│  │  입력하거나 붙여넣으세요     │ │
│  │                       │ │
│  │  예시:                  │ │
│  │  "밝은 산미와 초콜릿의      │ │
│  │   단맛이 조화로운..."      │ │
│  │                       │ │
│  └─────────────────────────┘ │
│                           │
│  [건너뛰기]    [다음 단계 →] │
└─────────────────────────────┘
```

### 파싱 결과 표시
```
📊 인식된 정보 (확인해주세요)

🎨 향미 키워드:
[초콜릿] [베리] [꽃향] [견과류]

👅 감각 표현:
[밝은 산미] [부드러운 바디] [깔끔한 마무리]

📍 기타 정보:
로스팅: Medium  |  원산지: 에티오피아
```

### 스마트 편집 인터페이스
```typescript
const SmartTextEditor: React.FC = () => {
  const [text, setText] = useState('');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  
  // 실시간 파싱
  const handleTextChange = useDebouncedCallback(async (newText: string) => {
    setText(newText);
    
    // 파싱 실행
    const parsed = await parseRoasterNotes(newText);
    setHighlights(parsed.highlights);
    setSuggestions(parsed.suggestions);
  }, 500);
  
  return (
    <View style={styles.editorContainer}>
      {/* 텍스트 에디터 */}
      <TextInput
        multiline
        value={text}
        onChangeText={handleTextChange}
        style={[styles.textEditor, { height: Math.max(120, textHeight) }]}
        placeholder="로스터의 테이스팅 노트를 입력해주세요..."
      />
      
      {/* 하이라이트 오버레이 */}
      <View style={styles.highlightOverlay}>
        {highlights.map((highlight, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.highlight,
              { backgroundColor: getHighlightColor(highlight.type) }
            ]}
            onPress={() => showDefinition(highlight)}
          >
            <Text>{highlight.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* 제안 사항 */}
      {suggestions.length > 0 && (
        <ScrollView horizontal style={styles.suggestionContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => applySuggestion(suggestion)}
            >
              <Text style={styles.suggestionText}>
                + {suggestion.text}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};
```

---

## 🤖 스마트 파싱 엔진

### 자연어 처리 파이프라인
```typescript
class RoasterNotesParser {
  async parseNotes(text: string, language: string = 'auto'): Promise<ParsedNotes> {
    // 1. 언어 감지
    const detectedLang = await this.detectLanguage(text);
    
    // 2. 전처리
    const cleanedText = this.preprocessText(text);
    
    // 3. 토큰화
    const tokens = this.tokenize(cleanedText, detectedLang);
    
    // 4. 엔티티 추출
    const entities = await this.extractEntities(tokens);
    
    // 5. 향미 추출
    const flavors = await this.extractFlavors(entities, detectedLang);
    
    // 6. 묘사어 추출
    const descriptors = await this.extractDescriptors(entities, detectedLang);
    
    // 7. 구조화
    return this.structureParsedData(flavors, descriptors, entities);
  }
  
  private async extractFlavors(entities: Entity[], lang: string): Promise<ParsedFlavor[]> {
    const flavorPatterns = {
      ko: [
        /([가-힣]+)(?:의\s*)?(?:향|맛|느낌)/,
        /(산미|단맛|쓴맛|바디|향)/,
        /(초콜릿|베리|견과류|꽃|과일)/
      ],
      en: [
        /(chocolate|berry|nutty|floral|fruity)/i,
        /(bright|mild|strong|smooth|clean)/i,
        /(acidity|sweetness|body|finish|aroma)/i
      ]
    };
    
    const patterns = flavorPatterns[lang] || flavorPatterns.en;
    const flavors: ParsedFlavor[] = [];
    
    for (const entity of entities) {
      for (const pattern of patterns) {
        const matches = entity.text.match(pattern);
        if (matches) {
          const flavor = await this.categorizeFlavor(matches[1], lang);
          if (flavor) {
            flavors.push({
              text: matches[1],
              category: flavor.category,
              subcategory: flavor.subcategory,
              confidence: entity.confidence * 0.9,
              position: entity.position
            });
          }
        }
      }
    }
    
    return this.deduplicateFlavors(flavors);
  }
  
  private async categorizeFlavor(flavorText: string, lang: string): Promise<FlavorCategory | null> {
    // 향미 카테고리 매핑
    const flavorMap = await this.loadFlavorMapping(lang);
    return flavorMap.get(flavorText.toLowerCase()) || null;
  }
}
```

### AI 향미 매핑 시스템
```typescript
interface FlavorMappingService {
  // SCA 표준 향미 휠과 매핑
  mapToSCAWheel(flavor: string, language: string): Promise<SCAFlavorNode>;
  
  // 유사 향미 찾기
  findSimilarFlavors(flavor: string): Promise<SimilarFlavor[]>;
  
  // 향미 강도 추정
  estimateIntensity(context: string, flavor: string): Promise<number>;
  
  // 개인화 향미 매핑
  personalizeMapping(userId: string, flavor: string): Promise<PersonalizedFlavor>;
}

// SCA 향미 휠 노드
interface SCAFlavorNode {
  id: string;
  name: string;
  level: 1 | 2 | 3;              // 향미 휠 레벨
  parent?: string;               // 상위 카테고리
  children: string[];            // 하위 카테고리
  synonyms: string[];            // 동의어
  description: string;           // 설명
  examples: string[];            // 예시
}

// 유사 향미
interface SimilarFlavor {
  flavor: string;
  similarity: number;            // 유사도 (0-1)
  relationship: 'synonym' | 'related' | 'broader' | 'narrower';
}
```

---

## 📚 학습 도구 통합

### 용어 사전 (Glossary)
```typescript
interface FlavorGlossary {
  term: string;                  // 용어 ("bright acidity")
  category: string;              // 카테고리 ("sensory")
  definitions: {                 // 다국어 정의
    ko: string;
    en: string;
  };
  examples: string[];            // 사용 예시
  relatedTerms: string[];        // 관련 용어
  difficulty: 1 | 2 | 3;         // 난이도 (1: 초보자, 3: 전문가)
  frequency: number;             // 사용 빈도
  
  // 학습 도구
  pronunciation?: string;        // 발음 (영어)
  etymology?: string;           // 어원
  visualAids: string[];         // 시각 자료 URL
}

class GlossaryService {
  async getDefinition(term: string, userLevel: UserLevel): Promise<Definition> {
    const entry = await this.findGlossaryEntry(term);
    
    if (!entry) {
      // 동적 정의 생성 (AI)
      return await this.generateDefinition(term, userLevel);
    }
    
    // 사용자 레벨에 맞는 정의 반환
    return this.adaptDefinitionToLevel(entry, userLevel);
  }
  
  async suggestRelatedTerms(term: string): Promise<RelatedTerm[]> {
    // 의미적 유사도 기반 추천
    const embeddings = await this.getTermEmbeddings(term);
    return await this.findSimilarTerms(embeddings);
  }
  
  // 개인화된 학습 진도
  async trackLearningProgress(userId: string, term: string): Promise<void> {
    await this.updateVocabularyProgress(userId, {
      term,
      timestamp: Date.now(),
      context: 'roaster-notes',
      learned: true
    });
  }
}
```

### 인터랙티브 학습 UI
```typescript
const InteractiveGlossary: React.FC<{ term: string }> = ({ term }) => {
  const [definition, setDefinition] = useState<Definition | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  
  useEffect(() => {
    loadDefinition(term);
  }, [term]);
  
  return (
    <Modal visible={true} animationType="slide">
      <View style={styles.glossaryModal}>
        <Text style={styles.term}>{definition?.term}</Text>
        
        {/* 발음 재생 */}
        {definition?.pronunciation && (
          <TouchableOpacity onPress={() => playPronunciation(term)}>
            <Text style={styles.pronunciation}>🔊 {definition.pronunciation}</Text>
          </TouchableOpacity>
        )}
        
        {/* 정의 */}
        <Text style={styles.definition}>
          {definition?.definitions.ko}
        </Text>
        
        {/* 예시 토글 */}
        <TouchableOpacity onPress={() => setShowExamples(!showExamples)}>
          <Text style={styles.toggleButton}>
            {showExamples ? '예시 숨기기' : '예시 보기'} {showExamples ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
        
        {showExamples && (
          <View style={styles.examples}>
            {definition?.examples.map((example, index) => (
              <Text key={index} style={styles.example}>
                • {example}
              </Text>
            ))}
          </View>
        )}
        
        {/* 관련 용어 */}
        <ScrollView horizontal style={styles.relatedTerms}>
          {definition?.relatedTerms.map((related, index) => (
            <TouchableOpacity
              key={index}
              style={styles.relatedChip}
              onPress={() => navigateToTerm(related)}
            >
              <Text style={styles.relatedText}>{related}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* 학습 완료 버튼 */}
        <TouchableOpacity
          style={styles.learnedButton}
          onPress={() => markAsLearned(term)}
        >
          <Text style={styles.learnedButtonText}>
            ✓ 이 용어를 배웠어요
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
```

---

## 📱 다양한 입력 방식

### 1. 사진/OCR 입력
```typescript
class RoasterNotesOCR extends CoffeeOCRService {
  async extractRoasterNotes(imageUri: string): Promise<ExtractedNotes> {
    // 1. 이미지 전처리 (노트 영역 감지)
    const noteRegions = await this.detectTextRegions(imageUri);
    
    // 2. 텍스트 추출
    const extractedTexts = await Promise.all(
      noteRegions.map(region => this.extractTextFromRegion(region))
    );
    
    // 3. 노트 영역 분류
    const classifiedTexts = await this.classifyTextTypes(extractedTexts);
    
    // 4. 로스터 노트 식별
    const roasterNotes = classifiedTexts.filter(text => 
      text.type === 'tasting-notes' && text.confidence > 0.7
    );
    
    return {
      notes: roasterNotes,
      confidence: this.calculateOverallConfidence(roasterNotes),
      suggestions: await this.generateSuggestions(roasterNotes)
    };
  }
  
  private async classifyTextTypes(texts: ExtractedText[]): Promise<ClassifiedText[]> {
    // ML 모델로 텍스트 유형 분류
    const classifier = await this.loadTextClassifier();
    
    return await Promise.all(texts.map(async text => ({
      ...text,
      type: await classifier.classify(text.content),
      confidence: await classifier.getConfidence(text.content)
    })));
  }
}
```

### 2. 음성 입력
```typescript
class VoiceToRoasterNotes {
  async startVoiceRecording(): Promise<void> {
    // 음성 인식 시작
    await VoiceRecorder.start({
      language: 'ko-KR',
      partialResults: true,
      maxDuration: 120000  // 2분 제한
    });
    
    // 실시간 피드백
    VoiceRecorder.onPartialResult((result) => {
      this.updateTranscriptionPreview(result.text);
    });
    
    VoiceRecorder.onFinalResult((result) => {
      this.processVoiceInput(result.text);
    });
  }
  
  private async processVoiceInput(transcription: string): Promise<void> {
    // 1. 전사 결과 정제
    const cleanedText = await this.cleanTranscription(transcription);
    
    // 2. 테이스팅 노트 영역 추출
    const noteSegments = await this.extractNoteSegments(cleanedText);
    
    // 3. 구조화
    const structuredNotes = await this.structureNotes(noteSegments);
    
    // 4. 사용자에게 확인 요청
    this.showTranscriptionConfirmation(structuredNotes);
  }
  
  private async cleanTranscription(text: string): Promise<string> {
    // 음성 인식 특성상 나타나는 오류 수정
    const corrections = {
      '산미': ['삶의', '3미', '산미가'],
      '바디': ['바디가', '바닥', '바디감'],
      '향미': ['향이', '향기', '항미'],
      '초콜릿': ['초콜렛', '초콜', '초컬릿'],
      '베리': ['배리', '베리가', '베리류']
    };
    
    let corrected = text;
    Object.entries(corrections).forEach(([correct, variants]) => {
      variants.forEach(variant => {
        corrected = corrected.replace(new RegExp(variant, 'gi'), correct);
      });
    });
    
    return corrected;
  }
}
```

### 3. 스마트 붙여넣기
```typescript
class SmartPasteHandler {
  async processPastedText(text: string): Promise<ProcessedPaste> {
    // 1. 소스 감지
    const source = await this.detectSource(text);
    
    // 2. 형식 분석
    const format = this.analyzeFormat(text);
    
    // 3. 내용 추출
    const extracted = await this.extractContent(text, source, format);
    
    return {
      originalText: text,
      source,
      format,
      extractedNotes: extracted.notes,
      metadata: extracted.metadata,
      confidence: extracted.confidence
    };
  }
  
  private async detectSource(text: string): Promise<PasteSource> {
    const patterns = {
      website: /https?:\/\/[^\s]+/,
      instagram: /#[\w]+|@[\w]+/,
      newsletter: /newsletter|뉴스레터/i,
      packaging: /원산지|가공|로스팅/,
      review: /별점|평점|\d+점/
    };
    
    for (const [source, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return source as PasteSource;
      }
    }
    
    return 'unknown';
  }
}
```

---

## 🎯 개인화 기능

### 학습 진도 추적
```typescript
interface LearningProgress {
  userId: string;
  vocabulary: {
    totalTerms: number;
    learnedTerms: number;
    recentTerms: string[];
    weakTerms: string[];          // 자주 틀리는 용어
  };
  
  preferences: {
    preferredLanguage: 'ko' | 'en';
    showDefinitions: boolean;
    autoTranslate: boolean;
    difficultyLevel: 1 | 2 | 3;
  };
  
  usage: {
    inputMethods: {
      manual: number;
      ocr: number; 
      voice: number;
    };
    avgCompletionTime: number;
    skipRate: number;
  };
}

class PersonalizationService {
  async adaptUIToUser(userId: string): Promise<UIConfig> {
    const progress = await this.getLearningProgress(userId);
    
    return {
      // 초보자는 더 많은 도움말
      showHints: progress.vocabulary.learnedTerms < 10,
      
      // 숙련자는 고급 기능
      enableAdvancedParsing: progress.vocabulary.learnedTerms > 50,
      
      // 선호하는 입력 방식 우선 표시
      primaryInputMethod: this.getPrimaryInputMethod(progress.usage.inputMethods),
      
      // 개인화된 용어집
      personalizedGlossary: await this.getPersonalizedTerms(userId)
    };
  }
  
  async generatePersonalizedSuggestions(
    userId: string, 
    currentText: string
  ): Promise<Suggestion[]> {
    const progress = await this.getLearningProgress(userId);
    const parsed = await this.parseNotes(currentText);
    
    const suggestions = [];
    
    // 놓친 향미 제안
    if (parsed.flavors.length < 3) {
      suggestions.push({
        type: 'flavor-suggestion',
        text: '더 구체적인 향미를 추가해보세요',
        examples: this.getFlavorSuggestions(progress.vocabulary.recentTerms)
      });
    }
    
    // 새로운 용어 학습 기회
    const newTerms = this.findNewTerms(parsed.terms, progress.vocabulary.learnedTerms);
    if (newTerms.length > 0) {
      suggestions.push({
        type: 'learning-opportunity',
        text: `새로운 용어를 발견했어요: ${newTerms.join(', ')}`,
        action: 'show-definitions'
      });
    }
    
    return suggestions;
  }
}
```

---

## 🧪 테스트 전략

### 파싱 엔진 테스트
```typescript
describe('RoasterNotesParser', () => {
  test('한국어 향미 추출', async () => {
    const koreanNote = "밝은 산미와 초콜릿의 단맛이 조화로운 미디엄 로스트";
    const parsed = await parser.parseNotes(koreanNote, 'ko');
    
    expect(parsed.flavors).toContainEqual(
      expect.objectContaining({
        text: '산미',
        category: 'acidity',
        confidence: expect.numberMatching(n => n > 0.8)
      })
    );
    
    expect(parsed.flavors).toContainEqual(
      expect.objectContaining({
        text: '초콜릿',
        category: 'chocolate'
      })
    );
  });
  
  test('영어 향미 추출', async () => {
    const englishNote = "Bright acidity with notes of berry and chocolate sweetness";
    const parsed = await parser.parseNotes(englishNote, 'en');
    
    expect(parsed.flavors).toHaveLength(3);
    expect(parsed.descriptors).toContain(
      expect.objectContaining({
        text: 'bright',
        type: DescriptorType.INTENSITY
      })
    );
  });
  
  test('복합 언어 처리', async () => {
    const mixedNote = "Ethiopia Yirgacheffe - 꽃향과 bright acidity";
    const parsed = await parser.parseNotes(mixedNote, 'auto');
    
    expect(parsed.parsedInfo.origin).toBe('Ethiopia');
    expect(parsed.flavors.map(f => f.text)).toContain('꽃향');
  });
});
```

### UI 상호작용 테스트
```typescript
describe('RoasterNotesScreen', () => {
  test('텍스트 입력 및 파싱', async () => {
    const { getByTestId } = render(<RoasterNotesStep />);
    const textInput = getByTestId('notes-input');
    
    fireEvent.changeText(textInput, '산미가 밝고 초콜릿 향이 나요');
    
    await waitFor(() => {
      expect(getByTestId('parsed-flavors')).toBeVisible();
    });
    
    expect(getByTestId('flavor-chip-산미')).toBeVisible();
    expect(getByTestId('flavor-chip-초콜릿')).toBeVisible();
  });
  
  test('용어 사전 호출', async () => {
    const { getByTestId, getByText } = render(<RoasterNotesStep />);
    
    fireEvent.changeText(getByTestId('notes-input'), '산미');
    await waitFor(() => {
      expect(getByTestId('highlighted-term-산미')).toBeVisible();
    });
    
    fireEvent.press(getByTestId('highlighted-term-산미'));
    await waitFor(() => {
      expect(getByText('산미의 정의')).toBeVisible();
    });
  });
});
```

---

## 📊 성공 지표

### 핵심 KPI
- **단계 완료율**: 70% (목표, 선택 단계이므로)
- **평균 입력 시간**: < 5분
- **파싱 정확도**: > 85% (향미 추출)
- **용어 학습률**: 단계당 평균 2개 새 용어
- **건너뛰기율**: < 40% (너무 높으면 단계 개선 필요)

### 학습 효과 측정
```typescript
const learningMetrics = {
  vocabularyGrowth: {
    newTermsPerSession: number,      // 세션당 새 용어 수
    retentionRate: number,           // 용어 기억률 (7일 후)
    usageInPersonalNotes: number     // 개인 노트에서 재사용률
  },
  
  engagementMetrics: {
    definitionViews: number,         // 정의 조회 수
    relatedTermClicks: number,       // 관련 용어 클릭 수
    personalizedSuggestionUse: number // 개인화 제안 사용률
  },
  
  efficiencyMetrics: {
    inputMethodDistribution: {       // 입력 방식 선호도
      manual: number,
      ocr: number,
      voice: number,
      paste: number
    },
    editRate: number,               // 파싱 결과 수정률
    satisfactionScore: number       // 파싱 결과 만족도
  }
};
```

---

## 🚀 향후 개선 계획

### Phase 1 (현재)
- ✅ 기본 텍스트 입력 및 파싱
- ✅ 간단한 향미 추출
- 🔧 용어 사전 기본 기능
- 🔧 OCR 지원

### Phase 2 (3개월)
- 🔄 AI 파싱 엔진 고도화
- 🔄 실시간 번역 기능
- 🔄 음성 입력 지원
- 🔄 커뮤니티 크라우드소싱 데이터

### Phase 3 (6개월)
- 🔄 개인화된 학습 추천
- 🔄 로스터별 노트 스타일 분석
- 🔄 AR 기반 실시간 번역
- 🔄 전문가 검증 시스템

---

이 문서는 Roaster Notes 단계의 완전한 구현 가이드입니다. 단순한 텍스트 입력을 넘어서 학습 도구이자 개인 성장의 기록이 되도록 설계되었습니다.