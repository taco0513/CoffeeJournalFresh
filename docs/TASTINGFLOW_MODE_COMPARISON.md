# 🍃🔬 TastingFlow Mode Comparison

## 개요

Coffee Journal의 TastingFlow는 사용자 타입과 전문성 수준에 따라 두 가지 모드로 구분됩니다. 이 문서는 **Cafe Mode**와 **Lab Mode**의 차이점과 전환 전략을 상세히 비교합니다.

---

## 📊 모드별 핵심 비교

| 구분 | 🍃 Cafe Mode (Phase 1) | 🔬 Lab Mode (Phase 2) |
|------|----------------------|---------------------|
| **대상 사용자** | 일반 커피 애호가 | 전문가, 바리스타, 로스터 |
| **복잡도** | 간단 (3-6단계) | 복합 (8-12단계) |
| **소요 시간** | 5-15분 | 30-90분 |
| **데이터 정밀도** | 기본적 | 전문가급 정밀 |
| **결과 형태** | 간단한 점수 & 격려 | 상세 분석 보고서 |
| **가격** | 무료 | $29.99/월 |

---

## 🎯 사용자 여정 비교

### 🍃 Cafe Mode 사용자 여정

```
일반 커피 애호가
    ↓
"이 커피는 어떤 맛이지?"
    ↓
기본 정보 입력 (커피명, 로스터리, 카페, 온도)
    ↓
향미 휠로 향미 선택 (최대 5개)
    ↓
슬라이더로 감각 평가 (body, acidity, sweetness, finish)
    ↓
개인 노트 작성
    ↓
로스터 노트와 비교
    ↓
격려하는 결과 & 성장 추적
    ↓
"오늘도 새로운 맛을 발견했어요! 🎉"
```

**핵심 목표**: 부담 없는 취향 발견과 성장 여정

### 🔬 Lab Mode 사용자 여정

```
커피 전문가 (Q Grader, 바리스타)
    ↓
"이 커피의 품질을 정확히 평가해야 해"
    ↓
실험 환경 설정 (온도, 습도, 장비)
    ↓
상세한 샘플 정보 입력 (농장, 가공, 로스팅)
    ↓
블라인드 테스팅 설정
    ↓
정밀한 추출 변수 기록
    ↓
SCA 표준 센서리 분석
    ↓
고급 향미 프로파일링
    ↓
비교 분석 및 통계 처리
    ↓
전문 보고서 생성 & 내보내기
    ↓
"정확한 품질 평가와 개선점을 파악했다"
```

**핵심 목표**: 정밀한 품질 평가와 전문적 분석

---

## 🔧 기능별 상세 비교

### 1. 커피 정보 입력

#### 🍃 Cafe Mode
```typescript
interface CafeInfo {
  coffeeName: string;        // 필수
  roastery: string;         // 필수
  cafeName: string;         // 필수 ('Home' 선택 가능)
  temperature: 'hot' | 'ice'; // 필수
  origin?: string;          // 선택
  variety?: string;         // 선택
  altitude?: string;        // 선택
  process?: string;         // 선택
  roastLevel?: string;      // 선택
}
```
- **입력 시간**: 1-2분
- **자동완성**: 기본 지원
- **필수 필드**: 4개 (커피명, 로스터리, 카페, 온도)

#### 🔬 Lab Mode  
```typescript
interface LabInfo {
  sampleId: string;         // 샘플 코드
  farm: string;            // 농장
  variety: string;         // 품종
  altitude: number;        // 재배 고도
  processDetails: ProcessInfo;  // 상세 가공법
  roastProfile: RoastData; // 로스팅 프로파일
  storage: StorageInfo;    // 보관 조건
  // ... 20+ 필드
}
```
- **입력 시간**: 5-10분
- **바코드/QR**: 지원
- **필수 필드**: 15개 이상

### 2. 향미 선택

#### 🍃 Cafe Mode
- **향미 휠**: 기본 향미 휠 (2단계 선택)
- **최대 선택**: 5개
- **개인 라이브러리**: 즐겨 사용하는 향미 저장
- **설명**: 친숙한 용어 사용

#### 🔬 Lab Mode
- **전체 향미 휠**: SCA 표준 86개 향미
- **강도 맵핑**: 각 향미별 강도 측정
- **시간축 분석**: 초기-중간-마무리 향미
- **화학적 연관**: 성분과 향미 연결

### 3. 센서리 분석

#### 🍃 Cafe Mode
```typescript
{
  body: [1-5, 0.5 step],
  acidity: [1-5, 0.5 step],
  sweetness: [1-5, 0.5 step],
  finish: [1-5, 0.5 step]
}
```

#### 🔬 Lab Mode
```typescript
{
  fragrance: [1-10, 0.25 step],
  aroma: [1-10, 0.25 step], 
  flavor: [1-10, 0.25 step],
  aftertaste: [1-10, 0.25 step],
  acidity: [1-10, 0.25 step],
  body: [1-10, 0.25 step],
  balance: [1-10, 0.25 step],
  uniformity: [0-10, 2 step],
  cleanCup: [0-10, 2 step],
  sweetness: [0-10, 2 step],
  overall: [1-10, 0.25 step]
}
```

### 4. 결과 및 보고서

