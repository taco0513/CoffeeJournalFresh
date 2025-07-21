# 🍃 Cafe Mode - Step 4: Sensory Evaluation 상세 명세서

## 개요

Sensory Evaluation은 Cafe Mode TastingFlow의 **네 번째 단계**로, 향미 외의 감각적 특성(바디, 산미, 단맛, 마무리감)을 평가하는 **선택적 단계**입니다. 사용자 레벨에 따라 단순한 프리셋부터 세밀한 조정까지 다양한 인터페이스를 제공합니다.

> **MVP 우선순위**: P1 (Important) - 개인 감각 발달에 중요한 기능

---

## 🎯 설계 목표

### 핵심 원칙
- **직관성**: 전문 용어 없이도 감각을 표현할 수 있는 방법
- **점진성**: 초보자부터 중급자까지 자연스러운 발전
- **선택성**: 부담 없이 건너뛸 수 있는 옵션
- **감각성**: 추상적 감각을 구체적으로 표현하는 도구

### 사용자 목표
- ✅ 자신만의 감각 표현 방법 발견
- ✅ 커피의 바디감, 산미 등 이해
- ✅ 점진적인 감각 어휘 학습
- ✅ 개인 감각 패턴 구축

---

## 📋 데이터 구조

### 기본 인터페이스
```typescript
interface SensoryEvaluation {
  // 사용자 레벨별 평가 방식
  userLevel: 'beginner' | 'intermediate';
  evaluationMethod: 'preset' | 'detailed';
  
  // 기본 감각 속성
  sensoryAttributes: {
    body?: SensoryAttribute;          // 바디감
    acidity?: SensoryAttribute;       // 산미
    sweetness?: SensoryAttribute;     // 단맛
    finish?: SensoryAttribute;        // 마무리감
    balance?: SensoryAttribute;       // 전체적 밸런스
  };
  
  // 초보자용 프리셋 (선택적)
  overallPreset?: SensoryPreset;
  
  // 개인적 감각 메모
  personalNotes: {
    mouthfeel: string;                // 입안 느낌 자유 서술
    temperature: 'hot' | 'warm' | 'cool';  // 마실 때 온도
    overallImpression: string;        // 전체적 인상
  };
  
  // 비교 기준
  comparisonPoints: {
    similarCoffees: string[];         // 비슷한 커피 경험
    contrastingCoffees: string[];     // 대조적인 커피 경험
  };
  
  // 메타데이터
  evaluationTime: number;             // 평가 소요 시간
  confidence: number;                 // 평가 확신도 (1-5)
  skipReason?: string;                // 건너뛴 이유
}

// 감각 속성 공통 구조
interface SensoryAttribute {
  value: number;                      // 수치 값 (1-5 or 1-10)
  confidence: number;                 // 확신도 (1-5)
  personalDescription?: string;       // 개인적 표현
  comparisonNote?: string;            // 비교 메모
}

// 초보자용 프리셋
enum SensoryPreset {
  LIGHT = 'light',           // 가볍고 깔끔한 느낌
  MEDIUM = 'medium',         // 균형잡힌 중간 느낌
  FULL = 'full',            // 진하고 묵직한 느낌
  BRIGHT = 'bright',        // 밝고 상큼한 느낌
  SMOOTH = 'smooth'         // 부드럽고 고운 느낌
}

// 온도별 감각 변화 추적
interface TemperatureEvolution {
  hotTaste: SensorySnapshot;          // 뜨거울 때 감각
  warmTaste: SensorySnapshot;         // 따뜻할 때 감각
  coolTaste?: SensorySnapshot;        // 식었을 때 감각 (선택)
}

interface SensorySnapshot {
  timestamp: number;
  temperature: number;                // 추정 온도
  dominant_sensation: string;         // 주요 감각
  notes: string;                     // 메모
}
```

---

## 🎨 사용자 레벨별 인터페이스

### 🌱 초보자 (Beginner) 모드

