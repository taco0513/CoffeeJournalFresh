# Coffee Journal - Risk Prevention Strategy (시니어 개발자 최종 검수)

## 🔴 치명적인 문제 - 즉시 수정 필요

### 1. **Console Log 제거 방식이 위험함**
```javascript
// ❌ 절대 하면 안됨 - 코드 파괴 위험
content.replace(/console\.(log|warn|error|info)\(.*?\);?\n?/g, '');

// ✅ 프로덕션에서 검증된 방법
// babel-plugin-transform-remove-console 사용
// .babelrc.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ...(__DEV__ ? [] : ['transform-remove-console']),
  ],
};

// 또는 metro.config.js에서 처리
const { getDefaultConfig } = require('metro-config');
module.exports = (async () => {
  const config = await getDefaultConfig();
  if (!__DEV__) {
    config.transformer.minifierConfig = {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
      output: {
        ascii_only: true,
        quote_style: 3,
        wrap_iife: true,
      },
      sourceMap: {
        includeSources: false,
      },
      toplevel: false,
      compress: {
        drop_console: true, // 여기가 핵심
      },
    };
  }
  return config;
})();
```

### 2. **현재 앱에 가장 큰 위험 - Realm과 Supabase 동기화**
```typescript
// 현재 구조의 문제점:
// 1. 동기화 실패 시 데이터 불일치
// 2. 충돌 해결 전략 없음
// 3. 오프라인 큐 미구현

// ✅ 즉시 적용 가능한 해결책
class SyncManager {
  private syncInProgress = false;
  private failedSyncCount = 0;
  private readonly MAX_RETRY = 3;
  
  async syncWithRetry() {
    if (this.syncInProgress) return;
    
    this.syncInProgress = true;
    try {
      // 1단계: 로컬 변경사항 감지
      const localChanges = await this.detectLocalChanges();
      
      // 2단계: 배치로 동기화 (한번에 하나씩 X)
      const batches = this.createBatches(localChanges, 50);
      
      for (const batch of batches) {
        try {
          await this.syncBatch(batch);
          await this.markAsSynced(batch);
        } catch (error) {
          // 실패한 배치만 저장
          await this.saveFailedBatch(batch);
        }
      }
      
      // 3단계: 실패한 작업 재시도
      if (this.failedSyncCount < this.MAX_RETRY) {
        setTimeout(() => this.retrySyncFailed(), 5000 * Math.pow(2, this.failedSyncCount));
      }
    } finally {
      this.syncInProgress = false;
    }
  }
  
  private async detectLocalChanges() {
    // lastSyncedAt 타임스탬프 활용
    const lastSync = await AsyncStorage.getItem('lastSyncTimestamp');
    return realm.objects('TastingRecord').filtered(`updatedAt > ${lastSync}`);
  }
}
```

### 3. **메모리 누수 방지 전략 없음**
```typescript
// ✅ React Native 메모리 관리 필수 사항
class ComponentBase extends Component {
  private subscriptions: Array<() => void> = [];
  
  componentWillUnmount() {
    // 1. 모든 구독 해제
    this.subscriptions.forEach(unsub => unsub());
    
    // 2. 타이머 정리
    if (this.timer) clearTimeout(this.timer);
    
    // 3. 이미지 캐시 정리 (중요!)
    if (this.imageRefs) {
      this.imageRefs.forEach(ref => {
        if (ref.current) {
          ref.current.src = null;
        }
      });
    }
    
    // 4. Realm 리스너 해제
    if (this.realmResults) {
      this.realmResults.removeAllListeners();
    }
  }
}

// FlatList 최적화 (필수)
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  // 이 설정들이 없으면 메모리 폭발
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={10}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

## 🟡 실제 운영에서 자주 놓치는 부분들

### 1. **앱 업데이트 전략이 없음**
```typescript
// ✅ 필수 구현 - 강제 업데이트 시스템
import VersionCheck from 'react-native-version-check';

class UpdateManager {
  static async checkUpdate() {
    try {
      const updateNeeded = await VersionCheck.needUpdate();
      
      if (updateNeeded?.isNeeded) {
        const { currentVersion, latestVersion, storeUrl } = updateNeeded;
        
        // 서버에서 강제 업데이트 버전 확인
        const forceUpdateVersion = await this.getForceUpdateVersion();
        
        if (this.isVersionLower(currentVersion, forceUpdateVersion)) {
          // 강제 업데이트
          Alert.alert(
            '필수 업데이트',
            '앱을 계속 사용하려면 업데이트가 필요합니다.',
            [
              {
                text: '업데이트',
                onPress: () => Linking.openURL(storeUrl)
              }
            ],
            { cancelable: false }
          );
        }
      }
    } catch (error) {
      // 업데이트 체크 실패해도 앱은 실행되어야 함
      console.error('Update check failed:', error);
    }
  }
}
```

### 2. **네트워크 상태 관리가 빈약함**
```typescript
// ✅ 실제로 필요한 네트워크 관리
import NetInfo from '@react-native-community/netinfo';

class NetworkManager {
  private listeners = new Set<(isConnected: boolean) => void>();
  private isConnected = true;
  private connectionType = 'unknown';
  
