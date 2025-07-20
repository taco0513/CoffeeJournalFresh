import React, { useEffect } from 'react';
import './src/utils/i18n';
import { StyleSheet, AppState } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { SentryService } from './src/services/SentryService';
import { initializeShakeDetection } from './src/hooks/useShakeToFeedback';
import { performanceMonitor } from './src/services/PerformanceMonitor';
import { analyticsService } from './src/services/AnalyticsService';
import { errorContextService } from './src/services/ErrorContextService';
import { FirstTimeUserFeedback } from './src/components/beta/FirstTimeUserFeedback';

// Initialize Sentry for crash reporting
SentryService.initialize();

// Initialize shake detection for feedback
initializeShakeDetection();

// Initialize performance monitoring
performanceMonitor.initialize();

// Initialize error context service
errorContextService.initialize();

// Sync configuration - set to true when Supabase is ready
export const ENABLE_SYNC = true;

function App(): React.JSX.Element {
  useEffect(() => {
    // Handle app state changes for analytics
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        analyticsService.endSession();
        performanceMonitor.flushQueue();
      } else if (nextAppState === 'active') {
        analyticsService.initialize();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup function
    return () => {
      subscription?.remove();
      analyticsService.endSession();
      performanceMonitor.cleanup();
      errorContextService.cleanup();
    };
  }, []);

  return (
    <ErrorBoundary>
      <AppNavigator />
      <FirstTimeUserFeedback />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;