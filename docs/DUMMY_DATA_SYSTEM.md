# DummyData System Documentation

## Overview
CupNote의 DummyData 시스템은 개발 및 테스트를 위한 두 가지 보완적인 더미 데이터 생성 도구를 제공합니다.

## 시스템 구성

### 1. DummyDataInput (입력 도우미)
**용도**: 화면별 맞춤형 더미 데이터 입력을 위한 플로팅 버튼
- **파일**: `/src/components/dev/DummyDataInput.tsx`
- **서비스**: `/src/services/DummyDataService.ts`
- **특징**: 
  - 40개 이상의 화면 지원
  - 화면 컨텍스트 인식
  - 복잡한 데이터 구조 생성
  - 실제 사용자 플로우 시뮬레이션

### 2. DummyDataCard (카드 생성기)
**용도**: 간단한 테스트 카드 3개 빠른 생성
- **파일**: `/src/services/DummyDataCardService.ts`
- **UI**: Developer Screen의 "📝 3개 생성" 버튼
- **특징**:
  - 3개의 다양한 커피 기록 즉시 생성
  - 최소 필수 필드만 포함
  - 통계, 저널, 성과 테스트용
  - 빠른 UI 검증

## 기능 비교

| 특징 | DummyDataInput | DummyDataCard |
|------|----------------|---------------|
| 생성 방식 | 화면별 맞춤형 | 일괄 3개 생성 |
| 데이터 복잡도 | 높음 (전체 필드) | 낮음 (필수 필드) |
| 사용 시나리오 | 특정 화면 테스트 | 빠른 데이터 채우기 |
| 접근 방법 | 플로팅 버튼 | 개발자 화면 |
| 데이터 다양성 | 화면별 특화 | 3가지 고정 패턴 |

## DummyDataInput 상세

### 지원 화면 (40+)
```typescript
// 주요 화면 예시
- Home: 홈 화면 대시보드 데이터
- CoffeeInfo: 커피 정보 입력
- Sensory: 감각 평가 데이터
- Result: 결과 화면 데이터
- LabMode: 실험실 모드 데이터
- HomeCafe: 홈카페 추출 데이터
// ... 40개 이상의 화면
```

### 사용 방법
1. 개발자 모드 활성화
2. 원하는 화면으로 이동
3. 플로팅 버튼 터치
4. 해당 화면에 맞는 더미 데이터 자동 입력

## DummyDataCard 상세

### 생성되는 데이터 (3개)
```typescript
1. 블루보틀 - 에티오피아 예가체프 (Hot, 85점)
   - 과일향, 꽃향
   - 높은 점수의 스페셜티 커피

2. 테라로사 - 콜롬비아 수프레모 (Cold, 78점)
   - 초콜릿, 견과류
   - 중간 점수의 균형잡힌 커피

3. 커피리브레 - 브라질 산토스 (Hot, 72점)
   - 달콤한, 카라멜
   - 일반적인 상업용 커피
```

### 사용 방법
1. 개발자 화면 진입
2. "📊 데이터 상태" 카드 확인
3. "📝 3개 생성" 버튼 터치
4. 즉시 3개 테스트 레코드 생성

## 주요 특징

### 1. 권한 관리
- 개발자/관리자만 접근 가능
- 베타 사용자는 접근 불가
- AccessControlService 통합

### 2. 상태 초기화
- 앱 시작 시 항상 OFF 상태
- 매 세션마다 수동 활성화 필요
- 프로덕션 안전성 보장

### 3. UI 연동
- 생성된 데이터는 즉시 UI에 반영
- StatCards: 통계 카드 업데이트
- Journal: 저널 목록 추가
- Achievements: 성과 진행도 반영

### 4. 데이터 관리
- "🗑️ 전체 삭제" 버튼으로 초기화
- "🔄 새로고침" 버튼으로 개수 확인
- DeviceEventEmitter로 실시간 동기화

## 기술 구현

### DummyDataInput 아키텍처

