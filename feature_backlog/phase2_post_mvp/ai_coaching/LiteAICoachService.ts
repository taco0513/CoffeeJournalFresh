import { PersonalTasteAnalysisService } from './PersonalTasteAnalysisService';
import { FlavorLearningEngine } from './FlavorLearningEngine';
import { AchievementSystem } from './AchievementSystem';
import { TastePattern, FlavorPreference, MasteryLevel } from '@/types/personalTaste';

// =============================================
// Types and Interfaces
// =============================================

export interface CoachTip {
  id: string;
  type: 'guidance' | 'feedback' | 'insight' | 'challenge' | 'encouragement';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionable?: {
    text: string;
    action: string; // e.g., 'focus_on_acidity', 'try_flavor_quiz'
  };
  icon?: string;
  category?: string;
}

export interface CoachFeedback {
  overall: 'excellent' | 'good' | 'improving' | 'needs_practice';
  matchScore: number;
  strengths: string[];
  improvements: string[];
  tips: CoachTip[];
  encouragement: string;
}

export interface TastingGuidance {
  preTastingTips: CoachTip[];
  flavorHints: Map<string, string>; // flavor -> hint
  focusAreas: string[];
  difficulty: 'easy' | 'medium' | 'challenging';
  expectedFlavors?: string[];
}

export interface DailyInsight {
  fact: string;
  personalizedMessage: string;
  suggestedAction: string;
  relatedAchievement?: string;
}

export interface LearningPath {
  currentFocus: string;
  nextMilestone: string;
  estimatedTime: string;
  exercises: LearningExercise[];
}

export interface LearningExercise {
  type: 'tasting' | 'quiz' | 'comparison' | 'exploration';
  title: string;
  description: string;
  targetFlavor?: string;
  difficulty: number; // 1-5
}

// =============================================
// Lite AI Coach Service
// =============================================

export class LiteAICoachService {
  private readonly COACH_PERSONALITIES = {
    encouraging: 0.4,
    educational: 0.3,
    challenging: 0.2,
    analytical: 0.1,
  };

  constructor(
    private tasteAnalysis: PersonalTasteAnalysisService,
    private learningEngine: FlavorLearningEngine,
    private achievementSystem: AchievementSystem
  ) {}

  /**
   * Get contextual tasting guidance before/during tasting
   */
  async getTastingGuidance(
    userId: string,
    coffeeInfo: {
      roasterName: string;
      coffeeName: string;
      origin?: string;
      process?: string;
      roasterNotes?: string;
    }
  ): Promise<TastingGuidance> {
    try {
      // Get user's profile and learning state
      const [tastePattern, flavorMastery] = await Promise.all([
        this.tasteAnalysis.analyzePersonalTastePattern(userId),
        this.learningEngine.getUserFlavorMasterySummary(userId),
      ]);

      // Analyze coffee characteristics
      const expectedFlavors = this.parseRoasterNotes(coffeeInfo.roasterNotes);
      const coffeeProfile = this.analyzeCoffeeProfile(coffeeInfo);

      // Generate pre-tasting tips
      const preTastingTips = this.generatePreTastingTips(
        tastePattern,
        coffeeProfile,
        expectedFlavors
      );

      // Create flavor-specific hints
      const flavorHints = this.generateFlavorHints(
        expectedFlavors,
        flavorMastery,
        tastePattern
      );

      // Determine focus areas based on weaknesses
      const focusAreas = this.identifyFocusAreas(
        tastePattern,
        flavorMastery,
        expectedFlavors
      );

      // Calculate difficulty
      const difficulty = this.calculateTastingDifficulty(
        expectedFlavors,
        flavorMastery,
        tastePattern
      );

      return {
        preTastingTips,
        flavorHints,
        focusAreas,
        difficulty,
        expectedFlavors: difficulty === 'easy' ? expectedFlavors : undefined,
      };
    } catch (error) {
      console.error('Error generating tasting guidance:', error);
      return {
        preTastingTips: [this.getGenericTip()],
        flavorHints: new Map(),
        focusAreas: ['general'],
        difficulty: 'medium',
      };
    }
  }

