// Sentry stub - replace this when adding @sentry/react-native package
// TODO: When implementing @sentry/react-native:
// 1. Install package: bun add @sentry/react-native
// 2. Run setup wizard: npx @sentry/wizard@latest -i reactNative
// 3. Remove all console statements from this file
// 4. Replace stub methods with actual Sentry SDK calls
// 5. Update LoggingService to use real Sentry integration
// 6. Add proper error boundaries and performance monitoring
// 7. Configure source maps for production debugging

import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const SENTRY_DSN = process.env.SENTRY_DSN || ''; // TODO: Add your Sentry DSN from https://sentry.io

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

export class SentryService {
  static initialize(): void {
    console.log('Sentry is currently disabled. Install @sentry/react-native to enable crash reporting.');
  }

  static setUser(user: { id: string; email?: string; username?: string } | null): void {
    if (__DEV__) {
      console.log('Sentry.setUser:', user);
    }
  }

  static addBreadcrumb(message: string, category: string, data?: any): void {
    if (__DEV__) {
      console.log(`Sentry breadcrumb [${category}]:`, message, data);
    }
  }

  static captureException(error: Error, context?: { level?: SeverityLevel; tags?: Record<string, string>; extra?: any }): void {
    console.error('Sentry.captureException:', error, context);
  }

  static captureMessage(message: string, level: SeverityLevel = 'info'): void {
    if (__DEV__) {
      console.log(`Sentry.captureMessage [${level}]:`, message);
    }
  }

  static startTransaction(name: string, op: string) {
    return {
      finish: () => {},
      setData: (key: string, value: any) => {},
      setStatus: (status: string) => {},
    };
  }

  static setTag(key: string, value: string): void {
    if (__DEV__) {
      console.log(`Sentry.setTag: ${key}=${value}`);
    }
  }

  static setContext(key: string, context: any): void {
    if (__DEV__) {
      console.log(`Sentry.setContext [${key}]:`, context);
    }
  }

  // Beta user specific tracking
  static trackBetaFeedback(feedbackType: string, feedbackData: any): void {
    this.addBreadcrumb(`Beta feedback submitted: ${feedbackType}`, 'beta-feedback', feedbackData);
  }

  // Track feature usage for beta
  static trackFeatureUsage(featureName: string, metadata?: any): void {
    this.addBreadcrumb(`Feature used: ${featureName}`, 'feature-usage', metadata);
  }
}