#### 화면 구성
```
┌─────────────────────────────┐
│ ← [뒤로]   감각 평가   [건너뛰기] │
├─────────────────────────────┤
│                           │
│  👅 입안의 느낌은 어떠셨나요?     │
│                           │
│  💡 커피를 입에 넣었을 때의      │
│     전체적인 느낌을 선택해주세요    │
│                           │
│  ┌─────────────────────────┐ │
│  │      ☁️ 가벼운 느낌      │ │
│  │   Light & Clean       │ │
│  │  상쾌하고 깔끔한 맛        │ │
│  └─────────────────────────┘ │
│                           │
│  ┌─────────────────────────┐ │
│  │      ⚖️ 균형잡힌 느낌     │ │
│  │    Medium & Balanced   │ │
│  │  적당하고 조화로운 맛       │ │
│  └─────────────────────────┘ │
│                           │
│  ┌─────────────────────────┐ │
│  │      🏋️ 진한 느낌        │ │
│  │     Full & Rich       │ │
│  │   깊고 묵직한 맛          │ │
│  └─────────────────────────┘ │
│                           │
│  ✨ 더 자세히 표현하기 [▼]     │
│                           │
│  [건너뛰기]    [다음 단계 →] │
└─────────────────────────────┘
```

#### 확장 옵션 (토글)
```
✨ 더 자세히 표현하기 [▲]
├─ 🌟 특별한 느낌이 있었나요?
│  [톡 쏘는 느낌] [달콤한 느낌] [쌉싸름한 느낌]
├─ 🌡️ 마실 때 온도는?
│  [뜨거울 때] [따뜻할 때] [식었을 때]
└─ 💭 한 마디로 표현하면?
   [________________]
```

#### 기술 구현
```typescript
const BeginnerSensoryEvaluation: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<SensoryPreset | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState({
    specialFeeling: [] as string[],
    temperature: null as string | null,
    oneWordDescription: ''
  });
  
  const presetOptions = [
    {
      id: SensoryPreset.LIGHT,
      title: '가벼운 느낌',
      subtitle: 'Light & Clean',
      description: '상쾌하고 깔끔한 맛',
      icon: '☁️',
      color: '#E3F2FD'
    },
    {
      id: SensoryPreset.MEDIUM,
      title: '균형잡힌 느낌',
      subtitle: 'Medium & Balanced',
      description: '적당하고 조화로운 맛',
      icon: '⚖️',
      color: '#FFF3E0'
    },
    {
      id: SensoryPreset.FULL,
      title: '진한 느낌',
      subtitle: 'Full & Rich',
      description: '깊고 묵직한 맛',
      icon: '🏋️',
      color: '#EFEBE9'
    }
  ];
  
  const specialFeelings = [
    { id: 'tangy', name: '톡 쏘는 느낌', description: '산미가 느껴져요' },
    { id: 'sweet', name: '달콤한 느낌', description: '은은한 단맛이 나요' },
    { id: 'bitter', name: '쌉싸름한 느낌', description: '적당한 쓴맛이 있어요' },
    { id: 'smooth', name: '부드러운 느낌', description: '목 넘김이 부드러워요' },
    { id: 'strong', name: '강한 느낌', description: '임팩트가 강해요' }
  ];
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👅 입안의 느낌은 어떠셨나요?</Text>
        <Text style={styles.subtitle}>
          커피를 입에 넣었을 때의 전체적인 느낌을 선택해주세요
        </Text>
      </View>
      
      <View style={styles.presetOptions}>
        {presetOptions.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isSelected={selectedPreset === preset.id}
            onPress={() => {
              setSelectedPreset(preset.id);
              HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Medium);
            }}
          />
        ))}
      </View>
      
      {/* 확장 옵션 토글 */}
      <TouchableOpacity 
        style={styles.advancedToggle}
        onPress={() => setShowAdvanced(!showAdvanced)}
      >
        <Text style={styles.advancedToggleText}>
          ✨ 더 자세히 표현하기 {showAdvanced ? '[▲]' : '[▼]'}
        </Text>
      </TouchableOpacity>
      
      {/* 고급 옵션 */}
      {showAdvanced && (
        <Animated.View 
          style={styles.advancedSection}
          entering={SlideInDown.duration(300)}
        >
          {/* 특별한 느낌 */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>🌟 특별한 느낌이 있었나요?</Text>
            <View style={styles.chipContainer}>
              {specialFeelings.map((feeling) => (
                <ToggleChip
                  key={feeling.id}
                  label={feeling.name}
                  isSelected={additionalNotes.specialFeeling.includes(feeling.id)}
                  onPress={() => toggleSpecialFeeling(feeling.id)}
                />
              ))}
            </View>
          </View>
          
          {/* 온도별 경험 */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>🌡️ 마실 때 온도는?</Text>
            <View style={styles.temperatureOptions}>
              {['뜨거울 때', '따뜻할 때', '식었을 때'].map((temp) => (
                <RadioOption
                  key={temp}
                  label={temp}
                  isSelected={additionalNotes.temperature === temp}
                  onPress={() => setAdditionalNotes(prev => ({ ...prev, temperature: temp }))}
                />
              ))}
            </View>
          </View>
          
          {/* 한 마디 표현 */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>💭 한 마디로 표현하면?</Text>
            <TextInput
              style={styles.oneWordInput}
              placeholder="예: 부드러워요, 진해요, 상큼해요"
              value={additionalNotes.oneWordDescription}
              onChangeText={(text) => setAdditionalNotes(prev => ({ ...prev, oneWordDescription: text }))}
              maxLength={20}
            />
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
};
```

