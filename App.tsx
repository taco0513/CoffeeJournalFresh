import React, { useEffect } from 'react';
import './src/services/i18n'; // Initialize i18n
import { AppState, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator-tamagui';
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
import AuthService from './src/services/supabase/auth';
import { useUserStore } from './src/stores/useUserStore';
import { supabase } from './src/services/supabase/client';

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
  // Remove setSession as it doesn't exist in useUserStore
  
  useEffect(() => {
    // Temporarily disable auth restoration to debug the loop issue
    // TODO: Re-enable after fixing the navigation loop
    /*
    // Restore auth session on app startup
    const initializeAuth = async () => {
      try {
        const user = await AuthService.restoreSession();
        if (user) {
          // Get full session data from Supabase
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setSession(session);
          }
        }
      } catch (error) {
        console.error('Failed to restore auth session:', error);
      }
    };
    
    initializeAuth();
    
    // Listen to auth state changes
    const { data: authListener } = AuthService.onAuthStateChange(async (user) => {
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession(session);
        }
      } else {
        setSession(null);
      }
    });
    */
    
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
      // authListener?.subscription?.unsubscribe();
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