import NetInfo from '@react-native-community/netinfo';
// import { reportError } from './sentry';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  timeout?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class NetworkUtils {
  private static isOnline = true;
  private static listeners = new Set<(isOnline: boolean) => void>();

  static {
    // 네트워크 상태 모니터링 초기화
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;
      
      if (wasOnline !== this.isOnline) {
        this.listeners.forEach(listener => listener(this.isOnline));
      }
    });
  }

  /**
   * 네트워크 상태 리스너 추가
   */
  static addConnectionListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 현재 네트워크 연결 상태 확인
   */
  static async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  }

  /**
   * 네트워크 연결 대기
   */
  static async waitForConnection(timeout = 30000): Promise<boolean> {
    if (await this.isConnected()) return true;

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeout);

      const unsubscribe = this.addConnectionListener((isOnline) => {
        if (isOnline) {
          clearTimeout(timer);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }

  /**
   * Exponential backoff를 사용한 재시도 로직
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      maxDelay = 30000,
      backoffFactor = 2,
      timeout = 60000,
      onRetry
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // 타임아웃 적용
        const result = await this.withTimeout(fn(), timeout);
        return result;
      } catch (error) {
        lastError = error as Error;

        // 재시도 불가능한 에러는 즉시 throw
        if (!this.isRetryableError(error)) {
          throw error;
        }

        // 마지막 시도였으면 에러 throw
        if (attempt === maxRetries) {
          break;
        }

        // 재시도 전 대기
        const delay = Math.min(
          initialDelay * Math.pow(backoffFactor, attempt),
          maxDelay
        );

        // 재시도 콜백 호출
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        // 네트워크 연결 대기
        if (!await this.isConnected()) {
          console.log(`[NetworkUtils] Waiting for network connection...`);
          const connected = await this.waitForConnection(delay);
          if (!connected) {
            throw new NetworkError('Network connection timeout');
          }
        } else {
          // Exponential backoff delay
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // 모든 재시도 실패
    // reportError(lastError!, {
    //   context: 'network_retry_exhausted',
    //   maxRetries,
    //   lastAttempt: maxRetries + 1
    // });
    console.error('[NetworkUtils] All retries exhausted:', lastError);

    throw lastError!;
  }

  /**
   * fetch with retry
   */
  static async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retryOptions?: RetryOptions
  ): Promise<Response> {
    return this.retry(
      async () => {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        // 4xx 에러는 재시도하지 않음
        if (response.status >= 400 && response.status < 500) {
          const error = new NetworkError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
          throw error;
        }

        // 5xx 에러는 재시도
        if (!response.ok) {
          throw new NetworkError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }

        return response;
      },
      {
        ...retryOptions,
        onRetry: (attempt, error) => {
          console.log(`[NetworkUtils] Retry attempt ${attempt} after error:`, error.message);
          retryOptions?.onRetry?.(attempt, error);
        }
      }
    );
  }

  /**
   * 재시도 가능한 에러인지 확인
   */
  private static isRetryableError(error: any): boolean {
    // 네트워크 에러
    if (error.message?.includes('Network request failed')) return true;
    if (error.message?.includes('fetch error')) return true;
    if (error.message?.includes('Failed to fetch')) return true;
    
    // 타임아웃
    if (error.message?.includes('timeout')) return true;
    
    // HTTP 5xx 에러
    if (error.statusCode && error.statusCode >= 500) return true;
    
    // 특정 에러 코드
    if (error.code === 'ECONNREFUSED') return true;
    if (error.code === 'ETIMEDOUT') return true;
    if (error.code === 'ENOTFOUND') return true;
    
    return false;
  }

  /**
   * Promise에 타임아웃 적용
   */
  private static async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
  }

  /**
   * 네트워크 품질 확인
   */
  static async getNetworkQuality(): Promise<'high' | 'medium' | 'low' | 'offline'> {
    const state = await NetInfo.fetch();
    
    if (!state.isConnected || !state.isInternetReachable) {
      return 'offline';
    }

    // 셀룰러 연결인 경우
    if (state.type === 'cellular') {
      const cellularGeneration = state.details?.cellularGeneration;
      if (cellularGeneration === '2g') return 'low';
      if (cellularGeneration === '3g') return 'medium';
      return 'high'; // 4g, 5g
    }

    // WiFi 또는 기타 연결
    return 'high';
  }

  /**
   * 네트워크 상태에 따른 요청 최적화
   */
  static async optimizedFetch(
    url: string,
    options: RequestInit = {},
    retryOptions?: RetryOptions
  ): Promise<Response> {
    const quality = await this.getNetworkQuality();
    
    // 네트워크 품질에 따라 재시도 옵션 조정
    const optimizedRetryOptions = {
      ...retryOptions,
      maxRetries: quality === 'low' ? 5 : 3,
      initialDelay: quality === 'low' ? 2000 : 1000,
      timeout: quality === 'low' ? 120000 : 60000,
    };

    // 저품질 네트워크에서는 헤더 추가
    if (quality === 'low' || quality === 'medium') {
      options.headers = {
        ...options.headers,
        'X-Network-Quality': quality,
      };
    }

    return this.fetchWithRetry(url, options, optimizedRetryOptions);
  }
}

// 기본 export
export default NetworkUtils;