### 🌿 중급자 (Intermediate) 모드

#### 화면 구성
```
┌─────────────────────────────┐
│ ← [뒤로]   감각 평가   [건너뛰기] │
├─────────────────────────────┤
│                           │
│  🎯 세부 감각 평가            │
│                           │
│  💪 바디감 (Body)            │
│  ●────●────○────○────○ (2.5/5) │
│  가벼움     보통     진함      │
│                           │
│  🍋 산미 (Acidity)           │
│  ○────○────●────○────○ (3/5) │
│  없음      보통     강함      │
│                           │
│  🍯 단맛 (Sweetness)         │
│  ○────○────○────●────○ (4/5) │
│  없음      보통     달콤      │
│                           │
│  ✨ 마무리감 (Finish)         │
│  ○────○────●────○────○ (3/5) │
│  짧음      보통     길고깊음   │
│                           │
│  ⚖️ 전체 밸런스               │
│  [조화로움 ●] [한쪽으로 치우침 ○] │
│                           │
│  📝 감각 메모:               │
│  [처음엔 신맛이 강했는데...]    │
│                           │
│  🌡️ 온도별 변화 추적 [+]      │
│                           │
│  [다시 평가]    [다음 단계 →] │
└─────────────────────────────┘
```

#### 온도별 변화 추적 (확장)
```
🌡️ 온도별 변화 추적 [▲]
├─ ♨️ 뜨거울 때 (80°C+)
│  주요 감각: 쓴맛과 향이 강함
│  메모: 첫인상은 진하고...
├─ 🌤️ 따뜻할 때 (60-70°C)  
│  주요 감각: 단맛이 올라옴
│  메모: 균형이 더 좋아짐
└─ ❄️ 식었을 때 (40-50°C)
   주요 감각: 산미가 뚜렷해짐
   메모: 다른 커피 같음
```

