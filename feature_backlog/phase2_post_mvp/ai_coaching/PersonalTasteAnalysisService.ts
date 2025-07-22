import Realm from 'realm';
import { supabase } from './supabase/client';
import { generateUUID } from '@/utils/uuid';

// =============================================
// Types and Interfaces
// =============================================

export interface TastePattern {
  userId: string;
  dominantFlavors: FlavorPreference[];
  tasteProfile: TasteProfileType;
  growthTrend: GrowthMetrics;
  recommendations: string[];
  lastUpdated: Date;
}

export interface FlavorPreference {
  category: string;
  subcategory?: string;
  preference: number; // 0-1 scale
  frequency: number; // How often selected
  consistency: number; // How consistent the ratings
}

export type TasteProfileType = 
  | 'Fruity Explorer'
  | 'Chocolate Lover'
  | 'Floral Enthusiast'
  | 'Nutty Adventurer'
  | 'Balanced Seeker'
  | 'Bold Pioneer'
  | 'Sweet Tooth'
  | 'Acid Lover'
  | 'Complex Connoisseur';

export interface GrowthMetrics {
  vocabularyGrowth: number; // Words per week
  accuracyImprovement: number; // % improvement
  flavorDiversityIndex: number; // 0-1 scale
  consistencyScore: number; // 0-1 scale
  weeklyProgress: number; // % of goals met
}

export interface CoffeeRecommendation {
  coffeeId?: string;
  roasterName: string;
  coffeeName: string;
  matchScore: number; // 0-100
  reason: string;
  flavorNotes: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface PersonalInsights {
  strengths: string[];
  areasToExplore: string[];
  recentDiscoveries: string[];
  tastingTips: string[];
}

// =============================================
// Personal Taste Analysis Service
// =============================================

export class PersonalTasteAnalysisService {
  private realm: Realm | null = null;

  constructor(realm?: Realm) {
    if (realm) {
      this.realm = realm;
    }
  }

  setRealm(realm: Realm) {
    this.realm = realm;
  }

  /**
   * Analyze personal taste pattern based on tasting history
   */
  async analyzePersonalTastePattern(userId: string): Promise<TastePattern> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      // Get user's tasting records
      const tastingRecords = this.realm
        .objects('TastingRecord')
        .filtered('userId = $0', userId)
        .sorted('createdAt', true);

      // Get or create user taste profile
      let tasteProfile = this.realm
        .objects('UserTasteProfile')
        .filtered('userId = $0', userId)[0];

