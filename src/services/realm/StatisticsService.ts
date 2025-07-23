import { BaseRealmService } from './BaseRealmService';
import { ITastingRecord, IFlavorNote } from './schemas';
import { RealmLogger } from '../../utils/logger';

export class StatisticsService {
  private static instance: StatisticsService;
  private baseService: BaseRealmService;

  private constructor() {
    this.baseService = BaseRealmService.getInstance();
  }

  static getInstance(): StatisticsService {
    if (!StatisticsService.instance) {
      StatisticsService.instance = new StatisticsService();
    }
    return StatisticsService.instance;
  }

  async initialize(): Promise<void> {
    if (!this.baseService.isInitialized) {
      await this.baseService.initialize();
    }
  }

  getStatistics(): {
    totalTastings: number;
    uniqueRoasteries: number;
    uniqueCafes: number;
    averageScore: number;
  } {
    const realm = this.baseService.getRealm();
    
    const tastings = realm.objects<ITastingRecord>('TastingRecord')
      .filtered('isDeleted = false');
    
    const roasteries = new Set<string>();
    const cafes = new Set<string>();
    let totalScore = 0;
    
    tastings.forEach(tasting => {
      roasteries.add(tasting.roastery);
      if (tasting.cafeName) {
        cafes.add(tasting.cafeName);
      }
      totalScore += tasting.matchScoreTotal || 0;
    });
    
    return {
      totalTastings: tastings.length,
      uniqueRoasteries: roasteries.size,
      uniqueCafes: cafes.size,
      averageScore: tastings.length > 0 ? totalScore / tastings.length : 0,
    };
  }