#### 기술 구현
```typescript
const IntermediateSensoryEvaluation: React.FC = () => {
  const [sensoryScores, setSensoryScores] = useState({
    body: { value: 3, confidence: 3 },
    acidity: { value: 3, confidence: 3 },
    sweetness: { value: 3, confidence: 3 },
    finish: { value: 3, confidence: 3 },
    balance: { value: 3, confidence: 3 }
  });
  
  const [personalNotes, setPersonalNotes] = useState({
    mouthfeel: '',
    overallImpression: '',
    temperature: 'hot' as const
  });
  
  const [temperatureTracking, setTemperatureTracking] = useState<TemperatureEvolution>({
    hotTaste: { timestamp: Date.now(), temperature: 80, dominant_sensation: '', notes: '' }
  });
  
  const [showTemperatureTracking, setShowTemperatureTracking] = useState(false);
  
  const sensoryAttributes = [
    {
      key: 'body',
      title: '바디감',
      subtitle: 'Body',
      icon: '💪',
      scale: ['가벼움', '보통', '진함'],
      descriptions: {
        1: '물처럼 가벼운 느낌',
        2: '약간 가벼운 느낌', 
        3: '적당한 무게감',
        4: '묵직한 느낌',
        5: '매우 진한 느낌'
      }
    },
    {
      key: 'acidity',
      title: '산미',
      subtitle: 'Acidity',
      icon: '🍋',
      scale: ['없음', '보통', '강함'],
      descriptions: {
        1: '산미가 거의 없음',
        2: '은은한 산미',
        3: '적당한 산미',
        4: '뚜렷한 산미',
        5: '강한 산미'
      }
    },
    {
      key: 'sweetness',
      title: '단맛',
      subtitle: 'Sweetness',
      icon: '🍯',
      scale: ['없음', '보통', '달콤'],
      descriptions: {
        1: '단맛이 없음',
        2: '약간의 단맛',
        3: '적당한 단맛',
        4: '뚜렷한 단맛',
        5: '매우 달콤함'
      }
    },
    {
      key: 'finish',
      title: '마무리감',
      subtitle: 'Finish',
      icon: '✨',
      scale: ['짧음', '보통', '길고깊음'],
      descriptions: {
        1: '금세 사라짐',
        2: '짧은 여운',
        3: '적당한 여운',
        4: '긴 여운',
        5: '매우 긴 여운'
      }
    }
  ];
  
  const handleScoreChange = (attribute: string, value: number) => {
    setSensoryScores(prev => ({
      ...prev,
      [attribute]: { ...prev[attribute], value }
    }));
    
    // 실시간 피드백
    showScoreTooltip(attribute, value);
  };
  
  const addTemperatureSnapshot = (temperature: 'warm' | 'cool') => {
    const snapshot: SensorySnapshot = {
      timestamp: Date.now(),
      temperature: temperature === 'warm' ? 65 : 45,
      dominant_sensation: '',
      notes: ''
    };
    
    setTemperatureTracking(prev => ({
      ...prev,
      [temperature === 'warm' ? 'warmTaste' : 'coolTaste']: snapshot
    }));
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 세부 감각 평가</Text>
        <Text style={styles.subtitle}>
          각 감각을 천천히 느껴보며 평가해주세요
        </Text>
      </View>
      
      {/* 감각 속성별 평가 */}
      {sensoryAttributes.map((attribute) => (
        <View key={attribute.key} style={styles.attributeSection}>
          <View style={styles.attributeHeader}>
            <Text style={styles.attributeIcon}>{attribute.icon}</Text>
            <View>
              <Text style={styles.attributeTitle}>{attribute.title}</Text>
              <Text style={styles.attributeSubtitle}>({attribute.subtitle})</Text>
            </View>
          </View>
          
          <SensorySlider
            value={sensoryScores[attribute.key].value}
            onValueChange={(value) => handleScoreChange(attribute.key, value)}
            scale={attribute.scale}
            descriptions={attribute.descriptions}
          />
          
          <ConfidenceIndicator
            confidence={sensoryScores[attribute.key].confidence}
            onConfidenceChange={(confidence) => 
              setSensoryScores(prev => ({
                ...prev,
                [attribute.key]: { ...prev[attribute.key], confidence }
              }))
            }
          />
        </View>
      ))}
      
      {/* 전체 밸런스 */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceTitle}>⚖️ 전체 밸런스</Text>
        <View style={styles.balanceOptions}>
          <RadioButton
            label="조화로움"
            isSelected={sensoryScores.balance.value >= 4}
            onPress={() => setSensoryScores(prev => ({ ...prev, balance: { value: 4, confidence: 3 }}))}
          />
          <RadioButton
            label="한쪽으로 치우침"
            isSelected={sensoryScores.balance.value < 4}
            onPress={() => setSensoryScores(prev => ({ ...prev, balance: { value: 2, confidence: 3 }}))}
          />
        </View>
      </View>
      
      {/* 개인 메모 */}
      <View style={styles.notesSection}>
        <Text style={styles.notesTitle}>📝 감각 메모</Text>
        <TextInput
          style={styles.notesInput}
          multiline
          placeholder="처음 느낌은... 시간이 지나면서..."
          value={personalNotes.mouthfeel}
          onChangeText={(text) => setPersonalNotes(prev => ({ ...prev, mouthfeel: text }))}
          maxLength={200}
        />
      </View>
      
      {/* 온도별 변화 추적 */}
      <View style={styles.temperatureSection}>
        <TouchableOpacity 
          style={styles.temperatureToggle}
          onPress={() => setShowTemperatureTracking(!showTemperatureTracking)}
        >
          <Text style={styles.temperatureToggleText}>
            🌡️ 온도별 변화 추적 {showTemperatureTracking ? '[▲]' : '[+]'}
          </Text>
        </TouchableOpacity>
        
        {showTemperatureTracking && (
          <TemperatureTracker
            evolution={temperatureTracking}
            onSnapshotAdd={addTemperatureSnapshot}
            onSnapshotUpdate={updateTemperatureSnapshot}
          />
        )}
      </View>
    </ScrollView>
  );
};
```

