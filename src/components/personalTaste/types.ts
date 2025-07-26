import { 
  GrowthMilestone,
  MasteryLevel,
  PersonalStatsData,
  ProgressData,
  TasteProfileType,
  // CoachInsight, // Moved to Future Roadmap
  // TastingData, // Moved to Future Roadmap
  // CoffeeInfo, // Moved to Future Roadmap
  // CoachFeedback // Moved to Future Roadmap
} from '@/types/personalTaste';

// TasteProfileCard Props
export interface TasteProfileCardProps {
  level: number;
  progress: ProgressData;
  tasteType: TasteProfileType;
  onLevelTap?: () => void;
  style?: StyleProp<ViewStyle>;
}

// FlavorRadarChart Props
export interface FlavorRadarChartProps {
  preferences: {
    fruity: number;
    floral: number;
    sweet: number;
    nutty: number;
    chocolate: number;
    spices: number;
};
  interactive?: boolean;
  showComparison?: boolean;
  comparisonData?: {
    fruity: number;
    floral: number;
    sweet: number;
    nutty: number;
    chocolate: number;
    spices: number;
};
  onFlavorTap?: (flavor: string) => void;
  style?: StyleProp<ViewStyle>;
}

// GrowthTimeline Props
export interface GrowthTimelineProps {
  milestones: GrowthMilestone[];
  currentWeek: number;
  onMilestoneTap?: (milestone: GrowthMilestone) => void;
  style?: StyleProp<ViewStyle>;
}

// FlavorMasteryMap Props
export interface FlavorCategory {
  id: string;
  name: string;
  color: string;
  emoji?: string;
}

export interface FlavorMasteryMapProps {
  categories: FlavorCategory[];
  masteryLevels: MasteryLevel[];
  layout?: 'grid' | 'wheel' | 'tree';
  onCategorySelect?: (category: string) => void;
  style?: StyleProp<ViewStyle>;
}

// PersonalStatsGrid Props
export interface PersonalStatsGridProps {
  stats: PersonalStatsData;
  onStatTap?: (statKey: keyof PersonalStatsData) => void;
  style?: StyleProp<ViewStyle>;
}

// Coach Components - Moved to Future Roadmap
// export interface CoachTipCardProps {
//   tip: string;
//   type?: 'info' | 'warning' | 'success';
//   onDismiss?: () => void;
//   autoDismiss?: boolean;
//   dismissTimeout?: number;
//   style?: StyleProp<ViewStyle>;
// }

// export interface CoachInsightBannerProps {
//   insight: CoachInsight;
//   onActionPress?: () => void;
//   onDismiss?: () => void;
//   style?: StyleProp<ViewStyle>;
// }

// export interface CoachFeedbackModalProps {
//   visible: boolean;
//   feedback: CoachFeedback | null;
//   tastingData: TastingData;
//   coffeeInfo: CoffeeInfo;
//   onClose: () => void;
//   onActionPress?: (action: string) => void;
// }