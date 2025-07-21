# 🔬 TastingFlow - Lab Mode (Phase 2)

## 개요

Lab Mode는 커피 전문가, 바리스타, 로스터를 대상으로 한 **고도로 정밀한** 테이스팅 플로우입니다. 전문적인 분석 도구와 상세한 데이터 수집을 통해 커피의 모든 특성을 체계적으로 기록하고 분석할 수 있습니다.

> **⚠️ Phase 2 Features**: 이 기능들은 Phase 2에서 개발 예정입니다. 현재 MVP는 Cafe Mode에 집중하고 있습니다.

---

## 🎯 설계 철학

### 핵심 원칙
- **정밀성**: 전문가급 정확한 분석 도구
- **객관성**: 편견을 배제한 블라인드 테이스팅 지원
- **과학성**: 데이터 기반의 체계적 접근
- **전문성**: 업계 표준에 부합하는 용어와 방법론

### 대상 사용자
- 커피 전문가 (Q Grader, 로스터, 바리스타)
- 커피 교육자 및 연구자  
- 커피 품질 관리자
- 고급 커피 애호가 (Cup of Excellence 참여자 등)

---

## 📋 TastingFlow 단계

### 전체 플로우 구조
```
1. Lab Setup (실험 설정)
   ↓
2. Sample Information (샘플 정보)  
   ↓
3. Blind Mode Toggle (블라인드 모드)
   ↓
4. Extraction Parameters (추출 변수)
   ↓
5. Professional Sensory Analysis (전문 센서리 분석)
   ↓ 
6. Advanced Flavor Profiling (고급 향미 프로파일링)
   ↓
7. Comparative Analysis (비교 분석)
   ↓
8. Lab Results & Report (실험 결과 및 보고서)
```

### 단계별 상세 설명

#### 1. 🔬 Lab Setup (실험 설정)
**목적**: 전문적인 테이스팅 환경 설정

**설정 옵션**:
```typescript
interface LabSetup {
  tastingMode: 'single' | 'comparative' | 'triangulation' | 'blind';
  environment: {
    temperature: number;     // 실내 온도
    humidity: number;        // 습도  
    lighting: string;        // 조명 조건
    noiseLevel: string;      // 소음 수준
  };
  equipment: {
    grinder: string;         // 그라인더 모델
    brewingDevice: string;   // 추출 도구
    scale: string;          // 저울 정밀도
    thermometer: string;     // 온도계
  };
  calibration: {
    palateCondition: string; // 미각 컨디션
    lastMeal: Date;         // 마지막 식사 시간  
    medications: string[];   // 복용 약물
  };
}
```

#### 2. 📊 Sample Information (샘플 정보)
**목적**: 상세한 커피 샘플 데이터 수집

**확장된 필드**:
```typescript
interface LabSampleInfo {
  // 기본 정보 (Cafe Mode 대비 더 상세)
  sampleId: string;           // 샘플 식별 코드
  farm: string;               // 농장 정보
  variety: string;            // 품종
  altitude: number;           // 재배 고도
  harvestDate: Date;          // 수확일
  processDetails: {           // 가공 세부사항
    method: string;
    fermentationTime: number;
    dryingMethod: string;
    moisture: number;
  };
  
  // 로스팅 정보
  roastProfile: {
    roaster: string;
    roastDate: Date;
    developmentTimeRatio: number;
    firstCrackTime: number;
    endTemperature: number;
    colorValue: number;        // Agtron 값
  };
  
  // 보관 정보
  storage: {
    condition: string;
    packaging: string;
    openDate: Date;
  };
}
```

#### 3. 🎭 Blind Mode Toggle (블라인드 모드)
**목적**: 편견 없는 객관적 평가

**블라인드 모드 옵션**:
```typescript
interface BlindMode {
  level: 'none' | 'partial' | 'full';
  hiddenInfo: {
    origin?: boolean;         // 원산지 숨김
    roaster?: boolean;        // 로스터 숨김  
    price?: boolean;          // 가격 숨김
    variety?: boolean;        // 품종 숨김
    process?: boolean;        // 가공법 숨김
    roastLevel?: boolean;     // 로스팅 레벨 숨김
  };
  revealTiming: 'after_tasting' | 'after_scoring' | 'manual';
}
```

**UI 특징**:
- 선택한 정보는 완전히 가려짐
- 테이스팅 완료 후 순차적 정보 공개
- 편견의 영향 측정 가능

#### 4. ⚗️ Extraction Parameters (추출 변수)
**목적**: 추출 조건의 정밀한 기록 및 제어

