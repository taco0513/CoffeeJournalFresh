import Realm from 'realm';
import { generateUUID } from '@/utils/uuid';

// =============================================
// Types and Interfaces
// =============================================

export interface FlavorIdentification {
  flavorCategory: string;
  flavorSubcategory?: string;
  specificFlavor?: string;
  userSelection: string;
  isCorrect: boolean;
  confidence: number; // 0-1
  responseTime: number; // milliseconds
}

export interface FlavorQuiz {
  id: string;
  questions: FlavorQuestion[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[]; // Categories to focus on
  estimatedTime: number; // minutes
}

export interface FlavorQuestion {
  id: string;
  type: 'identify' | 'match' | 'compare' | 'describe';
  description: string;
  hints: string[];
  correctAnswer: FlavorOption;
  options: FlavorOption[];
  difficulty: number; // 1-5
  points: number;
}

export interface FlavorOption {
  category: string;
  subcategory?: string;
  specific?: string;
  displayName: string;
}

export interface MasteryLevel {
  category: string;
  level: 'novice' | 'apprentice' | 'proficient' | 'expert' | 'master';
  score: number; // 0-100
  accuracyRate: number; // 0-1
  confidenceLevel: number; // 1-5
  totalExposures: number;
  successfulIdentifications: number;
  lastPracticed: Date;
  nextMilestone: string;
  progressToNext: number; // 0-1
}

export interface LearningRecommendation {
  category: string;
  reason: string;
  suggestedPractices: string[];
  estimatedTimeToMastery: number; // days
}

// =============================================
// Flavor Learning Engine
// =============================================

export class FlavorLearningEngine {
  private realm: Realm | null = null;
  
  // Flavor wheel data (simplified version)
  private readonly flavorWheel = {
    fruity: {
      subcategories: ['berry', 'citrus', 'tropical', 'stone_fruit', 'apple_pear'],
      specifics: {
        berry: ['blackberry', 'raspberry', 'blueberry', 'strawberry'],
        citrus: ['lemon', 'lime', 'grapefruit', 'orange'],
        tropical: ['pineapple', 'mango', 'passion_fruit', 'lychee'],
        stone_fruit: ['peach', 'apricot', 'plum', 'cherry'],
        apple_pear: ['red_apple', 'green_apple', 'pear'],
      }
    },
    floral: {
      subcategories: ['jasmine', 'rose', 'lavender', 'orange_blossom'],
      specifics: {
        jasmine: ['jasmine'],
        rose: ['rose'],
        lavender: ['lavender'],
        orange_blossom: ['orange_blossom'],
      }
    },
    sweet: {
      subcategories: ['chocolate', 'vanilla', 'caramel', 'honey', 'sugar'],
      specifics: {
        chocolate: ['dark_chocolate', 'milk_chocolate', 'cocoa'],
        vanilla: ['vanilla'],
        caramel: ['caramel', 'butterscotch', 'toffee'],
        honey: ['honey', 'maple_syrup'],
        sugar: ['brown_sugar', 'molasses'],
      }
    },
    nutty: {
      subcategories: ['almond', 'hazelnut', 'walnut', 'peanut'],
      specifics: {
        almond: ['almond', 'marzipan'],
        hazelnut: ['hazelnut'],
        walnut: ['walnut'],
        peanut: ['peanut', 'peanut_butter'],
      }
    },
    spices: {
      subcategories: ['cinnamon', 'clove', 'nutmeg', 'black_pepper'],
      specifics: {
        cinnamon: ['cinnamon'],
        clove: ['clove'],
        nutmeg: ['nutmeg'],
        black_pepper: ['black_pepper', 'white_pepper'],
      }
    },
    roasted: {
      subcategories: ['toast', 'burnt', 'smoky', 'ashy'],
      specifics: {
        toast: ['toast', 'biscuit'],
        burnt: ['burnt', 'charred'],
        smoky: ['smoky', 'tobacco'],
        ashy: ['ashy'],
      }
    },
  };

  constructor(realm?: Realm) {
    if (realm) {
      this.realm = realm;
    }
  }

  setRealm(realm: Realm) {
    this.realm = realm;
  }

