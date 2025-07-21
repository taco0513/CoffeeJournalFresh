// =============================================
// Personal Taste Discovery Services
// =============================================

// export { PersonalTasteAnalysisService } from '../PersonalTasteAnalysisService'; // Moved to backlog
// export { FlavorLearningEngine } from '../FlavorLearningEngine'; // Moved to backlog
export { AchievementSystem } from '../AchievementSystem';
// export { LiteAICoachService } from '../LiteAICoachService'; // Moved to future roadmap

// Re-export types
export * from '@/types/personalTaste';

// Service initialization helper
import Realm from 'realm';
// import { PersonalTasteAnalysisService } from '../PersonalTasteAnalysisService'; // Moved to backlog
// import { FlavorLearningEngine } from '../FlavorLearningEngine'; // Moved to backlog
import { AchievementSystem } from '../AchievementSystem';

export interface PersonalTasteServices {
  // analysisService: PersonalTasteAnalysisService; // Moved to backlog
  // learningEngine: FlavorLearningEngine; // Moved to backlog
  achievementSystem: AchievementSystem;
}

export const initializePersonalTasteServices = (realm: Realm): PersonalTasteServices => {
  // const analysisService = new PersonalTasteAnalysisService(realm); // Moved to backlog
  // const learningEngine = new FlavorLearningEngine(realm); // Moved to backlog
  const achievementSystem = new AchievementSystem(realm);

  // Initialize achievement definitions
  achievementSystem.initializeAchievements().catch(error => {
    console.error('Error initializing achievements:', error);
  });

  return {
    // analysisService, // Moved to backlog
    // learningEngine, // Moved to backlog
    achievementSystem,
  };
};