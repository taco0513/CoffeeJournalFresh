import React from 'react';
import './src/utils/i18n';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// Sync configuration - set to true when Supabase is ready
export const ENABLE_SYNC = true;

function App(): React.JSX.Element {
  return <AppNavigator />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;