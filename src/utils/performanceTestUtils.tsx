/**
 * Performance Testing Utilities for Tamagui Migration
 * Measures and compares performance metrics before/after migration
 */

import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PerformanceMetrics {
  screenName: string;
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
  jsThreadFPS?: number;
  uiThreadFPS?: number;
  timestamp: Date;
  isTamagui: boolean;
}

export interface PerformanceComparison {
  screenName: string;
  legacy: PerformanceMetrics | null;
  tamagui: PerformanceMetrics | null;
  improvement: {
    renderTime: number;
    interactionTime: number;
    memoryUsage?: number;
  };
}

class PerformanceTestManager {
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private startTime: number = 0;
  private interactionStartTime: number = 0;

  /**
   * Start measuring render performance
   */
  startRenderMeasurement(screenName: string) {
    this.startTime = performance.now();
    console.log(`🏁 Starting render measurement for ${screenName}`);
  }

  /**
   * End render measurement and record metrics
   */
  async endRenderMeasurement(screenName: string, isTamagui: boolean = true) {
    const renderTime = performance.now() - this.startTime;
    
    // Wait for interactions to complete
    await new Promise(resolve => {
      InteractionManager.runAfterInteractions(() => {
        resolve(true);
      });
    });

    const interactionTime = performance.now() - this.startTime;

    const metrics: PerformanceMetrics = {
      screenName,
      renderTime,
      interactionTime,
      timestamp: new Date(),
      isTamagui,
    };

    // Store metrics
    await this.storeMetrics(screenName, metrics);
    
    console.log(`✅ ${screenName} Performance:`, {
      renderTime: `${renderTime.toFixed(2)}ms`,
      interactionTime: `${interactionTime.toFixed(2)}ms`,
      type: isTamagui ? 'Tamagui' : 'Legacy',
    });

    return metrics;
  }

  /**
   * Store metrics for comparison
   */
  private async storeMetrics(screenName: string, metrics: PerformanceMetrics) {
    const key = `perf_${screenName}_${metrics.isTamagui ? 'tamagui' : 'legacy'}`;
    await AsyncStorage.setItem(key, JSON.stringify(metrics));
    
    // Also store in memory
    if (!this.metrics.has(screenName)) {
      this.metrics.set(screenName, []);
    }
    this.metrics.get(screenName)!.push(metrics);
  }

  /**
   * Get comparison between legacy and Tamagui versions
   */
  async getComparison(screenName: string): Promise<PerformanceComparison | null> {
    const legacyKey = `perf_${screenName}_legacy`;
    const tamaguiKey = `perf_${screenName}_tamagui`;

    const legacyData = await AsyncStorage.getItem(legacyKey);
    const tamaguiData = await AsyncStorage.getItem(tamaguiKey);

    const legacy = legacyData ? JSON.parse(legacyData) : null;
    const tamagui = tamaguiData ? JSON.parse(tamaguiData) : null;

    if (!legacy || !tamagui) {
      return null;
    }

    return {
      screenName,
      legacy,
      tamagui,
      improvement: {
        renderTime: ((legacy.renderTime - tamagui.renderTime) / legacy.renderTime) * 100,
        interactionTime: ((legacy.interactionTime - tamagui.interactionTime) / legacy.interactionTime) * 100,
        memoryUsage: legacy.memoryUsage && tamagui.memoryUsage
          ? ((legacy.memoryUsage - tamagui.memoryUsage) / legacy.memoryUsage) * 100
          : undefined,
      },
    };
  }

  /**
   * Get all comparisons
   */
  async getAllComparisons(): Promise<PerformanceComparison[]> {
    const keys = await AsyncStorage.getAllKeys();
    const screenNames = new Set<string>();

    keys.forEach(key => {
      if (key.startsWith('perf_')) {
        const parts = key.split('_');
        screenNames.add(parts[1]);
      }
    });

    const comparisons: PerformanceComparison[] = [];
    
    for (const screenName of screenNames) {
      const comparison = await this.getComparison(screenName);
      if (comparison) {
        comparisons.push(comparison);
      }
    }

    return comparisons;
  }

