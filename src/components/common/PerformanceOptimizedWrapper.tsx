import React, { memo, useEffect, useRef } from 'react';
import { performanceMonitor } from '../../services/PerformanceMonitor';

interface PerformanceWrapperProps {
  children: React.ReactNode;
  componentName: string;
  trackRenders?: boolean;
  trackMounts?: boolean;
  trackUpdates?: boolean;
}

/**
 * HOC for performance monitoring and optimization
 */
export const PerformanceOptimizedWrapper = memo<PerformanceWrapperProps>(({
  children,
  componentName,
  trackRenders = true,
  trackMounts = true,
  trackUpdates = true,
}) => {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef<string | null>(null);
  const lastPropsRef = useRef<any>(null);

  // Track component mount
  useEffect(() => {
    if (trackMounts) {
      const timingId = performanceMonitor.startTiming(`${componentName}_mount`);
      mountTimeRef.current = timingId;
      
      return () => {
        if (mountTimeRef.current) {
          performanceMonitor.endTiming(
            mountTimeRef.current,
            `${componentName}_unmount`,
            { renderCount: renderCountRef.current }
          );
        }
      };
    }
  }, [componentName, trackMounts]);

  // Track renders
  useEffect(() => {
    renderCountRef.current += 1;
    
    if (trackRenders) {
      const timingId = performanceMonitor.startTiming(`${componentName}_render`);
      
      // End timing on next tick to capture render time
      setTimeout(() => {
        performanceMonitor.endTiming(timingId, `${componentName}_render_complete`, {
          renderNumber: renderCountRef.current,
        });
      }, 0);
    }
  });

  // Track prop updates
  useEffect(() => {
    if (trackUpdates && lastPropsRef.current !== null) {
      const timingId = performanceMonitor.startTiming(`${componentName}_update`);
      
      setTimeout(() => {
        performanceMonitor.endTiming(timingId, `${componentName}_update_complete`, {
          renderNumber: renderCountRef.current,
        });
      }, 0);
    }
    
    lastPropsRef.current = { children, componentName };
  }, [children, componentName, trackUpdates]);

  return <>{children}</>;
});

/**
 * HOC function for wrapping components with performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = memo((props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Unknown';
    
    return (
      <PerformanceOptimizedWrapper componentName={name}>
        <Component {...props} />
      </PerformanceOptimizedWrapper>
    );
  });

  WrappedComponent.displayName = `withPerformanceMonitoring(${
    componentName || Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

/**
 * Lazy loading wrapper with performance tracking
 */
export function LazyComponentWrapper({
  children,
  fallback,
  componentName,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName: string;
}) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const timingIdRef = useRef<string | null>(null);

  useEffect(() => {
    timingIdRef.current = performanceMonitor.startTiming(`${componentName}_lazy_load`);
    
    // Simulate component being ready
    const timer = setTimeout(() => {
      setIsLoaded(true);
      
      if (timingIdRef.current) {
        performanceMonitor.endTiming(
          timingIdRef.current,
          `${componentName}_lazy_load_complete`
        );
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      if (timingIdRef.current) {
        performanceMonitor.endTiming(
          timingIdRef.current,
          `${componentName}_lazy_load_cancelled`
        );
      }
    };
  }, [componentName]);

  if (!isLoaded && fallback) {
    return <>{fallback}</>;
  }

  return (
    <PerformanceOptimizedWrapper 
      componentName={`${componentName}_lazy`}
      trackMounts={true}
      trackRenders={true}
    >
      {children}
    </PerformanceOptimizedWrapper>
  );
}

/**
 * Virtualized list item wrapper for performance
 */
export const VirtualizedItemWrapper = memo<{
  children: React.ReactNode;
  index: number;
  componentName: string;
}>(({ children, index, componentName }) => {
  const isVisibleRef = useRef(false);
  const timingIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Track when item becomes visible
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      timingIdRef.current = performanceMonitor.startTiming(
        `${componentName}_item_${index}_visible`
      );
      
      return () => {
        if (timingIdRef.current) {
          performanceMonitor.endTiming(
            timingIdRef.current,
            `${componentName}_item_${index}_hidden`
          );
        }
      };
    }
  }, [componentName, index]);

  return <>{children}</>;
});

VirtualizedItemWrapper.displayName = 'VirtualizedItemWrapper';