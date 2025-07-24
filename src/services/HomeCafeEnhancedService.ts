import { isKoreanMarket } from './i18n';

/**
 * Enhanced HomeCafe Service for Advanced Pourover Features
 * Targeting serious home baristas with professional brewing guidance
 */

export interface DripperSpec {
  name: string;
  korean: string;
  brand: string;
  material: string;
  sizes: DripperSize[];
  angles: string;
  flowRate: 'fast' | 'medium' | 'slow';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  characteristics: string[];
  recommendedTechniques: string[];
  icon: string;
}

export interface DripperSize {
  size: string;
  capacity: string;
  cupCount: string;
  filterType: string;
  defaultRatio: string;
  recommendedDose: number[];
}

export interface RecipeTemplate {
  id: string;
  name: string;
  korean: string;
  author: string;
  championship?: string;
  year?: number;
  dripper: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  recipe: {
    doseIn: number;
    waterAmount: number;
    ratio: string;
    waterTemp: number;
    grindSize: string;
    totalBrewTime: number;
    steps: BrewingStep[];
  };
  notes: string[];
  tags: string[];
}

export interface BrewingStep {
  stepNumber: number;
  time: number; // seconds from start
  action: 'pour' | 'wait' | 'stir' | 'swirl';
  waterAmount?: number;
  description: string;
  korean: string;
  pourPattern?: 'center' | 'spiral' | 'pulse';
  technique?: string;
}

export interface GrindGuide {
  dripper: string;
  grindSize: string;
  korean: string;
  description: string;
  visualReference: string;
  commonSettings: {
    grinder: string;
    setting: string;
  }[];
  adjustment: {
    tooFast: string;
    tooSlow: string;
  };
}

export class HomeCafeEnhancedService {
  private static instance: HomeCafeEnhancedService;

  private constructor() {}

  static getInstance(): HomeCafeEnhancedService {
    if (!HomeCafeEnhancedService.instance) {
      HomeCafeEnhancedService.instance = new HomeCafeEnhancedService();
    }
    return HomeCafeEnhancedService.instance;
  }

