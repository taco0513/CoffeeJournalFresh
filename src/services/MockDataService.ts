import { TastingData, HomeCafeData } from './realm/types';
import { SelectedSensoryExpression } from '../types/tasting';
import RealmService from './realm/RealmService';
import { RealmLogger } from '../utils/logger';

export enum MockDataScenario {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate', 
  EXPERT = 'expert',
  HOME_CAFE_FOCUSED = 'home_cafe_focused',
  STATISTICS_TEST = 'statistics_test'
}

export interface MockDataOptions {
  scenario: MockDataScenario;
  count: number;
  includeHomeCafe?: boolean;
  includePhotos?: boolean;
}

export class MockDataService {
  /**
   * Generate mock tasting records based on scenario
   */
  static generateTastingRecords(options: MockDataOptions): TastingData[] {
    const { scenario, count, includeHomeCafe = true } = options;
    
    switch (scenario) {
      case MockDataScenario.BEGINNER:
        return this.generateBeginnerData(count, includeHomeCafe);
      case MockDataScenario.INTERMEDIATE:
        return this.generateIntermediateData(count, includeHomeCafe);
      case MockDataScenario.EXPERT:
        return this.generateExpertData(count, includeHomeCafe);
      case MockDataScenario.HOME_CAFE_FOCUSED:
        return this.generateHomeCafeData(count);
      case MockDataScenario.STATISTICS_TEST:
        return this.generateStatisticsTestData(count, includeHomeCafe);
      default:
        return this.generateIntermediateData(count, includeHomeCafe);
    }
  }

  /**
   * Beginner-friendly data with simple flavor expressions
   */
  private static generateBeginnerData(count: number, includeHomeCafe: boolean): TastingData[] {
    const data: TastingData[] = [];
    const beginnerFlavors = [
      { level: 1, value: 'Sweet', koreanValue: '달콤한' },
      { level: 1, value: 'Bitter', koreanValue: '쓴맛' },
      { level: 1, value: 'Sour', koreanValue: '신맛' },
      { level: 2, value: 'Chocolate', koreanValue: '초콜릿' },
      { level: 2, value: 'Caramel', koreanValue: '캐러멜' },
      { level: 2, value: 'Nutty', koreanValue: '견과류' }
    ];

    const cafes = ['스타벅스', '투썸플레이스', '메가커피', '커피빈'];
    const roasteries = ['스타벅스', '투썸', '메가커피', '커피빈'];
    const coffeeNames = ['아메리카노', '카페라떼', '카푸치노', '브루드커피'];

    for (let i = 0; i < count; i++) {
      const isHomeCafe = includeHomeCafe && Math.random() > 0.7;
      
      data.push({
        coffeeInfo: {
          cafeName: isHomeCafe ? undefined : cafes[i % cafes.length],
          roastery: roasteries[i % roasteries.length],
          coffeeName: coffeeNames[i % coffeeNames.length],
          origin: ['브라질', '콜롬비아', '에티오피아', '과테말라'][i % 4],
          variety: ['아라비카', '로부스타'][i % 2],
          altitude: ['1200m', '1500m', '1800m'][i % 3],
          process: ['워시드', '내추럴', '허니'][i % 3],
          temperature: ['hot', 'cold'][i % 2] as 'hot' | 'cold'
        },
        roasterNotes: `초보자를 위한 ${i + 1}번째 커피 테이스팅`,
        selectedFlavors: beginnerFlavors.slice(0, Math.floor(Math.random() * 3) + 1),
        selectedSensoryExpressions: this.generateBeginnerSensoryData(),
        sensoryAttributes: {
          body: Math.floor(Math.random() * 3) + 2, // 2-4 range
          acidity: Math.floor(Math.random() * 3) + 2,
          sweetness: Math.floor(Math.random() * 3) + 2,
          finish: Math.floor(Math.random() * 3) + 2,
          mouthfeel: ['Clean', 'Creamy'][Math.floor(Math.random() * 2)] as 'Clean' | 'Creamy',
          bitterness: Math.floor(Math.random() * 3) + 2,
          balance: Math.floor(Math.random() * 3) + 2
        },
        matchScore: {
          total: Math.floor(Math.random() * 30) + 60, // 60-90 range
          flavorScore: Math.floor(Math.random() * 15) + 30,
          sensoryScore: Math.floor(Math.random() * 15) + 30
        },
        personalComment: `초보자 관점에서 ${i + 1}번째 커피 경험`,
        mode: isHomeCafe ? 'home_cafe' : 'cafe',
        homeCafeData: isHomeCafe ? this.generateSimpleHomeCafeData() : undefined
      });
    }

    return data;
  }