**상세 추출 데이터**:
```typescript
interface ExtractionParameters {
  // 기본 추출 변수
  coffeeWeight: number;       // 원두 무게 (0.1g 단위)
  waterWeight: number;        // 물 무게
  ratio: string;             // 비율 (1:15.5 등)
  grindSize: number;         // 그라인드 크기 (마이크로미터)
  
  // 온도 관리  
  waterTemperature: {
    initial: number;          // 초기 온도
    contact: number;          // 접촉 온도
    final: number;           // 최종 온도
  };
  
  // 시간 관리
  timing: {
    bloomTime: number;        // 블룸 시간
    totalBrewTime: number;    // 총 추출 시간
    intervals: number[];      // 단계별 시간
  };
  
  // 추출 기법
  technique: {
    method: string;           // 추출 방법
    pourPattern: string;      // 푸어링 패턴
    agitation: string;        // 저어주기
    pressure: number;         // 압력 (에스프레소)
  };
  
  // 결과 측정
  output: {
    yield: number;            // 수율
    tds: number;             // 총 용해 고형물
    extractionYield: number;  // 추출율
    flowRate: number;        // 유속
  };
}
```

#### 5. 👨‍🔬 Professional Sensory Analysis (전문 센서리 분석)
**목적**: SCA 표준에 따른 전문적 센서리 평가

**SCA 표준 평가 항목**:
```typescript
interface ProfessionalSensory {
  // SCA 표준 10점 척도
  fragrance: {
    dry: number;              // 마른 향 (1-10)
    wet: number;              // 젖은 향 (1-10)
    notes: string;
  };
  
  flavor: {
    score: number;            // 플레이버 점수 (1-10)
    intensity: number;        // 강도
    quality: number;          // 품질
    notes: string[];
  };
  
  aftertaste: {
    score: number;            // 여운 점수
    length: number;           // 지속 시간 (초)
    quality: string;          // 품질 평가
  };
  
  acidity: {
    score: number;            // 산미 점수
    intensity: number;        // 강도 (1-5)
    quality: number;          // 품질 (1-5)
    type: string[];          // 산미 종류
  };
  
  body: {
    score: number;            // 바디 점수  
    weight: number;           // 무게감 (1-5)
    texture: string[];        // 질감
  };
  
  balance: {
    score: number;            // 밸런스 점수
    harmony: number;          // 조화도
    notes: string;
  };
  
  uniformity: number;         // 균일성 (2점씩 5컵)
  cleanCup: number;          // 깔끔함 (2점씩 5컵)
  sweetness: number;         // 단맛 (2점씩 5컵)
  
  overall: {
    score: number;            // 종합 점수
    notes: string;
    defects: DefectLog[];
  };
  
  finalScore: number;         // 최종 총점 (100점 만점)
}
```

#### 6. 🎨 Advanced Flavor Profiling (고급 향미 프로파일링)
**목적**: 정밀한 향미 분석 및 프로파일링

**다차원 향미 분석**:
```typescript
interface AdvancedFlavorProfile {
  // 향미 휠 전체 사용
  primaryFlavors: FlavorNote[];     // 주요 향미
  secondaryFlavors: FlavorNote[];   // 보조 향미
  flavorEvolution: {               // 향미 변화 추적
    initial: string[];             // 초기 향미  
    middle: string[];              // 중간 향미
    finish: string[];              // 마무리 향미
  };
  
  // 향미 강도 맵핑
  intensityMapping: {
    [flavor: string]: {
      intensity: number;            // 강도 (1-10)
      quality: number;             // 품질 (1-10)  
      phase: 'aroma' | 'taste' | 'aftertaste';
    };
  };
  
  // 화학적 연관성
  chemicalCorrelation: {
    acids: string[];                // 산 성분
    sugars: string[];              // 당 성분
    volatiles: string[];           // 휘발성 화합물
  };
  
  // 커스텀 속성
  customAttributes: {
    [attribute: string]: number;
  };
}
```

#### 7. 📈 Comparative Analysis (비교 분석)
**목적**: 다른 샘플과의 상세 비교

**비교 분석 도구**:
```typescript
interface ComparativeAnalysis {
  // 동시 비교 (최대 5개 샘플)
  simultaneousComparison: {
    samples: string[];              // 비교 샘플 ID
    rankingCriteria: string[];      // 순위 기준
    preferences: RankingResult[];    // 선호도 순위
  };
  
  // 시간차 비교
  temporalComparison: {
    baseline: string;               // 기준 샘플
    variations: VariationAnalysis[]; // 변형 분석
    consistency: number;            // 일관성 점수
  };
  
  // 통계적 분석  
  statisticalAnalysis: {
    correlation: number;            // 상관관계
    significance: number;           // 유의성
    confidence: number;            // 신뢰도
  };
  
  // 트렌드 분석
  trendAnalysis: {
    flavorEvolution: TrendLine[];   // 향미 변화 추세
    qualityProgression: TrendLine[]; // 품질 진행
    seasonalVariation: SeasonalData; // 계절별 변화
  };
}
```