  /**
   * Generate performance report
   */
  async generateReport(): Promise<string> {
    const comparisons = await this.getAllComparisons();
    
    if (comparisons.length === 0) {
      return 'No performance comparisons available yet.';
    }

    let report = '# Tamagui Migration Performance Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += '## Screen Performance Comparisons\n\n';

    let totalRenderImprovement = 0;
    let totalInteractionImprovement = 0;
    let screenCount = 0;

    comparisons.forEach(comp => {
      report += `### ${comp.screenName}\n`;
      report += `- **Render Time**: ${comp.legacy?.renderTime.toFixed(2)}ms → ${comp.tamagui?.renderTime.toFixed(2)}ms `;
      report += `(${comp.improvement.renderTime > 0 ? '🟢' : '🔴'} ${Math.abs(comp.improvement.renderTime).toFixed(1)}%)\n`;
      report += `- **Interaction Time**: ${comp.legacy?.interactionTime.toFixed(2)}ms → ${comp.tamagui?.interactionTime.toFixed(2)}ms `;
      report += `(${comp.improvement.interactionTime > 0 ? '🟢' : '🔴'} ${Math.abs(comp.improvement.interactionTime).toFixed(1)}%)\n\n`;

      totalRenderImprovement += comp.improvement.renderTime;
      totalInteractionImprovement += comp.improvement.interactionTime;
      screenCount++;
    });

    report += '## Summary\n\n';
    report += `- **Average Render Time Improvement**: ${(totalRenderImprovement / screenCount).toFixed(1)}%\n`;
    report += `- **Average Interaction Time Improvement**: ${(totalInteractionImprovement / screenCount).toFixed(1)}%\n`;
    report += `- **Screens Tested**: ${screenCount}\n`;

    return report;
  }

  /**
   * Clear all stored metrics
   */
  async clearMetrics() {
    const keys = await AsyncStorage.getAllKeys();
    const perfKeys = keys.filter(key => key.startsWith('perf_'));
    await AsyncStorage.multiRemove(perfKeys);
    this.metrics.clear();
    console.log('🧹 Cleared all performance metrics');
  }
}

// Singleton instance
export const performanceTest = new PerformanceTestManager();

/**
 * HOC to measure screen performance
 */
export function withPerformanceMeasurement<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  screenName: string,
  isTamagui: boolean = true
) {
  return class extends React.Component<T> {
    componentDidMount() {
      performanceTest.startRenderMeasurement(screenName);
      
      // Measure after render completes
      requestAnimationFrame(() => {
        performanceTest.endRenderMeasurement(screenName, isTamagui);
      });
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

/**
 * Hook to measure component performance
 */
export function usePerformanceMeasurement(screenName: string, isTamagui: boolean = true) {
  React.useEffect(() => {
    performanceTest.startRenderMeasurement(screenName);
    
    // Measure after render completes
    requestAnimationFrame(() => {
      performanceTest.endRenderMeasurement(screenName, isTamagui);
    });
  }, [screenName, isTamagui]);
}

/**
 * Utility to run automated performance tests
 */
export async function runAutomatedPerformanceTests(screens: string[]) {
  console.log('🚀 Starting automated performance tests...');
  
  const results: PerformanceComparison[] = [];
  
  for (const screen of screens) {
    console.log(`Testing ${screen}...`);
    // Navigation to each screen would happen here in a real test
    // For now, we'll simulate with mock data
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const comparison = await performanceTest.getComparison(screen);
    if (comparison) {
      results.push(comparison);
    }
  }
  
  const report = await performanceTest.generateReport();
  console.log('\n📊 Performance Report:\n', report);
  
  return results;
}

/**
 * Bundle size analyzer (requires additional tooling)
 */
export async function analyzeBundleSize() {
  // This would integrate with Metro bundler or other tools
  // For now, return mock data
  return {
    legacy: {
      totalSize: 5200000, // 5.2MB
      jsSize: 4100000,
      assetsSize: 1100000,
    },
    tamagui: {
      totalSize: 4420000, // 4.42MB
      jsSize: 3500000,
      assetsSize: 920000,
    },
    improvement: {
      total: 15, // 15% reduction
      js: 14.6,
      assets: 16.4,
    },
  };
}