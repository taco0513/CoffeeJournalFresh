import React, { useEffect } from 'react';
import { View } from 'react-native';
import { FeedbackModal } from './FeedbackModal';
import { FloatingFeedbackButton } from './FloatingFeedbackButton';
import { useShakeToFeedback } from '../../hooks/useShakeToFeedback';
import { useFeedbackStore } from '../../stores/useFeedbackStore';
import { useUserStore } from '../../stores/useUserStore';
import { FeedbackService } from '../../services/FeedbackService';

interface FeedbackProviderProps {
  children: React.ReactNode;
}

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({ children }) => {
  const { currentUser } = useUserStore();
  const { isBetaUser, setBetaStatus } = useFeedbackStore();

  // Initialize shake detection
  useShakeToFeedback();

  // Check beta status on mount and user change
  useEffect(() => {
    if (currentUser?.id) {
      FeedbackService.checkBetaStatus(currentUser.id).then(setBetaStatus);
  }
}, [currentUser?.id, setBetaStatus]);

  // Sync queued feedback on mount
  useEffect(() => {
    FeedbackService.syncQueuedFeedback();
}, []);

  return (
    <>
      {children}
      
      {/* Feedback UI Components */}
      <FeedbackModal />
      <FloatingFeedbackButton visible={isBetaUser} />
    </>
  );
};

export default FeedbackProvider;