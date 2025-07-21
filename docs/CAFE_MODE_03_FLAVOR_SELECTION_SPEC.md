# 🍃 Cafe Mode - Step 3: Flavor Selection 상세 명세서

## 개요

Flavor Selection은 Cafe Mode TastingFlow의 **세 번째 단계**로, 사용자가 개인이 느낀 향미를 선택하는 **핵심적인 선택 단계**입니다. 사용자 레벨에 따라 다른 복잡도의 인터페이스를 제공하여 자연스러운 학습과 성장을 돕습니다.

> **MVP 우선순위**: P0 (Critical) - 개인 취향 발견의 핵심 기능

---

## 🎯 설계 목표

### 핵심 원칙
- **점진성**: 사용자 레벨에 맞는 적절한 복잡도
- **직관성**: 전문 지식 없이도 쉽게 선택 가능
- **학습성**: 자연스러운 향미 어휘 확장
- **개성**: 정답이 아닌 개인 감각 인정

### 사용자 목표
- ✅ 자신만의 향미 표현 발견 (3-5개 향미)
- ✅ 점진적인 향미 어휘 학습
- ✅ 부담 없는 선택과 표현
- ✅ 개인 향미 패턴 축적

---

## 📋 데이터 구조

### 기본 인터페이스
```typescript
interface FlavorSelection {
  // 선택된 향미들
  selectedFlavors: SelectedFlavor[];
  
  // 사용자 레벨별 메타데이터
  userLevel: 'beginner' | 'intermediate';
  selectionMethod: 'category' | 'wheel' | 'search';
  
  // 학습 추적
  newFlavorsDiscovered: string[];    // 이번에 새로 선택한 향미
  familiarFlavors: string[];         // 자주 사용하는 향미
  
  // 개인화
  personalLibrary: PersonalFlavor[]; // 개인 향미 라이브러리
  confidence: number;                // 선택 확신도 (1-5)
  
  // 메타데이터
  selectionTime: number;             // 선택에 소요된 시간 (초)
  hesitationPoints: string[];        // 망설였던 향미들
}

// 선택된 향미 정보
interface SelectedFlavor {
  id: string;                        // 향미 ID
  name: string;                      // 향미 이름 (한글)
  nameEn?: string;                   // 영문 이름
  category: FlavorCategory;          // 대분류
  subcategory?: string;              // 소분류
  intensity?: number;                // 강도 (1-5, 중급자만)
  personalNote?: string;             // 개인 메모
  isNew: boolean;                    // 새로 발견한 향미인지
}

// 향미 카테고리
enum FlavorCategory {
  FRUITY = 'fruity',                // 과일향
  NUTTY = 'nutty',                  // 견과류
  CHOCOLATE = 'chocolate',          // 초콜릿
  FLORAL = 'floral',               // 꽃향
  SPICY = 'spicy',                 // 향신료
  CARAMEL = 'caramel',             // 카라멜
  OTHER = 'other'                  // 기타
}

// 개인 향미 라이브러리
interface PersonalFlavor {
  flavor: SelectedFlavor;
  usageCount: number;               // 사용 횟수
  firstUsed: Date;                  // 첫 사용일
  lastUsed: Date;                   // 마지막 사용일
  personalRating: number;           // 개인 선호도 (1-5)
  associatedCoffees: string[];      // 연관된 커피들
}
```

---

## 🎨 사용자 레벨별 인터페이스

### 🌱 초보자 (Beginner) 모드

#### 화면 구성
```
┌─────────────────────────────┐
│ ← [뒤로]    향미 선택    [건너뛰기] │
├─────────────────────────────┤
│                           │
│  🎨 어떤 맛이 느껴지시나요?      │
│      3개까지 선택해주세요        │
│                           │
│  ┌───────┐ ┌───────┐      │
│  │  🍎   │ │  🥜   │      │
│  │과일향  │ │견과류  │      │
│  │Sweet  │ │Nutty  │      │
│  │& Fruity│ │& Roasted│    │
│  └───────┘ └───────┘      │
│                           │
│  ┌───────┐ ┌───────┐      │
│  │  🍫   │ │  🌸   │      │
│  │초콜릿   │ │꽃향   │      │
│  │Rich &  │ │Light & │    │
│  │Sweet   │ │Fragrant│    │
│  └───────┘ └───────┘      │
│                           │
│  ┌───────┐                │
│  │  ❓    │                │
│  │ 기타   │                │
│  │Other   │                │
│  └───────┘                │
│                           │
│  선택됨: [과일향] [초콜릿]      │
│                           │
│  [건너뛰기]    [다음 단계 →] │
└─────────────────────────────┘
```

