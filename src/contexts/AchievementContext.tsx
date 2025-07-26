import React, { createContext, useContext, useState, useCallback } from 'react';
import { Achievement } from '../types/achievements';
import { AchievementNotification } from '../components/achievements/AchievementNotification';

interface AchievementContextType {
  showAchievementNotification: (
    achievement: Achievement,
    celebrationType?: 'subtle' | 'normal' | 'epic'
  ) => void;
  showMultipleAchievements: (achievements: Achievement[]) => void;
  isNotificationVisible: boolean;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const useAchievementNotification = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievementNotification must be used within an AchievementProvider');
}
  return context;
};

interface AchievementProviderProps {
  children: React.ReactNode;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({ children }) => {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [celebrationType, setCelebrationType] = useState<'subtle' | 'normal' | 'epic'>('normal');
  const [isVisible, setIsVisible] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  const getCelebrationType = (achievement: Achievement): 'subtle' | 'normal' | 'epic' => {
    switch (achievement.rarity) {
      case 'legendary':
        return 'epic';
      case 'epic':
        return 'epic';
      case 'rare':
        return 'normal';
      case 'common':
      default:
        return 'subtle';
  }
};

  const showNextAchievement = useCallback(() => {
    if (achievementQueue.length > 0 && !isVisible) {
      const nextAchievement = achievementQueue[0];
      const nextCelebrationType = getCelebrationType(nextAchievement);
      
      setCurrentAchievement(nextAchievement);
      setCelebrationType(nextCelebrationType);
      setIsVisible(true);
      
      // Remove from queue
      setAchievementQueue(prev => prev.slice(1));
  }
}, [achievementQueue, isVisible]);

  const showAchievementNotification = useCallback(
    (achievement: Achievement, customCelebrationType?: 'subtle' | 'normal' | 'epic') => {
      const celebType = customCelebrationType || getCelebrationType(achievement);
      
      if (isVisible) {
        // Add to queue if notification is already showing
        setAchievementQueue(prev => [...prev, achievement]);
    } else {
        setCurrentAchievement(achievement);
        setCelebrationType(celebType);
        setIsVisible(true);
    }
  },
    [isVisible]
  );

  const showMultipleAchievements = useCallback((achievements: Achievement[]) => {
    if (achievements.length === 0) return;
    
    if (achievements.length === 1) {
      showAchievementNotification(achievements[0]);
      return;
  }
    
    // Show first achievement immediately
    const [first, ...rest] = achievements;
    showAchievementNotification(first);
    
    // Add rest to queue
    setAchievementQueue(prev => [...prev, ...rest]);
}, [showAchievementNotification]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setCurrentAchievement(null);
    
    // Show next achievement in queue after a short delay
    setTimeout(() => {
      showNextAchievement();
  }, 500);
}, [showNextAchievement]);

  const handleReplay = useCallback(() => {
    if (currentAchievement) {
      // Hide and show again for replay effect
      setIsVisible(false);
      setTimeout(() => {
        setIsVisible(true);
    }, 300);
  }
}, [currentAchievement]);

  const contextValue: AchievementContextType = {
    showAchievementNotification,
    showMultipleAchievements,
    isNotificationVisible: isVisible,
};

  return (
    <AchievementContext.Provider value={contextValue}>
      {children}
      
      <AchievementNotification
        visible={isVisible}
        achievement={currentAchievement}
        celebrationType={celebrationType}
        onDismiss={handleDismiss}
        onReplay={handleReplay}
      />
    </AchievementContext.Provider>
  );
};