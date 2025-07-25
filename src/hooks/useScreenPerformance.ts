import { useEffect } from 'react';
import { usePerformanceMeasurement } from '../utils/performanceTestUtils';

/**
 * Hook to automatically measure screen performance
 * @param screenName Name of the screen being measured
 * @param enabled Whether to enable performance measurement (default: true in DEV)
 */
export function useScreenPerformance(screenName: string, enabled: boolean = __DEV__) {
  usePerformanceMeasurement(screenName, true); // true = Tamagui version
  
  useEffect(() => {
    if (enabled) {
      console.log(`📊 Performance measurement enabled for ${screenName}`);
    }
  }, [screenName, enabled]);
}