#### 8. 📋 Lab Results & Report (실험 결과 및 보고서)
**목적**: 전문적인 분석 보고서 생성

**보고서 구성**:
```typescript
interface LabReport {
  // 실행 요약
  executiveSummary: {
    overallScore: number;
    keyFindings: string[];
    recommendations: string[];
    qualityGrade: string;
  };
  
  // 상세 분석
  detailedAnalysis: {
    sensoryProfile: SensoryRadarChart;
    flavorMap: FlavorMapping;
    extractionEfficiency: ExtractionAnalysis;
    defectAnalysis: DefectReport;
  };
  
  // 비교 데이터
  benchmarkComparison: {
    industryStandard: ComparisonResult;
    pricePoint: ComparisonResult;
    previousBatches: ComparisonResult;
  };
  
  // 개선 권장사항
  improvements: {
    roasting: string[];
    extraction: string[];
    storage: string[];
    quality: string[];
  };
  
  // 데이터 내보내기
  exportFormats: {
    pdf: boolean;
    csv: boolean;  
    json: boolean;
    scaFormat: boolean;
  };
}
```

---

## 🧪 고급 분석 도구

### 블라인드 테이스팅 시스템
- **삼각 테스트**: 3개 중 다른 1개 찾기
- **순위 테스트**: 특정 기준으로 순위 매기기
- **묘사 분석**: 편견 없는 순수 묘사

### 추출 최적화 엔진
- **변수 상관관계**: 추출 변수와 맛의 관계 분석
- **레시피 생성**: 목표 맛을 위한 최적 레시피 제안
- **품질 예측**: 추출 조건으로부터 품질 예측

### 통계 분석 도구
- **ANOVA**: 집단 간 차이 분석
- **회귀 분석**: 변수 간 관계 모델링  
- **클러스터 분석**: 유사 그룹 식별

---

## 🎯 전문가 워크플로우

### Q Grader 워크플로우
1. 표준 컵핑 프로토콜 적용
2. SCA 양식에 따른 자동 점수 계산
3. 결과 데이터 SCA 포맷으로 출력

### 로스터 워크플로우  
1. 로스팅 배치별 품질 추적
2. 로스트 프로파일과 컵 품질 상관관계
3. 고객 피드백과 전문가 평가 비교

### 바리스타 워크플로우
1. 추출 레시피 개발 및 검증
2. 일관성 모니터링
3. 경연 대회용 정밀 분석

---

## 🔧 기술적 구현

### 데이터 구조
```typescript
interface LabTastingSession {
  sessionId: string;
  setup: LabSetup;
  samples: LabSampleInfo[];
  blindMode: BlindMode;
  extractions: ExtractionParameters[];
  sensoryData: ProfessionalSensory[];
  flavorProfiles: AdvancedFlavorProfile[];
  comparativeAnalysis: ComparativeAnalysis;
  report: LabReport;
  metadata: {
    taster: TasterProfile;
    timestamp: Date;
    duration: number;
    environment: EnvironmentLog;
  };
}
```

### API 통합
- **SCA 데이터베이스**: 표준 커피 데이터 연동
- **CoE 시스템**: Cup of Excellence 데이터 연계  
- **로스터 시스템**: 로스팅 데이터 직접 연동
- **분석 도구**: MATLAB, R 연동 지원

---

## 🚀 향후 발전 방향

### Phase 2 (초기)
- 기본 Lab Mode 인터페이스
- 블라인드 테이스팅 기능
- 전문가급 센서리 분석

### Phase 3 (고급)  
- AI 보조 분석 도구
- 머신러닝 품질 예측
- 실시간 전문가 네트워크

### Phase 4 (통합)
- IoT 추출 장비 연동
- 자동 환경 모니터링
- 블록체인 품질 추적

---

## 💰 수익화 모델

### 구독 서비스
- **Professional**: $29.99/월 (기본 Lab Mode)  
- **Enterprise**: $99.99/월 (팀 기능 + 고급 분석)
- **Academic**: $19.99/월 (교육 기관 할인)

### 추가 서비스
- 전문가 컨설팅 연결
- 커스텀 분석 보고서
- 장비 구매 연계

---

이 Lab Mode는 커피 업계의 전문가들이 요구하는 모든 기능을 갖춘 완전한 테이스팅 분석 도구입니다. Phase 2에서 구현되면 Coffee Journal을 전문가용 도구로도 확장할 수 있습니다.