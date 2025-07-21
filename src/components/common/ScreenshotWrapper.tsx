import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { ScreenshotService } from '../../services/ScreenshotService';

interface ScreenshotWrapperProps {
  children: React.ReactNode;
  screenName?: string;
  style?: any;
}

export interface ScreenshotWrapperRef {
  captureScreen: () => Promise<string | null>;
  captureMultiple: (count?: number) => Promise<string[]>;
}

export const ScreenshotWrapper = forwardRef<ScreenshotWrapperRef, ScreenshotWrapperProps>(
  ({ children, screenName = 'screen', style }, ref) => {
    const viewShotRef = useRef<ViewShot | null>(null);

    useImperativeHandle(ref, () => ({
      captureScreen: async () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${screenName}-${timestamp}.png`;
        const path = await ScreenshotService.captureScreen(viewShotRef, filename);
        
        if (path) {
          ScreenshotService.showSaveSuccess(path);
        }
        
        return path;
      },
      captureMultiple: async (count = 5) => {
        const paths = await ScreenshotService.captureMultiple(
          viewShotRef, 
          count, 
          1000, 
          screenName
        );
        
        if (paths.length > 0) {
          ScreenshotService.showMultipleSaveSuccess(paths);
        }
        
        return paths;
      }
    }));

    return (
      <ViewShot
        ref={viewShotRef}
        options={{
          fileName: `${screenName}-screenshot`,
          format: 'png',
          quality: 0.9,
        }}
        style={[styles.container, style]}
      >
        {children}
      </ViewShot>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

ScreenshotWrapper.displayName = 'ScreenshotWrapper';