#### 기술 구현
```typescript
interface BeginnerFlavorUI {
  categories: FlavorCategory[];
  maxSelection: 3;
  showDescriptions: boolean;
  cardSize: 'large';
  
  // 각 카테고리별 설명
  descriptions: {
    fruity: '딸기, 사과, 베리 등의 달콤하고 상큼한 맛',
    nutty: '아몬드, 헤이즐넛 등의 고소한 맛',
    chocolate: '초콜릿, 코코아의 진하고 달콤한 맛',
    floral: '꽃향기 같은 은은하고 향긋한 맛',
    spicy: '계피, 정향 등의 따뜻하고 자극적인 맛',
    caramel: '카라멜, 설탕의 달콤하고 부드러운 맛',
    other: '위에 없는 특별한 맛'
  };
}

const BeginnerFlavorSelector: React.FC = () => {
  const [selectedFlavors, setSelectedFlavors] = useState<FlavorCategory[]>([]);
  const maxSelection = 3;
  
  const handleCategorySelect = (category: FlavorCategory) => {
    if (selectedFlavors.includes(category)) {
      // 이미 선택된 경우 제거
      setSelectedFlavors(prev => prev.filter(f => f !== category));
    } else if (selectedFlavors.length < maxSelection) {
      // 새로 선택
      setSelectedFlavors(prev => [...prev, category]);
      
      // 햅틱 피드백
      HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Medium);
      
      // 선택 애니메이션
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 최대 선택 수 초과 알림
      Alert.alert('', '최대 3개까지 선택할 수 있어요');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>어떤 맛이 느껴지시나요?</Text>
        <Text style={styles.subtitle}>
          {maxSelection}개까지 선택해주세요 ({selectedFlavors.length}/{maxSelection})
        </Text>
      </View>
      
      <View style={styles.categoryGrid}>
        {flavorCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            isSelected={selectedFlavors.includes(category.id)}
            onPress={() => handleCategorySelect(category.id)}
            disabled={!selectedFlavors.includes(category.id) && selectedFlavors.length >= maxSelection}
          />
        ))}
      </View>
      
      {selectedFlavors.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.selectedTitle}>선택된 향미:</Text>
          <View style={styles.selectedChips}>
            {selectedFlavors.map((flavor) => (
              <SelectedChip key={flavor} flavor={flavor} />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};
```

### 🌿 중급자 (Intermediate) 모드

#### 화면 구성
```
┌─────────────────────────────┐
│ ← [뒤로]    향미 선택    [건너뛰기] │
├─────────────────────────────┤
│                           │
│  🎯 상세 향미 선택 (5개까지)     │
│                           │
│  ┌─────────────────────┐    │
│  │   🔍 [검색...]       │    │
│  └─────────────────────┘    │
│                           │
│  📚 내 향미 라이브러리          │
│  [베리] [초콜릿] [꿀] [견과류]   │
│                           │
│  🎨 향미 휠                 │
│  ┌─────────────────────┐    │
│  │        🍎           │    │
│  │    과일향            │    │
│  │  ┌─────────────┐    │    │
│  │  │베리 사과 감귤   │    │    │
│  │  │체리 복숭아 등   │    │    │
│  │  └─────────────┘    │    │
│  └─────────────────────┘    │
│                           │
│  선택된 향미:                │
│  🍓베리(4) 🍫초콜릿(3) 🌰견과류(2) │
│                           │
│  [다시 선택]    [다음 단계 →] │
└─────────────────────────────┘
```

