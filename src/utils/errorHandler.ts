import { Alert, Platform } from 'react-native';

import { Logger } from '../services/LoggingService';
export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export const ErrorMessages = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  AUTH_ERROR: '인증에 실패했습니다. 다시 로그인해주세요.',
  SAVE_ERROR: '데이터 저장에 실패했습니다.',
  LOAD_ERROR: '데이터를 불러올 수 없습니다.',
  PERMISSION_ERROR: '필요한 권한이 없습니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
  SUPABASE_ERROR: 'Supabase 서버 연결에 실패했습니다.',
  REALM_ERROR: '로컬 데이터베이스 오류가 발생했습니다.',
};

export class ErrorHandler {
  static handle(error: Error, context?: string): void {
    const errorMessage = this.getErrorMessage(error);
    
    // Log error for debugging (in production, send to error tracking service)
    if (__DEV__) {
      Logger.error(`[${context || 'App'}] Error:`, 'util', { component: 'errorHandler', error: error });
  }
    
    // Show user-friendly error message
    this.showErrorAlert(errorMessage, context);
}
  
  static getErrorMessage(error: Error): string {
    const err = error as Error & { code?: string; source?: string };
    // Network errors
    if (err?.message?.includes('Network') || err?.code === 'NETWORK_ERROR') {
      return ErrorMessages.NETWORK_ERROR;
  }
    
    // Supabase errors
    if (err?.message?.includes('Supabase') || err?.source === 'supabase') {
      return ErrorMessages.SUPABASE_ERROR;
  }
    
    // Auth errors
    if (err?.code === 'AUTH_ERROR' || err?.message?.includes('authentication')) {
      return ErrorMessages.AUTH_ERROR;
  }
    
    // Realm errors
    if (err?.message?.includes('Realm') || err?.source === 'realm') {
      return ErrorMessages.REALM_ERROR;
  }
    
    // Permission errors
    if (err?.code === 'PERMISSION_DENIED') {
      return ErrorMessages.PERMISSION_ERROR;
  }
    
    // Default error message
    return err?.message || ErrorMessages.UNKNOWN_ERROR;
}
  
  static showErrorAlert(message: string, context?: string): void {
    const title = context ? `${context} 오류` : '오류';
    
    Alert.alert(
      title,
      message,
      [
        {
          text: '확인',
          style: 'default',
      },
      ],
      { cancelable: true }
    );
}
  
  static async handleAsync<T>(
    promise: Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await promise;
  } catch (error) {
      this.handle(error, context);
      return null;
  }
}
}

// Network status utility
export const NetworkUtils = {
  isNetworkError(error: Error): boolean {
    const err = error as Error;
    const errorMessage = err?.message?.toLowerCase() || '';
    const errorWithCode = error as { code?: string };
    return (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorWithCode?.code === 'NETWORK_ERROR' ||
      errorWithCode?.code === 'ECONNABORTED'
    );
},
  
  async retry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: unknown;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
    } catch (error) {
        lastError = error;
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
    
    throw lastError;
},
};