#### 화면 감지 로직
```typescript
// DummyDataInput.tsx
const getCurrentScreenName = (): string | null => {
  const screenContext = ScreenContextService.getCurrentScreen();
  if (screenContext?.name) {
    return screenContext.name;
  }
  
  // 폴백: navigation state에서 현재 라우트 확인
  const state = navigation.getState();
  const currentRoute = state.routes[state.index];
  return currentRoute?.name || null;
};
```

#### 화면별 데이터 생성 로직
```typescript
// DummyDataService.ts
static async generateDummyDataForScreen(screenName: string): Promise<void> {
  switch (screenName) {
    case 'CoffeeInfo':
      // 커피 정보 더미 데이터
      useTastingStore.getState().updateTasting({
        roastery: this.getRandomItem(ROASTERS),
        coffeeName: this.getRandomItem(COFFEE_NAMES),
        origin: this.getRandomItem(ORIGINS),
        temperature: Math.random() > 0.5 ? 'hot' : 'cold',
        // ... 추가 필드
      });
      break;
      
    case 'Sensory':
      // 감각 평가 더미 데이터
      const randomMouthfeel = this.getRandomItem(MOUTHFEEL_TYPES);
      const randomScores = {
        body: Math.floor(Math.random() * 5) + 1,
        acidity: Math.floor(Math.random() * 5) + 1,
        sweetness: Math.floor(Math.random() * 5) + 1,
        finish: Math.floor(Math.random() * 5) + 1,
      };
      useTastingStore.getState().updateSensoryAttribute(randomScores);
      break;
      
    // ... 40+ 화면 케이스
  }
}
```

### DummyDataCard 아키텍처

#### 데이터 생성 상세 로직
```typescript
// DummyDataCardService.ts
static async createSimpleRecords(): Promise<number> {
  const realmService = RealmService.getInstance();
  if (!realmService.isInitialized) {
    await realmService.initialize();
  }
  
  const realm = realmService.getRealm();
  let successCount = 0;
  
  realm.write(() => {
    testData.forEach((data, index) => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - index); // 시간 차이
      
      const testRecord = {
        id: String(uuid.v4()),
        createdAt: now,
        updatedAt: now,
        
        // 필수 커피 정보
        roastery: data.roastery,
        coffeeName: data.coffeeName,
        temperature: data.temperature,
        
        // 점수 계산
        matchScoreTotal: data.matchScoreTotal,
        matchScoreFlavor: Math.floor(data.matchScoreTotal * 0.5),
        matchScoreSensory: Math.floor(data.matchScoreTotal * 0.5),
        
        // 기본 감각 평가 (랜덤)
        sensoryAttribute: {
          body: 3 + Math.floor(Math.random() * 2),
          acidity: 2 + Math.floor(Math.random() * 3),
          sweetness: 3 + Math.floor(Math.random() * 2),
          finish: 3 + Math.floor(Math.random() * 2),
          mouthfeel: 'Clean' as const
        },
        
        isSynced: false,
        isDeleted: false,
        mode: 'cafe' as const
      };
      
      try {
        realm.create('TastingRecord', testRecord);
        successCount++;
      } catch (error) {
        Logger.error(`Failed to create record ${index + 1}`, 'service', { error });
      }
    });
  });
  
  return successCount;
}
```

## 모범 사례

### 개발 워크플로우
1. **초기 테스트**: DummyDataCard로 3개 생성
2. **화면별 테스트**: DummyDataInput으로 특정 화면 테스트
3. **통합 테스트**: 두 도구 조합 사용
4. **정리**: 전체 삭제 후 재시작

### 주의사항
- 프로덕션 빌드에서는 자동 비활성화
- 실제 사용자 데이터와 섞이지 않도록 주의
- 테스트 완료 후 반드시 삭제

## 데이터 구조 상세

