// Sentry stub - replace this when adding @sentry/react-native package
// For complete setup instructions, see: docs/SENTRY_SETUP.md
// This mock implementation provides local error logging during development

import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { Logger } from './LoggingService';
const SENTRY_DSN = process.env.SENTRY_DSN || ''; // Configure in .env file - see docs/SENTRY_SETUP.md

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

export class SentryService {
  static initialize(): void {
    Logger.debug('Sentry is currently disabled. Install @sentry/react-native to enable crash reporting.', 'service', { component: 'SentryService' });
}

  static setUser(user: { id: string; email?: string; username?: string } | null): void {
    if (__DEV__) {
      Logger.debug('Sentry.setUser:', 'service', { component: 'SentryService', data: user });
  }
}

  static addBreadcrumb(message: string, category: string, data?: unknown): void {
    if (__DEV__) {
      Logger.debug(`Sentry breadcrumb [${category}]:`, 'service', { component: 'SentryService', data: message, data });
  }
}

  static captureException(error: Error, context?: { level?: SeverityLevel; tags?: Record<string, string>; extra?: unknown }): void {
    Logger.error('Sentry.captureException:', 'service', { component: 'SentryService', error: error, context });
}

  static captureMessage(message: string, level: SeverityLevel = 'info'): void {
    if (__DEV__) {
      Logger.debug(`Sentry.captureMessage [${level}]:`, 'service', { component: 'SentryService', data: message });
  }
}

  static startTransaction(name: string, op: string) {
    return {
      finish: () => {},
      setData: (key: string, value: unknown) => {},
      setStatus: (status: string) => {},
  };
}

  static setTag(key: string, value: string): void {
    if (__DEV__) {
      Logger.debug(`Sentry.setTag: ${key}=${value}`, 'service', { component: 'SentryService' });
  }
}

  static setContext(key: string, context: Record<string, unknown>): void {
    if (__DEV__) {
      Logger.debug(`Sentry.setContext [${key}]:`, 'service', { component: 'SentryService', data: context });
  }
}

  // Beta user specific tracking
  static trackBetaFeedback(feedbackType: string, feedbackData: unknown): void {
    this.addBreadcrumb(`Beta feedback submitted: ${feedbackType}`, 'beta-feedback', feedbackData);
}

  // Track feature usage for beta
  static trackFeatureUsage(featureName: string, metadata?: unknown): void {
    this.addBreadcrumb(`Feature used: ${featureName}`, 'feature-usage', metadata);
}
}