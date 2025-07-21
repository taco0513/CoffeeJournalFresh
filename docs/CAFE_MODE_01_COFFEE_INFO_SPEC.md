# 🍃 Cafe Mode - Step 1: Coffee Info 상세 명세서

## 개요

Coffee Info는 Cafe Mode TastingFlow의 **첫 번째이자 가장 중요한** 단계입니다. 사용자가 부담 없이 기본 정보를 입력하면서 테이스팅 여정을 시작할 수 있도록 설계되었습니다.

> **MVP 우선순위**: P0 (Critical) - 반드시 구현되어야 하는 핵심 기능

---

## 🎯 설계 목표

### 핵심 원칙
- **간단함**: 최소 필수 정보만 요구 (2개 필드)
- **스마트함**: 자동완성으로 입력 부담 최소화
- **유연함**: 선택적 정보는 나중에도 추가 가능
- **효율성**: OCR 스캔으로 빠른 입력 지원

### 사용자 목표
- ✅ 5분 안에 기본 정보 입력 완료
- ✅ 타이핑 최소화 (자동완성 활용)
- ✅ 실수 없는 정확한 정보 입력
- ✅ 다음 단계로 자연스러운 진행

---

## 📋 데이터 구조

### 기본 인터페이스
```typescript
interface CoffeeInfo {
  // 필수 필드 (2개)
  coffeeName: string;              // 커피 이름
  roastery: string;               // 로스터리 이름
  
  // 선택 필드 (나중에 추가 가능)
  origin?: string;                // 원산지
  process?: string;               // 가공법
  roastLevel?: RoastLevel;        // 로스팅 레벨
  purchaseDate?: Date;            // 구매일
  price?: number;                // 가격
  
  // 메타데이터
  inputMethod: 'manual' | 'ocr' | 'autocomplete';
  confidence: number;             // OCR 신뢰도 (OCR 사용시)
  source: string;                // 데이터 출처
}

// 로스팅 레벨 enum
enum RoastLevel {
  LIGHT = 'light',
  LIGHT_MEDIUM = 'light-medium',
  MEDIUM = 'medium',
  MEDIUM_DARK = 'medium-dark',
  DARK = 'dark'
}

```

### 검증 규칙
```typescript
const validationRules = {
  coffeeName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[가-힣a-zA-Z0-9\s\-\.]+$/  // 한글, 영문, 숫자, 공백, -, . 만 허용
  },
  roastery: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[가-힣a-zA-Z0-9\s\-\.&]+$/
  },
  origin: {
    required: false,
    maxLength: 50
  },
  price: {
    required: false,
    min: 0,
    max: 1000000  // 100만원 상한
  }
};
```

---

## 🎨 사용자 인터페이스

### 화면 구성
```
┌─────────────────────────────┐
│ ← [뒤로]    커피 정보    [다음] │
├─────────────────────────────┤
│                           │
│  📷 [OCR 스캔]              │
│                           │
│  ☕ 커피 이름 *             │
│  [__________________]     │
│  💡 예: 콜드브루 블렌드        │
│                           │
│  🏪 로스터리 *              │
│  [__________________]     │
│  💡 예: 블루보틀 코리아        │
│                           │
│  🌍 원산지 (선택)            │
│  [__________________]     │
│                           │
│  ⚙️ 더 많은 옵션 [▼]        │
│                           │
│  [건너뛰기]    [다음 단계 →] │
└─────────────────────────────┘
```

### 확장 옵션 (토글)
```
⚙️ 더 많은 옵션 [▲]
├─ 🍃 가공법: [Natural ▼]
├─ 🔥 로스팅: [Medium ▼]
├─ 📅 구매일: [2025-07-21]
└─ 💰 가격: [₩ 25,000]
```

---

## 🤖 스마트 기능

### 1. OCR 스캔 기능

#### 지원 정보
- ✅ 커피 이름 인식
- ✅ 로스터리 이름 인식  
- ✅ 원산지 정보 인식
- ✅ 가공법 인식 (Natural, Washed 등)
- ⏳ 로스팅 레벨 인식 (Phase 2)
- ⏳ 가격 인식 (Phase 2)

