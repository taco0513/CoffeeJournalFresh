import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import RNShake from 'react-native-shake';
import { useFeedbackStore } from '../stores/useFeedbackStore';
import { useUserStore } from '../stores/useUserStore';
import { FeedbackService } from '../services/FeedbackService';

export function useShakeToFeedback() {
  const { showFeedback, enableShakeToFeedback, setBetaStatus } = useFeedbackStore();
  const { currentUser } = useUserStore();
  const isHandlingShake = useRef(false);

  useEffect(() => {
    if (!enableShakeToFeedback || !currentUser?.id) return;

    // Check if user is beta tester
    FeedbackService.checkBetaStatus(currentUser.id).then(setBetaStatus);

    // Subscribe to shake event
    const subscription = RNShake.addListener(() => {
      // Prevent multiple triggers
      if (isHandlingShake.current) return;
      
      isHandlingShake.current = true;
      showFeedback();
      
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
  }, [enableShakeToFeedback, currentUser?.id, showFeedback, setBetaStatus]);
}

// Hook to initialize shake detection when app starts
export function initializeShakeDetection() {
  // This is called once in the app's entry point
  if (Platform.OS === 'android') {
    // Android requires explicit start
    RNShake.startListening();
  }
}