import { FlavorPath, SelectedSensoryExpression } from '../../types/tasting';
import { ITastingRecord } from './schemas';

export interface TastingData {
  coffeeInfo: {
    cafeName?: string;
    roastery: string;
    coffeeName: string;
    origin?: string;
    variety?: string;
    altitude?: string;
    process?: string;
    temperature?: 'hot' | 'cold';
  };
  roasterNotes?: string;
  selectedFlavors?: FlavorPath[];
  selectedSensoryExpressions?: SelectedSensoryExpression[];
  sensoryAttributes?: {
    body?: number;
    acidity?: number;
    sweetness?: number;
    finish?: number;
    bitterness?: number;
    balance?: number;
    mouthfeel?: string;
  };
  personalComment?: string;
  matchScore?: {
    total?: number;
    flavorScore?: number;
    sensoryScore?: number;
  };
  mode?: 'cafe' | 'home_cafe';
  homeCafeData?: any;
}

export interface TastingFilter {
  isDeleted?: boolean;
  isSynced?: boolean;
  cafeName?: string;
  roastery?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface CoffeeSearchResult {
  id: string;
  coffeeName: string;
  roastery: string;
  origin?: string;
  lastTasted: Date;
  tastingCount: number;
}

export interface SameCoffeeComparison {
  totalCount: number;
  averageScore: number;
  scoreDistribution: { score: number; count: number }[];
  recentTastings: ITastingRecord[];
}

export interface SimilarCoffee {
  coffeeName: string;
  roastery: string;
  origin?: string;
  averageScore: number;
  tastingCount: number;
  similarity: number;
}

export interface CoffeeJourneyStats {
  firstTastingDate: Date | null;
  journeyDays: number;
  tastingsPerWeek: number;
  favoriteRoastery: string | null;
  favoriteCafe: string | null;
}

export interface TastingStatistics {
  totalTastings: number;
  averageScore: number;
  scoreDistribution: { range: string; count: number }[];
  monthlyTrend: { month: string; count: number; avgScore: number }[];
  preferredOrigins: { origin: string; count: number; percentage: number }[];
  preferredProcesses: { process: string; count: number; percentage: number }[];
}

export interface Last30DaysStats {
  totalTastings: number;
  topOrigin: string | null;
  topFlavors: string[];
}

export interface AchievementProgress {
  totalPoints: number;
  unlockedCount: number;
  nextMilestone: number;
}

export interface Statistics {
  totalTastings: number;
  uniqueRoasteries: number;
  uniqueCafes: number;
  averageScore: number;
}

export interface FlavorProfile {
  flavor: string;
  count: number;
  percentage: number;
}