#### 기술 구현
```typescript
interface OCRResult {
  coffeeName?: {
    value: string;
    confidence: number;    // 0-1 신뢰도
    boundingBox: Rectangle;
  };
  roastery?: {
    value: string;
    confidence: number;
    boundingBox: Rectangle;
  };
  origin?: {
    value: string;
    confidence: number;
    boundingBox: Rectangle;
  };
  rawText: string;        // 전체 인식 텍스트
  processingTime: number; // 처리 시간 (ms)
}

class CoffeeOCRService {
  async scanCoffeePackage(imageUri: string): Promise<OCRResult> {
    // 1. 이미지 전처리
    const processedImage = await this.preprocessImage(imageUri);
    
    // 2. OCR 실행
    const rawResult = await OCREngine.recognize(processedImage);
    
    // 3. 커피 정보 추출
    const extractedInfo = await this.extractCoffeeInfo(rawResult);
    
    // 4. 신뢰도 계산
    const confidence = this.calculateConfidence(extractedInfo);
    
    return extractedInfo;
  }
  
  private async extractCoffeeInfo(text: string): Promise<OCRResult> {
    // 정규식 패턴으로 정보 추출
    const patterns = {
      roastery: /(?:로스터리|ROASTERY|roasted by)\s*:?\s*([가-힣a-zA-Z\s&]+)/i,
      origin: /(?:원산지|ORIGIN|from)\s*:?\s*([가-힣a-zA-Z\s]+)/i,
      process: /(Natural|Washed|Honey|Semi-washed|나추럴|워시드|허니)/i
    };
    
    // 패턴 매칭 및 결과 반환
  }
}
```

#### 사용자 경험
```
1. [📷 OCR 스캔] 버튼 탭
   ↓
2. 카메라 화면 표시
   - "커피 봉투를 카메라에 맞춰주세요"
   - 가이드 프레임 표시
   ↓
3. 사진 촬영 → 자동 처리
   ↓
4. 결과 확인 화면
   - 인식된 정보 표시
   - 신뢰도 낮은 항목은 빨간 테두리
   - [수정하기] / [사용하기] 버튼
```

### 2. 자동완성 시스템

#### 데이터 소스
```typescript
interface AutocompleteData {
  // 로스터리 데이터
  roasteries: {
    name: string;
    alias: string[];        // 별칭들 ("블루보틀" → "Blue Bottle")  
    logo?: string;          // 로고 URL
    location: string;       // 위치
    popularity: number;     // 인기도 (검색 빈도)
  }[];
  
  // 커피 이름 데이터  
  coffeeNames: {
    name: string;
    roastery: string;       // 연관 로스터리
    frequency: number;      // 사용 빈도
    variants: string[];     // 변형들
  }[];
  
  // 원산지 데이터
  origins: {
    country: string;
    region?: string;
    frequency: number;
  }[];
}
```

#### 검색 알고리즘
```typescript
class SmartAutocomplete {
  search(query: string, type: 'roastery' | 'coffee' | 'origin'): SearchResult[] {
    const results = [];
    
    // 1. 정확한 매칭 (가중치 100)
    const exactMatches = this.findExactMatches(query, type);
    results.push(...exactMatches.map(r => ({ ...r, weight: 100 })));
    
    // 2. 시작 문자 매칭 (가중치 80)  
    const prefixMatches = this.findPrefixMatches(query, type);
    results.push(...prefixMatches.map(r => ({ ...r, weight: 80 })));
    
    // 3. 부분 매칭 (가중치 60)
    const partialMatches = this.findPartialMatches(query, type);
    results.push(...partialMatches.map(r => ({ ...r, weight: 60 })));
    
    // 4. 퍼지 매칭 (가중치 40)
    const fuzzyMatches = this.findFuzzyMatches(query, type);
    results.push(...fuzzyMatches.map(r => ({ ...r, weight: 40 })));
    
    // 5. 인기도로 정렬
    return results
      .sort((a, b) => (b.weight * b.popularity) - (a.weight * a.popularity))
      .slice(0, 5);  // 최대 5개
  }
}
```