  /**
   * Enhanced dripper specifications with detailed characteristics
   */
  getDripperSpecs(): DripperSpec[] {
    return [
      {
        name: 'V60',
        korean: '브이60',
        brand: 'Hario',
        material: 'Ceramic/Plastic/Glass/Metal',
        angles: '60°',
        flowRate: 'fast',
        difficulty: 'intermediate',
        characteristics: [
          'Single large hole',
          'Spiral ribs for air flow',
          'Fast drainage',
          'Technique-sensitive'
        ],
        recommendedTechniques: ['pulse', 'spiral', 'center'],
        icon: '⏳',
        sizes: [
          {
            size: '01',
            capacity: '1-2 cups',
            cupCount: '1-2잔',
            filterType: 'V60-01 Filter',
            defaultRatio: '1:15',
            recommendedDose: [15, 20, 25]
          },
          {
            size: '02',
            capacity: '1-4 cups', 
            cupCount: '1-4잔',
            filterType: 'V60-02 Filter',
            defaultRatio: '1:15',
            recommendedDose: [20, 25, 30, 35]
          },
          {
            size: '03',
            capacity: '3-6 cups',
            cupCount: '3-6잔', 
            filterType: 'V60-03 Filter',
            defaultRatio: '1:15',
            recommendedDose: [30, 40, 50]
          }
        ]
      },
      {
        name: 'Kalita Wave',
        korean: '칼리타 웨이브',
        brand: 'Kalita',
        material: 'Stainless Steel/Glass',
        angles: 'Flat bottom',
        flowRate: 'medium',
        difficulty: 'beginner',
        characteristics: [
          'Three small holes',
          'Flat bottom design',
          'Even extraction',
          'More forgiving'
        ],
        recommendedTechniques: ['pulse', 'continuous'],
        icon: '〰️',
        sizes: [
          {
            size: '155',
            capacity: '1-2 cups',
            cupCount: '1-2잔',
            filterType: 'Wave 155 Filter',
            defaultRatio: '1:16',
            recommendedDose: [15, 20, 25]
          },
          {
            size: '185',
            capacity: '2-4 cups',
            cupCount: '2-4잔',
            filterType: 'Wave 185 Filter', 
            defaultRatio: '1:16',
            recommendedDose: [25, 30, 35]
          }
        ]
      },
      {
        name: 'Chemex',
        korean: '케멕스',
        brand: 'Chemex',
        material: 'Borosilicate Glass',
        angles: 'Wide opening',
        flowRate: 'slow',
        difficulty: 'intermediate',
        characteristics: [
          'Thick bonded filters',
          'Clean cup profile', 
          'Low bitterness',
          'Bright acidity'
        ],
        recommendedTechniques: ['pulse', 'spiral'],
        icon: '⏳',
        sizes: [
          {
            size: '3-cup',
            capacity: '3 cups',
            cupCount: '3컵',
            filterType: 'Chemex Circle Filter',
            defaultRatio: '1:17',
            recommendedDose: [20, 25, 30]
          },
          {
            size: '6-cup',
            capacity: '6 cups',
            cupCount: '6컵',
            filterType: 'Chemex Circle Filter',
            defaultRatio: '1:17',
            recommendedDose: [35, 42, 50]
          }
        ]
      },
      {
        name: 'Origami',
        korean: '오리가미',
        brand: 'Origami',
        material: 'Ceramic',
        angles: 'Variable ribs',
        flowRate: 'fast',
        difficulty: 'advanced',
        characteristics: [
          '20 ribs design',
          'Two filter options',
          'V60 or Wave filters',
          'Flexible brewing'
        ],
        recommendedTechniques: ['spiral', 'pulse', 'center'],
        icon: '🗾',
        sizes: [
          {
            size: 'S',
            capacity: '1-2 cups',
            cupCount: '1-2잔',
            filterType: 'V60-01 or Wave 155',
            defaultRatio: '1:15',
            recommendedDose: [15, 20, 25]
          },
          {
            size: 'M',
            capacity: '1-4 cups',
            cupCount: '1-4잔',
            filterType: 'V60-02 or Wave 185',
            defaultRatio: '1:15',
            recommendedDose: [20, 30, 40]
          }
        ]
      }
    ];
  }