  /**
   * Provide feedback after tasting completion
   */
  async provideFeedback(
    userId: string,
    tastingData: {
      selectedFlavors: string[];
      roasterNotes?: string;
      sensoryRatings: Record<string, number>;
      confidence: number;
    }
  ): Promise<CoachFeedback> {
    try {
      const [tastePattern, recentProgress] = await Promise.all([
        this.tasteAnalysis.analyzePersonalTastePattern(userId),
        this.tasteAnalysis.trackTasteGrowth(userId),
      ]);

      // Compare selections with roaster notes
      const roasterFlavors = this.parseRoasterNotes(tastingData.roasterNotes);
      const matchAnalysis = this.analyzeFlavorMatch(
        tastingData.selectedFlavors,
        roasterFlavors
      );

      // Identify strengths and areas for improvement
      const strengths = this.identifyStrengths(
        matchAnalysis,
        tastingData,
        tastePattern
      );
      
      const improvements = this.identifyImprovements(
        matchAnalysis,
        tastingData,
        tastePattern
      );

      // Generate contextual tips
      const tips = this.generateFeedbackTips(
        matchAnalysis,
        tastePattern,
        recentProgress
      );

      // Create encouraging message
      const encouragement = this.generateEncouragement(
        matchAnalysis.score,
        recentProgress,
        strengths
      );

      // Determine overall rating
      const overall = this.determineOverallRating(
        matchAnalysis.score,
        tastingData.confidence,
        recentProgress
      );

      return {
        overall,
        matchScore: matchAnalysis.score,
        strengths,
        improvements,
        tips,
        encouragement,
      };
    } catch (error) {
      console.error('Error providing feedback:', error);
      return {
        overall: 'good',
        matchScore: 75,
        strengths: ['You completed the tasting!'],
        improvements: ['Keep practicing to improve accuracy'],
        tips: [this.getGenericTip()],
        encouragement: 'Great job! Every tasting helps you learn.',
      };
    }
  }

  /**
   * Get daily personalized insight
   */
  async getDailyInsight(userId: string): Promise<DailyInsight> {
    try {
      const [tastePattern, stats, achievements] = await Promise.all([
        this.tasteAnalysis.analyzePersonalTastePattern(userId),
        this.achievementSystem.getAchievementStats(userId),
        this.achievementSystem.getUserAchievements(userId),
      ]);

      const insights = [
        this.generateGrowthInsight(tastePattern),
        this.generateFlavorInsight(tastePattern),
        this.generateAchievementInsight(achievements, stats),
        this.generateTimeBasedInsight(new Date()),
        this.generateEncouragingInsight(tastePattern.growthTrend),
      ];

      // Select most relevant insight
      const selectedInsight = insights[Math.floor(Math.random() * insights.length)];

      return selectedInsight;
    } catch (error) {
      console.error('Error generating daily insight:', error);
      return {
        fact: 'Did you know? Coffee has over 1,000 aromatic compounds!',
        personalizedMessage: 'Keep exploring to discover them all.',
        suggestedAction: 'Try a new coffee today',
      };
    }
  }

  /**
   * Generate personalized learning path
   */
  async generateLearningPath(userId: string): Promise<LearningPath> {
    try {
      const [tastePattern, flavorMastery, recommendations] = await Promise.all([
        this.tasteAnalysis.analyzePersonalTastePattern(userId),
        this.learningEngine.getUserFlavorMasterySummary(userId),
        this.learningEngine.getLearningRecommendations(userId),
      ]);

      // Find weakest area to focus on
      const weakestCategory = this.findWeakestCategory(flavorMastery);
      const currentFocus = weakestCategory || 'general';

      // Determine next milestone
      const nextMilestone = this.determineNextMilestone(
        tastePattern,
        flavorMastery,
        currentFocus
      );

      // Generate exercises
      const exercises = this.generateExercises(
        currentFocus,
        flavorMastery.get(currentFocus),
        tastePattern
      );

      // Estimate time to milestone
      const estimatedTime = this.estimateTimeToMilestone(
        flavorMastery.get(currentFocus),
        exercises.length
      );

      return {
        currentFocus,
        nextMilestone,
        estimatedTime,
        exercises,
      };
    } catch (error) {
      console.error('Error generating learning path:', error);
      return {
        currentFocus: 'general',
        nextMilestone: 'Improve overall tasting accuracy',
        estimatedTime: '1 week',
        exercises: [this.getGenericExercise()],
      };
    }
  }

