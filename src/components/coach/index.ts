// =============================================
// Coach UI Components
// =============================================

export { CoachTipCard } from './CoachTipCard';
export { CoachInsightBanner } from './CoachInsightBanner';
export { CoachFeedbackModal } from './CoachFeedbackModal';

// Re-export types for convenience
export type {
  CoachTip,
  CoachFeedback,
  TastingGuidance,
  DailyInsight,
  LearningPath,
} from '@/services/LiteAICoachService';