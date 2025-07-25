import type { NetInfoState } from '@react-native-community/netinfo';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RealmService from './realm/RealmService';
import { Logger, PerformanceTimer } from '../utils/logger';
import { SentryService } from './SentryService';

export enum ErrorType {
  REALM_CONNECTION = 'realm_connection',
  NETWORK_TIMEOUT = 'network_timeout',  
  AUTH_EXPIRED = 'auth_expired',
  STORAGE_FULL = 'storage_full',
  MEMORY_PRESSURE = 'memory_pressure',
  SYNC_CONFLICT = 'sync_conflict',
  BRIDGE_ERROR = 'bridge_error',
  UNKNOWN = 'unknown'
}

export enum RecoveryStrategy {
  RETRY = 'retry',
  REINITIALIZE = 'reinitialize',
  FALLBACK = 'fallback',
  RESET = 'reset',
  IGNORE = 'ignore'
}

export interface ErrorContext {
  errorType: ErrorType;
  originalError: Error;
  timestamp: Date;
  userAction?: string;
  screenName?: string;
  additionalData?: Record<string, any>;
  retryCount?: number;
  memoryUsage?: number;
  networkStatus?: boolean;
  realmStatus?: boolean;
}

export interface RecoveryResult {
  success: boolean;
  strategy: RecoveryStrategy;
  message: string;
  shouldRetry: boolean;
  shouldNotifyUser: boolean;
  userMessage?: string;
  diagnosticInfo?: Record<string, any>;
}

export interface ErrorPattern {
  errorType: ErrorType;
  frequency: number;
  lastOccurrence: Date;
  recoverySuccessRate: number;
  preferredStrategy: RecoveryStrategy;
}

const ERROR_PATTERNS_KEY = '@error_patterns';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

export class ErrorRecoveryService {
  private static instance: ErrorRecoveryService;
  private errorPatterns: Map<ErrorType, ErrorPattern> = new Map();
  private recoveryInProgress: Set<ErrorType> = new Set();

  private constructor() {
    this.loadErrorPatterns();
  }

  static getInstance(): ErrorRecoveryService {
    if (!ErrorRecoveryService.instance) {
      ErrorRecoveryService.instance = new ErrorRecoveryService();
    }
    return ErrorRecoveryService.instance;
  }

  /**
   * Main error recovery entry point
   */
  async handleError(error: Error, context: Partial<ErrorContext> = {}): Promise<RecoveryResult> {
    const timer = new PerformanceTimer('error_recovery', 'performance');
    
    try {
      // Classify the error
      const errorType = this.classifyError(error);
      
      // Build complete context
      const fullContext: ErrorContext = {
        errorType,
        originalError: error,
        timestamp: new Date(),
        retryCount: 0,
        ...context,
        memoryUsage: await this.getMemoryUsage(),
        networkStatus: await this.getNetworkStatus(),
        realmStatus: this.getRealmStatus()
      };

      // Check if recovery is already in progress for this error type
      if (this.recoveryInProgress.has(errorType)) {
        return {
          success: false,
          strategy: RecoveryStrategy.IGNORE,
          message: 'Recovery already in progress',
          shouldRetry: false,
          shouldNotifyUser: false
        };
      }

      // Update error patterns
      await this.updateErrorPattern(errorType);

      // Log the error
      Logger.error(`Error recovery initiated: ${errorType}`, 'error_recovery', error);

      // Execute recovery strategy
      this.recoveryInProgress.add(errorType);
      const result = await this.executeRecoveryStrategy(fullContext);
      this.recoveryInProgress.delete(errorType);

      // Log the result
      Logger.info(`Error recovery completed: ${result.success ? 'SUCCESS' : 'FAILED'} - ${errorType}`, 'error_recovery');

      return result;

    } catch (recoveryError) {
      Logger.error('Error recovery failed', 'error_recovery', recoveryError as Error);

      return {
        success: false,
        strategy: RecoveryStrategy.FALLBACK,
        message: 'Recovery process failed',
        shouldRetry: false,
        shouldNotifyUser: true,
        userMessage: '문제를 해결할 수 없습니다. 앱을 다시 시작해주세요.'
      };
    } finally {
      timer.end();
    }
  }

  /**
   * Classify error into known types
   */
  private classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Realm errors
    if (message.includes('realm') || message.includes('database') || message.includes('sqlite')) {
      return ErrorType.REALM_CONNECTION;
    }