#### 기술 구현
```typescript
interface IntermediateFlavorUI {
  useFlavorWheel: boolean;
  maxSelection: 5;
  enableIntensity: boolean;      // 강도 선택 가능
  personalLibrary: boolean;      // 개인 라이브러리 사용
  searchEnabled: boolean;        // 검색 기능
  subcategories: boolean;        // 세부 카테고리
}

const IntermediateFlavorSelector: React.FC = () => {
  const [selectedFlavors, setSelectedFlavors] = useState<SelectedFlavor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FlavorCategory | null>(null);
  
  // 개인 향미 라이브러리 로드
  const { personalLibrary } = usePersonalFlavorLibrary();
  
  // 향미 휠 데이터
  const flavorWheel = useFlavorWheel();
  
  const handleFlavorSelect = (flavor: FlavorData, intensity?: number) => {
    const selectedFlavor: SelectedFlavor = {
      id: flavor.id,
      name: flavor.name,
      nameEn: flavor.nameEn,
      category: flavor.category,
      subcategory: flavor.subcategory,
      intensity: intensity || 3,  // 기본 강도 3
      isNew: !personalLibrary.includes(flavor.id),
      personalNote: ''
    };
    
    if (selectedFlavors.length < 5) {
      setSelectedFlavors(prev => [...prev, selectedFlavor]);
      
      // 새로운 향미 발견 시 축하 애니메이션
      if (selectedFlavor.isNew) {
        showNewFlavorDiscoveryAnimation(flavor.name);
      }
    }
  };
  
  const handleIntensityChange = (flavorId: string, intensity: number) => {
    setSelectedFlavors(prev => 
      prev.map(flavor => 
        flavor.id === flavorId 
          ? { ...flavor, intensity }
          : flavor
      )
    );
  };
  
  return (
    <View style={styles.container}>
      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="향미 검색... (예: 베리, 초콜릿)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {/* 개인 향미 라이브러리 */}
      <View style={styles.personalLibrarySection}>
        <Text style={styles.sectionTitle}>📚 내 향미 라이브러리</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {personalLibrary.map((flavor) => (
            <PersonalFlavorChip
              key={flavor.id}
              flavor={flavor}
              onPress={() => handleFlavorSelect(flavor)}
              isSelected={selectedFlavors.some(f => f.id === flavor.id)}
            />
          ))}
        </ScrollView>
      </View>
      
      {/* 향미 휠 */}
      <View style={styles.flavorWheelSection}>
        <Text style={styles.sectionTitle}>🎨 향미 휠</Text>
        <FlavorWheel
          data={flavorWheel}
          onCategorySelect={setActiveCategory}
          onFlavorSelect={handleFlavorSelect}
          selectedFlavors={selectedFlavors}
        />
      </View>
      
      {/* 선택된 향미 with 강도 조절 */}
      <View style={styles.selectedSection}>
        <Text style={styles.sectionTitle}>
          선택된 향미 ({selectedFlavors.length}/5)
        </Text>
        {selectedFlavors.map((flavor) => (
          <SelectedFlavorWithIntensity
            key={flavor.id}
            flavor={flavor}
            onIntensityChange={(intensity) => 
              handleIntensityChange(flavor.id, intensity)
            }
            onRemove={() => removeFlavorFromSelection(flavor.id)}
          />
        ))}
      </View>
    </View>
  );
};
```

---

## 🧠 스마트 기능

### 1. 향미 추천 엔진
```typescript
class FlavorRecommendationEngine {
  async recommendFlavors(
    coffeeInfo: CoffeeInfo,
    userHistory: TastingHistory[],
    userLevel: UserLevel
  ): Promise<FlavorRecommendation[]> {
    
    // 1. 커피 정보 기반 추천
    const coffeeBasedFlavors = await this.getCoffeeProfileFlavors(coffeeInfo);
    
    // 2. 사용자 히스토리 기반 추천
    const historyBasedFlavors = this.getUserPatternFlavors(userHistory);
    
    // 3. 새로운 향미 발견 기회
    const explorationFlavors = this.getExplorationFlavors(userHistory, userLevel);
    
    // 4. 가중치 적용 및 정렬
    return this.combineAndRankRecommendations([
      ...coffeeBasedFlavors.map(f => ({ ...f, source: 'coffee_profile', weight: 0.4 })),
      ...historyBasedFlavors.map(f => ({ ...f, source: 'user_history', weight: 0.4 })),
      ...explorationFlavors.map(f => ({ ...f, source: 'exploration', weight: 0.2 }))
    ]);
  }
  
  private getCoffeeProfileFlavors(coffeeInfo: CoffeeInfo): Promise<FlavorData[]> {
    // 원산지, 가공법, 로스팅 레벨에 따른 일반적 향미 프로파일
    const flavorMapping = {
      origin: {
        'Ethiopia': ['floral', 'fruity', 'wine'],
        'Colombia': ['chocolate', 'nutty', 'caramel'],
        'Kenya': ['berry', 'wine', 'black_currant'],
        'Brazil': ['chocolate', 'nutty', 'low_acid'],
      },
      process: {
        'natural': ['fruity', 'sweet', 'wine'],
        'washed': ['clean', 'bright', 'acidic'],
        'honey': ['sweet', 'fruity', 'smooth']
      },
      roastLevel: {
        'light': ['floral', 'fruity', 'acidic'],
        'medium': ['balanced', 'chocolate', 'nutty'],
        'dark': ['smoky', 'bitter', 'roasted']
      }
    };
    
    // 매핑 로직 구현
  }
}
```