---

## 🧠 지능형 분석 기능

### 1. 감각 패턴 분석기
```typescript
class SensoryPatternAnalyzer {
  analyzeSensoryProfile(evaluation: SensoryEvaluation): SensoryAnalysis {
    const profile = this.buildSensoryProfile(evaluation);
    const patterns = this.detectPatterns(profile);
    const insights = this.generateInsights(patterns);
    
    return {
      profile,
      patterns,
      insights,
      recommendations: this.generateRecommendations(patterns)
    };
  }
  
  private buildSensoryProfile(evaluation: SensoryEvaluation): SensoryProfile {
    const { sensoryAttributes } = evaluation;
    
    // 감각 프로파일 구축
    const profile: SensoryProfile = {
      bodyScore: sensoryAttributes.body?.value || 0,
      acidityScore: sensoryAttributes.acidity?.value || 0,
      sweetnessScore: sensoryAttributes.sweetness?.value || 0,
      finishScore: sensoryAttributes.finish?.value || 0,
      balanceScore: sensoryAttributes.balance?.value || 0,
      
      // 프로파일 특성 계산
      characteristics: this.calculateCharacteristics(sensoryAttributes),
      dominantFeatures: this.identifyDominantFeatures(sensoryAttributes),
      balanceType: this.classifyBalanceType(sensoryAttributes)
    };
    
    return profile;
  }
  
  private detectPatterns(profile: SensoryProfile): SensoryPattern[] {
    const patterns: SensoryPattern[] = [];
    
    // 밸런스 패턴 감지
    if (profile.balanceScore >= 4) {
      patterns.push({
        type: 'balanced',
        confidence: 0.8,
        description: '전체적으로 조화로운 밸런스',
        characteristics: ['harmonious', 'well-rounded']
      });
    }
    
    // 지배적 특성 패턴
    if (profile.acidityScore >= 4) {
      patterns.push({
        type: 'acidity-forward',
        confidence: 0.9,
        description: '산미가 주도하는 프로파일',
        characteristics: ['bright', 'lively', 'crisp']
      });
    }
    
    if (profile.bodyScore >= 4 && profile.sweetnessScore >= 4) {
      patterns.push({
        type: 'rich-sweet',
        confidence: 0.85,
        description: '진하고 달콤한 프로파일',
        characteristics: ['rich', 'sweet', 'full-bodied']
      });
    }
    
    // 온도별 변화 패턴
    if (this.hasTemperatureEvolution(profile)) {
      patterns.push({
        type: 'temperature-evolution',
        confidence: 0.7,
        description: '온도 변화에 따른 감각 진화',
        characteristics: ['complex', 'evolving', 'temperature-sensitive']
      });
    }
    
    return patterns;
  }
  
  private generateInsights(patterns: SensoryPattern[]): SensoryInsight[] {
    const insights: SensoryInsight[] = [];
    
    for (const pattern of patterns) {
      switch (pattern.type) {
        case 'balanced':
          insights.push({
            category: 'strength',
            message: '이 커피는 어느 한 쪽으로 치우치지 않은 균형잡힌 맛이에요! 🎯',
            explanation: '산미, 단맛, 바디감이 조화롭게 어우러져 있어서 편안하게 마실 수 있어요.',
            personalGrowth: '밸런스가 좋은 커피를 선호하시는군요!'
          });
          break;
          
        case 'acidity-forward':
          insights.push({
            category: 'characteristic',
            message: '산미를 좋아하시는 분이시네요! 🍋',
            explanation: '밝고 생생한 산미가 이 커피의 매력 포인트예요.',
            personalGrowth: '산미 있는 커피에 대한 감각이 발달하고 있어요!'
          });
          break;
          
        case 'rich-sweet':
          insights.push({
            category: 'preference',
            message: '진하고 달콤한 커피를 즐기시는군요! 🍫',
            explanation: '묵직한 바디감과 달콤한 맛이 조화를 이루고 있어요.',
            personalGrowth: '복합적인 단맛을 구분할 수 있는 감각을 키워가고 계세요!'
          });
          break;
      }
    }
    
    return insights;
  }
}
```

