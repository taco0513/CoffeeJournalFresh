import { 
  GrowthMilestone,
  MasteryLevel,
  PersonalStatsData,
  ProgressData,
  TasteProfileType,
  CoachInsight,
  TastingData,
  CoffeeInfo,
  CoachFeedback
} from '@/types/personalTaste';

// TasteProfileCard Props
export interface TasteProfileCardProps {
  level: number;
  progress: ProgressData;
  tasteType: TasteProfileType;
  onLevelTap?: () => void;
  style?: any;
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
  style?: any;
}

// GrowthTimeline Props
export interface GrowthTimelineProps {
  milestones: GrowthMilestone[];
  currentWeek: number;
  onMilestoneTap?: (milestone: GrowthMilestone) => void;
  style?: any;
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
  style?: any;
}

// PersonalStatsGrid Props
export interface PersonalStatsGridProps {
  stats: PersonalStatsData;
  onStatTap?: (statKey: keyof PersonalStatsData) => void;
  style?: any;
}

// CoachTipCard Props
export interface CoachTipCardProps {
  tip: string;
  type?: 'info' | 'warning' | 'success';
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissTimeout?: number;
  style?: any;
}

// CoachInsightBanner Props
export interface CoachInsightBannerProps {
  insight: CoachInsight;
  onActionPress?: () => void;
  onDismiss?: () => void;
  style?: any;
}

// CoachFeedbackModal Props
export interface CoachFeedbackModalProps {
  visible: boolean;
  feedback: CoachFeedback | null;
  tastingData: TastingData;
  coffeeInfo: CoffeeInfo;
  onClose: () => void;
  onActionPress?: (action: string) => void;
}