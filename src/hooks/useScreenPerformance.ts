import { useEffect } from 'react';
import { usePerformanceMeasurement } from '../utils/performanceTestUtils';

import { Logger } from '../services/LoggingService';
/**
 * Hook to automatically measure screen performance
 * @param screenName Name of the screen being measured
 * @param enabled Whether to enable performance measurement (default: true in DEV)
 */
export function useScreenPerformance(screenName: string, enabled: boolean = __DEV__) {
  usePerformanceMeasurement(screenName, true); // true = Tamagui version
  
  useEffect(() => {
    if (enabled) {
      Logger.debug(`📊 Performance measurement enabled for ${screenName}`, 'hook', { component: 'useScreenPerformance' });
  }
}, [screenName, enabled]);
}