### 2. 개인화 학습 시스템
```typescript
interface SensoryLearningTracker {
  // 감각 발달 추적
  sensoryDevelopment: {
    consistencyImprovement: number;      // 일관성 향상도
    vocabularyExpansion: number;         // 감각 어휘 확장
    confidenceGrowth: number;           // 확신도 성장
    specializationArea: string;         // 특화 감각 영역
  };
  
  // 개인 선호 패턴
  personalPreferences: {
    favoriteProfiles: SensoryProfile[];  // 선호 프로파일
    avoidancePatterns: SensoryProfile[]; // 기피 프로파일
    explorationAreas: string[];         // 탐험할 영역
  };
  
  // 성장 마일스톤
  milestones: {
    firstDetailedEvaluation: Date;      // 첫 상세 평가
    consistentEvaluator: Date;          // 일관된 평가자
    sensoryExpert: Date;               // 감각 전문가
  };
}

class SensoryLearningService {
  async trackUserProgress(
    userId: string,
    evaluation: SensoryEvaluation
  ): Promise<void> {
    
    const previousEvaluations = await this.getUserSensoryHistory(userId);
    const consistency = this.calculateConsistency(previousEvaluations, evaluation);
    const newVocabulary = this.detectNewSensoryVocabulary(evaluation, previousEvaluations);
    
    // 진전 상황 업데이트
    await this.updateLearningProgress(userId, {
      consistency,
      newVocabulary,
      evaluationQuality: this.assessEvaluationQuality(evaluation)
    });
    
    // 레벨업 체크
    const levelUpCheck = await this.checkSensoryLevelUp(userId);
    if (levelUpCheck.canLevelUp) {
      await this.triggerSensoryLevelUp(userId, levelUpCheck.newCapabilities);
    }
  }
  
  private calculateConsistency(
    history: SensoryEvaluation[],
    current: SensoryEvaluation
  ): number {
    
    if (history.length < 3) return 0.5; // 초기값
    
    // 비슷한 커피들과의 일관성 측정
    const similarCoffees = history.filter(prev => 
      this.areSimilarCoffees(prev.coffeeInfo, current.coffeeInfo)
    );
    
    if (similarCoffees.length === 0) return 0.5;
    
    // 감각 점수 편차 계산
    let totalDeviation = 0;
    const attributes = ['body', 'acidity', 'sweetness', 'finish'];
    
    for (const attr of attributes) {
      const currentScore = current.sensoryAttributes[attr]?.value || 0;
      const historicalScores = similarCoffees.map(coffee => 
        coffee.sensoryAttributes[attr]?.value || 0
      );
      
      const avgHistorical = historicalScores.reduce((a, b) => a + b, 0) / historicalScores.length;
      const deviation = Math.abs(currentScore - avgHistorical);
      totalDeviation += deviation;
    }
    
    // 일관성 점수 (0-1)
    const maxDeviation = attributes.length * 5; // 최대 편차
    return Math.max(0, 1 - (totalDeviation / maxDeviation));
  }
  
  async generatePersonalizedGuidance(
    userId: string,
    currentEvaluation: SensoryEvaluation
  ): Promise<PersonalizedGuidance> {
    
    const userProfile = await this.getUserSensoryProfile(userId);
    const guidance: PersonalizedGuidance = {
      strengths: [],
      improvementAreas: [],
      nextChallenges: [],
      encouragements: []
    };
    
    // 강점 분석
    if (userProfile.consistencyScore > 0.8) {
      guidance.strengths.push({
        area: 'consistency',
        message: '일관된 평가를 하시는 분이시네요! 👏',
        details: '비슷한 커피에 대해 일관된 감각을 보여주고 있어요.'
      });
    }
    
    if (userProfile.vocabularySize > 20) {
      guidance.strengths.push({
        area: 'vocabulary',
        message: '풍부한 감각 표현을 구사하세요! 📚',
        details: `${userProfile.vocabularySize}개의 감각 용어를 사용하고 계시는군요!`
      });
    }
    
    // 개선 영역 제안
    if (userProfile.confidenceLevel < 0.6) {
      guidance.improvementAreas.push({
        area: 'confidence',
        message: '조금 더 확신을 가져도 좋을 것 같아요',
        suggestions: [
          '같은 커피를 여러 번 마시면서 일관성을 확인해보세요',
          '감각에 집중하는 시간을 늘려보세요',
          '다른 사람의 평가와 비교해보는 것도 도움이 돼요'
        ]
      });
    }
    
    // 다음 도전 과제
    if (userProfile.currentLevel === 'intermediate' && userProfile.accuracyScore > 0.8) {
      guidance.nextChallenges.push({
        challenge: 'temperature-tracking',
        title: '온도별 변화 감지하기',
        description: '같은 커피를 온도별로 마시면서 변화를 관찰해보세요',
        reward: '온도 마스터 배지'
      });
    }
    
    return guidance;
  }
}
```