### 2. 개인화 학습 시스템
```typescript
interface LearningProgress {
  // 향미 어휘 발달
  vocabularyGrowth: {
    totalFlavors: number;           // 총 사용한 향미 수
    newFlavorsThisWeek: number;     // 이번 주 새로 발견한 향미
    consistencyScore: number;       // 일관성 점수 (0-1)
    explorationRate: number;        // 새로운 향미 도전율
  };
  
  // 선택 패턴 분석
  selectionPatterns: {
    preferredCategories: FlavorCategory[];    // 선호 카테고리
    averageSelectionCount: number;            // 평균 선택 개수
    decisionTime: number;                     // 평균 선택 시간
    confidenceLevel: number;                  // 선택 확신도
  };
  
  // 성장 단계
  progressStage: {
    currentLevel: 'beginner' | 'intermediate' | 'advanced';
    nextLevelRequirements: LevelRequirement[];
    estimatedTimeToNext: number;              // 다음 레벨까지 예상 시간
  };
}

class PersonalizationService {
  async updateUserProgress(
    userId: string, 
    flavorSelection: FlavorSelection
  ): Promise<void> {
    
    const currentProgress = await this.getUserProgress(userId);
    
    // 새로운 향미 발견 추적
    if (flavorSelection.newFlavorsDiscovered.length > 0) {
      await this.trackNewFlavorDiscovery(userId, flavorSelection.newFlavorsDiscovered);
    }
    
    // 일관성 점수 업데이트
    const consistencyScore = await this.calculateConsistencyScore(
      userId, 
      flavorSelection
    );
    
    // 레벨 업 조건 확인
    const levelUpCheck = await this.checkLevelUpConditions(userId, currentProgress);
    if (levelUpCheck.canLevelUp) {
      await this.triggerLevelUpFlow(userId, levelUpCheck.newLevel);
    }
  }
  
  private async checkLevelUpConditions(
    userId: string, 
    progress: LearningProgress
  ): Promise<LevelUpCheck> {
    
    const conditions = {
      beginnerToIntermediate: {
        minTastings: 10,
        minFlavorsUsed: 15,
        minConsistency: 0.6,
        minTimeActive: 7 * 24 * 60 * 60 * 1000, // 1주일
      }
    };
    
    // 조건 확인 로직
    if (progress.currentLevel === 'beginner') {
      const cond = conditions.beginnerToIntermediate;
      const userStats = await this.getUserStats(userId);
      
      if (userStats.tastingCount >= cond.minTastings &&
          userStats.uniqueFlavorsUsed >= cond.minFlavorsUsed &&
          progress.vocabularyGrowth.consistencyScore >= cond.minConsistency &&
          userStats.accountAge >= cond.minTimeActive) {
            
        return {
          canLevelUp: true,
          newLevel: 'intermediate',
          achievements: ['taste_explorer', 'consistent_taster', 'vocabulary_builder']
        };
      }
    }
    
    return { canLevelUp: false };
  }
}
```