  init() {
    NetInfo.addEventListener(state => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected && state.isInternetReachable;
      this.connectionType = state.type;
      
      // 연결 상태 변경 시
      if (wasConnected !== this.isConnected) {
        this.listeners.forEach(listener => listener(this.isConnected));
        
        // 오프라인 → 온라인 전환 시 동기화
        if (!wasConnected && this.isConnected) {
          SyncManager.getInstance().startSync();
        }
      }
      
      // 셀룰러 연결에서는 이미지 품질 낮춤
      if (state.type === 'cellular') {
        ImageManager.setQuality('low');
      }
    });
  }
  
  async waitForConnection(timeout = 30000): Promise<boolean> {
    if (this.isConnected) return true;
    
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), timeout);
      
      const unsubscribe = this.addListener((connected) => {
        if (connected) {
          clearTimeout(timer);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }
}
```

### 3. **에러 리포팅이 너무 단순함**
```typescript
// ✅ 프로덕션급 에러 핸들링
class ErrorReporter {
  static init() {
    // 1. JS 에러
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      // 사용자 정보 수집 (개인정보 제외)
      const context = {
        userId: this.getUserId(),
        sessionId: this.getSessionId(),
        deviceInfo: this.getDeviceInfo(),
        memoryUsage: this.getMemoryUsage(),
        lastActions: ActionLogger.getLastActions(10),
      };
      
      // 에러 분류
      const errorType = this.classifyError(error);
      
      // 중요도에 따라 다른 처리
      if (isFatal || errorType === 'CRITICAL') {
        // 즉시 전송
        this.sendImmediately(error, context);
        
        // 사용자에게 알림
        this.showCrashDialog();
      } else {
        // 배치로 전송
        this.queueError(error, context);
      }
    });
    
    // 2. Promise 거부
    global.Promise = class Promise extends global.Promise {
      constructor(executor) {
        super((resolve, reject) => {
          executor(resolve, (reason) => {
            ErrorReporter.logUnhandledRejection(reason);
            reject(reason);
          });
        });
      }
    };
  }
  
  private static classifyError(error: Error): string {
    if (error.message.includes('Network')) return 'NETWORK';
    if (error.message.includes('Permission')) return 'PERMISSION';
    if (error.message.includes('Memory')) return 'CRITICAL';
    return 'GENERAL';
  }
}
```

## 🟢 시니어가 추천하는 실용적 접근법

### 1. **점진적 개선 전략**
```typescript
// Phase 1 (즉시): 최소한의 안정성
- ErrorBoundary ✅ (이미 추가)
- 기본 크래시 리포팅 (Firebase Crashlytics)
- 네트워크 에러 재시도 (3회)
- 세션 타임아웃 (30분)

// Phase 2 (1주일): 데이터 안정성
- 오프라인 큐 구현
- 동기화 충돌 해결
- 데이터 백업 (일 1회)
- 메모리 모니터링

// Phase 3 (1개월): 사용자 경험
- 업데이트 시스템
- 성능 모니터링
- A/B 테스트
- 피드백 수집
```

### 2. **비용 효율적인 모니터링**
```typescript
// 무료 또는 저렴한 서비스 조합
// 1. Sentry (무료 티어로 충분)
const Sentry = require('@sentry/react-native');
Sentry.init({
  dsn: 'YOUR_DSN',
  sampleRate: __DEV__ ? 1.0 : 0.1, // 프로덕션은 10%만
});

// 2. Google Analytics (무료)
import analytics from '@react-native-firebase/analytics';

// 3. 자체 구현 성능 모니터링
class PerformanceMonitor {
  static measureScreen(screenName: string) {
    const startTime = Date.now();
    
    return {
      recordMount: () => {
        const mountTime = Date.now() - startTime;
        if (mountTime > 1000) {
          analytics().logEvent('slow_screen_mount', {
            screen: screenName,
            duration: mountTime,
          });
        }
      }
    };
  }
}
```

### 3. **테스트 전략 (현실적)**
```typescript
// E2E 테스트는 핵심 플로우만
// 1. 회원가입 → 로그인 → 첫 기록
// 2. 오프라인 → 온라인 전환
// 3. 데이터 복구

// 나머지는 단위 테스트로
describe('Critical Business Logic', () => {
  test('점수는 0-100 사이여야 함', () => {
    expect(validateScore(101)).toBe(100);
    expect(validateScore(-1)).toBe(0);
  });
  
  test('동기화 충돌 시 최신 데이터 우선', () => {
    const local = { id: '1', score: 80, updatedAt: '2024-01-01' };
    const remote = { id: '1', score: 90, updatedAt: '2024-01-02' };
    expect(resolveConflict(local, remote)).toBe(remote);
  });
});
```

## 🚨 TestFlight 전 필수 체크리스트 (현실적)

### 오늘 당장 해야 할 것
1. **Console log 제거** (babel plugin으로)
2. **기본 에러 트래킹** (Sentry 무료 티어)
3. **네트워크 재시도** (3회, exponential backoff)
4. **메모리 누수 방지** (FlatList 최적화)

### 1주일 내 해야 할 것
1. **오프라인 동기화 큐**
2. **강제 업데이트 시스템**
3. **기본 성능 모니터링**
4. **데이터 검증 강화**

### 나중에 해도 되는 것
1. 완벽한 보안 (일단 HTTPS만 확인)
2. 복잡한 분석 시스템
3. 자동화된 E2E 테스트
4. 마이크로 최적화

## 💡 시니어의 조언

1. **완벽함보다 안정성**: 기능이 적어도 안정적인 앱이 낫다
2. **점진적 개선**: 한 번에 모든 걸 하려 하지 마라
3. **실사용자 피드백**: 추측하지 말고 데이터로 결정하라
4. **빠른 대응**: 문제 발생 시 핫픽스를 빠르게 배포할 수 있는 체계
5. **백업 플랜**: 모든 중요 기능에는 fallback이 있어야 함

## 🎯 결론

현재 앱의 가장 큰 리스크는:
1. Realm-Supabase 동기화 실패로 인한 데이터 손실
2. 메모리 누수로 인한 앱 크래시
3. 네트워크 에러 처리 미흡

이 세 가지만 해결해도 베타 테스트는 충분히 가능하다.