  /**
   * Get contextual tips for quiz/games
   */
  async getQuizHint(
    userId: string,
    questionType: string,
    flavorCategory: string,
    attemptNumber: number
  ): Promise<string> {
    try {
      const mastery = await this.learningEngine.evaluateFlavorMastery(
        userId,
        flavorCategory
      );

      // Progressive hints based on attempt number
      const hints = this.generateProgressiveHints(
        questionType,
        flavorCategory,
        mastery,
        attemptNumber
      );

      return hints[Math.min(attemptNumber - 1, hints.length - 1)];
    } catch (error) {
      console.error('Error generating quiz hint:', error);
      return 'Take your time and think about the flavor characteristics.';
    }
  }

  // =============================================
  // Private Helper Methods
  // =============================================

  private parseRoasterNotes(notes?: string): string[] {
    if (!notes) return [];

    // Simple extraction of flavor words
    const flavorKeywords = [
      'fruity', 'floral', 'sweet', 'chocolate', 'caramel', 'nutty',
      'berry', 'citrus', 'apple', 'stone fruit', 'tropical',
      'jasmine', 'rose', 'honey', 'vanilla', 'spice', 'herbal',
      'wine', 'juicy', 'bright', 'clean', 'smooth', 'creamy',
      'blackberry', 'blueberry', 'strawberry', 'raspberry',
      'lemon', 'lime', 'orange', 'grapefruit',
      'peach', 'apricot', 'cherry', 'plum',
    ];

    const lowerNotes = notes.toLowerCase();
    return flavorKeywords.filter(flavor => lowerNotes.includes(flavor));
  }

  private analyzeCoffeeProfile(coffeeInfo: any): any {
    const profile: any = {
      origin: coffeeInfo.origin,
      process: coffeeInfo.process,
      expectedComplexity: 'medium',
    };

    // Origin-based expectations
    if (coffeeInfo.origin?.toLowerCase().includes('ethiopia')) {
      profile.likelyFlavors = ['fruity', 'floral', 'wine'];
      profile.expectedComplexity = 'high';
    } else if (coffeeInfo.origin?.toLowerCase().includes('colombia')) {
      profile.likelyFlavors = ['chocolate', 'caramel', 'nutty'];
      profile.expectedComplexity = 'medium';
    } else if (coffeeInfo.origin?.toLowerCase().includes('kenya')) {
      profile.likelyFlavors = ['blackcurrant', 'wine', 'bright'];
      profile.expectedComplexity = 'high';
    }

    // Process-based expectations
    if (coffeeInfo.process?.toLowerCase().includes('natural')) {
      profile.likelyFlavors = [...(profile.likelyFlavors || []), 'fruity', 'sweet'];
      profile.processingNote = 'Natural process often enhances fruitiness';
    } else if (coffeeInfo.process?.toLowerCase().includes('honey')) {
      profile.likelyFlavors = [...(profile.likelyFlavors || []), 'sweet', 'syrupy'];
      profile.processingNote = 'Honey process adds sweetness and body';
    }

    return profile;
  }

