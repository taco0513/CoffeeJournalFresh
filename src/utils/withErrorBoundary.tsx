import React from 'react';
import { NavigationErrorBoundary } from '../components/NavigationErrorBoundary';

/**
 * Higher-order component to wrap screens with error boundaries
 * This provides automatic error handling at the screen level
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  screenName: string
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    return (
      <NavigationErrorBoundary screenName={screenName}>
        <Component {...props} ref={ref} />
      </NavigationErrorBoundary>
    );
  });
  
  WrappedComponent.displayName = `withErrorBoundary(${screenName})`;
  
  return WrappedComponent;
}

/**
 * Utility to wrap multiple screens with error boundaries
 * Usage: wrapScreensWithErrorBoundary({ HomeScreen, ProfileScreen, ... })
 */
export function wrapScreensWithErrorBoundary<T extends Record<string, React.ComponentType<any>>>(
  screens: T
): T {
  const wrappedScreens: any = {};
  
  for (const [screenName, Screen] of Object.entries(screens)) {
    wrappedScreens[screenName] = withErrorBoundary(Screen, screenName);
}
  
  return wrappedScreens as T;
}