### TastingRecord 스키마
```typescript
interface TastingRecord {
  // 기본 정보
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  // 커피 정보
  roastery: string;
  coffeeName: string;
  origin?: string;
  variety?: string;
  process?: string;
  roastLevel?: string;
  temperature: 'hot' | 'cold';
  
  // 평가 점수
  matchScoreTotal: number;     // 0-100
  matchScoreFlavor: number;    // 0-50
  matchScoreSensory: number;   // 0-50
  
  // 감각 평가
  sensoryAttribute: {
    body: number;        // 1-5
    acidity: number;     // 1-5
    sweetness: number;   // 1-5
    finish: number;      // 1-5
    mouthfeel: MouthfeelType;
  };
  
  // 플레이버 노트
  flavorNotes: FlavorNote[];
  
  // 한국어 감각 표현
  selectedSensoryExpressions?: SelectedSensoryExpression[];
  
  // 홈카페 데이터
  homeCafeData?: HomeCafeData;
  
  // 시스템 필드
  mode: 'cafe' | 'homecafe' | 'lab';
  isSynced: boolean;
  isDeleted: boolean;
}
```

## UI 연동 상세

### 생성 후 UI 업데이트 플로우
```typescript
// 1. 데이터 생성
const successCount = await DummyDataCardService.createSimpleRecords();

// 2. 이벤트 발생
DeviceEventEmitter.emit('refreshData');

// 3. 각 화면에서 리스너 등록
useEffect(() => {
  const subscription = DeviceEventEmitter.addListener('refreshData', () => {
    // 데이터 다시 로드
    loadTastingRecords();
    updateStatistics();
    checkAchievements();
  });
  
  return () => subscription.remove();
}, []);
```

### 영향받는 UI 컴포넌트
1. **HomeScreen**
   - 최근 기록 카드 업데이트
   - 통계 요약 갱신
   
2. **StatsScreen**
   - 총 기록 수 증가
   - 평균 점수 재계산
   - 선호도 차트 업데이트
   
3. **JournalScreen**
   - 기록 목록에 새 항목 추가
   - 필터링 옵션 업데이트
   
4. **AchievementsScreen**
   - 진행도 업데이트
   - 새 달성 조건 체크

## 디버깅 및 문제 해결

### 일반적인 문제
1. **데이터가 생성되지 않음**
   - 권한 확인: 개발자/관리자 권한 필요
   - Realm 초기화 상태 확인
   - 로그에서 에러 메시지 확인

2. **UI가 업데이트되지 않음**
   - DeviceEventEmitter 리스너 등록 확인
   - 화면 포커스 상태 확인
   - 데이터 필터링 조건 확인

3. **중복 데이터 생성**
   - 버튼 중복 클릭 방지 (isLoading 상태)
   - 트랜잭션 처리 확인

### 로깅 및 모니터링
```typescript
// 로그 레벨
Logger.debug('Creating simple mock records...', 'service');
Logger.info(`✅ Created ${successCount} simple mock records`, 'service');
Logger.error('Failed to create record', 'service', { error });

// 디버그 정보 확인
const checkDebugInfo = () => {
  console.log('Current records:', realm.objects('TastingRecord').length);
  console.log('Mock data state:', isDummyDataEnabled);
  console.log('User role:', AccessControlService.getCurrentUserRole());
};
```

## 보안 고려사항

1. **프로덕션 환경 보호**
   - `__DEV__` 플래그로 개발 환경 제한
   - 프로덕션 빌드에서 자동 비활성화
   - 민감한 데이터 포함 금지

2. **권한 관리**
   - AccessControlService 통합
   - 역할 기반 접근 제어 (RBAC)
   - 베타 사용자 접근 차단

3. **데이터 격리**
   - 테스트 데이터 명확한 표시
   - 실제 사용자 데이터와 분리
   - 삭제 기능 필수 제공

## 향후 개선 계획
1. **데이터 다양성 확대**
   - 더 많은 로스터리/커피 조합
   - 계절별 스페셜티 데이터
   - 다양한 추출 방법 데이터

2. **고급 기능**
   - 커스텀 시나리오 빌더
   - 데이터 템플릿 저장/불러오기
   - 벌크 데이터 생성 (100+)

3. **테스트 자동화**
   - E2E 테스트 통합
   - 성능 테스트 시나리오
   - 회귀 테스트 데이터셋

4. **분석 도구**
   - 생성된 데이터 통계 대시보드
   - 사용 패턴 분석
   - 테스트 커버리지 리포트