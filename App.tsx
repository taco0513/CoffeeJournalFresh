import React from 'react';
import './src/utils/i18n';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
// import { initSentry } from './src/utils/sentry';

// Initialize Sentry for crash reporting
// initSentry(); // Temporarily disabled due to build issues

// Sync configuration - set to true when Supabase is ready
export const ENABLE_SYNC = true;

function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;