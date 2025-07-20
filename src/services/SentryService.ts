// Sentry stub - replace this when adding @sentry/react-native package
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const SENTRY_DSN = process.env.SENTRY_DSN || ''; // Add your Sentry DSN here

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

export class SentryService {
  static initialize() {
    console.log('Sentry is currently disabled. Install @sentry/react-native to enable crash reporting.');
  }

  static setUser(user: { id: string; email?: string; username?: string } | null) {
    if (__DEV__) {
      console.log('Sentry.setUser:', user);
    }
  }

  static addBreadcrumb(message: string, category: string, data?: any) {
    if (__DEV__) {
      console.log(`Sentry breadcrumb [${category}]:`, message, data);
    }
  }

  static captureException(error: Error, context?: any) {
    console.error('Sentry.captureException:', error, context);
  }

  static captureMessage(message: string, level: SeverityLevel = 'info') {
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

  static setTag(key: string, value: string) {
    if (__DEV__) {
      console.log(`Sentry.setTag: ${key}=${value}`);
    }
  }

  static setContext(key: string, context: any) {
    if (__DEV__) {
      console.log(`Sentry.setContext [${key}]:`, context);
    }
  }

  // Beta user specific tracking
  static trackBetaFeedback(feedbackType: string, feedbackData: any) {
    this.addBreadcrumb(`Beta feedback submitted: ${feedbackType}`, 'beta-feedback', feedbackData);
  }

  // Track feature usage for beta
  static trackFeatureUsage(featureName: string, metadata?: any) {
    this.addBreadcrumb(`Feature used: ${featureName}`, 'feature-usage', metadata);
  }
}