  getFlavorProfile(): { flavor: string; count: number; percentage: number }[] {
    const realm = this.baseService.getRealm();
    
    const allFlavorNotes = realm.objects<IFlavorNote>('FlavorNote');
    const flavorCounts = new Map<string, number>();
    
    allFlavorNotes.forEach(note => {
      if (note.value) {
        flavorCounts.set(note.value, (flavorCounts.get(note.value) || 0) + 1);
      }
    });
    
    const totalNotes = allFlavorNotes.length;
    const flavorProfile = Array.from(flavorCounts.entries())
      .map(([flavor, count]) => ({
        flavor,
        count,
        percentage: totalNotes > 0 ? (count / totalNotes) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
    
    return flavorProfile;
  }

  getTastingStatistics(): {
    totalTastings: number;
    averageScore: number;
    scoreDistribution: { range: string; count: number }[];
    monthlyTrend: { month: string; count: number; avgScore: number }[];
    preferredOrigins: { origin: string; count: number; percentage: number }[];
    preferredProcesses: { process: string; count: number; percentage: number }[];
  } {
    const realm = this.baseService.getRealm();
    
    const tastings = realm.objects<ITastingRecord>('TastingRecord')
      .filtered('isDeleted = false')
      .sorted('createdAt', true);
    
    // Basic stats
    let totalScore = 0;
    const scoreRanges = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '0-59': 0,
    };
    
    // Monthly data
    const monthlyData = new Map<string, { count: number; totalScore: number }>();
    
    // Origin and process counts
    const originCounts = new Map<string, number>();
    const processCounts = new Map<string, number>();
    
    tastings.forEach(tasting => {
      const score = tasting.matchScoreTotal || 0;
      totalScore += score;
      
      // Score distribution
      if (score >= 90) scoreRanges['90-100']++;
      else if (score >= 80) scoreRanges['80-89']++;
      else if (score >= 70) scoreRanges['70-79']++;
      else if (score >= 60) scoreRanges['60-69']++;
      else scoreRanges['0-59']++;
      
      // Monthly trend
      const monthKey = tasting.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const monthData = monthlyData.get(monthKey) || { count: 0, totalScore: 0 };
      monthData.count++;
      monthData.totalScore += score;
      monthlyData.set(monthKey, monthData);
      
      // Origins
      if (tasting.origin) {
        originCounts.set(tasting.origin, (originCounts.get(tasting.origin) || 0) + 1);
      }
      
      // Processes
      if (tasting.process) {
        processCounts.set(tasting.process, (processCounts.get(tasting.process) || 0) + 1);
      }
    });
    
    const totalTastings = tastings.length;
    const averageScore = totalTastings > 0 ? totalScore / totalTastings : 0;
    
    // Convert maps to arrays
    const scoreDistribution = Object.entries(scoreRanges).map(([range, count]) => ({
      range,
      count,
    }));
    
    const monthlyTrend = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        count: data.count,
        avgScore: data.totalScore / data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
    
    const preferredOrigins = Array.from(originCounts.entries())
      .map(([origin, count]) => ({
        origin,
        count,
        percentage: (count / totalTastings) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const preferredProcesses = Array.from(processCounts.entries())
      .map(([process, count]) => ({
        process,
        count,
        percentage: (count / totalTastings) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalTastings,
      averageScore,
      scoreDistribution,
      monthlyTrend,
      preferredOrigins,
      preferredProcesses,
    };
  }

  getLast30DaysStats(): {
    totalTastings: number;
    topOrigin: string | null;
    topFlavors: string[];
  } {
    const realm = this.baseService.getRealm();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTastings = realm.objects<ITastingRecord>('TastingRecord')
      .filtered('isDeleted = false AND createdAt >= $0', thirtyDaysAgo);
    
    // Count origins
    const originCounts = new Map<string, number>();
    const flavorCounts = new Map<string, number>();
    
    recentTastings.forEach(tasting => {
      if (tasting.origin) {
        originCounts.set(tasting.origin, (originCounts.get(tasting.origin) || 0) + 1);
      }
      
      // Count flavors from flavor notes
      if (tasting.flavorNotes) {
        tasting.flavorNotes.forEach((note: IFlavorNote) => {
          if (note.value) {
            flavorCounts.set(note.value, (flavorCounts.get(note.value) || 0) + 1);
          }
        });
      }
    });
    
    // Get top origin
    let topOrigin: string | null = null;
    let maxOriginCount = 0;
    originCounts.forEach((count, origin) => {
      if (count > maxOriginCount) {
        maxOriginCount = count;
        topOrigin = origin;
      }
    });
    
    // Get top 3 flavors
    const topFlavors = Array.from(flavorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([flavor]) => flavor);
    
    return {
      totalTastings: recentTastings.length,
      topOrigin,
      topFlavors,
    };
  }

  getAchievementProgress(): {
    totalPoints: number;
    unlockedCount: number;
    nextMilestone: number;
  } {
    // This is a placeholder - the actual implementation should integrate with AchievementSystem
    const realm = this.baseService.getRealm();
    const tastings = realm.objects<ITastingRecord>('TastingRecord')
      .filtered('isDeleted = false');
    
    // Simple calculation based on number of tastings
    const totalPoints = tastings.length * 10; // 10 points per tasting
    const unlockedCount = Math.floor(totalPoints / 100); // 1 achievement per 100 points
    const nextMilestone = ((Math.floor(totalPoints / 100) + 1) * 100);
    
    return {
      totalPoints,
      unlockedCount,
      nextMilestone,
    };
  }

  getCoffeeJourneyStats(): {
    firstTastingDate: Date | null;
    journeyDays: number;
    tastingsPerWeek: number;
    favoriteRoastery: string | null;
    favoriteCafe: string | null;
  } {
    const realm = this.baseService.getRealm();
    const tastings = realm.objects<ITastingRecord>('TastingRecord')
      .filtered('isDeleted = false')
      .sorted('createdAt', false); // Oldest first
    
    if (tastings.length === 0) {
      return {
        firstTastingDate: null,
        journeyDays: 0,
        tastingsPerWeek: 0,
        favoriteRoastery: null,
        favoriteCafe: null,
      };
    }
    
    const firstTasting = tastings[0];
    const firstTastingDate = firstTasting.createdAt;
    const now = new Date();
    const journeyDays = Math.floor((now.getTime() - firstTastingDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.max(1, journeyDays / 7);
    const tastingsPerWeek = tastings.length / weeks;
    
    // Find favorite roastery
    const roasteryCounts = new Map<string, number>();
    const cafeCounts = new Map<string, number>();
    
    tastings.forEach(tasting => {
      roasteryCounts.set(tasting.roastery, (roasteryCounts.get(tasting.roastery) || 0) + 1);
      if (tasting.cafeName) {
        cafeCounts.set(tasting.cafeName, (cafeCounts.get(tasting.cafeName) || 0) + 1);
      }
    });
    
    let favoriteRoastery: string | null = null;
    let maxRoasteryCount = 0;
    roasteryCounts.forEach((count, roastery) => {
      if (count > maxRoasteryCount) {
        maxRoasteryCount = count;
        favoriteRoastery = roastery;
      }
    });
    
    let favoriteCafe: string | null = null;
    let maxCafeCount = 0;
    cafeCounts.forEach((count, cafe) => {
      if (count > maxCafeCount) {
        maxCafeCount = count;
        favoriteCafe = cafe;
      }
    });
    
    return {
      firstTastingDate,
      journeyDays,
      tastingsPerWeek,
      favoriteRoastery,
      favoriteCafe,
    };
  }
}

export default StatisticsService.getInstance();