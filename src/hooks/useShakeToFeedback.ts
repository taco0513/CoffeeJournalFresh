import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import RNShake from 'react-native-shake';
import { useFeedbackStore } from '../stores/useFeedbackStore';
import { useUserStore } from '../stores/useUserStore';
import { FeedbackService } from '../services/FeedbackService';
import ScreenContextService from '../services/ScreenContextService';

export function useShakeToFeedback() {
  const { showSmartFeedback, enableShakeToFeedback, setBetaStatus, setScreenContext, setScreenshot } = useFeedbackStore();
  const { currentUser } = useUserStore();
  const isHandlingShake = useRef(false);

  useEffect(() => {
    if (!enableShakeToFeedback || !currentUser?.id) return;

    // Check if user is beta tester
    FeedbackService.checkBetaStatus(currentUser.id).then(setBetaStatus);

    // Subscribe to shake event
    const subscription = RNShake.addListener(async () => {
      // Prevent multiple triggers
      if (isHandlingShake.current) return;
      
      isHandlingShake.current = true;
      
      try {
        // Capture screen context
        const screenContext = await ScreenContextService.getCurrentContext();
        if (screenContext) {
          setScreenContext(screenContext);
        }

        // Auto-capture screenshot
        await captureScreenOnShake();
      } catch (error) {
        console.error('Error capturing context on shake:', error);
      }
      
      // Use smart feedback instead of regular feedback
      showSmartFeedback();
      
      // Reset flag after a delay
      setTimeout(() => {
        isHandlingShake.current = false;
      }, 1000);
    });

    // Cleanup
    return () => {
      if (Platform.OS === 'ios') {
        subscription?.remove();
      } else {
        RNShake.removeAllListeners();
      }
    };
  }, [enableShakeToFeedback, currentUser?.id, showSmartFeedback, setBetaStatus, setScreenContext, setScreenshot]);

  const captureScreenOnShake = async () => {
    try {
      // Import ViewShot dynamically
      const ViewShot = require('react-native-view-shot');
      
      // Capture the entire screen
      const uri = await ViewShot.captureScreen({
        format: 'jpg',
        quality: 0.8,
        result: 'tmpfile',
      });
      
      if (uri) {
        setScreenshot(uri);
        console.log('Screen captured on shake:', uri);
      }
    } catch (error) {
      console.log('Auto screenshot on shake failed:', error);
      // Don't show error to user
    }
  };
}

// Hook to initialize shake detection when app starts
export function initializeShakeDetection() {
  // This is called once in the app's entry point
  // react-native-shake automatically starts listening when listeners are added
  // No explicit startListening method needed
}