  /**
   * Intermediate data with moderate complexity
   */
  private static generateIntermediateData(count: number, includeHomeCafe: boolean): TastingData[] {
    const data: TastingData[] = [];
    const intermediateFlavors = [
      { level: 1, value: 'Fruity', koreanValue: '과일향' },
      { level: 2, value: 'Berry', koreanValue: '베리류' },
      { level: 3, value: 'Blueberry', koreanValue: '블루베리' },
      { level: 1, value: 'Floral', koreanValue: '꽃향' },
      { level: 2, value: 'White Floral', koreanValue: '흰 꽃' },
      { level: 3, value: 'Jasmine', koreanValue: '자스민' },
      { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
      { level: 2, value: 'Dark Chocolate', koreanValue: '다크 초콜릿' }
    ];

    const specialtyCafes = ['블루보틀', '스터프드', '프리츠', '앤트라사이트'];
    const specialtyRoasteries = ['커피리브레', '테라로사', '드롭탑', '빈브라더스'];
    const specialtyCoffees = ['에티오피아 예가체프', '케냐 AA', '과테말라 안티구아', '코스타리카 타라주'];

    for (let i = 0; i < count; i++) {
      const isHomeCafe = includeHomeCafe && Math.random() > 0.5;
      
      data.push({
        coffeeInfo: {
          cafeName: isHomeCafe ? undefined : specialtyCafes[i % specialtyCafes.length],
          roastery: specialtyRoasteries[i % specialtyRoasteries.length],
          coffeeName: specialtyCoffees[i % specialtyCoffees.length],
          origin: ['Ethiopia', 'Kenya', 'Guatemala', 'Costa Rica'][i % 4],
          variety: ['Heirloom', 'SL28', 'Bourbon', 'Catuai'][i % 4],
          altitude: ['1600m', '1800m', '2000m', '2200m'][i % 4],
          process: ['Washed', 'Natural', 'Honey', 'Anaerobic'][i % 4],
          temperature: ['hot', 'cold'][i % 2] as 'hot' | 'cold'
        },
        roasterNotes: `중급자를 위한 스페셜티 커피 #${i + 1}. 복합적인 향미 프로필을 가진 커피`,
        selectedFlavors: intermediateFlavors.slice(0, Math.floor(Math.random() * 5) + 2),
        selectedSensoryExpressions: this.generateIntermediateSensoryData(),
        sensoryAttributes: {
          body: Math.floor(Math.random() * 5) + 1,
          acidity: Math.floor(Math.random() * 5) + 1,
          sweetness: Math.floor(Math.random() * 5) + 1,
          finish: Math.floor(Math.random() * 5) + 1,
          mouthfeel: ['Clean', 'Creamy', 'Juicy', 'Silky'][Math.floor(Math.random() * 4)] as any,
          bitterness: Math.floor(Math.random() * 5) + 1,
          balance: Math.floor(Math.random() * 5) + 1
        },
        matchScore: {
          total: Math.floor(Math.random() * 40) + 70, // 70-100 range
          flavorScore: Math.floor(Math.random() * 20) + 35,
          sensoryScore: Math.floor(Math.random() * 20) + 35
        },
        personalComment: `중급자 테이스팅 노트 #${i + 1}: 향미의 복합성과 균형감이 인상적`,
        mode: isHomeCafe ? 'home_cafe' : 'cafe',
        homeCafeData: isHomeCafe ? this.generateDetailedHomeCafeData() : undefined
      });
    }

    return data;
  }

  /**
   * Expert data with complex flavor profiles
   */
  private static generateExpertData(count: number, includeHomeCafe: boolean): TastingData[] {
    const data: TastingData[] = [];
    const expertFlavors = [
      { level: 1, value: 'Fruity', koreanValue: '과일향' },
      { level: 2, value: 'Stone Fruit', koreanValue: '핵과류' },
      { level: 3, value: 'Peach', koreanValue: '복숭아' },
      { level: 4, value: 'White Peach', koreanValue: '백도' },
      { level: 1, value: 'Floral', koreanValue: '꽃향' },
      { level: 2, value: 'Rose', koreanValue: '장미' },
      { level: 3, value: 'Tea Rose', koreanValue: '차장미' },
      { level: 1, value: 'Spices', koreanValue: '향신료' },
      { level: 2, value: 'Sweet Spice', koreanValue: '달콤한 향신료' },
      { level: 3, value: 'Cinnamon', koreanValue: '계피' },
      { level: 4, value: 'Ceylon Cinnamon', koreanValue: '실론 계피' }
    ];

    const expertCafes = ['망원동티아이피', '카페온즈', '브라운핸즈', '디저트39'];
    const expertRoasteries = ['감각커피', '빈스빈스', '카페드롭', '마메스'];
    const expertCoffees = ['파나마 게이샤', '자메이카 블루마운틴', '하와이 코나', '예멘 모카'];

    for (let i = 0; i < count; i++) {
      const isHomeCafe = includeHomeCafe && Math.random() > 0.3;
      
      data.push({
        coffeeInfo: {
          cafeName: isHomeCafe ? undefined : expertCafes[i % expertCafes.length],
          roastery: expertRoasteries[i % expertRoasteries.length],
          coffeeName: expertCoffees[i % expertCoffees.length],
          origin: ['Panama', 'Jamaica', 'Hawaii', 'Yemen'][i % 4],
          variety: ['Geisha', 'Typica', 'Bourbon', 'Mocha'][i % 4],
          altitude: ['1800m', '2000m', '2200m', '2400m'][i % 4],
          process: ['Washed', 'Natural', 'Honey', 'Carbonic Maceration'][i % 4],
          temperature: 'hot' as const
        },
        roasterNotes: `프리미엄 스페셜티 커피 #${i + 1}. 테루아의 특성과 가공법의 조화가 만들어낸 복합적 향미`,
        selectedFlavors: expertFlavors.slice(0, Math.floor(Math.random() * 8) + 4),
        selectedSensoryExpressions: this.generateExpertSensoryData(),
        sensoryAttributes: {
          body: Math.floor(Math.random() * 5) + 1,
          acidity: Math.floor(Math.random() * 5) + 1,
          sweetness: Math.floor(Math.random() * 5) + 1,
          finish: Math.floor(Math.random() * 5) + 1,
          mouthfeel: ['Clean', 'Creamy', 'Juicy', 'Silky'][Math.floor(Math.random() * 4)] as any,
          bitterness: Math.floor(Math.random() * 5) + 1,
          balance: Math.floor(Math.random() * 5) + 1
        },
        matchScore: {
          total: Math.floor(Math.random() * 30) + 80, // 80-100 range
          flavorScore: Math.floor(Math.random() * 15) + 40,
          sensoryScore: Math.floor(Math.random() * 15) + 40
        },
        personalComment: `전문가 큐핑 노트 #${i + 1}: 테루아의 독창성과 가공법의 정교함이 조화롭게 표현된 exceptional coffee`,
        mode: isHomeCafe ? 'home_cafe' : 'cafe',
        homeCafeData: isHomeCafe ? this.generateExpertHomeCafeData() : undefined
      });
    }

    return data;
  }

  /**
   * HomeCafe focused data
   */
  private static generateHomeCafeData(count: number): TastingData[] {
    const data: TastingData[] = [];
    const drippers = ['V60', 'KalitaWave', 'Origami', 'Chemex', 'FellowStagg'] as const;
    const filters = ['bleached', 'natural', 'wave', 'chemex'] as const;
    const pourTechniques = ['center', 'spiral', 'pulse', 'continuous'] as const;
    const grinders = [
      { brand: '커맨단테', model: 'C40' },
      { brand: '하리오', model: 'Mini Mill Slim' },
      { brand: '바라짜', model: 'Encore' },
      { brand: '펠로우', model: 'Ode' }
    ];

    for (let i = 0; i < count; i++) {
      const grinder = grinders[i % grinders.length];
      const dripper = drippers[i % drippers.length];
      
      data.push({
        coffeeInfo: {
          roastery: `홈카페 로스터리 ${i + 1}`,
          coffeeName: `홈카페 원두 ${i + 1}`,
          origin: ['Ethiopia', 'Colombia', 'Kenya', 'Guatemala'][i % 4],
          variety: ['Heirloom', 'Caturra', 'SL28', 'Bourbon'][i % 4],
          altitude: ['1600m', '1800m', '2000m'][i % 3],
          process: ['Washed', 'Natural', 'Honey'][i % 3],
          temperature: 'hot' as const
        },
        roasterNotes: `홈카페 실험 #${i + 1} - ${dripper} 추출법 테스트`,
        selectedFlavors: [
          { level: 1, value: 'Fruity', koreanValue: '과일향' },
          { level: 2, value: 'Berry', koreanValue: '베리류' }
        ],
        selectedSensoryExpressions: this.generateHomeCafeSensoryData(),
        sensoryAttributes: {
          body: Math.floor(Math.random() * 5) + 1,
          acidity: Math.floor(Math.random() * 5) + 1,
          sweetness: Math.floor(Math.random() * 5) + 1,
          finish: Math.floor(Math.random() * 5) + 1,
          mouthfeel: 'Clean' as const,
          bitterness: Math.floor(Math.random() * 5) + 1,
          balance: Math.floor(Math.random() * 5) + 1
        },
        matchScore: {
          total: Math.floor(Math.random() * 50) + 50,
          flavorScore: Math.floor(Math.random() * 25) + 25,
          sensoryScore: Math.floor(Math.random() * 25) + 25
        },
        personalComment: `홈카페 실험 기록 #${i + 1}`,
        mode: 'home_cafe',
        homeCafeData: {
          equipment: {
            dripper: dripper as any,
            dripperSize: dripper === 'V60' ? '02' : dripper === 'KalitaWave' ? '185' : undefined,
            filter: filters[i % filters.length] as any,
            grinder: {
              brand: grinder.brand,
              model: grinder.model,
              setting: `${Math.floor(Math.random() * 20) + 10}클릭`
            },
            server: '하리오 서버 600ml',
            scale: 'Acaia Pearl',
            kettle: '펠로우 스태그 EKG'
          },
          recipe: {
            doseIn: Math.floor(Math.random() * 5) + 15, // 15-20g
            waterAmount: Math.floor(Math.random() * 50) + 240, // 240-290ml
            ratio: `1:${Math.floor(Math.random() * 3) + 15}`, // 1:15 to 1:17
            waterTemp: Math.floor(Math.random() * 5) + 91, // 91-95°C
            bloomWater: 30 + Math.floor(Math.random() * 10), // 30-40g
            bloomTime: 30 + Math.floor(Math.random() * 15), // 30-45s
            bloomAgitation: Math.random() > 0.5,
            pourTechnique: pourTechniques[i % pourTechniques.length] as any,
            numberOfPours: Math.floor(Math.random() * 3) + 2, // 2-4 pours
            totalBrewTime: Math.floor(Math.random() * 60) + 150, // 2.5-3.5 minutes
            drawdownTime: Math.floor(Math.random() * 30) + 20, // 20-50s
            agitation: ['none', 'swirl', 'stir'][i % 3] as any,
            agitationTiming: '마지막 붓기 후'
          },
          notes: {
            grindAdjustment: `${Math.floor(Math.random() * 3) + 1}클릭 더 굵게`,
            channeling: Math.random() > 0.8,
            mudBed: Math.random() > 0.9,
            tasteResult: '산미가 밝아지고 단맛이 더 선명해짐',
            nextExperiment: '물온도를 2도 낮춰서 시도해보기'
          }
        }
      });
    }

    return data;
  }

  /**
   * Large dataset for statistics testing
   */
  private static generateStatisticsTestData(count: number, includeHomeCafe: boolean): TastingData[] {
    const data: TastingData[] = [];
    
    // Generate diverse data for statistical analysis
    for (let i = 0; i < count; i++) {
      const scenario = Math.floor(Math.random() * 3);
      
      if (scenario === 0) {
        data.push(...this.generateBeginnerData(1, includeHomeCafe));
      } else if (scenario === 1) {
        data.push(...this.generateIntermediateData(1, includeHomeCafe));
      } else {
        data.push(...this.generateExpertData(1, includeHomeCafe));
      }
    }

    return data;
  }

  /**
   * Generate beginner-level sensory expressions
   */
  private static generateBeginnerSensoryData(): SelectedSensoryExpression[] {
    const beginnerExpressions = [
      { category: '산미', expression: '싱그러운', isSelected: true },
      { category: '단맛', expression: '달콤한', isSelected: true },
      { category: '바디', expression: '부드러운', isSelected: true }
    ];
    
    return beginnerExpressions.slice(0, Math.floor(Math.random() * 2) + 1);
  }

  /**
   * Generate intermediate-level sensory expressions
   */
  private static generateIntermediateSensoryData(): SelectedSensoryExpression[] {
    const intermediateExpressions = [
      { category: '산미', expression: '발랄한', isSelected: true },
      { category: '단맛', expression: '농밀한', isSelected: true },
      { category: '쓴맛', expression: '카카오 같은', isSelected: true },
      { category: '바디', expression: '크리미한', isSelected: true },
      { category: '애프터', expression: '길게 남는', isSelected: true }
    ];
    
    return intermediateExpressions.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  /**
   * Generate expert-level sensory expressions
   */
  private static generateExpertSensoryData(): SelectedSensoryExpression[] {
    const expertExpressions = [
      { category: '산미', expression: '와인 같은', isSelected: true },
      { category: '단맛', expression: '꿀 같은', isSelected: true },
      { category: '쓴맛', expression: '다크 초콜릿 같은', isSelected: true },
      { category: '바디', expression: '벨벳 같은', isSelected: true },
      { category: '애프터', expression: '복합적인', isSelected: true },
      { category: '밸런스', expression: '조화로운', isSelected: true }
    ];
    
    return expertExpressions.slice(0, Math.floor(Math.random() * 4) + 3);
  }

  /**
   * Generate HomeCafe-specific sensory expressions
   */
  private static generateHomeCafeSensoryData(): SelectedSensoryExpression[] {
    const homeCafeExpressions = [
      { category: '산미', expression: '밝은', isSelected: true },
      { category: '단맛', expression: '은은한', isSelected: true },
      { category: '바디', expression: '깔끔한', isSelected: true }
    ];
    
    return homeCafeExpressions;
  }

  /**
   * Generate simple HomeCafe data for beginners
   */
  private static generateSimpleHomeCafeData(): HomeCafeData {
    return {
      equipment: {
        brewingMethod: 'French Press' as any,
        grinder: {
          brand: '하리오',
          model: 'Mini Mill',
          setting: '중간'
        }
      },
      recipe: {
        doseIn: 20,
        waterAmount: 300,
        ratio: '1:15',
        waterTemp: 95,
        totalBrewTime: 240
      },
      notes: {
        result: '처음 시도해본 홈브루잉, 생각보다 괜찮았음'
      }
    };
  }

  /**
   * Generate detailed HomeCafe data for intermediate users
   */
  private static generateDetailedHomeCafeData(): HomeCafeData {
    return {
      equipment: {
        brewingMethod: 'V60' as any,
        grinder: {
          brand: '커맨단테',
          model: 'C40',
          setting: '18클릭'
        },
        filter: 'V60 필터 #02',
        other: '구스넥 주전자, 디지털 저울'
      },
      recipe: {
        doseIn: 22,
        waterAmount: 350,
        ratio: '1:16',
        waterTemp: 93,
        bloomTime: 45,
        totalBrewTime: 180,
        pourPattern: '3번 나누어 붓기'
      },
      notes: {
        previousChange: '그라인딩을 1클릭 더 굵게 조정',
        result: '산미가 더 밝아지고 균형감이 좋아짐',
        nextExperiment: '블룸 시간을 15초 더 늘려보기'
      }
    };
  }

  /**
   * Generate expert-level HomeCafe data
   */
  private static generateExpertHomeCafeData(): HomeCafeData {
    const expertDrippers = ['V60', 'Origami', 'April', 'Orea'] as const;
    const expertTechniques = ['spiral', 'pulse', 'multiStage'] as const;
    
    return {
      equipment: {
        dripper: expertDrippers[Math.floor(Math.random() * expertDrippers.length)] as any,
        dripperSize: '02',
        filter: 'bleached' as any,
        grinder: {
          brand: 'EK43',
          model: 'Mahlkonig',
          setting: '8.5'
        },
        server: 'Hario V60 Range Server',
        scale: 'Acaia Lunar',
        kettle: 'Fellow Stagg EKG Pro'
      },
      recipe: {
        doseIn: 20,
        waterAmount: 320,
        ratio: '1:16',
        waterTemp: 93,
        bloomWater: 40,
        bloomTime: 45,
        bloomAgitation: true,
        pourTechnique: expertTechniques[Math.floor(Math.random() * expertTechniques.length)] as any,
        numberOfPours: 5,
        pourIntervals: [45, 30, 30, 30, 30],
        totalBrewTime: 210,
        drawdownTime: 25,
        agitation: 'swirl' as any,
        agitationTiming: '블룸 후, 마지막 붓기 후'
      },
      notes: {
        grindAdjustment: 'TDS 1.35 목표, 0.2 미세 조정',
        channeling: false,
        mudBed: false,
        tasteResult: '향미의 복합성이 극대화되면서도 클린한 피니시 달성',
        nextExperiment: '물의 미네랄 함량 조정을 통한 산미 밸런스 최적화'
      }
    };
  }

  /**
   * Create mock data in the database
   */
  static async createMockData(options: MockDataOptions): Promise<number> {
    try {
      const mockRecords = this.generateTastingRecords(options);
      const realmService = RealmService.getInstance();
      
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }

      let successCount = 0;
      
      for (const record of mockRecords) {
        try {
          await realmService.saveTasting(record);
          successCount++;
        } catch (error) {
          RealmLogger.error('realm', `Failed to save mock record: ${error}`, { record });
        }
      }

      RealmLogger.info('realm', `Created ${successCount} mock tasting records`, { 
        scenario: options.scenario,
        requested: options.count,
        created: successCount
      });

      return successCount;
    } catch (error) {
      RealmLogger.error('realm', 'Failed to create mock data', { error, options });
      throw error;
    }
  }

  /**
   * Clear all mock data from database
   */
  static async clearMockData(): Promise<void> {
    try {
      const realmService = RealmService.getInstance();
      
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }

      await realmService.clearAllTastings();
      
      RealmLogger.info('realm', 'Cleared all mock data successfully');
    } catch (error) {
      RealmLogger.error('realm', 'Failed to clear mock data', { error });
      throw error;
    }
  }

