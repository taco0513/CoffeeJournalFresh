import React from 'react';

/**
 * DataLoadingService - Prevents race conditions and duplicate requests
 * 
 * This service ensures that data loading operations are coordinated
 * and prevents multiple simultaneous requests for the same data.
 */

interface LoadingTask<T> {
  promise: Promise<T>;
  timestamp: number;
  context: string;
}

export class DataLoadingService {
  private static loadingTasks = new Map<string, LoadingTask<any>>();
  private static readonly CACHE_DURATION = 5000; // 5 seconds

  /**
   * Load data only once for a given key, preventing duplicate requests
   * @param key - Unique identifier for this data loading operation
   * @param loader - Function that returns a Promise with the data
   * @param context - Optional context for debugging
   * @returns Promise with the loaded data
   */
  static async loadOnce<T>(
    key: string, 
    loader: () => Promise<T>, 
    context: string = 'unknown'
  ): Promise<T> {
    const now = Date.now();
    
    // Check if we have a recent loading task for this key
    const existingTask = this.loadingTasks.get(key);
    if (existingTask && (now - existingTask.timestamp) < this.CACHE_DURATION) {
      console.log(`[DataLoadingService] Reusing existing task for key: ${key}`);
      return existingTask.promise;
    }

    console.log(`[DataLoadingService] Starting new task for key: ${key} (context: ${context})`);

    // Create new loading task
    const promise = this.executeWithTimeout(loader(), key, context);
    const task: LoadingTask<T> = {
      promise,
      timestamp: now,
      context
    };

    this.loadingTasks.set(key, task);

    try {
      const result = await promise;
      console.log(`[DataLoadingService] Completed task for key: ${key}`);
      return result;
    } catch (error) {
      console.error(`[DataLoadingService] Failed task for key: ${key}`, error);
      throw error;
    } finally {
      // Clean up completed task after a delay
      setTimeout(() => {
        this.loadingTasks.delete(key);
      }, this.CACHE_DURATION);
    }
  }

  /**
   * Execute a promise with timeout
   * @param promise - Promise to execute
   * @param key - Key for logging
   * @param context - Context for logging
   * @returns Promise with timeout
   */
  private static async executeWithTimeout<T>(
    promise: Promise<T>, 
    key: string, 
    context: string,
    timeoutMs: number = 30000
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`[DataLoadingService] Timeout after ${timeoutMs}ms for key: ${key}`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Check if a loading operation is currently in progress
   * @param key - Key to check
   * @returns true if loading is in progress
   */
  static isLoading(key: string): boolean {
    const task = this.loadingTasks.get(key);
    if (!task) return false;
    
    const now = Date.now();
    return (now - task.timestamp) < this.CACHE_DURATION;
  }

  /**
   * Cancel a loading operation
   * @param key - Key to cancel
   */
  static cancel(key: string): void {
    this.loadingTasks.delete(key);
    console.log(`[DataLoadingService] Cancelled task for key: ${key}`);
  }

  /**
   * Clear all loading tasks (useful for cleanup)
   */
  static clearAll(): void {
    console.log(`[DataLoadingService] Clearing all ${this.loadingTasks.size} tasks`);
    this.loadingTasks.clear();
  }

  /**
   * Get current loading statistics
   * @returns Object with loading statistics
   */
  static getStats(): { activeCount: number; tasks: Array<{ key: string; context: string; age: number }> } {
    const now = Date.now();
    const tasks = Array.from(this.loadingTasks.entries()).map(([key, task]) => ({
      key,
      context: task.context,
      age: now - task.timestamp
    }));

    return {
      activeCount: tasks.length,
      tasks
    };
  }
}

/**
 * React hook for safe data loading with automatic cleanup
 * @param dataLoader - Function that loads the data
 * @param deps - Dependencies that trigger reload
 * @param key - Unique key for this loading operation
 * @returns Object with data, loading state, and error
 */
export const useSafeDataLoading = <T>(
  dataLoader: () => Promise<T>,
  deps: React.DependencyList,
  key: string
): { data: T | null; isLoading: boolean; error: Error | null; reload: () => void } => {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await DataLoadingService.loadOnce(key, dataLoader, 'useSafeDataLoading');
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error(`[useSafeDataLoading] Error loading data for key ${key}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key, dataLoader]);

  React.useEffect(() => {
    load();
  }, [load, ...deps]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      DataLoadingService.cancel(key);
    };
  }, [key]);

  return {
    data,
    isLoading,
    error,
    reload: load
  };
};

// Type for data validation
export type DataValidator<T> = (data: any) => data is T;

/**
 * Validate data before setting it to state
 * @param data - Data to validate
 * @param validator - Validation function
 * @param fallback - Fallback value if validation fails
 * @returns Validated data or fallback
 */
export const validateData = <T>(
  data: any, 
  validator: DataValidator<T>, 
  fallback: T
): T => {
  try {
    if (validator(data)) {
      return data;
    }
    console.warn('[DataLoadingService] Data validation failed, using fallback');
    return fallback;
  } catch (error) {
    console.error('[DataLoadingService] Data validation error:', error);
    return fallback;
  }
};