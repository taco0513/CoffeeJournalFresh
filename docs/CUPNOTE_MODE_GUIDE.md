# CupNote 모드 가이드

## 개요
CupNote는 사용자의 수준과 필요에 따라 3가지 모드를 제공합니다:

### 1. 카페 모드
- 카페에서 마신 커피를 간편하게 기록
- 카페명과 기본 커피 정보만 입력

### 2. 홈카페 모드 (간소화)
- **5개 필드로 빠르게 기록**
- 취미로 커피를 내리는 일반 사용자를 위한 모드
- V60, 칼리타, 케멕스, 기타 4가지 드리퍼만 지원
- 원터치 타이머와 프리셋 기능

### 3. 랩 모드 (고급)
- **20개+ 필드로 전문가 수준 분석**
- 10개 모든 드리퍼 지원
- 블룸, 붓기 패턴, 채널링, TDS 등 상세 기록

## 홈카페 모드 (간소화) 상세

### 필수 입력 (3개)
1. **드리퍼**: V60, 칼리타, 케멕스, 기타
2. **레시피**:
   - 원두량 (g)
   - 물량 (ml)

### 선택 입력 (4개)
3. **물 온도**: 90-96°C 슬라이더
4. **그라인딩 메모**: 예) "2클릭 더 굵게"
5. **추출 노트**: 추출 과정에 대한 메모
6. **추출시간**: 타이머로 자동 측정

### 편의 기능
- **빠른 레시피**: 3개 프리셋 선택 (아침 V60, 진한 커피, 연한 커피)
- **스톱워치 타이머**: 
  - 시작/정지
  - 추출타임 기록 (1차 추출(뜸), 2차 추출, 3차 추출...)
  - 각 단계별 시간 저장
- **비율 자동 계산**: 1:15, 1:16 등

## 랩 모드 (고급) 상세

### 장비 설정
- **드리퍼**: 10종 (V60, Kalita Wave, Origami, Chemex, Fellow Stagg, April, Orea, Flower, Blue Bottle, Timemore)
- **필터**: 6종 (표백, 갈색, 웨이브, 케멕스, 메탈, 융)
- **그라인더**: 브랜드, 모델, 설정값

### 레시피 상세
- **기본**: 원두량, 물량, 비율, 온도
- **블룸**: 물량, 시간, 교반 여부
- **붓기**: 기법(5종), 횟수, 간격
- **시간**: 총 추출시간, 드로우다운

### 고급 분석
- **TDS**: Total Dissolved Solids 측정
- **추출 수율**: Extraction Yield 계산
- **교반**: 방법과 타이밍
- **실험 노트**: 채널링, 머드베드, 다음 실험 계획

## 모드별 비교

| 항목 | 홈카페 모드 | 랩 모드 |
|------|------------|----------|
| 드리퍼 | 4개 | 10개+ |
| 필드 수 | 5개 | 20개+ |
| 블룸 설정 | ❌ | ✅ |
| 붓기 패턴 | ❌ | ✅ |
| TDS/추출수율 | ❌ | ✅ |
| 소요 시간 | 30초 | 5분+ |
| 대상 | 취미 | 전문가 |

## 성장 전략
1. **카페 모드로 시작**: 커피 기록 습관 형성
2. **홈카페 모드로 성장**: 집에서 커피 내리기 시작
3. **랩 모드로 전문화**: 상세 분석과 실험

## TypeScript 인터페이스

### 홈카페 모드 (간소화)
```typescript
export type SimpleDripper = 'V60' | 'KalitaWave' | 'Chemex' | 'Other';

export interface SimpleHomeCafeData {
  dripper: SimpleDripper;
  recipe: {
    coffeeAmount: number;  // g
    waterAmount: number;   // ml
    brewTime?: number;     // seconds (자동 타이머)
    lapTimes?: { time: number; label: string }[]; // 랩 타임 기록
  };
  waterTemp?: number;      // °C (선택)
  grindNote?: string;      // "2클릭 더 굵게" (선택)
  quickNote?: string;      // 추출 노트 (선택)
}
```

### 랩 모드 (고급)
```typescript
export type PouroverDripper = 
  | 'V60' | 'KalitaWave' | 'Origami' | 'Chemex' 
  | 'FellowStagg' | 'April' | 'Orea' | 'FlowerDripper'
  | 'BluebottleDripper' | 'TimemoreCrystalEye' | 'Other';

export interface LabModeData extends HomeCafeData {
  tds?: number;
  extractionYield?: number;
  comparison?: {
    variable: string;
    previousValue: any;
    currentValue: any;
    result: string;
  };
  agitation?: {
    method: 'none' | 'stir' | 'swirl' | 'tap';
    timing: string[];
  };
}
```

## 구현 현황
- ✅ SimpleHomeCafeData 타입 정의
- ✅ HomeCafeSimpleForm 컴포넌트
- ✅ LabModeForm 컴포넌트
- ✅ LabModeScreen 스크린
- ✅ 스토어 업데이트 (3가지 모드 지원)
- ✅ 모드 선택 화면 업데이트

## 마이그레이션 전략
1. **기존 사용자**: 현재 복잡한 홈카페 데이터는 랩 모드에서 확인 가능
2. **신규 사용자**: 간소화된 홈카페 모드로 시작
3. **파워 유저**: 랩 모드 안내 및 전환 유도