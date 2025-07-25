import { Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { supabase } from './supabase/client';
import { analyticsService } from './AnalyticsService';

export interface PerformanceMetric {
  id: string;
  sessionId: string;
  userId?: string;
  metricType: 'crash' | 'error' | 'performance' | 'memory' | 'network';
  eventName: string;
  value?: number;
  metadata: Record<string, any>;
  timestamp: Date;
  deviceInfo: {
    platform: string;
    osVersion: string;
    appVersion: string;
    model: string;
    buildNumber: string;
    freeMemory?: number;
    totalMemory?: number;
  };
}

export interface NetworkTiming {
  url: string;
  method: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  statusCode?: number;
  errorMessage?: string;
}

class PerformanceMonitor {
  private performanceQueue: PerformanceMetric[] = [];
  private networkTimings: Map<string, number> = new Map();
  private renderTimings: Map<string, number> = new Map();
  private memoryCheckInterval: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    this.startMemoryMonitoring();
    this.setupErrorHandlers();
  }

  // Crash and Error Reporting
  async reportCrash(error: Error, errorInfo?: any): Promise<void> {
    const deviceInfo = await this.getDeviceInfo();
    
    const crashMetric: Omit<PerformanceMetric, 'id' | 'sessionId' | 'timestamp'> = {
      userId: undefined, // Will be set from current session
      metricType: 'crash',
      eventName: 'app_crash',
      metadata: {
        errorName: error.name,
        errorMessage: error.message,
        stackTrace: error.stack,
        errorInfo,
        userAgent: await DeviceInfo.getUserAgent(),
      },
      deviceInfo,
    };

    await this.addMetric(crashMetric);
    
    // Also track in analytics
    analyticsService.trackError('app_crash', error.message, error.stack, {
      errorName: error.name,
      errorInfo,
    });
  }

  async reportError(error: Error, context?: string, severity: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    const deviceInfo = await this.getDeviceInfo();
    
    const errorMetric: Omit<PerformanceMetric, 'id' | 'sessionId' | 'timestamp'> = {
      userId: undefined,
      metricType: 'error',
      eventName: 'app_error',
      metadata: {
        errorName: error.name,
        errorMessage: error.message,
        stackTrace: error.stack,
        context,
        severity,
      },
      deviceInfo,
    };

    await this.addMetric(errorMetric);
    
    // Track in analytics
    analyticsService.trackError(context || 'app_error', error.message, error.stack, {
      severity,
      errorName: error.name,
    });
  }

  // Performance Timing
  startTiming(eventName: string): string {
    const timingId = `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.renderTimings.set(timingId, Date.now());
    return timingId;
  }

  async endTiming(timingId: string, eventName: string, metadata?: Record<string, any>): Promise<void> {
    const startTime = this.renderTimings.get(timingId);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    this.renderTimings.delete(timingId);

    const deviceInfo = await this.getDeviceInfo();
    
    const performanceMetric: Omit<PerformanceMetric, 'id' | 'sessionId' | 'timestamp'> = {
      userId: undefined,
      metricType: 'performance',
      eventName,
      value: duration,
      metadata: {
        ...metadata,
        startTime,
        endTime: Date.now(),
      },
      deviceInfo,
    };

    await this.addMetric(performanceMetric);
    
    // Track in analytics
    analyticsService.trackTiming(eventName, duration, metadata);
  }

  // Network Monitoring
  startNetworkTiming(url: string, method: string = 'GET'): string {
    const requestId = `${method}_${url}_${Date.now()}`;
    this.networkTimings.set(requestId, Date.now());
    return requestId;
  }

  async endNetworkTiming(requestId: string, success: boolean, statusCode?: number, errorMessage?: string): Promise<void> {
    const startTime = this.networkTimings.get(requestId);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    this.networkTimings.delete(requestId);

    const [method, url] = requestId.split('_', 2);
    const deviceInfo = await this.getDeviceInfo();
    
    const networkMetric: Omit<PerformanceMetric, 'id' | 'sessionId' | 'timestamp'> = {
      userId: undefined,
      metricType: 'network',
      eventName: 'network_request',
      value: duration,
      metadata: {
        url,
        method,
        success,
        statusCode,
        errorMessage,
        startTime,
        endTime: Date.now(),
      },
      deviceInfo,
    };

    await this.addMetric(networkMetric);
  }

  // Memory Monitoring
  private startMemoryMonitoring(): void {
    this.memoryCheckInterval = setInterval(async () => {
      try {
        const [freeMemory, totalMemory] = await Promise.all([
          DeviceInfo.getFreeDiskStorage(),
          DeviceInfo.getTotalDiskCapacity(),
        ]);

        const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
        
        // Report if memory usage is high (>85%)
        if (memoryUsage > 85) {
          const deviceInfo = await this.getDeviceInfo();
          deviceInfo.freeMemory = freeMemory;
          deviceInfo.totalMemory = totalMemory;
          
          const memoryMetric: Omit<PerformanceMetric, 'id' | 'sessionId' | 'timestamp'> = {
            userId: undefined,
            metricType: 'memory',
            eventName: 'high_memory_usage',
            value: memoryUsage,
            metadata: {
              freeMemory,
              totalMemory,
              usagePercentage: memoryUsage,
            },
            deviceInfo,
          };

          await this.addMetric(memoryMetric);
        }
      } catch (error) {
        console.error('Error checking memory usage:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  // Setup global error handlers
  private setupErrorHandlers(): void {
    // Handle unhandled promise rejections
    if (typeof global !== 'undefined') {
      (global as any).addEventListener?.('unhandledrejection', (event: any) => {
        console.error('Unhandled promise rejection:', event.reason);
        this.reportError(new Error(event.reason), 'unhandled_promise_rejection', 'high');
      });
    }

    // React Native specific error handler
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('Global error handler:', error);
      this.reportCrash(error, { isFatal });
      
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }

  // Helper Methods
  private async getDeviceInfo(): Promise<PerformanceMetric['deviceInfo']> {
    try {
      const [freeMemory, totalMemory] = await Promise.all([
        DeviceInfo.getFreeDiskStorage().catch(() => undefined),
        DeviceInfo.getTotalDiskCapacity().catch(() => undefined),
      ]);

      return {
        platform: DeviceInfo.getSystemName(),
        osVersion: DeviceInfo.getSystemVersion(),
        appVersion: DeviceInfo.getVersion(),
        model: DeviceInfo.getModel(),
        buildNumber: DeviceInfo.getBuildNumber(),
        freeMemory,
        totalMemory,
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      return {
        platform: 'unknown',
        osVersion: 'unknown',
        appVersion: 'unknown',
        model: 'unknown',
        buildNumber: 'unknown',
      };
    }
  }

  private async addMetric(metric: Omit<PerformanceMetric, 'id' | 'sessionId' | 'timestamp'>): Promise<void> {
    const currentSession = await analyticsService.getSessionStats();
    
    const performanceMetric: PerformanceMetric = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: currentSession?.sessionId || 'unknown',
      timestamp: new Date(),
      ...metric,
    };

    this.performanceQueue.push(performanceMetric);

    // Auto-flush if queue is getting large
    if (this.performanceQueue.length >= 50) {
      await this.flushQueue();
    }
  }

  async flushQueue(): Promise<void> {
    if (this.performanceQueue.length === 0) return;

    try {
      // Check if we're in development mode - skip Supabase in dev
      if (__DEV__) {
        console.log('Performance metrics (dev mode):', {
          count: this.performanceQueue.length,
          metrics: this.performanceQueue.slice(0, 3), // Log first 3 for debugging
        });
        this.performanceQueue = [];
        return;
      }

      const { error } = await supabase
        .from('performance_metrics')
        .insert(this.performanceQueue);

      if (error) {
        console.warn('Performance metrics table not available:', error.message);
        // Clear queue to prevent memory buildup even if upload fails
        this.performanceQueue = [];
        return;
      }

      this.performanceQueue = [];
    } catch (error) {
      console.warn('Performance monitoring disabled:', error instanceof Error ? error.message : 'Unknown error');
      // Clear queue to prevent memory buildup
      this.performanceQueue = [];
    }
  }

  // Performance measurement decorators
  measureFunction<T extends (...args: any[]) => any>(
    fn: T,
    functionName: string
  ): (...args: Parameters<T>) => ReturnType<T> {
    return (...args: Parameters<T>): ReturnType<T> => {
      const timingId = this.startTiming(functionName);
      
      try {
        const result = fn(...args);
        
        // Handle async functions
        if (result instanceof Promise) {
          return result.then((value) => {
            this.endTiming(timingId, `function_${functionName}`, {
              args: args.length,
              async: true,
            });
            return value;
          }).catch((error) => {
            this.endTiming(timingId, `function_${functionName}`, {
              args: args.length,
              async: true,
              error: true,
            });
            throw error;
          }) as ReturnType<T>;
        }
        
        // Handle sync functions
        this.endTiming(timingId, `function_${functionName}`, {
          args: args.length,
          async: false,
        });
        
        return result;
      } catch (error) {
        this.endTiming(timingId, `function_${functionName}`, {
          args: args.length,
          async: false,
          error: true,
        });
        throw error;
      }
    };
  }

  cleanup(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
    
    this.flushQueue();
  }
}

export const performanceMonitor = new PerformanceMonitor();