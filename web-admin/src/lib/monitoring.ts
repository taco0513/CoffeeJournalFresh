/**
 * Monitoring and Error Tracking for Coffee Journal Admin
 * Integrates with Sentry, Vercel Analytics, and custom logging
 */

import { config, isProduction } from './env';

// Types for monitoring events
interface MonitoringEvent {
  event: string;
  data?: Record<string, any>;
  user?: {
    id: string;
    email: string;
    adminLevel?: string;
  };
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  tags?: Record<string, string>;
}

// Custom error class for admin operations
export class AdminError extends Error {
  public readonly code: string;
  public readonly severity: 'warning' | 'error' | 'critical';
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string = 'ADMIN_ERROR',
    severity: 'warning' | 'error' | 'critical' = 'error',
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AdminError';
    this.code = code;
    this.severity = severity;
    this.context = context;
  }
}

// Initialize monitoring based on environment
export function initializeMonitoring() {
  if (typeof window === 'undefined') return; // Server-side

  // Initialize Sentry (if configured)
  if (config.monitoring.sentry.dsn) {
    initializeSentry();
  }

  // Initialize Vercel Analytics (if configured)
  if (config.monitoring.vercelAnalyticsId) {
    initializeVercelAnalytics();
  }

  // Set up performance monitoring
  setupPerformanceMonitoring();

  // Set up error handlers
  setupGlobalErrorHandlers();

  console.log('🔍 Monitoring initialized for Coffee Journal Admin');
}

// Sentry initialization
function initializeSentry() {
  // Note: In a real implementation, you'd import @sentry/nextjs
  // import * as Sentry from '@sentry/nextjs';
  
  console.log('📊 Sentry monitoring would be initialized here');
  
  // Example Sentry configuration:
  // Sentry.init({
  //   dsn: config.monitoring.sentry.dsn,
  //   environment: config.app.environment,
  //   integrations: [
  //     new Sentry.BrowserTracing(),
  //   ],
  //   tracesSampleRate: 0.1,
  //   beforeSend(event) {
  //     // Filter out non-critical errors in development
  //     if (!isProduction && event.level !== 'error') {
  //       return null;
  //     }
  //     return event;
  //   },
  // });
}

// Vercel Analytics initialization
function initializeVercelAnalytics() {
  // Note: In a real implementation, you'd import @vercel/analytics
  // import { Analytics } from '@vercel/analytics/react';
  
  console.log('📈 Vercel Analytics would be initialized here');
}

// Performance monitoring setup
function setupPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Monitor Core Web Vitals
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            trackPerformance({
              name: 'page_load_time',
              value: entry.duration,
              unit: 'ms',
              tags: { page: window.location.pathname }
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.warn('Performance monitoring not available:', error);
    }
  }
}

// Global error handlers
function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
      type: 'unhandled_promise_rejection',
      reason: event.reason,
    });
  });

  // Global errors
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), {
      type: 'global_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
}

// Event tracking
export function trackEvent(event: MonitoringEvent) {
  const timestamp = new Date().toISOString();
  
  // Log to console in development
  if (!isProduction) {
    console.log(`📊 Event: ${event.event}`, {
      timestamp,
      ...event.data,
      user: event.user?.email,
      severity: event.severity || 'info',
    });
  }

  // Send to monitoring services in production
  if (isProduction) {
    // Send to Sentry, analytics, etc.
    sendToMonitoringServices({
      ...event,
      timestamp,
    });
  }
}

// Performance tracking
export function trackPerformance(metric: PerformanceMetric) {
  const timestamp = new Date().toISOString();
  
  console.log(`⚡ Performance: ${metric.name} = ${metric.value}${metric.unit}`, {
    timestamp,
    tags: metric.tags,
  });

  // Send to monitoring services
  if (isProduction) {
    sendPerformanceMetric({
      ...metric,
      timestamp,
    });
  }
}

// Error logging
export function logError(error: Error | AdminError, context?: Record<string, any>) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    context,
  };

  // Enhanced data for AdminError
  if (error instanceof AdminError) {
    Object.assign(errorData, {
      code: error.code,
      severity: error.severity,
      adminContext: error.context,
    });
  }

  console.error('❌ Error logged:', errorData);

  // Send to error tracking services
  if (isProduction) {
    sendErrorToServices(errorData);
  }
}

// Admin-specific event tracking
export const adminEvents = {
  login: (user: { email: string; adminLevel?: string }) => {
    trackEvent({
      event: 'admin_login',
      user: { id: user.email, email: user.email, adminLevel: user.adminLevel },
      severity: 'info',
    });
  },

  logout: (user: { email: string }) => {
    trackEvent({
      event: 'admin_logout',
      user: { id: user.email, email: user.email },
      severity: 'info',
    });
  },

  bulkOperation: (operation: string, count: number, user: { email: string }) => {
    trackEvent({
      event: 'admin_bulk_operation',
      data: { operation, itemCount: count },
      user: { id: user.email, email: user.email },
      severity: 'info',
    });
  },

  dataModification: (table: string, action: string, itemId: string, user: { email: string }) => {
    trackEvent({
      event: 'admin_data_modification',
      data: { table, action, itemId },
      user: { id: user.email, email: user.email },
      severity: 'warning',
    });
  },

  securityEvent: (eventType: string, details: Record<string, any>) => {
    trackEvent({
      event: 'admin_security_event',
      data: { eventType, ...details },
      severity: 'critical',
    });
  },
};

// Database operation monitoring
export function monitorDatabaseOperation<T>(
  operation: string,
  promise: Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  return promise
    .then((result) => {
      const duration = performance.now() - startTime;
      trackPerformance({
        name: 'database_operation',
        value: Math.round(duration),
        unit: 'ms',
        tags: { operation, status: 'success' }
      });
      return result;
    })
    .catch((error) => {
      const duration = performance.now() - startTime;
      trackPerformance({
        name: 'database_operation',
        value: Math.round(duration),
        unit: 'ms',
        tags: { operation, status: 'error' }
      });
      
      logError(new AdminError(
        `Database operation failed: ${operation}`,
        'DATABASE_ERROR',
        'error',
        { operation, duration: Math.round(duration) }
      ));
      
      throw error;
    });
}

// Health check utilities
export async function performHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: string;
}> {
  const checks: Record<string, boolean> = {};
  
  try {
    // Check Supabase connection
    const { supabase } = await import('./supabase/client');
    const { error } = await supabase.from('coffee_catalog').select('id').limit(1);
    checks.database = !error;
  } catch {
    checks.database = false;
  }

  // Check if we can access admin functions
  try {
    const { checkAdminAccess } = await import('./auth');
    await checkAdminAccess();
    checks.auth = true;
  } catch {
    checks.auth = false;
  }

  const healthyChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  
  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (healthyChecks === totalChecks) {
    status = 'healthy';
  } else if (healthyChecks > 0) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  return {
    status,
    checks,
    timestamp: new Date().toISOString(),
  };
}

// Helper functions for sending data to services
function sendToMonitoringServices(event: any) {
  // Implementation would send to actual monitoring services
  console.log('📊 Would send to monitoring services:', event);
}

function sendPerformanceMetric(metric: any) {
  // Implementation would send to performance monitoring
  console.log('⚡ Would send performance metric:', metric);
}

function sendErrorToServices(errorData: any) {
  // Implementation would send to error tracking services
  console.log('❌ Would send to error tracking:', errorData);
}