  /**
   * Update flavor learning progress based on user identification
   */
  async updateFlavorProgress(
    userId: string,
    flavorData: FlavorIdentification
  ): Promise<void> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      this.realm.write(() => {
        // Find or create learning progress record
        let progress = this.realm!
          .objects('FlavorLearningProgress')
          .filtered(
            'userId = $0 AND flavorCategory = $1 AND flavorSubcategory = $2 AND specificFlavor = $3',
            userId,
            flavorData.flavorCategory,
            flavorData.flavorSubcategory || null,
            flavorData.specificFlavor || null
          )[0];

        if (!progress) {
          progress = this.realm!.create('FlavorLearningProgress', {
            id: generateUUID(),
            userId,
            flavorCategory: flavorData.flavorCategory,
            flavorSubcategory: flavorData.flavorSubcategory || null,
            specificFlavor: flavorData.specificFlavor || null,
            firstEncounteredAt: new Date(),
            createdAt: new Date(),
          });
        }

        // Update statistics
        progress.exposureCount += 1;
        if (flavorData.isCorrect) {
          progress.identificationCount += 1;
        }
        
        // Update accuracy rate (moving average)
        const newAccuracy = progress.identificationCount / progress.exposureCount;
        progress.accuracyRate = newAccuracy;
        
        // Update confidence level based on performance
        progress.confidenceLevel = this.calculateConfidenceLevel(
          newAccuracy,
          progress.exposureCount,
          flavorData.confidence
        );
        
        progress.lastPracticedAt = new Date();
        
        // Check for mastery achievement
        if (this.checkMasteryAchievement(progress)) {
          progress.masteryAchievedAt = new Date();
        }
        
        progress.isSynced = false;
      });