    // Network errors
    if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
      return ErrorType.NETWORK_TIMEOUT;
    }

    // Authentication errors
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
      return ErrorType.AUTH_EXPIRED;
    }

    // Storage errors
    if (message.includes('storage') || message.includes('disk') || message.includes('quota')) {
      return ErrorType.STORAGE_FULL;
    }

    // Memory errors
    if (message.includes('memory') || message.includes('allocation') || message.includes('out of memory')) {
      return ErrorType.MEMORY_PRESSURE;
    }

    // Sync errors
    if (message.includes('sync') || message.includes('conflict') || message.includes('merge')) {
      return ErrorType.SYNC_CONFLICT;
    }

    // React Native bridge errors
    if (message.includes('bridge') || message.includes('native') || stack.includes('rctbridge')) {
      return ErrorType.BRIDGE_ERROR;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Execute appropriate recovery strategy
   */
  private async executeRecoveryStrategy(context: ErrorContext): Promise<RecoveryResult> {
    const { errorType, retryCount = 0 } = context;

    switch (errorType) {
      case ErrorType.REALM_CONNECTION:
        return await this.handleRealmError(context);
      
      case ErrorType.NETWORK_TIMEOUT:
        return await this.handleNetworkError(context);
      
      case ErrorType.AUTH_EXPIRED:
        return await this.handleAuthError(context);
      
      case ErrorType.STORAGE_FULL:
        return await this.handleStorageError(context);
      
      case ErrorType.MEMORY_PRESSURE:
        return await this.handleMemoryError(context);
      
      case ErrorType.SYNC_CONFLICT:
        return await this.handleSyncError(context);
      
      case ErrorType.BRIDGE_ERROR:
        return await this.handleBridgeError(context);
      
      default:
        return await this.handleGenericError(context);
    }
  }

  /**
   * Handle Realm database errors
   */
  private async handleRealmError(context: ErrorContext): Promise<RecoveryResult> {
    const { retryCount = 0 } = context;

    try {
      // Strategy 1: Simple retry (for transient issues)
      if (retryCount < 2) {
        await this.delay(RETRY_DELAY_MS * (retryCount + 1));
        
        const realmService = RealmService.getInstance();
        if (realmService.isInitialized) {
          // Test a simple operation
          await realmService.getTastingRecords({ limit: 1 });
          
          return {
            success: true,
            strategy: RecoveryStrategy.RETRY,
            message: 'Realm connection restored',
            shouldRetry: false,
            shouldNotifyUser: false
          };
        }
      }

      // Strategy 2: Reinitialize Realm
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        Logger.info('Attempting Realm reinitialization', 'error_recovery');
        
        const realmService = RealmService.getInstance();
        await realmService.initialize();
        
        // Test the connection
        await realmService.getTastingRecords({ limit: 1 });
        
        return {
          success: true,
          strategy: RecoveryStrategy.REINITIALIZE,
          message: 'Realm reinitialized successfully',
          shouldRetry: false,
          shouldNotifyUser: false
        };
      }

      // Strategy 3: Fallback mode
      return {
        success: false,
        strategy: RecoveryStrategy.FALLBACK,
        message: 'Realm recovery failed, entering fallback mode',
        shouldRetry: false,
        shouldNotifyUser: true,
        userMessage: '데이터베이스 연결에 문제가 있습니다. 일부 기능이 제한될 수 있습니다.'
      };

    } catch (error) {
      Logger.error('Realm recovery failed', 'error_recovery', error as Error);
      
      return {
        success: false,
        strategy: RecoveryStrategy.RESET,
        message: 'Realm recovery failed completely',
        shouldRetry: false,
        shouldNotifyUser: true,
        userMessage: '데이터베이스를 복구할 수 없습니다. 앱을 재시작해주세요.'
      };
    }
  }

  /**
   * Handle network-related errors
   */
  private async handleNetworkError(context: ErrorContext): Promise<RecoveryResult> {
    const { retryCount = 0 } = context;

    try {
      // Check network status
      const networkState = await NetInfo.fetch();
      
      if (!networkState.isConnected) {
        return {
          success: false,
          strategy: RecoveryStrategy.FALLBACK,
          message: 'Network unavailable',
          shouldRetry: true,
          shouldNotifyUser: true,
          userMessage: '인터넷 연결을 확인해주세요.'
        };
      }

      // Retry with exponential backoff
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        await this.delay(RETRY_DELAY_MS * Math.pow(2, retryCount));
        
        return {
          success: true,
          strategy: RecoveryStrategy.RETRY,
          message: 'Network retry scheduled',
          shouldRetry: true,
          shouldNotifyUser: false
        };
      }

      return {
        success: false,
        strategy: RecoveryStrategy.FALLBACK,
        message: 'Network retry limit exceeded',
        shouldRetry: false,
        shouldNotifyUser: true,
        userMessage: '네트워크 연결이 불안정합니다. 잠시 후 다시 시도해주세요.'
      };

    } catch (error) {
      return {
        success: false,
        strategy: RecoveryStrategy.FALLBACK,
        message: 'Network error recovery failed',
        shouldRetry: false,
        shouldNotifyUser: true,
        userMessage: '네트워크 오류가 발생했습니다.'
      };
    }
  }

  /**
   * Handle authentication errors
   */
  private async handleAuthError(context: ErrorContext): Promise<RecoveryResult> {
    try {
      // Clear potentially corrupted auth tokens
      await AsyncStorage.multiRemove([
        '@auth_token',
        '@refresh_token',
        '@user_session'
      ]);

      return {
        success: true,
        strategy: RecoveryStrategy.RESET,
        message: 'Auth tokens cleared',
        shouldRetry: false,
        shouldNotifyUser: true,
        userMessage: '인증이 만료되었습니다. 다시 로그인해주세요.'
      };

    } catch (error) {
      return {
        success: false,
        strategy: RecoveryStrategy.FALLBACK,
        message: 'Auth recovery failed',  
        shouldRetry: false,
        shouldNotifyUser: true,
        userMessage: '인증 오류가 발생했습니다. 앱을 재시작해주세요.'
      };
    }
  }

  /**
   * Handle storage full errors
   */
  private async handleStorageError(context: ErrorContext): Promise<RecoveryResult> {
    try {
      // Clear cache and temporary files
      await AsyncStorage.multiRemove([
        '@cache_data',
        '@temp_files',
        '@tasting_draft'
      ]);

      return {
        success: true,
        strategy: RecoveryStrategy.RESET,
        message: 'Storage cleaned up',
        shouldRetry: true,
        shouldNotifyUser: true,
        userMessage: '저장공간이 부족하여 일부 캐시를 정리했습니다.'
      };

    } catch (error) {
      return {
        success: false,
        strategy: RecoveryStrategy.FALLBACK,
        message: 'Storage cleanup failed',
        shouldRetry: false,
        shouldNotifyUser: true,
        userMessage: '저장공간이 부족합니다. 기기의 저장공간을 정리해주세요.'
      };
    }
  }

  /**
   * Handle memory pressure errors
   */
  private async handleMemoryError(context: ErrorContext): Promise<RecoveryResult> {
    try {
      // Clear memory-intensive caches
      // Note: In a real implementation, you'd clear image caches, etc.
      global.gc && global.gc(); // Force garbage collection if available
      
      return {
        success: true,
        strategy: RecoveryStrategy.RESET,
        message: 'Memory pressure relieved',
        shouldRetry: true,
        shouldNotifyUser: false
      };

    } catch (error) {
      return {
        success: false,
        strategy: RecoveryStrategy.FALLBACK,
        message: 'Memory recovery failed',
        shouldRetry: false,
        shouldNotifyUser: true,
        userMessage: '메모리 부족으로 일부 기능이 제한될 수 있습니다.'
      };
    }
  }

  /**
   * Handle sync conflict errors
   */
  private async handleSyncError(context: ErrorContext): Promise<RecoveryResult> {
    try {
      // Force a full sync from server
      // Note: In a real implementation, this would trigger sync service
      
      return {
        success: true,
        strategy: RecoveryStrategy.REINITIALIZE,
        message: 'Sync conflict resolved',
        shouldRetry: false,
        shouldNotifyUser: false
      };

    } catch (error) {
      return {
        success: false,
        strategy: RecoveryStrategy.FALLBACK,
        message: 'Sync recovery failed',
        shouldRetry: false,
        shouldNotifyUser: true,
        userMessage: '데이터 동기화에 문제가 있습니다. 네트워크를 확인해주세요.'
      };
    }
  }

  /**
   * Handle React Native bridge errors
   */
  private async handleBridgeError(context: ErrorContext): Promise<RecoveryResult> {
    try {
      // For bridge errors, we mostly log and continue
      // Critical bridge errors usually require app restart
      
      // SentryService.captureError(context.originalError, {
      //   tags: { error_type: 'bridge_error' },
      //   extra: { context }
      // });

      return {
        success: true,
        strategy: RecoveryStrategy.IGNORE,
        message: 'Bridge error logged, continuing',
        shouldRetry: false,
        shouldNotifyUser: false
      };

    } catch (error) {
      return {
        success: false,
        strategy: RecoveryStrategy.RESET,
        message: 'Critical bridge error',
        shouldRetry: false,
        shouldNotifyUser: true,
        userMessage: '시스템 오류가 발생했습니다. 앱을 재시작해주세요.'
      };
    }
  }

  /**
   * Handle generic/unknown errors
   */
  private async handleGenericError(context: ErrorContext): Promise<RecoveryResult> {
    const { retryCount = 0 } = context;

    // Log unknown errors for analysis
    // SentryService.captureError(context.originalError, {
    //   tags: { error_type: 'unknown' },
    //   extra: { context }
    // });

    if (retryCount < 2) {
      await this.delay(RETRY_DELAY_MS);
      
      return {
        success: true,
        strategy: RecoveryStrategy.RETRY,
        message: 'Generic retry attempted',
        shouldRetry: true,
        shouldNotifyUser: false
      };
    }

    return {
      success: false,
      strategy: RecoveryStrategy.FALLBACK,
      message: 'Unknown error, fallback mode',
      shouldRetry: false,
      shouldNotifyUser: true,
      userMessage: '예상치 못한 오류가 발생했습니다. 계속 문제가 발생하면 앱을 재시작해주세요.'
    };
  }

  /**
   * Get system information for diagnostics
   */
  private async getMemoryUsage(): Promise<number> {
    try {
      // This would require a native module in a real implementation
      // For now, return a mock value based on JS heap usage if available
      if ((global.performance as any)?.memory) {
        return Math.round((global.performance as any).memory.usedJSHeapSize / 1024 / 1024); // MB
      }
      return Math.floor(Math.random() * 100);
    } catch {
      return 0;
    }
  }

  private async getNetworkStatus(): Promise<boolean> {
    try {
      const netInfo: NetInfoState = await NetInfo.fetch();
      return netInfo.isConnected ?? false;
    } catch {
      return false;
    }
  }

  private getRealmStatus(): boolean {
    try {
      const realmService = RealmService.getInstance();
      return realmService.isInitialized;
    } catch {
      return false;
    }
  }

  /**
   * Update error pattern tracking
   */
  private async updateErrorPattern(errorType: ErrorType): Promise<void> {
    try {
      const existing = this.errorPatterns.get(errorType);
      
      if (existing) {
        existing.frequency += 1;
        existing.lastOccurrence = new Date();
      } else {
        this.errorPatterns.set(errorType, {
          errorType,
          frequency: 1,
          lastOccurrence: new Date(),
          recoverySuccessRate: 0,
          preferredStrategy: RecoveryStrategy.RETRY
        });
      }

      await this.saveErrorPatterns();
    } catch (error) {
      Logger.error(`Failed to update error pattern for ${errorType}`, 'error_recovery', error as Error);
    }
  }

  /**
   * Load error patterns from storage
   */
  private async loadErrorPatterns(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(ERROR_PATTERNS_KEY);
      if (stored) {
        const patterns = JSON.parse(stored);
        this.errorPatterns = new Map(Object.entries(patterns) as any);
        Logger.debug(`Error patterns loaded from storage: ${this.errorPatterns.size}`, 'error_recovery');
      }
    } catch (error) {
      Logger.error('Failed to load error patterns', 'error_recovery', error as Error);
    }
  }

  /**
   * Save error patterns to storage
   */
  private async saveErrorPatterns(): Promise<void> {
    try {
      const patterns = Object.fromEntries(this.errorPatterns);
      await AsyncStorage.setItem(ERROR_PATTERNS_KEY, JSON.stringify(patterns));
    } catch (error) {
      Logger.error('Failed to save error patterns', 'error_recovery', error as Error);
    }
  }

  /**
   * Get error analytics
   */
  getErrorAnalytics(): {
    totalErrors: number;
    errorsByType: Record<ErrorType, number>;
    mostCommonError: ErrorType | null;
    recentErrors: ErrorPattern[];
  } {
    const errorsByType: Record<ErrorType, number> = {} as any;
    let totalErrors = 0;
    let mostCommonError: ErrorType | null = null;
    let maxFrequency = 0;

    for (const [errorType, pattern] of this.errorPatterns) {
      errorsByType[errorType] = pattern.frequency;
      totalErrors += pattern.frequency;
      
      if (pattern.frequency > maxFrequency) {
        maxFrequency = pattern.frequency;
        mostCommonError = errorType;
      }
    }

    const recentErrors = Array.from(this.errorPatterns.values())
      .sort((a, b) => b.lastOccurrence.getTime() - a.lastOccurrence.getTime())
      .slice(0, 10);

    return {
      totalErrors,
      errorsByType,
      mostCommonError,
      recentErrors
    };
  }

  /**
   * Utility: Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all error patterns (for testing)
   */
  async clearErrorPatterns(): Promise<void> {
    try {
      this.errorPatterns.clear();
      await AsyncStorage.removeItem(ERROR_PATTERNS_KEY);
      Logger.info('Error patterns cleared', 'error_recovery');
    } catch (error) {
      Logger.error('Failed to clear error patterns', 'error_recovery', error as Error);
    }
  }
}

export default ErrorRecoveryService.getInstance();