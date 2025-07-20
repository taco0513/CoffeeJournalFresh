import { useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { analyticsService } from '../services/AnalyticsService';
import { useUserStore } from '../stores/useUserStore';

export const useAnalytics = () => {
  const navigation = useNavigation();
  const { currentUser } = useUserStore();

  useEffect(() => {
    // Initialize analytics when user changes
    if (currentUser) {
      analyticsService.initialize(currentUser.id);
    } else {
      analyticsService.initialize();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    // Handle app state changes
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        analyticsService.endSession();
      } else if (nextAppState === 'active') {
        analyticsService.initialize(currentUser?.id);
      }
    };

    // Note: In a real implementation, you'd want to use AppState from react-native
    // import { AppState } from 'react-native';
    // AppState.addEventListener('change', handleAppStateChange);

    return () => {
      analyticsService.endSession();
    };
  }, [currentUser?.id]);

  const trackScreenView = useCallback((screenName: string, properties?: Record<string, any>) => {
    analyticsService.trackScreenView(screenName, properties);
  }, []);

  const trackButtonClick = useCallback((buttonName: string, properties?: Record<string, any>) => {
    analyticsService.trackButtonClick(buttonName, undefined, properties);
  }, []);

  const trackFeatureUse = useCallback((featureName: string, properties?: Record<string, any>) => {
    analyticsService.trackFeatureUse(featureName, properties);
  }, []);

  const trackError = useCallback((errorName: string, errorMessage: string, stackTrace?: string, properties?: Record<string, any>) => {
    analyticsService.trackError(errorName, errorMessage, stackTrace, properties);
  }, []);

  const trackTiming = useCallback((eventName: string, duration: number, properties?: Record<string, any>) => {
    analyticsService.trackTiming(eventName, duration, properties);
  }, []);

  // Coffee-specific tracking
  const trackCoffeeAction = useCallback((action: string, coffeeId?: string, properties?: Record<string, any>) => {
    analyticsService.trackCoffeeAction(action, coffeeId, properties);
  }, []);

  const trackTastingAction = useCallback((action: string, tastingId?: string, properties?: Record<string, any>) => {
    analyticsService.trackTastingAction(action, tastingId, properties);
  }, []);

  const trackSearchAction = useCallback((query: string, results: number, searchType?: string) => {
    analyticsService.trackSearchAction(query, results, searchType);
  }, []);

  return {
    trackScreenView,
    trackButtonClick,
    trackFeatureUse,
    trackError,
    trackTiming,
    trackCoffeeAction,
    trackTastingAction,
    trackSearchAction,
  };
};

// HOC for automatic screen view tracking - temporarily disabled due to JSX issues
// export const withAnalytics = <T extends object>(WrappedComponent: React.ComponentType<T>, screenName: string) => {
//   return (props: T) => {
//     const { trackScreenView } = useAnalytics();
//
//     useEffect(() => {
//       trackScreenView(screenName);
//     }, [trackScreenView]);
//
//     return <WrappedComponent {...props} />;
//   };
// };