      // Update user's overall statistics
      await this.updateUserFlavorStats(userId);
      
    } catch (error) {
      console.error('Error updating flavor progress:', error);
      throw error;
    }
  }

  /**
   * Generate personalized quiz based on learning progress
   */
  async generatePersonalizedQuiz(userId: string): Promise<FlavorQuiz> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      // Get user's learning progress
      const learningProgress = this.realm
        .objects('FlavorLearningProgress')
        .filtered('userId = $0', userId);

      // Analyze areas that need practice
      const focusAreas = this.identifyFocusAreas(learningProgress);
      
      // Determine difficulty based on overall progress
      const difficulty = this.determineDifficulty(learningProgress);
      
      // Generate questions
      const questions = this.generateQuestions(
        focusAreas,
        difficulty,
        10 // number of questions
      );

      const quiz: FlavorQuiz = {
        id: generateUUID(),
        questions,
        difficulty,
        focusAreas,
        estimatedTime: questions.length * 0.5, // 30 seconds per question
      };

      return quiz;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  }

  /**
   * Evaluate mastery level for a flavor category
   */
  async evaluateFlavorMastery(
    userId: string,
    flavorCategory: string
  ): Promise<MasteryLevel> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      const categoryProgress = this.realm
        .objects('FlavorLearningProgress')
        .filtered('userId = $0 AND flavorCategory = $1', userId, flavorCategory);

      let totalExposures = 0;
      let totalIdentifications = 0;
      let avgAccuracy = 0;
      let avgConfidence = 0;
      let lastPracticed = new Date(0);

      categoryProgress.forEach((progress: any) => {
        totalExposures += progress.exposureCount;
        totalIdentifications += progress.identificationCount;
        avgAccuracy += progress.accuracyRate * progress.exposureCount;
        avgConfidence += progress.confidenceLevel;
        
        if (progress.lastPracticedAt > lastPracticed) {
          lastPracticed = progress.lastPracticedAt;
        }
      });

      if (categoryProgress.length > 0) {
        avgAccuracy /= totalExposures;
        avgConfidence /= categoryProgress.length;
      }

      const score = this.calculateMasteryScore(
        avgAccuracy,
        totalExposures,
        avgConfidence
      );

      const level = this.getMasteryLevel(score);
      const nextMilestone = this.getNextMilestone(level, score);

      return {
        category: flavorCategory,
        level,
        score,
        accuracyRate: avgAccuracy,
        confidenceLevel: Math.round(avgConfidence),
        totalExposures,
        successfulIdentifications: totalIdentifications,
        lastPracticed,
        nextMilestone: nextMilestone.description,
        progressToNext: nextMilestone.progress,
      };
    } catch (error) {
      console.error('Error evaluating mastery:', error);
      throw error;
    }
  }

  /**
   * Get learning recommendations for a user
   */
  async getLearningRecommendations(userId: string): Promise<LearningRecommendation[]> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      const allProgress = this.realm
        .objects('FlavorLearningProgress')
        .filtered('userId = $0', userId);

      // Group by category
      const categoryMap = new Map<string, any[]>();
      allProgress.forEach((progress: any) => {
        const category = progress.flavorCategory;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        categoryMap.get(category)!.push(progress);
      });

      const recommendations: LearningRecommendation[] = [];

      // Find weak areas
      categoryMap.forEach((progressList, category) => {
        const avgAccuracy = progressList.reduce((sum, p) => sum + p.accuracyRate, 0) / progressList.length;
        
        if (avgAccuracy < 0.7) {
          recommendations.push({
            category,
            reason: `Your accuracy in ${category} flavors is ${Math.round(avgAccuracy * 100)}%. More practice will help!`,
            suggestedPractices: this.getSuggestedPractices(category, avgAccuracy),
            estimatedTimeToMastery: Math.ceil((0.85 - avgAccuracy) * 30), // rough estimate
          });
        }
      });

      // Find unexplored categories
      const allCategories = Object.keys(this.flavorWheel);
      const exploredCategories = Array.from(categoryMap.keys());
      const unexplored = allCategories.filter(cat => !exploredCategories.includes(cat));

      unexplored.forEach(category => {
        recommendations.push({
          category,
          reason: `You haven't explored ${category} flavors yet. Try them to expand your palate!`,
          suggestedPractices: [
            `Start with basic ${category} identification`,
            `Compare different ${category} subcategories`,
            `Try coffees known for ${category} notes`,
          ],
          estimatedTimeToMastery: 14, // 2 weeks for new category
        });
      });

      return recommendations.slice(0, 5); // Top 5 recommendations
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  // =============================================
  // Private Helper Methods
  // =============================================

  private calculateConfidenceLevel(
    accuracy: number,
    exposureCount: number,
    userConfidence: number
  ): number {
    // Weight factors
    const accuracyWeight = 0.5;
    const exposureWeight = 0.3;
    const confidenceWeight = 0.2;

    // Normalize exposure count (cap at 20)
    const normalizedExposure = Math.min(exposureCount / 20, 1);

    // Calculate weighted confidence
    const weightedConfidence = 
      (accuracy * accuracyWeight) +
      (normalizedExposure * exposureWeight) +
      (userConfidence * confidenceWeight);

    // Convert to 1-5 scale
    return Math.max(1, Math.min(5, Math.round(weightedConfidence * 5)));
  }

  private checkMasteryAchievement(progress: any): boolean {
    return (
      progress.accuracyRate >= 0.85 &&
      progress.exposureCount >= 10 &&
      progress.confidenceLevel >= 4 &&
      !progress.masteryAchievedAt
    );
  }

  private async updateUserFlavorStats(userId: string): Promise<void> {
    if (!this.realm) return;

    const allProgress = this.realm
      .objects('FlavorLearningProgress')
      .filtered('userId = $0', userId);

    const uniqueFlavors = new Set<string>();
    allProgress.forEach((progress: any) => {
      const key = [
        progress.flavorCategory,
        progress.flavorSubcategory,
        progress.specificFlavor
      ].filter(Boolean).join('-');
      uniqueFlavors.add(key);
    });

    // Update user taste profile
    this.realm.write(() => {
      const profile = this.realm!
        .objects('UserTasteProfile')
        .filtered('userId = $0', userId)[0];

      if (profile) {
        profile.uniqueFlavorsTried = uniqueFlavors.size;
        profile.updatedAt = new Date();
        profile.isSynced = false;
      }
    });
  }

  private identifyFocusAreas(learningProgress: any): string[] {
    const categoryStats = new Map<string, { accuracy: number; count: number }>();

    learningProgress.forEach((progress: any) => {
      const category = progress.flavorCategory;
      if (!categoryStats.has(category)) {
        categoryStats.set(category, { accuracy: 0, count: 0 });
      }
      
      const stats = categoryStats.get(category)!;
      stats.accuracy += progress.accuracyRate;
      stats.count += 1;
    });

    // Sort by average accuracy (ascending) and take bottom 3
    const sortedCategories = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        avgAccuracy: stats.accuracy / stats.count,
      }))
      .sort((a, b) => a.avgAccuracy - b.avgAccuracy)
      .slice(0, 3)
      .map(item => item.category);

    // Add some unexplored categories
    const allCategories = Object.keys(this.flavorWheel);
    const exploredCategories = Array.from(categoryStats.keys());
    const unexplored = allCategories
      .filter(cat => !exploredCategories.includes(cat))
      .slice(0, 2);

    return [...sortedCategories, ...unexplored];
  }

  private determineDifficulty(learningProgress: any): 'beginner' | 'intermediate' | 'advanced' {
    if (learningProgress.length === 0) return 'beginner';

    let totalAccuracy = 0;
    let totalExposures = 0;

    learningProgress.forEach((progress: any) => {
      totalAccuracy += progress.accuracyRate * progress.exposureCount;
      totalExposures += progress.exposureCount;
    });

    const avgAccuracy = totalExposures > 0 ? totalAccuracy / totalExposures : 0;

    if (avgAccuracy >= 0.8 && totalExposures >= 50) return 'advanced';
    if (avgAccuracy >= 0.6 && totalExposures >= 20) return 'intermediate';
    return 'beginner';
  }

  private generateQuestions(
    focusAreas: string[],
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    count: number
  ): FlavorQuestion[] {
    const questions: FlavorQuestion[] = [];
    const difficultyMap = {
      beginner: { min: 1, max: 2, points: 10 },
      intermediate: { min: 2, max: 4, points: 20 },
      advanced: { min: 3, max: 5, points: 30 },
    };

    const diff = difficultyMap[difficulty];

    for (let i = 0; i < count; i++) {
      const category = focusAreas[i % focusAreas.length];
      const questionType = this.selectQuestionType(difficulty, i);
      
      questions.push(this.createQuestion(category, questionType, diff));
    }

    return questions;
  }

  private selectQuestionType(
    difficulty: string,
    index: number
  ): 'identify' | 'match' | 'compare' | 'describe' {
    const types: Array<'identify' | 'match' | 'compare' | 'describe'> = ['identify', 'match', 'compare', 'describe'];
    
    if (difficulty === 'beginner') {
      return types[index % 2]; // Only identify and match
    } else if (difficulty === 'intermediate') {
      return types[index % 3]; // Exclude describe
    }
    
    return types[index % 4]; // All types for advanced
  }

  private createQuestion(
    category: string,
    type: 'identify' | 'match' | 'compare' | 'describe',
    difficulty: { min: number; max: number; points: number }
  ): FlavorQuestion {
    const categoryData = this.flavorWheel[category as keyof typeof this.flavorWheel];
    if (!categoryData) {
      throw new Error(`Unknown category: ${category}`);
    }

    const subcategories = categoryData.subcategories;
    const correctSubcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
    
    let description = '';
    let hints: string[] = [];
    let correctAnswer: FlavorOption;
    let options: FlavorOption[] = [];

    switch (type) {
      case 'identify':
        description = `Which flavor category best describes notes of ${correctSubcategory}?`;
        hints = [`Think about the main category of ${correctSubcategory}`];
        correctAnswer = {
          category,
          displayName: category.charAt(0).toUpperCase() + category.slice(1),
        };
        
        // Generate wrong options
        options = [correctAnswer];
        Object.keys(this.flavorWheel).forEach(cat => {
          if (cat !== category && options.length < 4) {
            options.push({
              category: cat,
              displayName: cat.charAt(0).toUpperCase() + cat.slice(1),
            });
          }
        });
        break;

      case 'match':
        const specifics = categoryData.specifics[correctSubcategory] || [];
        const specificFlavor = specifics[Math.floor(Math.random() * specifics.length)];
        
        description = `Match "${specificFlavor}" to its flavor subcategory`;
        hints = [`${specificFlavor} belongs to the ${category} family`];
        correctAnswer = {
          category,
          subcategory: correctSubcategory,
          displayName: correctSubcategory.replace('_', ' '),
        };
        
        // Generate options from same category
        options = subcategories.slice(0, 4).map(sub => ({
          category,
          subcategory: sub,
          displayName: sub.replace('_', ' '),
        }));
        break;

      case 'compare':
        description = `Which of these is NOT typically found in the ${category} category?`;
        hints = [`One of these belongs to a different flavor family`];
        
        // Pick a wrong answer from different category
        const wrongCategory = Object.keys(this.flavorWheel).find(c => c !== category)!;
        const wrongData = this.flavorWheel[wrongCategory as keyof typeof this.flavorWheel];
        const wrongSubcategory = wrongData.subcategories[0];
        
        correctAnswer = {
          category: wrongCategory,
          subcategory: wrongSubcategory,
          displayName: wrongSubcategory.replace('_', ' '),
        };
        
        // Mix correct category options with the wrong one
        options = subcategories.slice(0, 3).map(sub => ({
          category,
          subcategory: sub,
          displayName: sub.replace('_', ' '),
        }));
        options.push(correctAnswer);
        break;

      case 'describe':
        description = `How would you describe the difference between ${subcategories[0]} and ${subcategories[1]} in the ${category} category?`;
        hints = [
          `Consider the intensity and character of each`,
          `Think about when you might taste each one`,
        ];
        correctAnswer = {
          category,
          displayName: 'See explanation',
        };
        options = []; // Free-form answer for describe
        break;
    }

    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);

    return {
      id: generateUUID(),
      type,
      description,
      hints,
      correctAnswer,
      options,
      difficulty: Math.floor(Math.random() * (difficulty.max - difficulty.min + 1)) + difficulty.min,
      points: difficulty.points,
    };
  }

  private calculateMasteryScore(
    accuracy: number,
    exposureCount: number,
    confidence: number
  ): number {
    // Weighted scoring
    const accuracyWeight = 0.5;
    const exposureWeight = 0.3;
    const confidenceWeight = 0.2;

    // Normalize exposure (cap at 50)
    const normalizedExposure = Math.min(exposureCount / 50, 1);
    
    // Normalize confidence (1-5 to 0-1)
    const normalizedConfidence = (confidence - 1) / 4;

    const score = 
      (accuracy * accuracyWeight) +
      (normalizedExposure * exposureWeight) +
      (normalizedConfidence * confidenceWeight);

    return Math.round(score * 100);
  }

  private getMasteryLevel(score: number): MasteryLevel['level'] {
    if (score >= 90) return 'master';
    if (score >= 75) return 'expert';
    if (score >= 60) return 'proficient';
    if (score >= 40) return 'apprentice';
    return 'novice';
  }

  private getNextMilestone(
    currentLevel: MasteryLevel['level'],
    currentScore: number
  ): { description: string; progress: number } {
    const milestones = {
      novice: { threshold: 40, next: 'apprentice' },
      apprentice: { threshold: 60, next: 'proficient' },
      proficient: { threshold: 75, next: 'expert' },
      expert: { threshold: 90, next: 'master' },
      master: { threshold: 100, next: 'master' },
    };

    const current = milestones[currentLevel];
    const progress = currentLevel === 'master' 
      ? 1 
      : (currentScore - (milestones[currentLevel === 'novice' ? 'novice' : 
          currentLevel === 'apprentice' ? 'novice' :
          currentLevel === 'proficient' ? 'apprentice' :
          'proficient'].threshold)) / 
        (current.threshold - (milestones[currentLevel === 'novice' ? 'novice' : 
          currentLevel === 'apprentice' ? 'novice' :
          currentLevel === 'proficient' ? 'apprentice' :
          'proficient'].threshold));

    return {
      description: currentLevel === 'master' 
        ? 'You have mastered this category!' 
        : `Reach ${current.threshold}% to become ${current.next}`,
      progress: Math.max(0, Math.min(1, progress)),
    };
  }

  private getSuggestedPractices(category: string, accuracy: number): string[] {
    const practices: string[] = [];

    if (accuracy < 0.5) {
      practices.push(
        `Start with basic ${category} identification exercises`,
        `Focus on the most common ${category} flavors first`,
        `Compare ${category} flavors side by side`,
      );
    } else if (accuracy < 0.7) {
      practices.push(
        `Practice distinguishing ${category} subcategories`,
        `Try blind tasting to improve accuracy`,
        `Keep a flavor journal for ${category} notes`,
      );
    } else {
      practices.push(
        `Challenge yourself with rare ${category} flavors`,
        `Try to identify specific ${category} descriptors`,
        `Help others learn ${category} flavors`,
      );
    }

    return practices;
  }

  /**
   * Generate a flavor wheel visualization data
   */
  getFlavorWheelData(): any {
    // Convert internal flavor wheel to visualization format
    const data = {
      name: 'Flavors',
      children: Object.entries(this.flavorWheel).map(([category, catData]) => ({
        name: category,
        children: catData.subcategories.map(subcategory => ({
          name: subcategory,
          children: (catData.specifics[subcategory] || []).map(specific => ({
            name: specific,
            value: 1,
          })),
        })),
      })),
    };

    return data;
  }

  /**
   * Get user's flavor mastery summary
   */
  async getUserFlavorMasterySummary(userId: string): Promise<Map<string, MasteryLevel>> {
    const summary = new Map<string, MasteryLevel>();
    
    for (const category of Object.keys(this.flavorWheel)) {
      const mastery = await this.evaluateFlavorMastery(userId, category);
      summary.set(category, mastery);
    }

    return summary;
  }
}