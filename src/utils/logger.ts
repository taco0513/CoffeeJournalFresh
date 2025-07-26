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

  end(context: Record<string, unknown> = {}): number {
    const duration = Date.now() - this.startTime;
    Logger.performance(`Timer ended: ${this.label} (${duration}ms)`, duration, context);
    return duration;
}
}

// Error logging helper
export const logError = (error: Error, context: Record<string, unknown> = {}, category = 'error') => {
  Logger.error(error.message, category, {
    ...context,
    error,
    stack: error.stack,
});
};

// User action logging helper
export const logUserAction = (action: string, screen: string, data: unknown = {}) => {
  Logger.userAction(action, screen, { data });
};

// API call logging helper
export const logAPICall = (
  endpoint: string, 
  method: string, 
  status?: number, 
  data: unknown = {}
) => {
  Logger.apiCall(endpoint, method, status, { data });
};

// Development-only logging
export const devLog = (message: string, data: unknown = {}) => {
  if (__DEV__) {
    Logger.debug(message, 'dev', { data });
}
};

// Create a simple console replacement for gradual migration
export const createConsoleReplacement = (category: string, component?: string) => {
  const context = component ? { component } : {};
  
  return {
    log: (message: string, ...args: unknown[]) => {
      Logger.debug(message, category, { ...context, data: args.length > 0 ? args : undefined });
  },
    info: (message: string, ...args: unknown[]) => {
      Logger.info(message, category, { ...context, data: args.length > 0 ? args : undefined });
  },
    warn: (message: string, ...args: unknown[]) => {
      Logger.warn(message, category, { ...context, data: args.length > 0 ? args : undefined });
  },
    error: (message: string, ...args: unknown[]) => {
      Logger.error(message, category, { ...context, data: args.length > 0 ? args : undefined });
  },
};
};