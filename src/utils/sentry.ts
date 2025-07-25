// import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';

// Mock Sentry types and functions for when Sentry is disabled
type SentryEvent = any;
type SentryEventHint = any;
type SentryBreadcrumb = any;
type SentryScope = any;
type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

const Sentry = {
  init: (options?: any) => {},
  setUser: (user: any) => {},
  captureException: (error: any, context?: any) => {},
  captureMessage: (message: string, level?: SeverityLevel) => {},
  withScope: (callback: (scope: any) => void) => callback({
    setContext: () => {},
  }),
  startTransaction: (context: any) => ({ finish: () => {} }),
  reactNativeTracingIntegration: (options?: any) => ({}),
  reactNavigationIntegration: () => ({}),
};

export const initSentry = () => {
  // Temporarily skip Sentry initialization due to build issues
  console.log('[Sentry] Temporarily disabled for testing');
  return;
  
  // Skip Sentry initialization if no DSN is provided
  if (!Config.SENTRY_DSN || Config.SENTRY_DSN === 'your_sentry_dsn_here') {
    console.log('[Sentry] Skipping initialization - no DSN provided');
    return;
  }
  
  Sentry.init({
    dsn: Config.SENTRY_DSN,
    
    // 환경 설정
    environment: __DEV__ ? 'development' : 'production',
    
    // 샘플링 비율 (개발: 100%, 프로덕션: 10%)
    sampleRate: __DEV__ ? 1.0 : 0.1,
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    
    // 디버그 모드
    debug: __DEV__,
    
    // 릴리즈 정보
    release: '1.0.0',
    
    // 통합 설정
    integrations: [
      Sentry.reactNativeTracingIntegration({
        routingInstrumentation: Sentry.reactNavigationIntegration(),
        tracingOrigins: ['localhost', /^\//],
      }),
    ],
    
    // 민감 정보 필터링
    beforeSend: (event: SentryEvent, hint: SentryEventHint) => {
      // 개발 환경에서는 모든 이벤트 전송
      if (__DEV__) {
        return event;
      }
      
      // 민감 정보 제거
      if (event.user?.email) {
        event.user.email = '[REDACTED]';
      }
      
      // 토큰, 비밀번호 등 민감 정보 필터링
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      
      // breadcrumbs에서 민감 정보 필터링
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.filter((crumb: SentryBreadcrumb) => {
          const message = crumb.message?.toLowerCase() || '';
          return !message.includes('password') && 
                 !message.includes('token') &&
                 !message.includes('secret');
        });
      }
      
      // 특정 에러 무시
      const error = hint.originalException;
      if (error && error instanceof Error) {
        // 네트워크 에러는 정보성으로만 기록
        if (error.message?.includes('Network request failed')) {
          event.level = 'info';
        }
        
        // 개발 중 의도적인 에러는 무시
        if (error.message?.includes('__DEV__')) {
          return null;
        }
      }
      
      return event;
    },
    
    // 브레드크럼 설정
    beforeBreadcrumb: (breadcrumb: SentryBreadcrumb) => {
      // console 브레드크럼 필터링
      if (breadcrumb.category === 'console' && !__DEV__) {
        return null;
      }
      
      // 민감한 네비게이션 정보 필터링
      if (breadcrumb.category === 'navigation' && breadcrumb.data?.params) {
        delete breadcrumb.data.params;
      }
      
      return breadcrumb;
    },
  });
};

// 사용자 정보 설정 (로그인 후 호출)
export const setSentryUser = (user: { id: string; username?: string }) => {
  // Temporarily disabled
  console.log('[Sentry] setSentryUser temporarily disabled');
  return;
  
  Sentry.setUser({
    id: user.id,
    username: user.username,
    // email은 의도적으로 제외 (개인정보 보호)
  });
};

// 사용자 정보 초기화 (로그아웃 시 호출)
export const clearSentryUser = () => {
  // Temporarily disabled
  console.log('[Sentry] clearSentryUser temporarily disabled');
  return;
  
  Sentry.setUser(null);
};

// 커스텀 에러 리포팅
export const reportError = (error: Error, context?: Record<string, any>) => {
  // Temporarily disabled
  console.error('[Sentry] reportError temporarily disabled:', error);
  return;
  
  Sentry.withScope((scope: SentryScope) => {
    if (context) {
      scope.setContext('custom', context);
    }
    Sentry.captureException(error);
  });
};

// 성능 모니터링용 트랜잭션
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({ name, op });
};

// 커스텀 메시지 (디버깅용)
export const logMessage = (message: string, level: SeverityLevel = 'info') => {
  if (__DEV__) {
    console.log(`[Sentry ${level}]:`, message);
  }
  Sentry.captureMessage(message, level);
};