  /**
   * World Champion Recipe Templates
   */
  getRecipeTemplates(): RecipeTemplate[] {
    return [
      {
        id: 'tetsu_kasuya_4_6',
        name: '4:6 Method',
        korean: '4:6 메소드',
        author: 'Tetsu Kasuya',
        championship: 'World Brewers Cup',
        year: 2016,
        dripper: 'V60',
        difficulty: 'intermediate',
        description: 'Famous 4:6 ratio method for controlling sweetness and strength',
        recipe: {
          doseIn: 20,
          waterAmount: 300,
          ratio: '1:15',
          waterTemp: 92,
          grindSize: 'Medium-coarse',
          totalBrewTime: 210,
          steps: [
            {
              stepNumber: 1,
              time: 0,
              action: 'pour',
              waterAmount: 60,
              description: 'First pour - center to control sweetness',
              korean: '1차 붓기 - 중앙에 천천히',
              pourPattern: 'center'
            },
            {
              stepNumber: 2,
              time: 45,
              action: 'pour',
              waterAmount: 60,
              description: 'Second pour - center to control sweetness',
              korean: '2차 붓기 - 중앙에 천천히',
              pourPattern: 'center'
            },
            {
              stepNumber: 3,
              time: 90,
              action: 'pour',
              waterAmount: 60,
              description: 'Third pour - control strength',
              korean: '3차 붓기 - 농도 조절',
              pourPattern: 'center'
            },
            {
              stepNumber: 4,
              time: 135,
              action: 'pour',
              waterAmount: 60,
              description: 'Fourth pour - control strength',
              korean: '4차 붓기 - 농도 조절',
              pourPattern: 'center'
            },
            {
              stepNumber: 5,
              time: 180,
              action: 'pour',
              waterAmount: 60,
              description: 'Final pour - complete extraction',
              korean: '마지막 붓기 - 추출 완료',
              pourPattern: 'center'
            }
          ]
        },
        notes: [
          'First 40% of water controls sweetness',
          'Last 60% of water controls strength',
          'Adjust grind size based on brew time'
        ],
        tags: ['world-champion', 'beginner-friendly', 'consistent']
      },
      {
        id: 'james_hoffmann_v60',
        name: 'Hoffmann V60 Method',
        korean: '호프만 V60 메소드',
        author: 'James Hoffmann',
        dripper: 'V60',
        difficulty: 'intermediate',
        description: 'Simple and consistent V60 method with emphasis on even extraction',
        recipe: {
          doseIn: 30,
          waterAmount: 500,
          ratio: '1:16.7',
          waterTemp: 95,
          grindSize: 'Medium-fine',
          totalBrewTime: 300,
          steps: [
            {
              stepNumber: 1,
              time: 0,
              action: 'pour',
              waterAmount: 60,
              description: 'Bloom pour - wet all grounds',
              korean: '블룸 - 모든 원두 적시기',
              pourPattern: 'spiral'
            },
            {
              stepNumber: 2,
              time: 30,
              action: 'stir',
              description: 'Gentle stir to ensure even saturation',
              korean: '부드럽게 젓기',
              technique: '1-2 gentle stirs'
            },
            {
              stepNumber: 3,
              time: 45,
              action: 'pour',
              waterAmount: 220,
              description: 'Pour in center, spiral outward',
              korean: '중앙에서 바깥으로 나선형',
              pourPattern: 'spiral'
            },
            {
              stepNumber: 4,
              time: 125,
              action: 'pour',
              waterAmount: 220,
              description: 'Final pour with same technique',
              korean: '마지막 붓기',
              pourPattern: 'spiral'
            }
          ]
        },
        notes: [
          'Focus on even wetting during bloom',
          'Maintain consistent pour speed',
          'Aim for 5-7 minute total brew time'
        ],
        tags: ['popular', 'consistent', 'even-extraction']
      },
      {
        id: 'onyx_kalita_wave',
        name: 'Onyx Kalita Wave',
        korean: '오닉스 칼리타 웨이브',
        author: 'Onyx Coffee Lab',
        dripper: 'KalitaWave',
        difficulty: 'beginner',
        description: 'Simple and forgiving Kalita Wave method',
        recipe: {
          doseIn: 22,
          waterAmount: 350,
          ratio: '1:16',
          waterTemp: 93,
          grindSize: 'Medium',
          totalBrewTime: 270,
          steps: [
            {
              stepNumber: 1,
              time: 0,
              action: 'pour',
              waterAmount: 44,
              description: 'Bloom pour - 2x coffee weight',
              korean: '블룸 - 원두량의 2배',
              pourPattern: 'center'
            },
            {
              stepNumber: 2,
              time: 30,
              action: 'pour',
              waterAmount: 153,
              description: 'Pour to 197g total weight',
              korean: '197g까지 붓기',
              pourPattern: 'spiral'
            },
            {
              stepNumber: 3,
              time: 90,
              action: 'pour',
              waterAmount: 153,
              description: 'Pour to 350g total weight',
              korean: '350g까지 붓기',
              pourPattern: 'spiral'
            }
          ]
        },
        notes: [
          'Very forgiving brewing method',
          'Hard to over-extract',
          'Great for beginners'
        ],
        tags: ['beginner', 'forgiving', 'simple']
      }
    ];
  }