      if (!tasteProfile) {
        // Create new profile
        this.realm.write(() => {
          tasteProfile = this.realm!.create('UserTasteProfile', {
            id: generateUUID(),
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });
      }

      // Analyze flavor preferences
      const flavorFrequency = this.calculateFlavorFrequency(tastingRecords);
      const dominantFlavors = this.identifyDominantFlavors(flavorFrequency);
      
      // Determine taste profile type
      const profileType = this.determineTasteProfile(dominantFlavors);
      
      // Calculate growth metrics
      const growthMetrics = this.calculateGrowthMetrics(tastingRecords, userId);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(dominantFlavors, profileType);

      // Update taste profile in database
      this.updateTasteProfile(userId, dominantFlavors, profileType, growthMetrics);

      return {
        userId,
        dominantFlavors,
        tasteProfile: profileType,
        growthTrend: growthMetrics,
        recommendations,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error analyzing taste pattern:', error);
      throw error;
    }
  }

  /**
   * Generate personalized coffee recommendations
   */
  async generatePersonalRecommendations(userId: string): Promise<CoffeeRecommendation[]> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      const tasteProfile = await this.analyzePersonalTastePattern(userId);
      const recommendations: CoffeeRecommendation[] = [];

      // Get user's tasting history to avoid duplicates
      const tastedCoffees = this.realm
        .objects('TastingRecord')
        .filtered('userId = $0', userId)
        .map(record => `${record.roasterName}-${record.coffeeName}`);

      // Recommendation strategy based on profile
      const strategies = this.getRecommendationStrategies(tasteProfile);

      for (const strategy of strategies) {
        const recommendation = this.createRecommendation(
          strategy,
          tasteProfile,
          tastedCoffees
        );
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }

      return recommendations.slice(0, 5); // Return top 5 recommendations
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Track taste growth over time
   */
  async trackTasteGrowth(userId: string): Promise<GrowthMetrics> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get recent tasting records
      const recentRecords = this.realm
        .objects('TastingRecord')
        .filtered('userId = $0 AND createdAt >= $1', userId, thirtyDaysAgo)
        .sorted('createdAt', true);

      const weeklyRecords = recentRecords.filtered(
        (record: any) => record.createdAt >= sevenDaysAgo
      );

      // Calculate vocabulary growth
      const vocabularyGrowth = this.calculateVocabularyGrowth(recentRecords);

      // Calculate accuracy improvement
      const accuracyImprovement = this.calculateAccuracyImprovement(recentRecords);

      // Calculate flavor diversity
      const flavorDiversityIndex = this.calculateFlavorDiversity(recentRecords);

      // Calculate consistency
      const consistencyScore = this.calculateConsistencyScore(recentRecords);

      // Calculate weekly progress
      const weeklyProgress = this.calculateWeeklyProgress(weeklyRecords, userId);

      const metrics: GrowthMetrics = {
        vocabularyGrowth,
        accuracyImprovement,
        flavorDiversityIndex,
        consistencyScore,
        weeklyProgress,
      };

      // Update daily stats
      await this.updateDailyStats(userId);

      return metrics;
    } catch (error) {
      console.error('Error tracking taste growth:', error);
      throw error;
    }
  }

  /**
   * Get personal insights and tips
   */
  async getPersonalInsights(userId: string): Promise<PersonalInsights> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      const tastePattern = await this.analyzePersonalTastePattern(userId);
      const growthMetrics = await this.trackTasteGrowth(userId);

      const insights: PersonalInsights = {
        strengths: this.identifyStrengths(tastePattern, growthMetrics),
        areasToExplore: this.identifyAreasToExplore(tastePattern),
        recentDiscoveries: this.getRecentDiscoveries(userId),
        tastingTips: this.generateTastingTips(tastePattern, growthMetrics),
      };

