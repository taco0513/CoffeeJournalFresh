import React, { useEffect } from 'react';
import './src/services/i18n'; // Initialize i18n
import { AppState, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { SentryService } from './src/services/SentryService';
import { initializeShakeDetection } from './src/hooks/useShakeToFeedback';
import { performanceMonitor } from './src/services/PerformanceMonitor';
import { analyticsService } from './src/services/AnalyticsService';
import { errorContextService } from './src/services/ErrorContextService';
// Unused imports removed for production build
// import { FirstTimeUserFeedback } from './src/components/beta/FirstTimeUserFeedback';
// import { DebugOverlay } from './src/components/DebugOverlay';
import { TamaguiProvider } from './src/providers/TamaguiProvider';

// Initialize Sentry for crash reporting
SentryService.initialize();

// Initialize shake detection for feedback
initializeShakeDetection();

// Initialize performance monitoring
performanceMonitor.initialize();

// Initialize error context service
errorContextService.initialize();

// Note: Realm initialization is done lazily when needed in components

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
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <TamaguiProvider>
            <AppNavigator />
            {/* Temporarily disabled to debug navigation issue */}
            {/* <FirstTimeUserFeedback /> */}
            {/* <DebugOverlay /> */}
          </TamaguiProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;