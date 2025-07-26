// EnhancedHomeCafeTimerModal.tsx
// Timer modal component for EnhancedHomeCafeScreen

import React from 'react';
import { AnimatePresence } from 'tamagui';
import { HomeCafeData } from '../../../types/tasting';
import InteractiveBrewTimer from '../InteractiveBrewTimer';
import { TimerModal } from './EnhancedHomeCafeStyledComponents';

interface EnhancedHomeCafeTimerModalProps {
  showTimer: boolean;
  recipe: HomeCafeData['recipe'];
  onComplete: (actualBrewTime: number) => void;
  onClose: () => void;
}

export const EnhancedHomeCafeTimerModal: React.FC<EnhancedHomeCafeTimerModalProps> = ({
  showTimer,
  recipe,
  onComplete,
  onClose,
}) => {
  if (!showTimer) {
    return null;
}

  return (
    <AnimatePresence>
      <TimerModal>
        {/* @ts-ignore - Component prop mismatch */}
        <InteractiveBrewTimer
          recipe={recipe}
          onComplete={onComplete}
          showModal={true}
          onClose={onClose}
        />
      </TimerModal>
    </AnimatePresence>
  );
};