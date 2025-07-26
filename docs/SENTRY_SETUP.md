# Sentry Integration Setup Guide

## Overview

Sentry is used for crash reporting and error monitoring in CupNote. The integration is partially implemented and requires configuration before production deployment.

## Current Status

The `SentryService.ts` file contains a mock implementation that logs errors locally. To enable real Sentry integration:

## Setup Steps

### 1. Install Sentry React Native

```bash
npm install @sentry/react-native
# or
yarn add @sentry/react-native

# For iOS
cd ios && pod install
```

### 2. Configure Sentry

1. Create an account at [https://sentry.io](https://sentry.io)
2. Create a new React Native project
3. Copy your DSN from the project settings

### 3. Update Environment Variables

Create or update your `.env` file:

```
SENTRY_DSN=your-sentry-dsn-here
```

### 4. Update SentryService.ts

Replace the mock implementation with the real Sentry SDK:

```typescript
import * as Sentry from '@sentry/react-native';

export class SentryService {
  static initialize() {
    if (!__DEV__ && process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: __DEV__ ? 'development' : 'production',
        integrations: [
          new Sentry.ReactNativeTracing(),
        ],
        tracesSampleRate: 1.0,
        beforeSend(event, hint) {
          // Filter out sensitive information
          if (event.user) {
            delete event.user.email;
          }
          return event;
        },
      });
    }
  }

  static captureException(error: Error, context?: any) {
    if (__DEV__) {
      console.error('Sentry Exception:', error, context);
    } else {
      Sentry.captureException(error, {
        contexts: {
          app: context,
        },
      });
    }
  }

  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    if (__DEV__) {
      console.log(`Sentry ${level}:`, message);
    } else {
      Sentry.captureMessage(message, level);
    }
  }

  static setUser(user: { id: string; username?: string }) {
    Sentry.setUser({
      id: user.id,
      username: user.username,
    });
  }

  static clearUser() {
    Sentry.setUser(null);
  }
}
```

### 5. Update App.tsx

No changes needed - the initialization is already called.

### 6. Test Integration

1. Force a test crash in development:
```typescript
Sentry.nativeCrash(); // Only works on device, not simulator
```

2. Verify the crash appears in your Sentry dashboard

## Privacy Considerations

- Never send sensitive user data (emails, passwords, etc.)
- Filter out personal information in `beforeSend` callback
- Consider user consent for crash reporting
- Add privacy policy disclosure about crash reporting

## Performance Impact

- Sentry adds minimal overhead (~50KB to bundle size)
- Network requests are batched and sent async
- Crashes are stored offline and sent when network is available

## Best Practices

1. **Error Context**: Always provide context when capturing errors
2. **User Identification**: Set user ID but not email
3. **Environment Separation**: Use different projects for dev/staging/prod
4. **Filtering**: Filter out expected errors (network timeouts, etc.)
5. **Release Tracking**: Include version and build numbers

## Monitoring

After setup, monitor:
- Crash-free rate
- Error frequency
- Performance metrics
- User impact

## Alternative: Keep Mock Implementation

If you prefer not to use Sentry immediately:
1. The current mock implementation logs to console
2. Consider implementing file-based logging for production
3. Can integrate with other services (Bugsnag, Crashlytics, etc.)

## TODO Checklist

- [ ] Create Sentry account
- [ ] Install @sentry/react-native
- [ ] Configure DSN in .env
- [ ] Update SentryService.ts with real implementation
- [ ] Test crash reporting
- [ ] Update privacy policy
- [ ] Configure source maps for better stack traces