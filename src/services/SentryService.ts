import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const SENTRY_DSN = process.env.SENTRY_DSN || ''; // Add your Sentry DSN here

export class SentryService {
  static initialize() {
    if (!SENTRY_DSN) {
      console.log('Sentry DSN not configured, skipping initialization');
      return;
    }

    Sentry.init({
      dsn: SENTRY_DSN,
      environment: __DEV__ ? 'development' : 'production',
      debug: __DEV__,
      tracesSampleRate: __DEV__ ? 1.0 : 0.1,
      
      // Integration configuration
      integrations: [
        new Sentry.ReactNativeTracing({
          routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
          tracingOrigins: ['localhost', /^\//],
        }),
      ],
      
      // Before send hook for filtering
      beforeSend: (event, hint) => {
        // Filter out development errors if needed
        if (__DEV__ && event.level === 'error') {
          console.log('Sentry Development Error:', event);
        }
        
        // Add device context
        event.contexts = {
          ...event.contexts,
          device: {
            ...event.contexts?.device,
            app_version: DeviceInfo.getVersion(),
            build_number: DeviceInfo.getBuildNumber(),
            brand: DeviceInfo.getBrand(),
            model: DeviceInfo.getModel(),
            os_version: Platform.Version.toString(),
          },
        };
        
        return event;
      },
      
      // Breadcrumb filtering
      beforeBreadcrumb: (breadcrumb) => {
        // Filter out noisy breadcrumbs
        if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
          return null;
        }
        return breadcrumb;
      },
    });
  }

  static setUser(user: { id: string; email?: string; username?: string } | null) {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    } else {
      Sentry.setUser(null);
    }
  }

  static addBreadcrumb(message: string, category: string, data?: any) {
    Sentry.addBreadcrumb({
      message,
      category,
      level: 'info',
      data,
      timestamp: Date.now() / 1000,
    });
  }

  static captureException(error: Error, context?: any) {
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    });
  }

  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    Sentry.captureMessage(message, level);
  }

  static startTransaction(name: string, op: string) {
    return Sentry.startTransaction({ name, op });
  }

  static setTag(key: string, value: string) {
    Sentry.setTag(key, value);
  }

  static setContext(key: string, context: any) {
    Sentry.setContext(key, context);
  }

  // Beta user specific tracking
  static trackBetaFeedback(feedbackType: string, feedbackData: any) {
    Sentry.addBreadcrumb({
      message: `Beta feedback submitted: ${feedbackType}`,
      category: 'beta-feedback',
      level: 'info',
      data: feedbackData,
    });
  }

  // Track feature usage for beta
  static trackFeatureUsage(featureName: string, metadata?: any) {
    Sentry.addBreadcrumb({
      message: `Feature used: ${featureName}`,
      category: 'feature-usage',
      level: 'info',
      data: metadata,
    });
  }
}