### 3. 향미 충돌 감지 및 제안
```typescript
class FlavorConflictDetector {
  analyzeFlavorCombination(flavors: SelectedFlavor[]): FlavorAnalysis {
    const analysis: FlavorAnalysis = {
      conflicts: [],
      harmonies: [],
      suggestions: [],
      overallBalance: 0
    };
    
    // 충돌하는 조합 감지
    const conflictPatterns = [
      { flavors: ['bitter', 'sweet'], level: 'mild', message: '쓴맛과 단맛이 함께 선택되었어요. 복합적인 맛이네요!' },
      { flavors: ['fruity', 'smoky'], level: 'moderate', message: '과일향과 스모키함의 독특한 조합이에요.' },
      { flavors: ['floral', 'roasted'], level: 'high', message: '꽃향과 로스티함은 상반된 특성이에요. 정말 특별한 커피군요!' }
    ];
    
    // 조화로운 조합 감지
    const harmonyPatterns = [
      { flavors: ['chocolate', 'nutty'], message: '초콜릿과 견과류는 환상의 조합이에요! 🍫🥜' },
      { flavors: ['fruity', 'floral'], message: '과일향과 꽃향의 우아한 조합이네요! 🍓🌸' },
      { flavors: ['caramel', 'vanilla'], message: '카라멜과 바닐라의 달콤한 하모니예요! 🍮' }
    ];
    
    // 분석 실행
    for (const pattern of conflictPatterns) {
      if (this.hasFlavorPattern(flavors, pattern.flavors)) {
        analysis.conflicts.push({
          type: pattern.level,
          message: pattern.message,
          involvedFlavors: pattern.flavors
        });
      }
    }
    
    for (const pattern of harmonyPatterns) {
      if (this.hasFlavorPattern(flavors, pattern.flavors)) {
        analysis.harmonies.push({
          message: pattern.message,
          involvedFlavors: pattern.flavors
        });
      }
    }
    
    return analysis;
  }
  
  generateSuggestions(
    currentFlavors: SelectedFlavor[], 
    coffeeProfile: CoffeeProfile
  ): FlavorSuggestion[] {
    
    const suggestions: FlavorSuggestion[] = [];
    
    // 누락된 일반적 향미 제안
    const expectedFlavors = this.getExpectedFlavorsForCoffee(coffeeProfile);
    const missingFlavors = expectedFlavors.filter(expected => 
      !currentFlavors.some(selected => selected.category === expected.category)
    );
    
    if (missingFlavors.length > 0) {
      suggestions.push({
        type: 'missing_common',
        message: `이런 향미도 느껴보세요: ${missingFlavors.map(f => f.name).join(', ')}`,
        suggestedFlavors: missingFlavors,
        priority: 'medium'
      });
    }
    
    // 밸런스 개선 제안
    const balanceAnalysis = this.analyzeFlavorBalance(currentFlavors);
    if (balanceAnalysis.needsMoreAcidity) {
      suggestions.push({
        type: 'balance_improvement',
        message: '산미 계열 향미를 추가하면 더 균형잡힌 표현이 될 것 같아요',
        suggestedFlavors: this.getAcidityFlavors(),
        priority: 'low'
      });
    }
    
    return suggestions.sort((a, b) => 
      this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority)
    );
  }
}
```

---

## 🎨 UI 컴포넌트 명세

### CategoryCard 컴포넌트 (초보자용)
```typescript
interface CategoryCardProps {
  category: {
    id: FlavorCategory;
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  isSelected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onPress,
  disabled = false
}) => {
  return (
    <Pressable
      style={[
        styles.categoryCard,
        isSelected && styles.selectedCard,
        disabled && styles.disabledCard
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={styles.categoryName}>{category.name}</Text>
      <Text style={styles.categoryDescription}>{category.description}</Text>
      
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
    </Pressable>
  );
};
```

### FlavorWheel 컴포넌트 (중급자용)
```typescript
interface FlavorWheelProps {
  data: FlavorWheelData;
  onCategorySelect: (category: FlavorCategory) => void;
  onFlavorSelect: (flavor: FlavorData) => void;
  selectedFlavors: SelectedFlavor[];
}

const FlavorWheel: React.FC<FlavorWheelProps> = ({
  data,
  onCategorySelect,
  onFlavorSelect,
  selectedFlavors
}) => {
  const [activeCategory, setActiveCategory] = useState<FlavorCategory | null>(null);
  
  return (
    <View style={styles.flavorWheel}>
      {/* 1단계: 대분류 선택 */}
      <View style={styles.categoryRing}>
        {data.categories.map((category) => (
          <CategorySegment
            key={category.id}
            category={category}
            isActive={activeCategory === category.id}
            onPress={() => {
              setActiveCategory(category.id);
              onCategorySelect(category.id);
            }}
          />
        ))}
      </View>
      
      {/* 2단계: 세부 향미 선택 */}
      {activeCategory && (
        <Animated.View 
          style={styles.subflavorRing}
          entering={FadeInDown.duration(300)}
        >
          {data.getSubflavors(activeCategory).map((flavor) => (
            <FlavorSegment
              key={flavor.id}
              flavor={flavor}
              isSelected={selectedFlavors.some(f => f.id === flavor.id)}
              onPress={() => onFlavorSelect(flavor)}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
};
```

---

## 🧪 테스트 전략

