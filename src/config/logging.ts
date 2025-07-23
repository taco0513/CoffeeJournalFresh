// Logging configuration for different environments
import { LogLevel } from '../services/LoggingService';

export interface LoggingConfig {
  level: LogLevel;
  enabledCategories: string[];
  enableSentry: boolean;
  enableConsoleOutput: boolean;
  maxBufferSize: number;
  flushInterval?: number; // in milliseconds
}

// Development configuration
export const DEV_LOGGING_CONFIG: LoggingConfig = {
  level: LogLevel.DEBUG,
  enabledCategories: ['*'], // All categories
  enableSentry: false,
  enableConsoleOutput: true,
  maxBufferSize: 1000,
};

// Production configuration
export const PROD_LOGGING_CONFIG: LoggingConfig = {
  level: LogLevel.WARN,
  enabledCategories: [
    'error',
    'auth',
    'sync',
    'realm',
    'api',
    'critical',
    'performance',
    'security'
  ],
  enableSentry: true,
  enableConsoleOutput: false,
  maxBufferSize: 500,
  flushInterval: 60000, // Flush logs every minute
};

// Test configuration
export const TEST_LOGGING_CONFIG: LoggingConfig = {
  level: LogLevel.ERROR,
  enabledCategories: ['error', 'test'],
  enableSentry: false,
  enableConsoleOutput: false,
  maxBufferSize: 100,
};

// Get configuration based on environment
export const getLoggingConfig = (): LoggingConfig => {
  if (__DEV__) {
    return DEV_LOGGING_CONFIG;
  }
  
  // You can add more environment checks here
  // For example, staging environment
  
  return PROD_LOGGING_CONFIG;
};

// Category definitions for better organization
export const LOG_CATEGORIES = {
  // Core system categories
  REALM: 'realm',
  AUTH: 'auth',
  SYNC: 'sync',
  API: 'api',
  
  // Feature categories
  PHOTO: 'photo',
  TASTING: 'tasting',
  USER: 'user',
  STATS: 'stats',
  
  // Technical categories
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  ERROR: 'error',
  CRITICAL: 'critical',
  
  // UI categories
  NAVIGATION: 'navigation',
  COMPONENT: 'component',
  UI: 'ui',
  
  // Development categories
  DEBUG: 'debug',
  DEV: 'dev',
  TEST: 'test',
} as const;

export type LogCategory = typeof LOG_CATEGORIES[keyof typeof LOG_CATEGORIES];

// Sensitive data patterns to redact from logs
export const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /key/i,
  /secret/i,
  /credential/i,
  /authorization/i,
  /auth/i,
  /email/i, // Be careful with email addresses
  /phone/i,
  /ssn/i,
  /credit/i,
] as const;

// Helper to redact sensitive information
export const redactSensitiveData = <T>(data: T): T => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(redactSensitiveData) as T;
  }
  
  const redacted: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
    
    if (isSensitive) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted as T;
};