#### 🍃 Cafe Mode
```typescript
interface CafeResult {
  personalScore: number;           // 개인 만족도
  roasterMatching?: number;        // 로스터 노트 일치도
  roasterNotes?: string;           // 로스터 노트
  personalNote?: string;           // 내 노트
  encouragement: string;           // "훌륭해요! 🎉"
  growthIndicator: string;         // 성장 지표
  suggestions: string[];           // 다음 추천
}
```

**표현 방식**:
- 격려 중심 메시지
- 성장 여정 추적
- 간단한 시각화

#### 🔬 Lab Mode
```typescript
interface LabReport {
  finalScore: number;              // SCA 100점 만점
  sensoryProfile: RadarChart;      // 센서리 레이더
  flavorMap: FlavorMapping;        // 향미 분포도
  defectAnalysis: DefectReport;    // 결함 분석
  benchmarkComparison: ComparisonData; // 벤치마크
  recommendations: string[];       // 전문가 권장사항
  exportFormats: ExportOptions;    // PDF, CSV 등
}
```

**표현 방식**:
- 객관적 수치 데이터
- 상세한 차트 및 그래프  
- 전문 용어 사용
- 내보내기 기능

---

## 🚀 사용자 전환 경로

### Cafe Mode → Lab Mode 자연스러운 전환

#### 1단계: 숙련도 증가 감지
```typescript
interface UserProgression {
  tastingCount: number;           // 테이스팅 횟수
  flavorVocabulary: number;      // 향미 어휘 수
  consistencyScore: number;       // 일관성 점수
  detailLevel: number;           // 상세도 레벨
}

// 전환 추천 조건
const suggestLabMode = (user: UserProgression) => {
  return user.tastingCount > 50 && 
         user.flavorVocabulary > 20 &&
         user.consistencyScore > 0.7 &&
         user.detailLevel > 0.8;
};
```

#### 2단계: 점진적 기능 노출
- **Preview 기능**: Lab Mode 일부 기능 체험
- **Bridge UI**: 중간 복잡도 인터페이스 제공
- **Tutorial**: 전문가급 도구 사용법 안내

#### 3단계: 구독 전환
- **무료 체험**: 월 3회 Lab Mode 사용
- **할인 혜택**: 첫 달 50% 할인
- **단계별 구독**: Basic → Professional → Enterprise

### Lab Mode → Cafe Mode 역방향 지원
- **간편 모드**: Lab Mode 내에서 빠른 기록
- **데이터 호환**: Lab 데이터를 Cafe Mode에서도 확인
- **유연한 전환**: 상황에 따라 모드 선택 가능

---

## 💡 개발 전략

### Phase 1 (현재): Cafe Mode 완성
1. **Core UX** 완벽 구현 (중급자 수준 통일)
2. **사용자 기반** 확보 (10,000+ 사용자)
3. **데이터 수집** 및 패턴 분석
4. **피드백 반영** 및 개선

### Phase 2: Lab Mode 개발
1. **전문가 자문단** 구성
2. **MVP Lab Mode** 개발
3. **베타 테스트** (전문가 그룹)
4. **구독 모델** 런칭

### Phase 3: 통합 및 고도화
1. **AI 기능** 추가
2. **모드 간 연계** 강화
3. **전문가 네트워크** 구축
4. **글로벌 확장**

---

## 📈 비즈니스 임팩트

### 사용자 확장성
```
Cafe Mode (무료)
├── MAU: 100,000명 목표
├── 전환율: 5% → Lab Mode
└── 수익: 구독 + 광고

Lab Mode (유료)
├── 구독자: 5,000명 목표  
├── ARPU: $29.99/월
└── 수익: $1.5M/년
```

### 시장 포지셔닝
- **Cafe Mode**: 대중 시장 (Competitor: 일반 커피 앱들)
- **Lab Mode**: 전문가 시장 (Competitor: VST, Cropster 등)

### 경쟁 우위
1. **통합 플랫폼**: 초보자부터 전문가까지
2. **자연스러운 전환**: 사용자 성장에 맞춘 진화
3. **데이터 일관성**: 모든 레벨에서 동일한 데이터 구조
4. **커뮤니티 효과**: 서로 다른 레벨 간 상호작용

---

## 🎯 성공 지표 (KPI)

### Cafe Mode KPI
- **사용자 참여**: DAU/MAU 비율 > 25%
- **완료율**: 테이스팅 완료율 > 80%
- **성장**: 월간 향미 어휘 증가율 > 15%
- **만족도**: 앱 스토어 평점 > 4.5점

### Lab Mode KPI  
- **전환율**: Cafe → Lab 전환율 > 5%
- **구독 유지**: 월간 이탈률 < 5%
- **사용 깊이**: 평균 세션 시간 > 45분
- **전문가 만족**: NPS 점수 > 70

### 통합 KPI
- **생태계 건강성**: 모드 간 전환 빈도 > 20%
- **수익 다양성**: 무료/유료 사용자 밸런스
- **브랜드 인지도**: 전문가 커뮤니티 내 인지도
- **글로벌 확장**: 해외 전문가 사용률

---

이 비교 문서를 통해 개발팀은 각 모드의 명확한 차이점을 이해하고, 사용자의 성장 여정에 맞는 기능을 제공할 수 있습니다. MVP에서는 Cafe Mode에 집중하되, 향후 Lab Mode로의 자연스러운 확장 경로를 염두에 두고 개발을 진행해야 합니다.