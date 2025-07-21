import Config from 'react-native-config';
import { SentryService } from './SentryService';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogContext {
  userId?: string;
  action?: string;
  screen?: string;
  component?: string;
  function?: string;
  data?: Record<string, any>;
  error?: Error;
  timestamp?: string;
  sessionId?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  timestamp: string;
  category: string;
}

class LoggingService {
  private static instance: LoggingService;
  private currentLogLevel: LogLevel;
  private enabledCategories: Set<string>;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 1000;
  private sessionId: string;

  private constructor() {
    // Set log level based on environment
    this.currentLogLevel = __DEV__ 
      ? LogLevel.DEBUG 
      : (Config.LOG_LEVEL ? parseInt(Config.LOG_LEVEL) : LogLevel.WARN);
    
    // Enable all categories in development, specific ones in production
    this.enabledCategories = __DEV__ 
      ? new Set(['*']) // All categories
      : new Set(['error', 'auth', 'sync', 'realm', 'critical']);
    
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private shouldLog(level: LogLevel, category: string): boolean {
    if (level < this.currentLogLevel) return false;
    if (this.enabledCategories.has('*')) return true;
    return this.enabledCategories.has(category);
  }

  private formatMessage(level: LogLevel, message: string, context: LogContext): string {
    const levelName = LogLevel[level];
    const timestamp = new Date().toISOString();
    const contextStr = context.component || context.screen || context.function || '';
    
    return `[${timestamp}] ${levelName} ${contextStr ? `[${contextStr}]` : ''} ${message}`;
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift(); // Remove oldest entry
    }
  }

  private createLogEntry(
    level: LogLevel, 
    message: string, 
    category: string, 
    context: LogContext = {}
  ): LogEntry {
    return {
      level,
      message,
      category,
      context: {
        ...context,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Core logging methods
  debug(message: string, category = 'debug', context: LogContext = {}): void {
    if (!this.shouldLog(LogLevel.DEBUG, category)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, category, context);
    this.addToBuffer(entry);
    
    if (__DEV__) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, category = 'info', context: LogContext = {}): void {
    if (!this.shouldLog(LogLevel.INFO, category)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, category, context);
    this.addToBuffer(entry);
    
    if (__DEV__) {
      console.info(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, category = 'warn', context: LogContext = {}): void {
    if (!this.shouldLog(LogLevel.WARN, category)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, category, context);
    this.addToBuffer(entry);
    
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  error(message: string, category = 'error', context: LogContext = {}): void {
    if (!this.shouldLog(LogLevel.ERROR, category)) return;
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, category, context);
    this.addToBuffer(entry);
    
    console.error(this.formatMessage(LogLevel.ERROR, message, context));
    
    // Send to Sentry in production
    if (!__DEV__ && context.error) {
      try {
        SentryService.getInstance().captureException(context.error, {
          tags: { category },
          extra: { message, context },
        });
      } catch (sentryError) {
        console.error('Failed to send error to Sentry:', sentryError);
      }
    }
  }

  fatal(message: string, category = 'fatal', context: LogContext = {}): void {
    const entry = this.createLogEntry(LogLevel.FATAL, message, category, context);
    this.addToBuffer(entry);
    
    console.error(`FATAL: ${this.formatMessage(LogLevel.FATAL, message, context)}`);
    
    // Always send fatal errors to Sentry
    if (context.error) {
      try {
        SentryService.getInstance().captureException(context.error, {
          level: 'fatal',
          tags: { category },
          extra: { message, context },
        });
      } catch (sentryError) {
        console.error('Failed to send fatal error to Sentry:', sentryError);
      }
    }
  }

  // Specialized logging methods for common use cases
  realm(message: string, context: LogContext = {}): void {
    this.debug(message, 'realm', { ...context, component: 'RealmService' });
  }

  auth(message: string, context: LogContext = {}): void {
    this.info(message, 'auth', { ...context, component: 'AuthService' });
  }

  sync(message: string, context: LogContext = {}): void {
    this.info(message, 'sync', { ...context, component: 'SyncService' });
  }

  performance(message: string, duration?: number, context: LogContext = {}): void {
    this.info(message, 'performance', { 
      ...context, 
      data: { ...context.data, duration },
      component: 'Performance'
    });
  }

  userAction(action: string, screen: string, context: LogContext = {}): void {
    this.info(`User action: ${action}`, 'user', { 
      ...context, 
      action,
      screen,
    });
  }

  apiCall(endpoint: string, method: string, status?: number, context: LogContext = {}): void {
    const level = status && status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `API ${method} ${endpoint}${status ? ` - ${status}` : ''}`;
    
    if (level === LogLevel.ERROR) {
      this.error(message, 'api', { ...context, data: { endpoint, method, status } });
    } else {
      this.info(message, 'api', { ...context, data: { endpoint, method, status } });
    }
  }

  // Configuration methods
  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  enableCategory(category: string): void {
    this.enabledCategories.add(category);
  }

  disableCategory(category: string): void {
    this.enabledCategories.delete(category);
  }

  // Utility methods
  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  clearLogBuffer(): void {
    this.logBuffer = [];
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // Export logs for debugging or support
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  // Create category-specific loggers
  createLogger(category: string, defaultContext: LogContext = {}) {
    return {
      debug: (message: string, context: LogContext = {}) => 
        this.debug(message, category, { ...defaultContext, ...context }),
      info: (message: string, context: LogContext = {}) => 
        this.info(message, category, { ...defaultContext, ...context }),
      warn: (message: string, context: LogContext = {}) => 
        this.warn(message, category, { ...defaultContext, ...context }),
      error: (message: string, context: LogContext = {}) => 
        this.error(message, category, { ...defaultContext, ...context }),
      fatal: (message: string, context: LogContext = {}) => 
        this.fatal(message, category, { ...defaultContext, ...context }),
    };
  }
}

// Export singleton instance and create convenient logger
export const Logger = LoggingService.getInstance();

// Create category-specific loggers for common use cases
export const RealmLogger = Logger.createLogger('realm', { component: 'RealmService' });
export const AuthLogger = Logger.createLogger('auth', { component: 'AuthService' });
export const SyncLogger = Logger.createLogger('sync', { component: 'SyncService' });
export const UILogger = Logger.createLogger('ui', { component: 'UIComponent' });
export const APILogger = Logger.createLogger('api', { component: 'APIService' });

export default LoggingService;