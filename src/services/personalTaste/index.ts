// =============================================
// Personal Taste Discovery Services
// =============================================

export { PersonalTasteAnalysisService } from '../PersonalTasteAnalysisService';
export { FlavorLearningEngine } from '../FlavorLearningEngine';
export { AchievementSystem } from '../AchievementSystem';
export { LiteAICoachService } from '../LiteAICoachService';

// Re-export types
export * from '@/types/personalTaste';

// Service initialization helper
import Realm from 'realm';
import { PersonalTasteAnalysisService } from '../PersonalTasteAnalysisService';
import { FlavorLearningEngine } from '../FlavorLearningEngine';
import { AchievementSystem } from '../AchievementSystem';

export interface PersonalTasteServices {
  analysisService: PersonalTasteAnalysisService;
  learningEngine: FlavorLearningEngine;
  achievementSystem: AchievementSystem;
}

export const initializePersonalTasteServices = (realm: Realm): PersonalTasteServices => {
  const analysisService = new PersonalTasteAnalysisService(realm);
  const learningEngine = new FlavorLearningEngine(realm);
  const achievementSystem = new AchievementSystem(realm);

  // Initialize achievement definitions
  achievementSystem.initializeAchievements().catch(error => {
    console.error('Error initializing achievements:', error);
  });

  return {
    analysisService,
    learningEngine,
    achievementSystem,
  };
};