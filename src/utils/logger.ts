// Convenience exports and utility functions for logging
export { 
  Logger, 
  RealmLogger, 
  AuthLogger, 
  SyncLogger, 
  UILogger, 
  APILogger,
  LogLevel,
  type LogContext,
  type LogEntry 
} from '../services/LoggingService';

import { Logger } from '../services/LoggingService';

// Performance timing utility
export class PerformanceTimer {
  private startTime: number;
  private label: string;
  private category: string;

  constructor(label: string, category = 'performance') {
    this.label = label;
    this.category = category;
    this.startTime = Date.now();
    Logger.debug(`Timer started: ${label}`, category);
  }

  end(context: any = {}): number {
    const duration = Date.now() - this.startTime;
    Logger.performance(`Timer ended: ${this.label} (${duration}ms)`, duration, context);
    return duration;
  }
}

// Error logging helper
export const logError = (error: Error, context: any = {}, category = 'error') => {
  Logger.error(error.message, category, {
    ...context,
    error,
    stack: error.stack,
  });
};

// User action logging helper
export const logUserAction = (action: string, screen: string, data: any = {}) => {
  Logger.userAction(action, screen, { data });
};

// API call logging helper
export const logAPICall = (
  endpoint: string, 
  method: string, 
  status?: number, 
  data: any = {}
) => {
  Logger.apiCall(endpoint, method, status, { data });
};

// Development-only logging
export const devLog = (message: string, data: any = {}) => {
  if (__DEV__) {
    Logger.debug(message, 'dev', { data });
  }
};

// Create a simple console replacement for gradual migration
export const createConsoleReplacement = (category: string, component?: string) => {
  const context = component ? { component } : {};
  
  return {
    log: (message: string, ...args: any[]) => {
      Logger.debug(message, category, { ...context, data: args.length > 0 ? args : undefined });
    },
    info: (message: string, ...args: any[]) => {
      Logger.info(message, category, { ...context, data: args.length > 0 ? args : undefined });
    },
    warn: (message: string, ...args: any[]) => {
      Logger.warn(message, category, { ...context, data: args.length > 0 ? args : undefined });
    },
    error: (message: string, ...args: any[]) => {
      Logger.error(message, category, { ...context, data: args.length > 0 ? args : undefined });
    },
  };
};