#### UI 구현
```typescript
const AutocompleteInput: React.FC<Props> = ({ type, value, onChange }) => {
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const handleInputChange = useMemo(
    debounce(async (text: string) => {
      if (text.length >= 2) {
        const results = await autocompleteService.search(text, type);
        setSuggestions(results);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    }, 300),
    [type]
  );
  
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={(text) => {
          onChange(text);
          handleInputChange(text);
        }}
        placeholder={getPlaceholder(type)}
        style={styles.input}
      />
      
      {showDropdown && (
        <View style={styles.dropdown}>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                onChange(item.name);
                setShowDropdown(false);
              }}
              style={styles.suggestionItem}
            >
              <Text style={styles.suggestionText}>{item.name}</Text>
              <Text style={styles.suggestionMeta}>{item.meta}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};
```

---

## 📱 반응형 디자인

### 화면 크기별 레이아웃

#### 모바일 (< 768px)
- 단일 컬럼 레이아웃
- 큰 터치 영역 (최소 44pt)
- OCR 버튼 상단 고정
- 키보드 대응 스크롤

#### 태블릿 (768px - 1024px)  
- 2컬럼 레이아웃 (필수 | 선택)
- 사이드 패널 미리보기
- 더 넓은 입력 필드

#### 데스크톱 (> 1024px)
- 3컬럼 레이아웃
- 실시간 미리보기 패널
- 키보드 단축키 지원

---

## ⚡ 성능 최적화

### 데이터 로딩 전략
```typescript
// 초기 로드 시 필수 데이터만
const initialData = {
  popularRoasteries: topRoasteries.slice(0, 20),  // 상위 20개만
  commonOrigins: topOrigins.slice(0, 15),         // 상위 15개만  
};

// 사용자 입력 시 점진적 로딩
const loadMoreData = useMemo(
  throttle(async (query: string) => {
    const additionalData = await api.searchCoffeeData(query);
    updateAutocompleteCache(additionalData);
  }, 1000),
  []
);
```

### 캐싱 전략
```typescript
class CoffeeDataCache {
  private memoryCache = new Map();
  private diskCache = AsyncStorage;
  
  async get(key: string): Promise<any> {
    // 1. 메모리 캐시 확인
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }
    
    // 2. 디스크 캐시 확인
    const diskData = await this.diskCache.getItem(key);
    if (diskData) {
      const parsed = JSON.parse(diskData);
      this.memoryCache.set(key, parsed);  // 메모리에 저장
      return parsed;
    }
    
    return null;
  }
  
  async set(key: string, data: any, ttl = 3600000): Promise<void> {
    // 메모리와 디스크 동시 저장
    this.memoryCache.set(key, data);
    await this.diskCache.setItem(key, JSON.stringify({
      data,
      expiry: Date.now() + ttl
    }));
  }
}
```

---

## 🧪 테스트 시나리오

### 단위 테스트
```typescript
describe('CoffeeInfo Component', () => {
  test('필수 필드 검증', () => {
    const result = validateCoffeeInfo({
      coffeeName: '',  // 빈 값
      roastery: 'Test Roastery'
    });
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('coffeeName.required');
  });
  
  test('OCR 결과 파싱', () => {
    const ocrText = "Blue Bottle Coffee\nEthiopia Yirgacheffe\nLight Roast";
    const result = extractCoffeeInfo(ocrText);
    
    expect(result.roastery).toBe('Blue Bottle Coffee');
    expect(result.origin).toBe('Ethiopia Yirgacheffe');
  });
  
  test('자동완성 검색', async () => {
    const results = await autocomplete.search('블루', 'roastery');
    
    expect(results).toHaveLength(5);
    expect(results[0].name).toContain('블루보틀');
  });
});
```

