/**
 * @format
 */

// MUST BE AT THE TOP - Required for React Navigation
import 'react-native-gesture-handler';

// Define __DEV__ if not already defined
if (typeof __DEV__ === 'undefined') {
  global.__DEV__ = process.env.NODE_ENV !== 'production';
}

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Initialize debugging utilities in development (temporarily disabled bridge debugger)
if (__DEV__) {
  // Temporarily disable bridge debugger to fix onRequestCategoryPreferencing error
  // import('./src/utils/bridgeDebugger');
  import('./src/utils/clearDraftStorage');
}

AppRegistry.registerComponent(appName, () => App);