  private generatePreTastingTips(
    tastePattern: TastePattern,
    coffeeProfile: any,
    expectedFlavors: string[]
  ): CoachTip[] {
    const tips: CoachTip[] = [];

    // Tip based on user's strengths
    if (tastePattern.dominantFlavors.length > 0) {
      const strongFlavor = tastePattern.dominantFlavors[0];
      if (expectedFlavors.includes(strongFlavor.category)) {
        tips.push({
          id: 'strength-match',
          type: 'encouragement',
          priority: 'high',
          title: 'In Your Wheelhouse!',
          message: `This coffee features ${strongFlavor.category} notes - your specialty! Trust your instincts.`,
          icon: '💪',
        });
      }
    }

    // Tip for challenging flavors
    const challengingFlavors = expectedFlavors.filter(
      f => !tastePattern.dominantFlavors.some(df => df.category === f)
    );
    
    if (challengingFlavors.length > 0) {
      tips.push({
        id: 'challenge-tip',
        type: 'guidance',
        priority: 'medium',
        title: 'New Flavor Alert',
        message: `This coffee might have ${challengingFlavors[0]} notes. Take small sips and let it coat your tongue.`,
        actionable: {
          text: 'Learn about this flavor',
          action: `learn_flavor_${challengingFlavors[0]}`,
        },
        icon: '🎯',
      });
    }

    // Process-specific tip
    if (coffeeProfile.processingNote) {
      tips.push({
        id: 'process-tip',
        type: 'insight',
        priority: 'low',
        title: 'Processing Insight',
        message: coffeeProfile.processingNote,
        icon: '💡',
      });
    }

    // Time-based tip
    const hour = new Date().getHours();
    if (hour < 10) {
      tips.push({
        id: 'morning-tip',
        type: 'guidance',
        priority: 'low',
        title: 'Morning Tasting',
        message: 'Your palate is freshest in the morning. Perfect timing for subtle flavors!',
        icon: '🌅',
      });
    }

    return tips.slice(0, 3); // Max 3 tips
  }

  private generateFlavorHints(
    expectedFlavors: string[],
    flavorMastery: Map<string, MasteryLevel>,
    tastePattern: TastePattern
  ): Map<string, string> {
    const hints = new Map<string, string>();

    expectedFlavors.forEach(flavor => {
      const mastery = flavorMastery.get(flavor);
      
      if (!mastery || mastery.score < 50) {
        // Beginner hint
        hints.set(flavor, this.getBeginnerHint(flavor));
      } else if (mastery.score < 75) {
        // Intermediate hint
        hints.set(flavor, this.getIntermediateHint(flavor));
      } else {
        // Advanced hint
        hints.set(flavor, this.getAdvancedHint(flavor));
      }
    });

    return hints;
  }

  private getBeginnerHint(flavor: string): string {
    const hints: Record<string, string> = {
      fruity: 'Think of fresh fruits - berries, citrus, or stone fruits like peach',
      floral: 'Like smelling flowers - jasmine, rose, or lavender',
      chocolate: 'From cocoa to dark chocolate - sometimes with a bitter edge',
      nutty: 'Almond, hazelnut, or walnut flavors',
      caramel: 'Sweet, buttery, sometimes with a burnt sugar note',
      citrus: 'Lemon, lime, orange, or grapefruit - bright and acidic',
    };

    return hints[flavor] || `Focus on identifying ${flavor} characteristics`;
  }

  private getIntermediateHint(flavor: string): string {
    const hints: Record<string, string> = {
      fruity: 'Try to distinguish between berry, citrus, and tropical fruit notes',
      floral: 'Is it more like jasmine (sweet) or lavender (herbal)?',
      chocolate: 'Notice if it\'s milk chocolate (sweet) or dark chocolate (bitter)',
      nutty: 'Can you identify the specific nut? Almond is sweet, walnut is earthy',
      caramel: 'Look for butterscotch or toffee variations',
      citrus: 'Lemon is sharp, orange is sweet, grapefruit is bitter-sweet',
    };

    return hints[flavor] || `Refine your perception of ${flavor}`;
  }