---

## 🎨 UI 컴포넌트 명세

### SensorySlider 컴포넌트
```typescript
interface SensorySliderProps {
  value: number;
  onValueChange: (value: number) => void;
  scale: string[];
  descriptions: { [key: number]: string };
  max?: number;
}

const SensorySlider: React.FC<SensorySliderProps> = ({
  value,
  onValueChange,
  scale,
  descriptions,
  max = 5
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <View style={styles.sliderContainer}>
      {/* 스케일 라벨 */}
      <View style={styles.scaleLabels}>
        {scale.map((label, index) => (
          <Text 
            key={index} 
            style={[
              styles.scaleLabel,
              Math.round(value) === index + 1 && styles.activeScaleLabel
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
      
      {/* 슬라이더 */}
      <View style={styles.sliderWrapper}>
        <Slider
          style={styles.slider}
          value={value}
          onValueChange={(newValue) => {
            onValueChange(newValue);
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 2000);
          }}
          minimumValue={1}
          maximumValue={max}
          step={0.5}
          thumbStyle={styles.thumb}
          trackStyle={styles.track}
          minimumTrackTintColor="#6B4E3D"
          maximumTrackTintColor="#E5E5E5"
        />
        
        {/* 점수 표시 */}
        <Text style={styles.scoreDisplay}>{value.toFixed(1)}/5</Text>
      </View>
      
      {/* 설명 툴팁 */}
      {showTooltip && (
        <Animated.View 
          style={styles.tooltip}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        >
          <Text style={styles.tooltipText}>
            {descriptions[Math.round(value)] || ''}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};
```

### TemperatureTracker 컴포넌트
```typescript
const TemperatureTracker: React.FC<{
  evolution: TemperatureEvolution;
  onSnapshotAdd: (temp: 'warm' | 'cool') => void;
  onSnapshotUpdate: (temp: 'hot' | 'warm' | 'cool', data: Partial<SensorySnapshot>) => void;
}> = ({ evolution, onSnapshotAdd, onSnapshotUpdate }) => {
  
  return (
    <View style={styles.temperatureTracker}>
      {/* 뜨거울 때 */}
      <TemperatureSnapshot
        title="♨️ 뜨거울 때 (80°C+)"
        snapshot={evolution.hotTaste}
        onUpdate={(data) => onSnapshotUpdate('hot', data)}
        isRequired
      />
      
      {/* 따뜻할 때 */}
      {evolution.warmTaste ? (
        <TemperatureSnapshot
          title="🌤️ 따뜻할 때 (60-70°C)"
          snapshot={evolution.warmTaste}
          onUpdate={(data) => onSnapshotUpdate('warm', data)}
        />
      ) : (
        <TouchableOpacity 
          style={styles.addSnapshotButton}
          onPress={() => onSnapshotAdd('warm')}
        >
          <Text style={styles.addSnapshotText}>+ 따뜻할 때 기록하기</Text>
        </TouchableOpacity>
      )}
      
      {/* 식었을 때 */}
      {evolution.coolTaste ? (
        <TemperatureSnapshot
          title="❄️ 식었을 때 (40-50°C)"
          snapshot={evolution.coolTaste}
          onUpdate={(data) => onSnapshotUpdate('cool', data)}
        />
      ) : (
        evolution.warmTaste && (
          <TouchableOpacity 
            style={styles.addSnapshotButton}
            onPress={() => onSnapshotAdd('cool')}
          >
            <Text style={styles.addSnapshotText}>+ 식었을 때 기록하기</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
};
```

