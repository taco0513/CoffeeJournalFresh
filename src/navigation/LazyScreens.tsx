import { lazy, Suspense } from 'react';
import { View, Spinner } from 'tamagui';

// Loading component
const LoadingScreen = () => (
  <View flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
    <Spinner size="large" color="$cupBlue" />
  </View>
);

// Lazy loaded screens - heavy screens that aren't immediately needed
export const LazyStatisticsScreen = lazy(() => import('../screens-tamagui/analytics/StatisticsScreen'));
export const LazyMarketIntelligenceScreen = lazy(() => import('../screens-tamagui/analytics/MarketIntelligenceScreen'));
export const LazyPersonalTasteDashboard = lazy(() => import('../screens-tamagui/analytics/PersonalTasteDashboard'));
export const LazyPerformanceDashboardScreen = lazy(() => import('../screens-tamagui/utilities/PerformanceDashboardScreen'));
export const LazyExperimentalDataScreen = lazy(() => import('../screens-tamagui/enhanced/ExperimentalDataScreen'));
export const LazyAchievementGalleryScreen = lazy(() => import('../screens-tamagui/achievements/AchievementGalleryScreen'));
export const LazyFlavorLibraryScreen = lazy(() => import('../screens-tamagui/education/FlavorLibraryScreen'));

// Wrapper component for lazy screens
export const withLazyLoading = (LazyComponent: React.LazyExoticComponent<any>) => {
  return (props: any) => (
    <Suspense fallback={<LoadingScreen />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};