  private getAdvancedHint(flavor: string): string {
    const hints: Record<string, string> = {
      fruity: 'Consider ripeness - is it fresh, ripe, or jammy?',
      floral: 'Notice the intensity - delicate or perfume-like?',
      chocolate: 'Look for cocoa percentage - 70% vs 85% dark',
      nutty: 'Raw or roasted? Fresh or aged?',
      caramel: 'Butterscotch vs toffee vs burnt caramel',
      citrus: 'Zest, juice, or whole fruit character?',
    };

    return hints[flavor] || `Master the nuances of ${flavor}`;
  }

  private identifyFocusAreas(
    tastePattern: TastePattern,
    flavorMastery: Map<string, MasteryLevel>,
    expectedFlavors: string[]
  ): string[] {
    const focusAreas: string[] = [];

    // Weak flavors that are expected
    expectedFlavors.forEach(flavor => {
      const mastery = flavorMastery.get(flavor);
      if (!mastery || mastery.score < 60) {
        focusAreas.push(flavor);
      }
    });

    // General weak areas
    if (tastePattern.growthTrend.consistencyScore < 0.6) {
      focusAreas.push('consistency');
    }

    if (tastePattern.growthTrend.vocabularyGrowth < 2) {
      focusAreas.push('vocabulary');
    }

    return focusAreas.slice(0, 3);
  }

  private calculateTastingDifficulty(
    expectedFlavors: string[],
    flavorMastery: Map<string, MasteryLevel>,
    tastePattern: TastePattern
  ): 'easy' | 'medium' | 'challenging' {
    let difficultyScore = 0;

    // Check mastery of expected flavors
    expectedFlavors.forEach(flavor => {
      const mastery = flavorMastery.get(flavor);
      if (!mastery || mastery.score < 50) {
        difficultyScore += 2;
      } else if (mastery.score < 75) {
        difficultyScore += 1;
      }
    });

    // Factor in complexity
    if (expectedFlavors.length > 4) {
      difficultyScore += 2;
    }

    // User experience level
    if (tastePattern.growthTrend.vocabularyGrowth < 2) {
      difficultyScore += 1;
    }

    if (difficultyScore >= 5) return 'challenging';
    if (difficultyScore >= 2) return 'medium';
    return 'easy';
  }

  private analyzeFlavorMatch(
    selected: string[],
    expected: string[]
  ): { score: number; matched: string[]; missed: string[]; extra: string[] } {
    const matched = selected.filter(s => expected.includes(s));
    const missed = expected.filter(e => !selected.includes(e));
    const extra = selected.filter(s => !expected.includes(s));

    // Calculate score (partial credit for related flavors)
    let score = (matched.length / Math.max(expected.length, 1)) * 100;
    
    // Bonus for finding additional valid flavors
    if (extra.length > 0 && extra.length <= 2) {
      score = Math.min(100, score + 5);
    }

    return { score, matched, missed, extra };
  }

  private identifyStrengths(
    matchAnalysis: any,
    tastingData: any,
    tastePattern: TastePattern
  ): string[] {
    const strengths: string[] = [];

    if (matchAnalysis.score >= 80) {
      strengths.push('Excellent flavor identification!');
    }

    if (matchAnalysis.matched.length > 0) {
      strengths.push(`Correctly identified ${matchAnalysis.matched.join(', ')}`);
    }

    if (tastingData.confidence > 0.8) {
      strengths.push('High confidence in your selections');
    }

    const balancedRatings = Object.values(tastingData.sensoryRatings)
      .every((r: any) => r >= 2 && r <= 4);
    if (balancedRatings) {
      strengths.push('Well-balanced sensory evaluation');
    }

    return strengths;
  }

  private identifyImprovements(
    matchAnalysis: any,
    tastingData: any,
    tastePattern: TastePattern
  ): string[] {
    const improvements: string[] = [];

    if (matchAnalysis.missed.length > 0) {
      improvements.push(`Missed: ${matchAnalysis.missed.slice(0, 2).join(', ')}`);
    }

    if (tastingData.confidence < 0.5) {
      improvements.push('Build confidence through regular practice');
    }

    if (matchAnalysis.score < 50) {
      improvements.push('Focus on one flavor at a time');
    }

    return improvements;
  }