### 통합 테스트
```typescript
describe('CoffeeInfo Flow', () => {
  test('수동 입력 → 다음 단계', async () => {
    const { getByPlaceholderText, getByText } = render(<CoffeeInfoStep />);
    
    // 정보 입력
    fireEvent.changeText(getByPlaceholderText('커피 이름'), '에티오피아 예가체프');
    fireEvent.changeText(getByPlaceholderText('로스터리'), '블루보틀');
    
    // 다음 단계 이동
    fireEvent.press(getByText('다음 단계'));
    
    // 상태 확인
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('RoasterNotes');
    });
  });
  
  test('OCR 스캔 → 정보 확인 → 다음 단계', async () => {
    const mockOCRResult = {
      coffeeName: { value: 'Colombia Supremo', confidence: 0.9 },
      roastery: { value: 'Stumptown', confidence: 0.8 }
    };
    
    OCRService.scanCoffeePackage.mockResolvedValue(mockOCRResult);
    
    const { getByText, getByTestId } = render(<CoffeeInfoStep />);
    
    // OCR 스캔
    fireEvent.press(getByText('OCR 스캔'));
    // 카메라 → 스캔 → 결과
    
    await waitFor(() => {
      expect(getByTestId('coffee-name-input')).toHaveProp('value', 'Colombia Supremo');
    });
  });
});
```

### E2E 테스트
```typescript
describe('Coffee Info E2E', () => {
  test('전체 플로우: 입력 → 검증 → 저장', async () => {
    // 1. 앱 시작
    await device.launchApp();
    await element(by.text('새 테이스팅 시작')).tap();
    
    // 2. Coffee Info 화면
    await expect(element(by.text('커피 정보'))).toBeVisible();
    
    // 3. 정보 입력
    await element(by.id('coffee-name-input')).typeText('콜드브루 블렌드');
    await element(by.id('roastery-input')).typeText('스타벅스');
    
    // 4. 자동완성 확인
    await element(by.text('스타벅스 코리아')).tap();
    
    // 5. 다음 단계
    await element(by.text('다음 단계')).tap();
    
    // 6. 결과 확인
    await expect(element(by.text('로스터 노트'))).toBeVisible();
  });
});
```

---

## 📊 성능 지표

### 목표 KPI
- **입력 완료 시간**: < 5분 (목표 3분)
- **OCR 인식 정확도**: > 80% (목표 90%)
- **자동완성 반응 시간**: < 300ms
- **단계 완료율**: > 85%
- **사용자 만족도**: > 4.0/5.0

### 모니터링 포인트
```typescript
const analytics = {
  // 사용 패턴
  inputMethod: ['manual', 'ocr', 'autocomplete'],  // 입력 방식 분포
  completionTime: number,                          // 단계 완료 시간
  fieldUtilization: {                              // 필드별 사용률
    coffeeName: 100,    // 필수
    roastery: 100,      // 필수  
    origin: 60,         // 목표
    process: 30,
    roastLevel: 25,
  },
  
  // 에러 및 이탈
  validationErrors: string[],                      // 검증 에러 종류
  abandonmentPoint: string,                        // 이탈 지점
  backButtonUsage: number,                         // 뒤로가기 사용률
  
  // 성능
  ocrProcessingTime: number,                       // OCR 처리 시간
  autocompleteResponseTime: number,                // 자동완성 반응시간
  cacheHitRate: number,                           // 캐시 적중률
};
```

---

## 🚀 향후 개선 계획

### Phase 1 (현재)
- ✅ 기본 UI 구현
- ✅ 필수 필드 검증
- 🔧 OCR 기본 기능
- 🔧 자동완성 시스템

### Phase 2 (3개월 후)
- 🔄 OCR 정확도 개선 (AI 모델 업그레이드)
- 🔄 음성 입력 지원
- 🔄 바코드/QR 코드 스캔
- 🔄 커뮤니티 데이터 활용

### Phase 3 (6개월 후)
- 🔄 AI 기반 정보 추천
- 🔄 실시간 협업 편집
- 🔄 다국어 OCR 지원
- 🔄 AR 패키지 정보 오버레이

---

이 문서는 Coffee Info 단계의 완전한 구현 가이드입니다. 개발팀은 이를 바탕으로 사용자 친화적이면서도 기술적으로 견고한 첫 번째 단계를 구현할 수 있습니다.