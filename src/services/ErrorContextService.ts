import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from './AnalyticsService';

export interface ErrorContext {
  // User Journey
  navigationPath: string[];
  currentScreen: string;
  previousScreen?: string;
  screenTimeSpent: number;
  recentActions: string[];
  
  // App State
  appVersion: string;
  buildNumber: string;
  platform: string;
  osVersion: string;
  deviceModel: string;
  
  // Performance
  memoryUsage?: number;
  lastNetworkRequest?: {
    url: string;
    method: string;
    status: number;
    timestamp: Date;
  };
  
  // Error Details
  errorMessage?: string;
  errorStack?: string;
  errorTimestamp?: Date;
  
  // Form Data (if on a form screen)
  formData?: Record<string, any>;
  
  // Console Logs (last 20)
  consoleLogs: ConsoleLog[];
}

export interface ConsoleLog {
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: Date;
  args?: any[];
}

class ErrorContextService {
  private consoleLogs: ConsoleLog[] = [];
  private readonly MAX_CONSOLE_LOGS = 20;
  private readonly MAX_ACTIONS = 10;
  private originalConsole: any = {};
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    // Temporarily disable console interception to prevent circular references
    // this.interceptConsole();
    this.interceptNetworkRequests();
  }

  private interceptConsole(): void {
    // Store original console methods
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
    };

    // Override console methods to capture logs
    const createInterceptor = (level: 'log' | 'warn' | 'error' | 'info') => {
      return (...args: any[]) => {
        // Guard against recursive calls
        if (!this.originalConsole[level]) return;
        
        // Call original console method
        try {
          this.originalConsole[level](...args);
        } catch (e) {
          // Fallback if there's an issue
        }
        
        // Store log for context (avoid circular JSON)
        try {
          this.addConsoleLog({
            level,
            message: args.map(arg => {
              if (typeof arg === 'object') {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return '[Circular Object]';
                }
              }
              return String(arg);
            }).join(' '),
            timestamp: new Date(),
            args: args.length <= 5 ? args : args.slice(0, 5), // Limit args to prevent memory issues
          });
        } catch (e) {
          // Skip logging if there's an error
        }
      };
    };

    console.log = createInterceptor('log');
    console.warn = createInterceptor('warn');
    console.error = createInterceptor('error');
    console.info = createInterceptor('info');
  }

  private interceptNetworkRequests(): void {
    // Intercept fetch requests
    const originalFetch = global.fetch;
    global.fetch = async (...args: any[]) => {
      const startTime = Date.now();
      try {
        const response = await originalFetch(args[0], args[1]);
        const duration = Date.now() - startTime;
        
        await analyticsService.trackTiming('network_request', duration, {
          url: args[0],
          method: args[1]?.method || 'GET',
          status: response.status,
          success: response.ok,
        });
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        await analyticsService.trackError('network_error', (error as any).message, (error as any).stack, {
          url: args[0],
          method: args[1]?.method || 'GET',
          duration,
        });
        
        throw error;
      }
    };
  }

  private addConsoleLog(log: ConsoleLog): void {
    this.consoleLogs.push(log);
    
    // Keep only recent logs
    if (this.consoleLogs.length > this.MAX_CONSOLE_LOGS) {
      this.consoleLogs = this.consoleLogs.slice(-this.MAX_CONSOLE_LOGS);
    }
  }

  async getCurrentContext(): Promise<ErrorContext> {
    const sessionStats = await analyticsService.getSessionStats();
    
    const context: ErrorContext = {
      // User Journey (from AnalyticsService)
      navigationPath: sessionStats?.navigationPath || [],
      currentScreen: sessionStats?.currentScreen || 'Unknown',
      previousScreen: sessionStats?.previousScreen,
      screenTimeSpent: sessionStats?.screenTimeSpent || 0,
      recentActions: sessionStats?.recentActions || [],
      
      // App State
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      deviceModel: DeviceInfo.getModel(),
      
      // Console Logs
      consoleLogs: this.consoleLogs,
      
      // Performance
      memoryUsage: await this.getMemoryUsage(),
    };

    return context;
  }

  async getContextForFeedback(): Promise<ErrorContext> {
    const context = await this.getCurrentContext();
    
    // Add specific context for feedback
    context.formData = await this.getCurrentFormData();
    
    return context;
  }

  async getContextForError(error: Error): Promise<ErrorContext> {
    const context = await this.getCurrentContext();
    
    // Add error-specific context
    context.errorMessage = error.message;
    context.errorStack = error.stack;
    context.errorTimestamp = new Date();
    
    return context;
  }

  private async getMemoryUsage(): Promise<number | undefined> {
    try {
      // This is a placeholder - React Native doesn't have built-in memory monitoring
      // You could use native modules or estimate based on app usage
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  private async getCurrentFormData(): Promise<Record<string, any> | undefined> {
    try {
      // Check if we're on a form screen and try to get form data
      // This would need to be implemented based on your specific forms
      const currentScreen = await analyticsService.getSessionStats().then(s => s?.currentScreen);
      
      if (currentScreen?.includes('Form') || currentScreen?.includes('Input')) {
        // Try to get any stored form data
        const formData = await AsyncStorage.getItem('@current_form_data');
        return formData ? JSON.parse(formData) : undefined;
      }
      
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  // Smart feedback category suggestion based on context
  suggestFeedbackCategory(context: ErrorContext): 'bug_report' | 'feature_request' | 'improvement' | 'praise' {
    // If there's an error, suggest bug report
    if (context.errorMessage || context.consoleLogs.some(log => log.level === 'error')) {
      return 'bug_report';
    }
    
    // If user spent a lot of time on one screen, might be struggling
    if (context.screenTimeSpent > 60000) { // More than 1 minute
      return 'improvement';
    }
    
    // If user navigated back and forth quickly, might be confused
    const backAndForth = context.navigationPath.filter((screen, index) => 
      index > 0 && context.navigationPath[index - 1] === screen
    ).length;
    
    if (backAndForth > 2) {
      return 'improvement';
    }
    
    // Default to feature request
    return 'feature_request';
  }

  // Generate smart title suggestions
  generateSmartTitle(context: ErrorContext): string {
    if (context.errorMessage) {
      return `오류 발생: ${context.currentScreen}에서 ${context.errorMessage.slice(0, 20)}...`;
    }
    
    if (context.consoleLogs.some(log => log.level === 'error')) {
      const errorLog = context.consoleLogs.find(log => log.level === 'error');
      return `오류 발생: ${context.currentScreen}에서 ${errorLog?.message.slice(0, 20)}...`;
    }
    
    if (context.screenTimeSpent > 60000) {
      return `${context.currentScreen} 화면에서 사용성 개선 제안`;
    }
    
    return `${context.currentScreen} 관련 피드백`;
  }

  // Generate smart description with context
  generateSmartDescription(context: ErrorContext): string {
    let description = `자동 수집된 컨텍스트:\n\n`;
    
    description += `📱 현재 화면: ${context.currentScreen}\n`;
    description += `⏱️ 화면 체류 시간: ${Math.round(context.screenTimeSpent / 1000)}초\n`;
    description += `🔄 최근 이동 경로: ${context.navigationPath.slice(-5).join(' → ')}\n`;
    
    if (context.recentActions.length > 0) {
      description += `👆 최근 액션: ${context.recentActions.slice(-3).join(', ')}\n`;
    }
    
    if (context.errorMessage) {
      description += `❌ 오류 메시지: ${context.errorMessage}\n`;
    }
    
    const recentErrors = context.consoleLogs.filter(log => log.level === 'error').slice(-3);
    if (recentErrors.length > 0) {
      description += `\n🚨 최근 오류 로그:\n`;
      recentErrors.forEach(log => {
        description += `${log.timestamp.toLocaleTimeString()}: ${log.message}\n`;
      });
    }
    
    description += `\n📊 디바이스 정보:\n`;
    description += `- ${context.platform} ${context.osVersion}\n`;
    description += `- ${context.deviceModel}\n`;
    description += `- 앱 버전: ${context.appVersion} (${context.buildNumber})\n`;
    
    description += `\n\n==== 추가 설명을 여기에 작성해주세요 ====\n`;
    
    return description;
  }

  cleanup(): void {
    // Restore original console methods
    if (this.originalConsole.log) {
      console.log = this.originalConsole.log;
      console.warn = this.originalConsole.warn;
      console.error = this.originalConsole.error;
      console.info = this.originalConsole.info;
    }
  }
}

export const errorContextService = new ErrorContextService();