  private generateFeedbackTips(
    matchAnalysis: any,
    tastePattern: TastePattern,
    recentProgress: any
  ): CoachTip[] {
    const tips: CoachTip[] = [];

    // Tips for missed flavors
    matchAnalysis.missed.forEach((flavor: string) => {
      tips.push({
        id: `missed-${flavor}`,
        type: 'guidance',
        priority: 'high',
        title: `Finding ${flavor}`,
        message: this.getMissedFlavorTip(flavor),
        actionable: {
          text: 'Practice this flavor',
          action: `practice_${flavor}`,
        },
        icon: '🎯',
      });
    });

    // Improvement trend tip
    if (recentProgress.accuracyImprovement > 10) {
      tips.push({
        id: 'improvement',
        type: 'encouragement',
        priority: 'medium',
        title: 'Great Progress!',
        message: `Your accuracy improved ${Math.round(recentProgress.accuracyImprovement)}% this month!`,
        icon: '📈',
      });
    }

    // Learning suggestion
    if (tastePattern.growthTrend.vocabularyGrowth < 3) {
      tips.push({
        id: 'vocabulary',
        type: 'challenge',
        priority: 'low',
        title: 'Expand Your Vocabulary',
        message: 'Try using more specific descriptors in your next tasting',
        actionable: {
          text: 'View flavor wheel',
          action: 'show_flavor_wheel',
        },
        icon: '📚',
      });
    }

    return tips.slice(0, 3);
  }

  private getMissedFlavorTip(flavor: string): string {
    const tips: Record<string, string> = {
      fruity: 'Next time, notice the sweetness and acidity together - that\'s often fruitiness',
      floral: 'Floral notes are often in the aroma - spend more time smelling before tasting',
      chocolate: 'Chocolate appears in the finish - let the coffee cool slightly',
      caramel: 'Caramel sweetness develops as the coffee cools',
      citrus: 'Citrus creates a bright, tangy sensation on the sides of your tongue',
      nutty: 'Nutty flavors often appear in medium roasts with good body',
    };

    return tips[flavor] || `${flavor} flavors can be subtle - keep practicing!`;
  }

  private generateEncouragement(
    score: number,
    progress: any,
    strengths: string[]
  ): string {
    if (score >= 90) {
      return '🌟 Outstanding! You\'re developing an expert palate!';
    } else if (score >= 75) {
      return '🎯 Great job! Your taste identification is really improving!';
    } else if (score >= 50) {
      return '💪 Good effort! Every tasting makes you better!';
    } else if (progress.accuracyImprovement > 0) {
      return '📈 You\'re improving! Keep up the consistent practice!';
    } else {
      return '☕ Keep exploring! Your unique palate is developing beautifully!';
    }
  }

  private determineOverallRating(
    score: number,
    confidence: number,
    progress: any
  ): 'excellent' | 'good' | 'improving' | 'needs_practice' {
    if (score >= 85 && confidence > 0.7) return 'excellent';
    if (score >= 70 || progress.accuracyImprovement > 15) return 'good';
    if (score >= 50 || progress.accuracyImprovement > 5) return 'improving';
    return 'needs_practice';
  }

  private generateGrowthInsight(tastePattern: TastePattern): DailyInsight {
    return {
      fact: `You've discovered ${tastePattern.dominantFlavors.length} flavor preferences!`,
      personalizedMessage: `Your top flavor is ${tastePattern.dominantFlavors[0]?.category || 'still being discovered'}. You notice it ${Math.round((tastePattern.dominantFlavors[0]?.preference || 0) * 100)}% of the time.`,
      suggestedAction: 'Try a coffee without your favorite flavor to expand your palate',
      relatedAchievement: 'flavor_explorer',
    };
  }