  /**
   * Validate mock data structure
   */
  static validateTastingData(data: TastingData): boolean {
    try {
      // Check required fields
      if (!data.coffeeInfo?.roastery || !data.coffeeInfo?.coffeeName) {
        RealmLogger.warn('Invalid coffee info', { roastery: data.coffeeInfo?.roastery, coffeeName: data.coffeeInfo?.coffeeName });
        return false;
      }

      // Check sensory attributes
      if (!data.sensoryAttributes?.body || !data.sensoryAttributes?.acidity) {
        RealmLogger.warn('Invalid sensory attributes', { body: data.sensoryAttributes?.body, acidity: data.sensoryAttributes?.acidity });
        return false;
      }

      // Check match score
      if (!data.matchScore?.total || data.matchScore.total < 0 || data.matchScore.total > 100) {
        RealmLogger.warn('Invalid match score', { total: data.matchScore?.total });
        return false;
      }

      // Check HomeCafe data if present
      if (data.mode === 'home_cafe' && data.homeCafeData) {
        if (!data.homeCafeData.equipment?.brewingMethod || !data.homeCafeData.recipe?.doseIn) {
          RealmLogger.warn('Invalid HomeCafe data', { 
            brewingMethod: data.homeCafeData.equipment?.brewingMethod, 
            doseIn: data.homeCafeData.recipe?.doseIn 
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      RealmLogger.error('Error validating mock data', { error });
      return false;
    }
  }

  /**
   * Get current mock data count
   */
  static async getMockDataCount(): Promise<number> {
    try {
      const realmService = RealmService.getInstance();
      
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }

      const tastings = await realmService.getTastingRecords({ isDeleted: false });
      return Array.from(tastings).length;
    } catch (error) {
      RealmLogger.error('realm', 'Failed to get mock data count', { error });
      return 0;
    }
  }
}