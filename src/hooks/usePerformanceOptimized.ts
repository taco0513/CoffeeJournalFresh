import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { performanceMonitor } from '../services/PerformanceMonitor';

/**
 * Performance optimization hook for expensive operations
 */
export function usePerformanceOptimized() {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  
  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;
    
    // Track frequent re-renders (potential performance issue)
    if (timeSinceLastRender < 16) { // Less than 1 frame at 60fps
      performanceMonitor.reportError(
        new Error('Frequent re-render detected'),
        'performance_optimization',
        'medium'
      );
  }
});

  /**
   * Memoized callback with performance tracking
   */
  const optimizedCallback = useCallback(
    <T extends (...args: unknown[]) => any>(
      callback: T,
      deps: React.DependencyList,
      trackingName?: string
    ): T => {
      return useCallback((...args: Parameters<T>) => {
        const timingId = trackingName ? performanceMonitor.startTiming(trackingName) : null;
        
        try {
          const result = callback(...args);
          
          if (timingId && trackingName) {
            if (result instanceof Promise) {
              result.finally(() => {
                performanceMonitor.endTiming(timingId, `callback_${trackingName}`);
            });
          } else {
              performanceMonitor.endTiming(timingId, `callback_${trackingName}`);
          }
        }
          
          return result;
      } catch (error) {
          if (timingId && trackingName) {
            performanceMonitor.endTiming(timingId, `callback_${trackingName}_error`);
        }
          throw error;
      }
    }, deps) as T;
  },
    []
  );

  /**
   * Debounced function with performance tracking
   */
  const debouncedCallback = useCallback(
    <T extends (...args: unknown[]) => any>(
      callback: T,
      delay: number,
      trackingName?: string
    ): T => {
      const timeoutRef = useRef<NodeJS.Timeout | null>(null);
      
      return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
      }
        
        timeoutRef.current = setTimeout(() => {
          const timingId = trackingName ? performanceMonitor.startTiming(trackingName) : null;
          
          try {
            const result = callback(...args);
            
            if (timingId && trackingName) {
              if (result instanceof Promise) {
                result.finally(() => {
                  performanceMonitor.endTiming(timingId, `debounced_${trackingName}`);
              });
            } else {
                performanceMonitor.endTiming(timingId, `debounced_${trackingName}`);
            }
          }
            
            return result;
        } catch (error) {
            if (timingId && trackingName) {
              performanceMonitor.endTiming(timingId, `debounced_${trackingName}_error`);
          }
            throw error;
        }
      }, delay);
    }, [callback, delay, trackingName]) as T;
  },
    []
  );

  /**
   * Throttled function with performance tracking
   */
  const throttledCallback = useCallback(
    <T extends (...args: unknown[]) => any>(
      callback: T,
      limit: number,
      trackingName?: string
    ): T => {
      const lastCallRef = useRef<number>(0);
      
      return useCallback((...args: Parameters<T>) => {
        const now = Date.now();
        
        if (now - lastCallRef.current >= limit) {
          lastCallRef.current = now;
          
          const timingId = trackingName ? performanceMonitor.startTiming(trackingName) : null;
          
          try {
            const result = callback(...args);
            
            if (timingId && trackingName) {
              if (result instanceof Promise) {
                result.finally(() => {
                  performanceMonitor.endTiming(timingId, `throttled_${trackingName}`);
              });
            } else {
                performanceMonitor.endTiming(timingId, `throttled_${trackingName}`);
            }
          }
            
            return result;
        } catch (error) {
            if (timingId && trackingName) {
              performanceMonitor.endTiming(timingId, `throttled_${trackingName}_error`);
          }
            throw error;
        }
      }
    }, [callback, limit, trackingName]) as T;
  },
    []
  );

  /**
   * Memoized expensive computation with performance tracking
   */
  const memoizedComputation = useCallback(
    <T>(
      computation: () => T,
      deps: React.DependencyList,
      trackingName?: string
    ): T => {
      return useMemo(() => {
        const timingId = trackingName ? performanceMonitor.startTiming(trackingName) : null;
        
        try {
          const result = computation();
          
          if (timingId && trackingName) {
            performanceMonitor.endTiming(timingId, `computation_${trackingName}`);
        }
          
          return result;
      } catch (error) {
          if (timingId && trackingName) {
            performanceMonitor.endTiming(timingId, `computation_${trackingName}_error`);
        }
          throw error;
      }
    }, deps);
  },
    []
  );

  return {
    optimizedCallback,
    debouncedCallback,
    throttledCallback,
    memoizedComputation,
    renderCount: renderCountRef.current,
};
}

/**
 * Hook for lazy loading data with performance optimization
 */
export function useLazyLoad<T>(
  loadFunction: () => Promise<T>,
  deps: React.DependencyList,
  options: {
    trackingName?: string;
    cacheTime?: number;
    retryCount?: number;
} = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);
  const retryCountRef = useRef(0);
  
  const { trackingName, cacheTime = 5 * 60 * 1000, retryCount = 3 } = options;

  const loadData = useCallback(async () => {
    // Check cache first
    if (cacheRef.current && cacheTime > 0) {
      const isValid = Date.now() - cacheRef.current.timestamp < cacheTime;
      if (isValid) {
        setData(cacheRef.current.data);
        return;
    }
  }

    setLoading(true);
    setError(null);
    
    const timingId = trackingName ? performanceMonitor.startTiming(trackingName) : null;
    
    try {
      const result = await loadFunction();
      
      // Cache the result
      cacheRef.current = { data: result, timestamp: Date.now() };
      setData(result);
      retryCountRef.current = 0;
      
      if (timingId && trackingName) {
        performanceMonitor.endTiming(timingId, `lazy_load_${trackingName}_success`);
    }
  } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      if (retryCountRef.current < retryCount) {
        retryCountRef.current += 1;
        setTimeout(() => loadData(), 1000 * retryCountRef.current); // Exponential backoff
    } else {
        setError(error);
        performanceMonitor.reportError(error, `lazy_load_${trackingName}`, 'medium');
    }
      
      if (timingId && trackingName) {
        performanceMonitor.endTiming(timingId, `lazy_load_${trackingName}_error`);
    }
  } finally {
      setLoading(false);
  }
}, [...deps, loadFunction, trackingName, cacheTime, retryCount]);

  useEffect(() => {
    loadData();
}, [loadData]);

  return { data, loading, error, reload: loadData };
}