  private generateFlavorInsight(tastePattern: TastePattern): DailyInsight {
    const underexplored = this.findUnderexploredFlavor(tastePattern);
    return {
      fact: `Did you know? ${underexplored} flavors can add amazing complexity to coffee.`,
      personalizedMessage: `You haven't explored many ${underexplored} coffees yet. Ready for a new adventure?`,
      suggestedAction: `Try a coffee with ${underexplored} notes today`,
    };
  }

  private generateAchievementInsight(achievements: any[], stats: any): DailyInsight {
    const nextAchievement = achievements.find(a => !a.unlockedAt && a.progress > 0.5);
    
    if (nextAchievement) {
      return {
        fact: `You're ${Math.round(nextAchievement.progress * 100)}% toward unlocking "${nextAchievement.title}"!`,
        personalizedMessage: nextAchievement.description,
        suggestedAction: 'Complete one more tasting to get closer',
        relatedAchievement: nextAchievement.type,
      };
    }

    return {
      fact: `You've unlocked ${stats.totalUnlocked} achievements so far!`,
      personalizedMessage: 'Every tasting brings new possibilities.',
      suggestedAction: 'Check your achievements page for what\'s next',
    };
  }

  private generateTimeBasedInsight(date: Date): DailyInsight {
    const hour = date.getHours();
    const day = date.getDay();

    if (hour < 10) {
      return {
        fact: 'Morning is the best time for tasting!',
        personalizedMessage: 'Your palate is most sensitive before eating heavy meals.',
        suggestedAction: 'Do your daily tasting now for best results',
      };
    }

    if (day === 0 || day === 6) {
      return {
        fact: 'Weekend is perfect for coffee exploration!',
        personalizedMessage: 'Take your time to really focus on the flavors.',
        suggestedAction: 'Try a comparison tasting with 2-3 coffees',
      };
    }

    return {
      fact: 'Consistency is key to developing your palate.',
      personalizedMessage: 'Even one thoughtful tasting per day makes a difference.',
      suggestedAction: 'Set a daily reminder for your coffee moment',
    };
  }

  private generateEncouragingInsight(growthTrend: any): DailyInsight {
    if (growthTrend.vocabularyGrowth > 3) {
      return {
        fact: 'Your flavor vocabulary is growing rapidly!',
        personalizedMessage: `You're learning ${Math.round(growthTrend.vocabularyGrowth)} new taste words per week.`,
        suggestedAction: 'Use your new words in today\'s tasting notes',
      };
    }

    return {
      fact: 'Every expert was once a beginner.',
      personalizedMessage: 'Your unique taste journey is unfolding perfectly.',
      suggestedAction: 'Trust your palate and keep exploring',
    };
  }

  private findUnderexploredFlavor(tastePattern: TastePattern): string {
    const allFlavors = ['fruity', 'floral', 'sweet', 'nutty', 'chocolate', 'spices'];
    const explored = tastePattern.dominantFlavors.map(f => f.category);
    return allFlavors.find(f => !explored.includes(f)) || 'exotic';
  }

  private findWeakestCategory(flavorMastery: Map<string, MasteryLevel>): string | null {
    let weakest: { category: string; score: number } | null = null;

    flavorMastery.forEach((mastery, category) => {
      if (!weakest || mastery.score < weakest.score) {
        weakest = { category, score: mastery.score };
      }
    });

    return weakest?.category || null;
  }

  private determineNextMilestone(
    tastePattern: TastePattern,
    flavorMastery: Map<string, MasteryLevel>,
    currentFocus: string
  ): string {
    const mastery = flavorMastery.get(currentFocus);
    
    if (!mastery || mastery.score < 50) {
      return `Achieve basic proficiency in ${currentFocus} flavors`;
    } else if (mastery.score < 75) {
      return `Master ${currentFocus} flavor identification`;
    } else {
      return `Become a ${currentFocus} flavor expert`;
    }
  }

