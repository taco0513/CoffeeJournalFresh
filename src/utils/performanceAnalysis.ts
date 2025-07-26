import { performanceMonitor } from '../services/PerformanceMonitor';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Logger } from '../services/LoggingService';
export interface PerformanceReport {
  summary: {
    totalOperations: number;
    averageResponseTime: number;
    slowestOperations: { name: string; duration: number }[];
    fastestOperations: { name: string; duration: number }[];
    errorRate: number;
    memoryIssues: number;
};
  recommendations: string[];
  criticalIssues: { type: string; description: string; severity: 'high' | 'medium' | 'low' }[];
}

interface StoredMetric {
  name: string;
  duration: number;
  timestamp: number;
  success: boolean;
  metadata?: unknown;
}

/**
 * Performance analysis and reporting utility
 */
class PerformanceAnalyzer {
  private static instance: PerformanceAnalyzer;
  private metrics: StoredMetric[] = [];
  private readonly STORAGE_KEY = '@performance_metrics';
  private readonly MAX_STORED_METRICS = 1000;
  private readonly ANALYSIS_PERIOD = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.loadStoredMetrics();
}

  static getInstance(): PerformanceAnalyzer {
    if (!PerformanceAnalyzer.instance) {
      PerformanceAnalyzer.instance = new PerformanceAnalyzer();
  }
    return PerformanceAnalyzer.instance;
}

  /**
   * Record a performance metric
   */
  recordMetric(name: string, duration: number, success: boolean = true, metadata?: unknown): void {
    const metric: StoredMetric = {
      name,
      duration,
      timestamp: Date.now(),
      success,
      metadata,
  };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_STORED_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_STORED_METRICS);
  }

    // Persist to storage (debounced)
    this.debouncedSave();
}

  /**
   * Generate comprehensive performance report
   */
  generateReport(): PerformanceReport {
    const recentMetrics = this.getRecentMetrics();
    const summary = this.generateSummary(recentMetrics);
    const recommendations = this.generateRecommendations(recentMetrics, summary);
    const criticalIssues = this.identifyCriticalIssues(recentMetrics, summary);

    return {
      summary,
      recommendations,
      criticalIssues,
  };
}

  /**
   * Get performance insights for specific operations
   */
  getOperationInsights(operationName: string): {
    averageTime: number;
    successRate: number;
    recentTrend: 'improving' | 'degrading' | 'stable';
    recommendations: string[];
} {
    const recentMetrics = this.getRecentMetrics();
    const operationMetrics = recentMetrics.filter(m => m.name === operationName);

    if (operationMetrics.length === 0) {
      return {
        averageTime: 0,
        successRate: 0,
        recentTrend: 'stable',
        recommendations: ['No data available for this operation'],
    };
  }

    const averageTime = operationMetrics.reduce((sum, m) => sum + m.duration, 0) / operationMetrics.length;
    const successRate = operationMetrics.filter(m => m.success).length / operationMetrics.length;

    // Analyze trend (compare first half vs second half)
    const midpoint = Math.floor(operationMetrics.length / 2);
    const firstHalf = operationMetrics.slice(0, midpoint);
    const secondHalf = operationMetrics.slice(midpoint);

    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.duration, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.duration, 0) / secondHalf.length;

    let recentTrend: 'improving' | 'degrading' | 'stable' = 'stable';
    const trendThreshold = 0.15; // 15% change threshold

    if (secondHalfAvg < firstHalfAvg * (1 - trendThreshold)) {
      recentTrend = 'improving';
  } else if (secondHalfAvg > firstHalfAvg * (1 + trendThreshold)) {
      recentTrend = 'degrading';
  }

    const recommendations = this.generateOperationRecommendations(
      operationName,
      averageTime,
      successRate,
      recentTrend
    );

    return {
      averageTime,
      successRate,
      recentTrend,
      recommendations,
  };
}

  /**
   * Export performance data for analysis
   */
  exportData(): unknown {
    return {
      metrics: this.getRecentMetrics(),
      summary: this.generateSummary(this.getRecentMetrics()),
      exportedAt: new Date().toISOString(),
  };
}

  /**
   * Clear all stored metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    AsyncStorage.removeItem(this.STORAGE_KEY);
}

  // Private methods
  private getRecentMetrics(): StoredMetric[] {
    const cutoff = Date.now() - this.ANALYSIS_PERIOD;
    return this.metrics.filter(m => m.timestamp >= cutoff);
}

  private generateSummary(metrics: StoredMetric[]): PerformanceReport['summary'] {
    if (metrics.length === 0) {
      return {
        totalOperations: 0,
        averageResponseTime: 0,
        slowestOperations: [],
        fastestOperations: [],
        errorRate: 0,
        memoryIssues: 0,
    };
  }

    const totalOperations = metrics.length;
    const averageResponseTime = metrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations;
    const errorRate = metrics.filter(m => !m.success).length / totalOperations;

    // Group by operation name for analysis
    const operationGroups = metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = [];
    }
      groups[metric.name].push(metric);
      return groups;
  }, {} as Record<string, StoredMetric[]>);

    // Calculate average times per operation
    const operationAverages = Object.entries(operationGroups).map(([name, ops]) => ({
      name,
      duration: ops.reduce((sum, op) => sum + op.duration, 0) / ops.length,
  }));

    const slowestOperations = operationAverages
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    const fastestOperations = operationAverages
      .sort((a, b) => a.duration - b.duration)
      .slice(0, 5);

    const memoryIssues = metrics.filter(m => 
      m.name.includes('memory') || 
      m.metadata?.memoryUsage > 85
    ).length;

    return {
      totalOperations,
      averageResponseTime,
      slowestOperations,
      fastestOperations,
      errorRate,
      memoryIssues,
  };
}

  private generateRecommendations(
    metrics: StoredMetric[], 
    summary: PerformanceReport['summary']
  ): string[] {
    const recommendations: string[] = [];

    // High error rate
    if (summary.errorRate > 0.05) {
      recommendations.push(
        `Error rate is ${(summary.errorRate * 100).toFixed(1)}%. Focus on error handling and retry mechanisms.`
      );
  }

    // Slow operations
    if (summary.slowestOperations.length > 0 && summary.slowestOperations[0].duration > 2000) {
      recommendations.push(
        `Slowest operation "${summary.slowestOperations[0].name}" takes ${summary.slowestOperations[0].duration.toFixed(0)}ms. Consider optimization.`
      );
  }

    // Memory issues
    if (summary.memoryIssues > 0) {
      recommendations.push(
        `${summary.memoryIssues} memory-related issues detected. Monitor memory usage and implement cleanup.`
      );
  }

    // High average response time
    if (summary.averageResponseTime > 1000) {
      recommendations.push(
        `Average response time is ${summary.averageResponseTime.toFixed(0)}ms. Consider implementing caching or lazy loading.`
      );
  }

    return recommendations;
}

  private identifyCriticalIssues(
    metrics: StoredMetric[], 
    summary: PerformanceReport['summary']
  ): PerformanceReport['criticalIssues'] {
    const issues: PerformanceReport['criticalIssues'] = [];

    // Very high error rate
    if (summary.errorRate > 0.1) {
      issues.push({
        type: 'high_error_rate',
        description: `Error rate of ${(summary.errorRate * 100).toFixed(1)}% indicates system instability`,
        severity: 'high',
    });
  }

    // Extremely slow operations
    if (summary.slowestOperations.length > 0 && summary.slowestOperations[0].duration > 5000) {
      issues.push({
        type: 'slow_operation',
        description: `Operation "${summary.slowestOperations[0].name}" takes over 5 seconds`,
        severity: 'high',
    });
  }

    // Memory pressure
    if (summary.memoryIssues > 10) {
      issues.push({
        type: 'memory_pressure',
        description: `${summary.memoryIssues} memory issues detected in recent period`,
        severity: 'medium',
    });
  }

    return issues;
}

  private generateOperationRecommendations(
    operationName: string,
    averageTime: number,
    successRate: number,
    trend: 'improving' | 'degrading' | 'stable'
  ): string[] {
    const recommendations: string[] = [];

    if (averageTime > 2000) {
      recommendations.push(`Consider optimizing ${operationName} - current average: ${averageTime.toFixed(0)}ms`);
  }

    if (successRate < 0.95) {
      recommendations.push(`Improve error handling for ${operationName} - success rate: ${(successRate * 100).toFixed(1)}%`);
  }

    if (trend === 'degrading') {
      recommendations.push(`Performance degrading for ${operationName} - investigate recent changes`);
  }

    return recommendations;
}

  private async loadStoredMetrics(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.metrics = JSON.parse(stored);
    }
  } catch (error) {
      Logger.warn('Failed to load performance metrics:', 'util', { component: 'performanceAnalysis', error: error });
  }
}

  private saveTimeout: NodeJS.Timeout | null = null;
  private debouncedSave = (): void => {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
  }
    
    this.saveTimeout = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (error) {
        Logger.warn('Failed to save performance metrics:', 'util', { component: 'performanceAnalysis', error: error });
    }
  }, 5000); // Save after 5 seconds of inactivity
};
}

export const performanceAnalyzer = PerformanceAnalyzer.getInstance();

// Convenience function for easy integration
export function trackPerformance<T extends (...args: unknown[]) => any>(
  fn: T,
  operationName: string
): T {
  return ((...args: Parameters<T>) => {
    const startTime = Date.now();
    
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result
          .then((value) => {
            performanceAnalyzer.recordMetric(operationName, Date.now() - startTime, true);
            return value;
        })
          .catch((error) => {
            performanceAnalyzer.recordMetric(operationName, Date.now() - startTime, false);
            throw error;
        });
    } else {
        performanceAnalyzer.recordMetric(operationName, Date.now() - startTime, true);
        return result;
    }
  } catch (error) {
      performanceAnalyzer.recordMetric(operationName, Date.now() - startTime, false);
      throw error;
  }
}) as T;
}