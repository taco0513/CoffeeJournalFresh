// Personal Taste Components
export { TasteProfileCard } from './TasteProfileCard';
export { FlavorRadarChart } from './FlavorRadarChart';
export { GrowthTimeline } from './GrowthTimeline';
export { FlavorMasteryMap } from './FlavorMasteryMap';
export { PersonalStatsGrid } from './PersonalStatsGrid';

// AI Coach Components (re-export from coach directory)
export { CoachTipCard } from '../coach/CoachTipCard';
export { CoachInsightBanner } from '../coach/CoachInsightBanner';
export { CoachFeedbackModal } from '../coach/CoachFeedbackModal';

// Export types if needed
export type {
  TasteProfileCardProps,
  FlavorRadarChartProps,
  GrowthTimelineProps,
  FlavorMasteryMapProps,
  PersonalStatsGridProps,
  CoachTipCardProps,
  CoachInsightBannerProps,
  CoachFeedbackModalProps,
} from './types';