  private generateExercises(
    focus: string,
    mastery: MasteryLevel | undefined,
    tastePattern: TastePattern
  ): LearningExercise[] {
    const exercises: LearningExercise[] = [];
    const level = mastery?.score || 0;

    // Basic identification
    if (level < 50) {
      exercises.push({
        type: 'tasting',
        title: `Find ${focus} in your coffee`,
        description: `Focus only on identifying ${focus} characteristics`,
        targetFlavor: focus,
        difficulty: 1,
      });

      exercises.push({
        type: 'quiz',
        title: `${focus} flavor basics`,
        description: 'Test your knowledge of common ${focus} descriptors',
        targetFlavor: focus,
        difficulty: 1,
      });
    }

    // Intermediate discrimination
    if (level >= 30 && level < 75) {
      exercises.push({
        type: 'comparison',
        title: `Compare ${focus} variations`,
        description: 'Taste 2 coffees and identify different ${focus} notes',
        targetFlavor: focus,
        difficulty: 3,
      });
    }

    // Advanced exploration
    if (level >= 50) {
      exercises.push({
        type: 'exploration',
        title: `Rare ${focus} discovery`,
        description: 'Identify subtle or unusual ${focus} characteristics',
        targetFlavor: focus,
        difficulty: 4,
      });
    }

    // General exercise
    exercises.push({
      type: 'tasting',
      title: 'Mindful tasting',
      description: 'Slow down and notice every flavor',
      difficulty: 2,
    });

    return exercises;
  }

  private estimateTimeToMilestone(
    currentMastery: MasteryLevel | undefined,
    exerciseCount: number
  ): string {
    const currentScore = currentMastery?.score || 0;
    const targetScore = currentScore < 50 ? 50 : currentScore < 75 ? 75 : 90;
    const pointsNeeded = targetScore - currentScore;
    
    // Assume 2-3 points per day with regular practice
    const daysNeeded = Math.ceil(pointsNeeded / 2.5);
    
    if (daysNeeded <= 7) return '1 week';
    if (daysNeeded <= 14) return '2 weeks';
    if (daysNeeded <= 30) return '1 month';
    return `${Math.ceil(daysNeeded / 30)} months`;
  }

  private generateProgressiveHints(
    questionType: string,
    flavorCategory: string,
    mastery: MasteryLevel,
    attemptNumber: number
  ): string[] {
    const hints: string[] = [];

    // First hint - general
    hints.push(`Think about the characteristics of ${flavorCategory} flavors`);

    // Second hint - more specific
    if (questionType === 'identify') {
      hints.push(`${flavorCategory} flavors often appear in the ${this.getFlavorLocation(flavorCategory)}`);
    } else {
      hints.push(`Compare with other ${flavorCategory} variations you know`);
    }

    // Third hint - very specific
    hints.push(this.getSpecificHint(flavorCategory, mastery.score));

    return hints;
  }

  private getFlavorLocation(flavor: string): string {
    const locations: Record<string, string> = {
      fruity: 'aroma and first sip',
      floral: 'aroma especially',
      chocolate: 'finish and aftertaste',
      nutty: 'mid-palate',
      caramel: 'sweetness as it cools',
      citrus: 'bright acidity upfront',
    };

    return locations[flavor] || 'throughout the cup';
  }

  private getSpecificHint(flavor: string, masteryScore: number): string {
    if (masteryScore < 50) {
      return `Start with the most obvious ${flavor} notes`;
    } else if (masteryScore < 75) {
      return `Consider the intensity and specific type of ${flavor}`;
    } else {
      return `Look for subtle variations and complementary notes`;
    }
  }

  private getGenericTip(): CoachTip {
    return {
      id: 'generic',
      type: 'guidance',
      priority: 'low',
      title: 'Tasting Tip',
      message: 'Take your time and trust your palate!',
      icon: '☕',
    };
  }

  private getGenericExercise(): LearningExercise {
    return {
      type: 'tasting',
      title: 'Daily tasting practice',
      description: 'Focus on identifying 3 distinct flavors',
      difficulty: 2,
    };
  }
}