### 사용자 레벨별 테스트
```typescript
describe('FlavorSelection - Beginner Mode', () => {
  test('최대 3개 선택 제한', () => {
    const { getByTestId } = render(<BeginnerFlavorSelector />);
    
    // 3개 카테고리 선택
    fireEvent.press(getByTestId('category-fruity'));
    fireEvent.press(getByTestId('category-chocolate'));
    fireEvent.press(getByTestId('category-nutty'));
    
    // 4번째 선택 시도
    fireEvent.press(getByTestId('category-floral'));
    
    // 알림 확인
    expect(Alert.alert).toHaveBeenCalledWith('', '최대 3개까지 선택할 수 있어요');
    
    // 여전히 3개만 선택되어 있는지 확인
    const selectedChips = getAllByTestId('selected-chip');
    expect(selectedChips).toHaveLength(3);
  });
  
  test('선택 취소 기능', () => {
    const { getByTestId } = render(<BeginnerFlavorSelector />);
    
    fireEvent.press(getByTestId('category-fruity'));
    expect(getByTestId('category-fruity')).toHaveStyle({ selected: true });
    
    fireEvent.press(getByTestId('category-fruity')); // 다시 선택
    expect(getByTestId('category-fruity')).toHaveStyle({ selected: false });
  });
});

describe('FlavorSelection - Intermediate Mode', () => {
  test('향미 검색 기능', async () => {
    const { getByTestId } = render(<IntermediateFlavorSelector />);
    const searchInput = getByTestId('search-input');
    
    fireEvent.changeText(searchInput, '베리');
    
    await waitFor(() => {
      expect(getByTestId('search-result-berry')).toBeVisible();
      expect(getByTestId('search-result-blueberry')).toBeVisible();
    });
  });
  
  test('강도 조절 기능', () => {
    const { getByTestId } = render(<IntermediateFlavorSelector />);
    
    // 향미 선택
    fireEvent.press(getByTestId('flavor-chocolate'));
    
    // 강도 조절
    const intensitySlider = getByTestId('intensity-slider-chocolate');
    fireEvent(intensitySlider, 'onValueChange', 4);
    
    expect(intensitySlider).toHaveProp('value', 4);
  });
});
```

---

## 📊 성공 지표 및 분석

### 핵심 KPI
- **단계 완료율**: > 70% (선택 단계이므로)
- **평균 선택 시간**: < 3분 (초보자), < 5분 (중급자)
- **향미 발견율**: 세션당 평균 1개 새 향미
- **재선택률**: < 20% (선택 후 변경하는 비율)
- **다음 단계 진행률**: > 80%

### 학습 효과 측정
```typescript
const learningAnalytics = {
  vocabularyExpansion: {
    newFlavorsPerWeek: number,        // 주간 새 향미 발견 수
    retentionRate: number,            // 향미 기억률 (30일 후)
    crossSessionConsistency: number,  // 세션 간 일관성
  },
  
  userEngagement: {
    explorationRate: number,          // 새로운 향미 시도 비율
    personalLibraryUsage: number,     // 개인 라이브러리 활용도
    searchFeatureUsage: number,       // 검색 기능 사용률
  },
  
  progressionMetrics: {
    beginnerToIntermediateRate: number, // 레벨업 비율
    averageTimeToLevelUp: number,       // 레벨업 평균 시간
    featureAdoptionRate: number,        // 새 기능 도입률
  }
};
```

---

## 🚀 향후 개선 계획

### Phase 1 (현재)
- ✅ 기본 카테고리 선택 (초보자)
- ✅ 향미 휠 인터페이스 (중급자)
- 🔧 개인화 추천 시스템
- 🔧 향미 학습 도구

### Phase 2 (3개월)
- 🔄 AI 기반 향미 추천
- 🔄 음성 입력 지원 ("베리 같은 맛")
- 🔄 커뮤니티 향미 데이터
- 🔄 다국어 향미 매핑

### Phase 3 (6개월)
- 🔄 AR 기반 향미 가이드
- 🔄 전문가 검증 시스템
- 🔄 개인 향미 DNA 분석
- 🔄 실시간 협업 테이스팅

---

이 문서는 Flavor Selection 단계의 완전한 구현 가이드입니다. 사용자의 성장 여정에 맞춰 점진적으로 복잡해지는 인터페이스를 통해 자연스러운 학습과 개인 취향 발견을 지원합니다.