  /**
   * Grind size guidance with visual references
   */
  getGrindGuides(): GrindGuide[] {
    return [
      {
        dripper: 'V60',
        grindSize: 'Medium-fine',
        korean: '중간-가는',
        description: 'Like table salt or fine sand',
        visualReference: '굵은 소금 또는 고운 모래',
        commonSettings: [
          { grinder: 'Baratza Encore', setting: '15' },
          { grinder: 'Comandante C40', setting: '18-22 clicks' },
          { grinder: 'Hario Mini Mill', setting: '7-8 clicks' },
          { grinder: 'Timemore C2', setting: '12-15 clicks' }
        ],
        adjustment: {
          tooFast: 'Grind finer (더 곱게) - brew time under 2:30',
          tooSlow: 'Grind coarser (더 굵게) - brew time over 4:00'
        }
      },
      {
        dripper: 'KalitaWave',
        grindSize: 'Medium',
        korean: '중간',
        description: 'Like coarse sea salt',
        visualReference: '굵은 바다소금',
        commonSettings: [
          { grinder: 'Baratza Encore', setting: '20' },
          { grinder: 'Comandante C40', setting: '25-28 clicks' },
          { grinder: 'Hario Mini Mill', setting: '10-11 clicks' },
          { grinder: 'Timemore C2', setting: '18-20 clicks' }
        ],
        adjustment: {
          tooFast: 'Grind finer (더 곱게) - brew time under 3:00',
          tooSlow: 'Grind coarser (더 굵게) - brew time over 5:00'
        }
      },
      {
        dripper: 'Chemex',
        grindSize: 'Medium-coarse',
        korean: '중간-굵은',
        description: 'Like coarse breadcrumbs',
        visualReference: '굵은 빵가루',
        commonSettings: [
          { grinder: 'Baratza Encore', setting: '25-28' },
          { grinder: 'Comandante C40', setting: '30-35 clicks' },
          { grinder: 'Hario Mini Mill', setting: '12-13 clicks' },
          { grinder: 'Timemore C2', setting: '22-25 clicks' }
        ],
        adjustment: {
          tooFast: 'Grind finer (더 곱게) - brew time under 4:00',
          tooSlow: 'Grind coarser (더 굵게) - brew time over 6:00'
        }
      }
    ];
  }

  /**
   * Get recipe template by ID
   */
  getRecipeById(id: string): RecipeTemplate | undefined {
    return this.getRecipeTemplates().find(recipe => recipe.id === id);
  }

  /**
   * Get dripper spec by name
   */
  getDripperSpec(dripperName: string): DripperSpec | undefined {
    return this.getDripperSpecs().find(spec => spec.name === dripperName);
  }

  /**
   * Get grind guide for specific dripper
   */
  getGrindGuide(dripperName: string): GrindGuide | undefined {
    return this.getGrindGuides().find(guide => guide.dripper === dripperName);
  }

  /**
   * Calculate recommended recipe based on dripper and dose
   */
  calculateRecommendedRecipe(dripper: string, doseIn: number): Partial<RecipeTemplate['recipe']> {
    const spec = this.getDripperSpec(dripper);
    if (!spec) return {};

    const defaultRatio = spec.sizes[0]?.defaultRatio || '1:15';
    const ratio = parseFloat(defaultRatio.split(':')[1]);
    
    return {
      doseIn,
      waterAmount: Math.round(doseIn * ratio),
      ratio: defaultRatio,
      waterTemp: dripper === 'Chemex' ? 95 : 92,
      grindSize: this.getGrindGuide(dripper)?.grindSize || 'Medium'
    };
  }

  /**
   * Get beginner-friendly recipes
   */
  getBeginnerRecipes(): RecipeTemplate[] {
    return this.getRecipeTemplates().filter(recipe => recipe.difficulty === 'beginner');
  }

  /**
   * Get world champion recipes
   */
  getChampionRecipes(): RecipeTemplate[] {
    return this.getRecipeTemplates().filter(recipe => recipe.championship);
  }
}

export default HomeCafeEnhancedService;