---

## 🧪 테스트 전략

### 감각 평가 정확성 테스트
```typescript
describe('SensoryEvaluation Accuracy', () => {
  test('초보자 프리셋 선택', () => {
    const { getByTestId } = render(<BeginnerSensoryEvaluation />);
    
    fireEvent.press(getByTestId('preset-light'));
    expect(getByTestId('preset-light')).toHaveStyle({ selected: true });
    
    // 다른 프리셋으로 변경
    fireEvent.press(getByTestId('preset-medium'));
    expect(getByTestId('preset-light')).toHaveStyle({ selected: false });
    expect(getByTestId('preset-medium')).toHaveStyle({ selected: true });
  });
  
  test('중급자 슬라이더 조작', () => {
    const { getByTestId } = render(<IntermediateSensoryEvaluation />);
    const bodySlider = getByTestId('slider-body');
    
    fireEvent(bodySlider, 'onValueChange', 4.5);
    expect(getByTestId('score-display-body')).toHaveTextContent('4.5/5');
  });
  
  test('온도별 변화 추적', async () => {
    const { getByTestId, queryByTestId } = render(<IntermediateSensoryEvaluation />);
    
    // 온도 추적 토글
    fireEvent.press(getByTestId('temperature-toggle'));
    expect(getByTestId('temperature-tracker')).toBeVisible();
    
    // 따뜻할 때 스냅샷 추가
    fireEvent.press(getByTestId('add-warm-snapshot'));
    await waitFor(() => {
      expect(getByTestId('warm-snapshot')).toBeVisible();
    });
  });
});
```

---

## 📊 성공 지표

### 핵심 KPI
- **완료율**: > 60% (선택 단계이므로 비교적 낮은 목표)
- **평균 평가 시간**: < 5분 (초보자), < 8분 (중급자)
- **확신도 점수**: > 3.5/5 (평균)
- **온도 추적 사용률**: > 30% (중급자)
- **개인 메모 작성률**: > 40%

### 학습 효과 측정
```typescript
const sensoryLearningMetrics = {
  skillDevelopment: {
    consistencyImprovement: number,      // 일관성 향상률
    vocabularyGrowth: number,            // 감각 어휘 증가율
    evaluationSpeed: number,             // 평가 속도 개선
    confidenceGrowth: number,           // 확신도 성장
  },
  
  engagementMetrics: {
    advancedFeatureUsage: number,       // 고급 기능 사용률
    temperatureTrackingRate: number,    // 온도 추적 사용률
    noteQuality: number,                // 메모 품질 점수
    returnRate: number,                 // 재방문률
  }
};
```

---

## 🚀 향후 개선 계획

### Phase 1 (현재)
- ✅ 초보자 프리셋 시스템
- ✅ 중급자 상세 평가
- 🔧 온도별 변화 추적
- 🔧 개인화 학습 시스템

### Phase 2 (3개월)
- 🔄 AI 기반 감각 코칭
- 🔄 블라인드 감각 테스트
- 🔄 커뮤니티 감각 비교
- 🔄 전문가 검증 시스템

### Phase 3 (6개월)
- 🔄 생체 신호 연동 (심박수, 타액 등)
- 🔄 AR 기반 감각 가이드
- 🔄 개인 감각 DNA 프로파일
- 🔄 감각 훈련 게임화

---

이 문서는 Sensory Evaluation 단계의 완전한 구현 가이드입니다. 사용자의 감각 발달과 개인화된 학습을 지원하는 핵심 기능을 담고 있습니다.