      return insights;
    } catch (error) {
      console.error('Error getting personal insights:', error);
      throw error;
    }
  }

  // =============================================
  // Private Helper Methods
  // =============================================

  private calculateFlavorFrequency(tastingRecords: any): Map<string, number> {
    const frequency = new Map<string, number>();

    tastingRecords.forEach((record: any) => {
      const flavorNotes = record.flavorNotes || [];
      flavorNotes.forEach((note: any) => {
        const key = note.level1;
        frequency.set(key, (frequency.get(key) || 0) + 1);
        
        if (note.level2) {
          const subKey = `${note.level1}-${note.level2}`;
          frequency.set(subKey, (frequency.get(subKey) || 0) + 1);
        }
      });
    });

    return frequency;
  }

  private identifyDominantFlavors(frequency: Map<string, number>): FlavorPreference[] {
    const total = Array.from(frequency.values()).reduce((a, b) => a + b, 0);
    const preferences: FlavorPreference[] = [];

    frequency.forEach((count, flavor) => {
      const parts = flavor.split('-');
      preferences.push({
        category: parts[0],
        subcategory: parts[1],
        preference: count / total,
        frequency: count,
        consistency: 0.8, // TODO: Calculate actual consistency
      });
    });

    return preferences
      .sort((a, b) => b.preference - a.preference)
      .slice(0, 10);
  }

  private determineTasteProfile(dominantFlavors: FlavorPreference[]): TasteProfileType {
    if (dominantFlavors.length === 0) return 'Balanced Seeker';

    const topCategory = dominantFlavors[0].category.toLowerCase();
    
    const profileMap: Record<string, TasteProfileType> = {
      'fruity': 'Fruity Explorer',
      'sweet': 'Sweet Tooth',
      'floral': 'Floral Enthusiast',
      'nutty': 'Nutty Adventurer',
      'chocolate': 'Chocolate Lover',
      'spices': 'Bold Pioneer',
      'sour': 'Acid Lover',
      'roasted': 'Bold Pioneer',
    };

    return profileMap[topCategory] || 'Complex Connoisseur';
  }

  private calculateGrowthMetrics(tastingRecords: any, userId: string): GrowthMetrics {
    // Simplified calculation - in production, implement more sophisticated algorithms
    return {
      vocabularyGrowth: 2.5, // words per week
      accuracyImprovement: 15, // % improvement
      flavorDiversityIndex: 0.65, // 0-1 scale
      consistencyScore: 0.78, // 0-1 scale
      weeklyProgress: 85, // % of goals met
    };
  }

  private updateTasteProfile(
    userId: string,
    dominantFlavors: FlavorPreference[],
    profileType: TasteProfileType,
    growthMetrics: GrowthMetrics
  ) {
    if (!this.realm) return;

    this.realm.write(() => {
      const profile = this.realm!
        .objects('UserTasteProfile')
        .filtered('userId = $0', userId)[0];

      if (profile) {
        // Convert flavor preferences to JSON
        const flavorPrefsMap: Record<string, number> = {};
        dominantFlavors.forEach(pref => {
          flavorPrefsMap[pref.category] = pref.preference;
        });

        profile.flavorPreferences = JSON.stringify(flavorPrefsMap);
        profile.vocabularyLevel = Math.min(
          10,
          Math.floor(growthMetrics.vocabularyGrowth)
        );
        profile.tasteDiscoveryRate = growthMetrics.flavorDiversityIndex * 100;
        profile.lastAnalysisAt = new Date();
        profile.updatedAt = new Date();
        profile.isSynced = false;
      }
    });
  }

  private generateRecommendations(
    dominantFlavors: FlavorPreference[],
    profileType: TasteProfileType
  ): string[] {
    const recommendations: string[] = [];

    // Based on profile type
    const profileRecommendations: Record<TasteProfileType, string[]> = {
      'Fruity Explorer': [
        'Try Ethiopian naturals for intense fruit notes',
        'Explore Kenyan coffees for blackcurrant flavors',
        'Colombian Geishas offer unique tropical fruit profiles',
      ],
      'Chocolate Lover': [
        'Brazilian pulped naturals for chocolate sweetness',
        'Colombian coffees often have cocoa notes',
        'Try Swiss Water Process decafs for pure chocolate flavors',
      ],
      'Floral Enthusiast': [
        'Ethiopian washed Yirgacheffes for jasmine notes',
        'Panama Geishas for intense floral aromatics',
        'Colombian Sidra variety for rose-like qualities',
      ],
      'Nutty Adventurer': [
        'Brazilian Santos for classic nutty profiles',
        'Colombian Castillo for almond sweetness',
        'Guatemalan coffees for hazelnut notes',
      ],
      'Balanced Seeker': [
        'Colombian Supremo for well-rounded cups',
        'Costa Rican honey process for balance',
        'Blend of origins for consistent balance',
      ],
      'Bold Pioneer': [
        'Sumatran wet-hulled for earthy boldness',
        'Robusta blends for extra intensity',
        'Dark roasted single origins',
      ],
      'Sweet Tooth': [
        'Honey process coffees for natural sweetness',
        'Yellow Bourbon variety for sugar-like sweetness',
        'Natural process for fruit sweetness',
      ],
      'Acid Lover': [
        'Kenyan SL28/SL34 for bright acidity',
        'Light roasted Ethiopians',
        'High altitude Colombian coffees',
      ],
      'Complex Connoisseur': [
        'Anaerobic fermentation coffees',
        'Experimental processing methods',
        'Rare varieties like Wush Wush or Sudan Rume',
      ],
    };

    recommendations.push(...(profileRecommendations[profileType] || []));

    // Add exploration recommendations
    const underexploredCategories = this.findUnderexploredCategories(dominantFlavors);
    if (underexploredCategories.length > 0) {
      recommendations.push(
        `Expand your palate by trying ${underexploredCategories[0]} flavors`
      );
    }

    return recommendations.slice(0, 5);
  }

  private findUnderexploredCategories(dominantFlavors: FlavorPreference[]): string[] {
    const allCategories = [
      'fruity', 'floral', 'sweet', 'nutty', 'chocolate', 
      'spices', 'roasted', 'vegetal', 'sour', 'other'
    ];
    
    const exploredCategories = new Set(
      dominantFlavors.map(f => f.category.toLowerCase())
    );
    
    return allCategories.filter(cat => !exploredCategories.has(cat));
  }

  private getRecommendationStrategies(tastePattern: TastePattern) {
    return [
      { type: 'similar', weight: 0.4 },
      { type: 'explore', weight: 0.3 },
      { type: 'challenge', weight: 0.2 },
      { type: 'trending', weight: 0.1 },
    ];
  }

  private createRecommendation(
    strategy: any,
    tastePattern: TastePattern,
    tastedCoffees: string[]
  ): CoffeeRecommendation | null {
    // Simplified recommendation logic
    // In production, this would query a coffee database
    
    const mockRecommendations: CoffeeRecommendation[] = [
      {
        roasterName: 'Blue Bottle',
        coffeeName: 'Ethiopia Yirgacheffe',
        matchScore: 92,
        reason: 'Based on your love for fruity flavors',
        flavorNotes: ['Blueberry', 'Lemon', 'Floral'],
        difficulty: 'intermediate',
      },
      {
        roasterName: 'Stumptown',
        coffeeName: 'Colombia El Jordan',
        matchScore: 88,
        reason: 'A balanced coffee to expand your palate',
        flavorNotes: ['Chocolate', 'Caramel', 'Orange'],
        difficulty: 'beginner',
      },
      {
        roasterName: 'Counter Culture',
        coffeeName: 'Kenya Gaturiri',
        matchScore: 85,
        reason: 'Challenge yourself with complex acidity',
        flavorNotes: ['Blackcurrant', 'Tomato', 'Wine'],
        difficulty: 'advanced',
      },
    ];

    // Filter out already tasted coffees
    const newRecommendations = mockRecommendations.filter(
      rec => !tastedCoffees.includes(`${rec.roasterName}-${rec.coffeeName}`)
    );

    return newRecommendations[0] || null;
  }

  private calculateVocabularyGrowth(records: any): number {
    // Calculate unique words used over time
    const uniqueWords = new Set<string>();
    
    records.forEach((record: any) => {
      if (record.vocabularyUsed) {
        record.vocabularyUsed.forEach((word: string) => {
          uniqueWords.add(word.toLowerCase());
        });
      }
    });

    // Simple growth rate calculation
    const weeks = records.length > 0 ? 
      (new Date().getTime() - records[records.length - 1].createdAt.getTime()) / 
      (7 * 24 * 60 * 60 * 1000) : 1;
    
    return uniqueWords.size / Math.max(weeks, 1);
  }

  private calculateAccuracyImprovement(records: any): number {
    if (records.length < 2) return 0;

    // Compare early vs recent accuracy
    const earlyRecords = records.slice(-Math.floor(records.length / 3));
    const recentRecords = records.slice(0, Math.floor(records.length / 3));

    const earlyAccuracy = earlyRecords.reduce((sum: number, r: any) => 
      sum + (r.tasteConfidence || 0.5), 0) / earlyRecords.length;
    
    const recentAccuracy = recentRecords.reduce((sum: number, r: any) => 
      sum + (r.tasteConfidence || 0.5), 0) / recentRecords.length;

    return ((recentAccuracy - earlyAccuracy) / earlyAccuracy) * 100;
  }

  private calculateFlavorDiversity(records: any): number {
    const uniqueFlavors = new Set<string>();
    let totalFlavors = 0;

    records.forEach((record: any) => {
      const flavorNotes = record.flavorNotes || [];
      flavorNotes.forEach((note: any) => {
        uniqueFlavors.add(note.level1);
        if (note.level2) uniqueFlavors.add(`${note.level1}-${note.level2}`);
        if (note.level3) uniqueFlavors.add(`${note.level1}-${note.level2}-${note.level3}`);
        totalFlavors++;
      });
    });

    // Shannon diversity index simplified
    return Math.min(uniqueFlavors.size / Math.max(totalFlavors, 1), 1);
  }

  private calculateConsistencyScore(records: any): number {
    // Check consistency in rating similar coffees
    // Simplified: check variance in sensory ratings
    
    if (records.length < 2) return 1;

    const sensoryRatings = records.map((r: any) => r.sensoryAttributes)
      .filter((s: any) => s);

    if (sensoryRatings.length < 2) return 1;

    // Calculate standard deviation of ratings
    const attributes = ['body', 'acidity', 'sweetness', 'finish'];
    let totalVariance = 0;

    attributes.forEach(attr => {
      const values = sensoryRatings.map((s: any) => s[attr] || 3);
      const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length;
      const variance = values.reduce((sum: number, val: number) => 
        sum + Math.pow(val - mean, 2), 0) / values.length;
      totalVariance += variance;
    });

    // Convert variance to consistency score (lower variance = higher consistency)
    const avgVariance = totalVariance / attributes.length;
    return Math.max(0, 1 - (avgVariance / 4)); // Normalize to 0-1
  }

  private calculateWeeklyProgress(weeklyRecords: any, userId: string): number {
    // Define weekly goals
    const weeklyGoals = {
      tastings: 5,
      newFlavors: 3,
      quizzes: 2,
    };

    const actualTastings = weeklyRecords.length;
    const newFlavors = new Set(
      weeklyRecords.flatMap((r: any) => 
        (r.flavorNotes || []).map((n: any) => n.level1)
      )
    ).size;

    // Calculate progress percentage
    const tastingProgress = (actualTastings / weeklyGoals.tastings) * 100;
    const flavorProgress = (newFlavors / weeklyGoals.newFlavors) * 100;

    return Math.min(100, (tastingProgress + flavorProgress) / 2);
  }

  private async updateDailyStats(userId: string): Promise<void> {
    if (!this.realm) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRecords = this.realm
      .objects('TastingRecord')
      .filtered('userId = $0 AND createdAt >= $1', userId, today);

    const vocabularyUsed = new Set<string>();
    const newFlavors = new Set<string>();

    todayRecords.forEach((record: any) => {
      if (record.vocabularyUsed) {
        record.vocabularyUsed.forEach((word: string) => vocabularyUsed.add(word));
      }
      
      const flavorNotes = record.flavorNotes || [];
      flavorNotes.forEach((note: any) => {
        newFlavors.add(note.level1);
      });
    });

    this.realm.write(() => {
      let dailyStat = this.realm!
        .objects('DailyTasteStat')
        .filtered('userId = $0 AND statDate = $1', userId, today)[0];

      if (!dailyStat) {
        dailyStat = this.realm!.create('DailyTasteStat', {
          id: generateUUID(),
          userId,
          statDate: today,
          createdAt: new Date(),
        });
      }

      dailyStat.tastingsCount = todayRecords.length;
      dailyStat.newFlavorsDiscovered = newFlavors.size;
      dailyStat.vocabularyWordsUsed = vocabularyUsed.size;
      dailyStat.tasteAccuracyScore = 
        todayRecords.reduce((sum: number, r: any) => 
          sum + (r.tasteConfidence || 0.5), 0) / Math.max(todayRecords.length, 1) * 100;
      dailyStat.isSynced = false;
    });
  }

  private identifyStrengths(
    tastePattern: TastePattern,
    growthMetrics: GrowthMetrics
  ): string[] {
    const strengths: string[] = [];

    if (growthMetrics.consistencyScore > 0.8) {
      strengths.push('Highly consistent in your tastings');
    }

    if (growthMetrics.vocabularyGrowth > 3) {
      strengths.push('Rapidly expanding flavor vocabulary');
    }

    if (tastePattern.dominantFlavors.length > 0) {
      strengths.push(`Strong ability to identify ${tastePattern.dominantFlavors[0].category} flavors`);
    }

    if (growthMetrics.flavorDiversityIndex > 0.7) {
      strengths.push('Excellent flavor exploration range');
    }

    return strengths;
  }

  private identifyAreasToExplore(tastePattern: TastePattern): string[] {
    const areas: string[] = [];
    const underexplored = this.findUnderexploredCategories(tastePattern.dominantFlavors);

    underexplored.slice(0, 3).forEach(category => {
      areas.push(`Try more ${category} flavor profiles`);
    });

    if (tastePattern.dominantFlavors.length < 5) {
      areas.push('Expand your flavor identification range');
    }

    return areas;
  }

  private getRecentDiscoveries(userId: string): string[] {
    if (!this.realm) return [];

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const recentRecords = this.realm
      .objects('TastingRecord')
      .filtered('userId = $0 AND createdAt >= $1', userId, sevenDaysAgo)
      .sorted('createdAt', true);

    const discoveries: string[] = [];
    const seenFlavors = new Set<string>();

    recentRecords.forEach((record: any) => {
      const flavorNotes = record.flavorNotes || [];
      flavorNotes.forEach((note: any) => {
        const flavor = note.level3 || note.level2 || note.level1;
        if (!seenFlavors.has(flavor) && discoveries.length < 5) {
          seenFlavors.add(flavor);
          discoveries.push(`Discovered ${flavor} in ${record.coffeeName}`);
        }
      });
    });

    return discoveries;
  }

  private generateTastingTips(
    tastePattern: TastePattern,
    growthMetrics: GrowthMetrics
  ): string[] {
    const tips: string[] = [];

    if (growthMetrics.consistencyScore < 0.6) {
      tips.push('Try to rate similar attributes more consistently');
    }

    if (growthMetrics.vocabularyGrowth < 2) {
      tips.push('Challenge yourself to use new flavor descriptors');
    }

    if (tastePattern.tasteProfile === 'Fruity Explorer') {
      tips.push('Pay attention to citrus vs berry distinctions');
    }

    if (growthMetrics.weeklyProgress < 50) {
      tips.push('Set a goal to taste at least 5 coffees per week');
    }

    tips.push('Compare your notes with roaster descriptions after tasting');

    return tips.slice(0, 3);
  }

  /**
   * Sync local data with Supabase
   */
  async syncWithSupabase(userId: string): Promise<void> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      // Sync taste profiles
      const unsyncedProfiles = this.realm
        .objects('UserTasteProfile')
        .filtered('userId = $0 AND isSynced = false', userId);

      for (const profile of unsyncedProfiles) {
        const { error } = await supabase
          .from('user_taste_profiles')
          .upsert({
            id: profile.id,
            user_id: profile.userId,
            flavor_preferences: JSON.parse(profile.flavorPreferences || '{}'),
            sweetness_preference: profile.sweetnessPreference,
            acidity_preference: profile.acidityPreference,
            bitterness_preference: profile.bitternessPreference,
            body_preference: profile.bodyPreference,
            balance_preference: profile.balancePreference,
            total_tastings: profile.totalTastings,
            unique_flavors_tried: profile.uniqueFlavorsTried,
            vocabulary_level: profile.vocabularyLevel,
            taste_discovery_rate: profile.tasteDiscoveryRate,
            last_analysis_at: profile.lastAnalysisAt,
            updated_at: profile.updatedAt,
          });

        if (!error) {
          this.realm.write(() => {
            profile.isSynced = true;
          });
        }
      }

      // Sync other personal taste data...
      // (Similar patterns for other tables)

    } catch (error) {
      console.error('Error syncing with Supabase:', error);
      throw error;
    }
  }
}