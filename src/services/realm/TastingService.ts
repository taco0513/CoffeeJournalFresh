import uuid from 'react-native-uuid';
import { BaseRealmService } from './BaseRealmService';
import { ITastingRecord, IFlavorNote, ISensoryAttribute } from './schemas';
import { RealmLogger } from '../../utils/logger';
import { CafeService } from './CafeService';
import { RoasterService } from './RoasterService';
import { CoffeeLibraryService } from './CoffeeLibraryService';
import { FlavorPath, SelectedSensoryExpression } from '../../types/tasting';
import { 
  TastingData, 
  TastingFilter, 
  CoffeeSearchResult, 
  SameCoffeeComparison, 
  SimilarCoffee 
} from './types';

export class TastingService {
  private static instance: TastingService;
  private baseService: BaseRealmService;
  private cafeService: CafeService;
  private roasterService: RoasterService;
  private coffeeLibraryService: CoffeeLibraryService;

  private constructor() {
    this.baseService = BaseRealmService.getInstance();
    this.cafeService = CafeService.getInstance();
    this.roasterService = RoasterService.getInstance();
    this.coffeeLibraryService = CoffeeLibraryService.getInstance();
  }

  static getInstance(): TastingService {
    if (!TastingService.instance) {
      TastingService.instance = new TastingService();
    }
    return TastingService.instance;
  }

  async saveTasting(data: TastingData): Promise<ITastingRecord> {
    
    // Ensure Realm is initialized before proceeding
    if (!this.baseService.isInitialized) {
      await this.baseService.initialize();
    }
    
    const realm = this.baseService.getRealm();
    
    try {
      let savedRecord: ITastingRecord;
      
      realm.write(() => {
        // Default values
        const defaultCoffeeInfo = {
          cafeName: '',
          roastery: 'Unknown',
          coffeeName: 'Unknown Coffee',
          origin: '',
          variety: '',
          altitude: '',
          process: '',
          temperature: 'hot' as const,
        };
        
        const defaultSensoryAttributes = {
          body: 3,
          acidity: 3,
          sweetness: 3,
          finish: 3,
          bitterness: 3,
          balance: 3,
          mouthfeel: 'Clean',
        };
        
        const defaultMatchScore = {
          total: 0,
          flavorScore: 0,
          sensoryScore: 0,
        };
        
        // Safe data extraction
        const safeData = {
          coffeeInfo: { ...defaultCoffeeInfo, ...(data.coffeeInfo || {}) },
          roasterNotes: data.roasterNotes || '',
          selectedFlavors: data.selectedFlavors || [],
          selectedSensoryExpressions: data.selectedSensoryExpressions || [],
          sensoryAttributes: { ...defaultSensoryAttributes, ...(data.sensoryAttributes || {}) },
          matchScore: { ...defaultMatchScore, ...(data.matchScore || {}) },
          personalComment: data.personalComment || '',
        };
        
        // Create flavor notes from selected flavors
        const flavorNotes: IFlavorNote[] = [];
        
        try {
          if (Array.isArray(safeData.selectedFlavors)) {
            safeData.selectedFlavors.forEach((flavorPath) => {
              if (flavorPath && typeof flavorPath === 'object') {
                // Handle test data format: { level, value, koreanValue }
                if ((flavorPath as any).level && (flavorPath as any).value) {
                  flavorNotes.push({
                    level: (flavorPath as any).level,
                    value: (flavorPath as any).value,
                    koreanValue: (flavorPath as any).koreanValue,
                  });
                }
                // Handle original format: { level1, level2, level3, level4 }
                else {
                  // Level 1 flavor
                  if (flavorPath.level1) {
                    flavorNotes.push({
                      level: 1,
                      value: flavorPath.level1,
                      koreanValue: undefined,
                    });
                  }
                  
                  // Level 2 flavor
                  if (flavorPath.level2) {
                    flavorNotes.push({
                      level: 2,
                      value: flavorPath.level2,
                      koreanValue: undefined,
                    });
                  }
                  
                  // Level 3 flavor
                  if (flavorPath.level3) {
                    flavorNotes.push({
                      level: 3,
                      value: flavorPath.level3,
                      koreanValue: undefined,
                    });
                  }
                  
                  // Level 4 flavor
                  if ((flavorPath as any).level4) {
                    flavorNotes.push({
                      level: 4,
                      value: (flavorPath as any).level4,
                      koreanValue: undefined,
                    });
                  }
                }
              }
            });
          }
        } catch (flavorError) {
          RealmLogger.error('realm', 'Error creating flavor notes', flavorError as Error);
        }
        
        // Create sensory attribute with safe access
        let sensoryAttribute: ISensoryAttribute;
        try {
          sensoryAttribute = {
            body: safeData.sensoryAttributes.body || 3,
            acidity: safeData.sensoryAttributes.acidity || 3,
            sweetness: safeData.sensoryAttributes.sweetness || 3,
            finish: safeData.sensoryAttributes.finish || 3,
            bitterness: safeData.sensoryAttributes.bitterness || 3,
            balance: safeData.sensoryAttributes.balance || 3,
            mouthfeel: (safeData.sensoryAttributes.mouthfeel || 'Clean') as 'Clean' | 'Creamy' | 'Juicy' | 'Silky',
          };
        } catch (sensoryError) {
          RealmLogger.error('realm', 'Error creating sensory attributes', sensoryError as Error);
          sensoryAttribute = defaultSensoryAttributes;
        }
        
        // Create the tasting record
        try {
          savedRecord = realm.create<ITastingRecord>('TastingRecord', {
            id: uuid.v4() as string,
            createdAt: new Date(),
            updatedAt: new Date(),
            
            // Coffee info
            cafeName: safeData.coffeeInfo.cafeName,
            roastery: safeData.coffeeInfo.roastery,
            coffeeName: safeData.coffeeInfo.coffeeName,
            origin: safeData.coffeeInfo.origin,
            variety: safeData.coffeeInfo.variety,
            altitude: safeData.coffeeInfo.altitude,
            process: safeData.coffeeInfo.process,
            temperature: safeData.coffeeInfo.temperature,
            
            // Tasting notes
            roasterNotes: safeData.roasterNotes,
            personalComment: data.personalComment || '',
            
            // Match scores
            matchScoreTotal: safeData.matchScore.total,
            matchScoreFlavor: safeData.matchScore.flavorScore,
            matchScoreSensory: safeData.matchScore.sensoryScore,
            
            // Relationships
            flavorNotes: flavorNotes,
            sensoryAttribute: sensoryAttribute,
            
            // Sensory expressions (stored as JSON string)
            selectedSensoryExpressions: JSON.stringify(safeData.selectedSensoryExpressions || []) as any,
            
            // Mode
            mode: data.mode || 'cafe',
            
            // Home Cafe Data (stored as JSON string)
            homeCafeData: data.homeCafeData ? JSON.stringify(data.homeCafeData) : 
                         (data as any).simpleHomeCafeData ? JSON.stringify((data as any).simpleHomeCafeData) :
                         (data as any).labModeData ? JSON.stringify((data as any).labModeData) : null,
            
            // Sync status
            isSynced: false,
            isDeleted: false,
          });
        } catch (recordError) {
          throw recordError;
        }
        
        // Update related services after successful record creation
        try {
          // Update coffee library
          this.coffeeLibraryService.updateCoffeeLibrary({
            roastery: safeData.coffeeInfo.roastery,
            coffeeName: safeData.coffeeInfo.coffeeName,
            origin: safeData.coffeeInfo.origin,
            variety: safeData.coffeeInfo.variety,
            altitude: safeData.coffeeInfo.altitude,
            process: safeData.coffeeInfo.process,
            roasterNotes: safeData.roasterNotes,
          });
          
          // Update cafe stats if cafe name provided
          if (safeData.coffeeInfo.cafeName) {
            this.cafeService.updateCafeFromTasting(safeData.coffeeInfo.cafeName);
          }
          
          // Update roaster stats
          this.roasterService.updateRoasterFromTasting(
            safeData.coffeeInfo.roastery,
            safeData.matchScore.total
          );
        } catch (updateError) {
          // Log error but don't fail the save operation
          RealmLogger.error('realm', 'Failed to update related services after tasting save', updateError as Error);
        }
      });
      
      return savedRecord!;
      
    } catch (error) {
      throw new Error(`Failed to save tasting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTastingRecords(filter?: TastingFilter): Promise<Realm.Results<ITastingRecord>> {
    if (!this.baseService.isInitialized) {
      await this.baseService.initialize();
    }
    
    const realm = this.baseService.getRealm();
    let query = realm.objects<ITastingRecord>('TastingRecord');
    
    if (filter) {
      let filterClauses: string[] = [];
      let filterValues: (string | boolean | Date | number)[] = [];
      
      if (filter.isDeleted !== undefined) {
        filterClauses.push('isDeleted = $' + filterValues.length);
        filterValues.push(filter.isDeleted);
      }
      
      if (filter.isSynced !== undefined) {
        filterClauses.push('isSynced = $' + filterValues.length);
        filterValues.push(filter.isSynced);
      }
      
      if (filter.cafeName) {
        filterClauses.push('cafeName = $' + filterValues.length);
        filterValues.push(filter.cafeName);
      }
      
      if (filter.roastery) {
        filterClauses.push('roastery = $' + filterValues.length);
        filterValues.push(filter.roastery);
      }
      
      if (filter.startDate) {
        filterClauses.push('createdAt >= $' + filterValues.length);
        filterValues.push(filter.startDate);
      }
      
      if (filter.endDate) {
        filterClauses.push('createdAt <= $' + filterValues.length);
        filterValues.push(filter.endDate);
      }
      
      if (filterClauses.length > 0) {
        query = query.filtered(filterClauses.join(' AND '), ...filterValues);
      }
    }
    
    const sortedQuery = query.sorted('createdAt', true);
    return this.baseService.paginateResults(sortedQuery, filter?.limit, filter?.offset) as any;
  }

  async getTastingRecordById(id: string): Promise<ITastingRecord | null> {
    if (!this.baseService.isInitialized) {
      await this.baseService.initialize();
    }
    
    const realm = this.baseService.getRealm();
    const record = realm.objectForPrimaryKey<ITastingRecord>('TastingRecord', id);
    return record || null;
  }

  async updateTastingRecord(id: string, updates: Partial<ITastingRecord>): Promise<void> {
    if (!this.baseService.isInitialized) {
      await this.baseService.initialize();
    }
    
    const realm = this.baseService.getRealm();
    
    realm.write(() => {
      const record = realm.objectForPrimaryKey<ITastingRecord>('TastingRecord', id);
      if (record) {
        Object.assign(record, updates, {
          updatedAt: new Date(),
          isSynced: false,
        });
      }
    });
  }

  async deleteTastingRecord(id: string, hardDelete: boolean = false): Promise<void> {
    if (!this.baseService.isInitialized) {
      await this.baseService.initialize();
    }
    
    const realm = this.baseService.getRealm();
    
    try {
      realm.write(() => {
        const tasting = realm.objectForPrimaryKey<ITastingRecord>('TastingRecord', id);
        if (tasting) {
          if (hardDelete) {
            realm.delete(tasting);
          } else {
            tasting.isDeleted = true;
            tasting.updatedAt = new Date();
            tasting.isSynced = false;
          }
        } else {
          throw new Error(`Tasting record not found with id: ${id}`);
        }
      });
    } catch (error) {
      throw new Error(`Failed to delete tasting record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createTastingRecord(data: Omit<ITastingRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITastingRecord> {
    if (!this.baseService.isInitialized) {
      await this.baseService.initialize();
    }
    
    const realm = this.baseService.getRealm();
    let newRecord: ITastingRecord;
    
    realm.write(() => {
      newRecord = realm.create<ITastingRecord>('TastingRecord', {
        id: uuid.v4() as string,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      });
    });
    
    return newRecord!;
  }

  // Get recent tastings with limit
  static async getRecentTastings(limit: number = 10): Promise<{
    id: string;
    cafeName: string;
    roastery: string;
    coffeeName: string;
    matchScoreTotal: number;
    createdAt: Date;
  }[]> {
    try {
      const instance = TastingService.getInstance();
      
      // Realm이 초기화되지 않았으면 초기화 시도
      if (!instance.baseService.isInitialized) {
        await instance.baseService.initialize();
      }
      
      const realm = instance.baseService.getRealm();
      const records = realm.objects<ITastingRecord>('TastingRecord')
        .filtered('isDeleted = false')
        .sorted('createdAt', true)
        .slice(0, limit);
      
      // 안전하게 배열로 변환
      return Array.from(records).map(tasting => ({
        id: tasting.id,
        cafeName: tasting.cafeName || '',
        roastery: tasting.roastery,
        coffeeName: tasting.coffeeName,
        matchScoreTotal: tasting.matchScoreTotal,
        createdAt: tasting.createdAt,
      }));
    } catch (error) {
      return []; // 에러 시 빈 배열 반환
    }
  }

  // Sync-related methods
  getUnsyncedRecords(): any {
    const realm = this.baseService.getRealm();
    return realm.objects<ITastingRecord>('TastingRecord')
      .filtered('isSynced = false');
  }

  markAsSynced(recordIds: string[]): void {
    const realm = this.baseService.getRealm();
    
    realm.write(() => {
      recordIds.forEach(id => {
        const record = realm.objectForPrimaryKey<ITastingRecord>('TastingRecord', id);
        if (record) {
          record.isSynced = true;
          record.syncedAt = new Date();
        }
      });
    });
  }

  clearAllTastings(): void {
    const realm = this.baseService.getRealm();
    
    realm.write(() => {
      // Delete in order to respect relationships
      const allTastings = realm.objects('TastingRecord');
      const allFlavorNotes = realm.objects('FlavorNote');
      const allSensoryAttributes = realm.objects('SensoryAttribute');
      
      realm.delete(allFlavorNotes);
      realm.delete(allSensoryAttributes);
      realm.delete(allTastings);
    });
  }

  // Search methods
  searchCoffees(searchText: string, limit: number = 10): CoffeeSearchResult[] {
    const realm = this.baseService.getRealm();
    
    try {
      // Search in all tasting records
      const query = searchText.toLowerCase();
      const allTastings = realm.objects<ITastingRecord>('TastingRecord')
        .filtered('isDeleted = false')
        .filtered(
          'coffeeName CONTAINS[c] $0 OR roastery CONTAINS[c] $0 OR origin CONTAINS[c] $0',
          query
        );
      
      // Group by coffee+roastery combination
      const coffeeMap = new Map<string, CoffeeSearchResult>();
      
      allTastings.forEach(tasting => {
        const key = `${tasting.roastery}-${tasting.coffeeName}`;
        
        if (coffeeMap.has(key)) {
          const existing = coffeeMap.get(key);
          if (existing) {
            existing.tastingCount++;
            if (tasting.createdAt > existing.lastTasted) {
              existing.lastTasted = tasting.createdAt;
            }
          }
        } else {
          coffeeMap.set(key, {
            id: tasting.id,
            coffeeName: tasting.coffeeName,
            roastery: tasting.roastery,
            origin: tasting.origin,
            lastTasted: tasting.createdAt,
            tastingCount: 1,
          });
        }
      });
      
      // Convert to array and sort by last tasted
      const results = Array.from(coffeeMap.values())
        .sort((a, b) => b.lastTasted.getTime() - a.lastTasted.getTime())
        .slice(0, limit);
      
      return results;
    } catch (error) {
      RealmLogger.error('realm', 'Failed to search coffees', error as Error);
      return [];
    }
  }

  getSameCoffeeComparison(coffeeName: string, roastery: string): SameCoffeeComparison | null {
    const realm = this.baseService.getRealm();
    
    try {
      const sameCoffeeRecords = realm.objects<ITastingRecord>('TastingRecord')
        .filtered('coffeeName = $0 AND roastery = $1 AND isDeleted = false', coffeeName, roastery)
        .sorted('createdAt', true);
      
      if (sameCoffeeRecords.length === 0) {
        return null;
      }
      
      // Calculate statistics
      let totalScore = 0;
      const scoreMap = new Map<number, number>();
      
      sameCoffeeRecords.forEach(record => {
        const score = record.matchScoreTotal || 0;
        totalScore += score;
        scoreMap.set(score, (scoreMap.get(score) || 0) + 1);
      });
      
      const averageScore = totalScore / sameCoffeeRecords.length;
      
      // Convert score distribution to array
      const scoreDistribution = Array.from(scoreMap.entries())
        .map(([score, count]) => ({ score, count }))
        .sort((a, b) => a.score - b.score);
      
      // Get recent tastings (max 5)
      const recentTastings = Array.from(sameCoffeeRecords.slice(0, 5));
      
      return {
        totalCount: sameCoffeeRecords.length,
        averageScore,
        scoreDistribution,
        recentTastings,
      };
    } catch (error) {
      RealmLogger.error('realm', 'Failed to get same coffee comparison', error as Error);
      return null;
    }
  }

  getSimilarCoffees(coffeeName: string, roastery: string, origin?: string): SimilarCoffee[] {
    const realm = this.baseService.getRealm();
    
    try {
      // Get the reference coffee
      const referenceCoffee = realm.objects<ITastingRecord>('TastingRecord')
        .filtered('coffeeName = $0 AND roastery = $1 AND isDeleted = false', coffeeName, roastery)[0];
      
      if (!referenceCoffee) {
        return [];
      }
      
      // Find similar coffees (same origin or similar characteristics)
      let similarCoffees;
      if (origin) {
        similarCoffees = realm.objects<ITastingRecord>('TastingRecord')
          .filtered('origin = $0 AND isDeleted = false AND NOT (coffeeName = $1 AND roastery = $2)', 
            origin, coffeeName, roastery);
      } else {
        // If no origin, find coffees from the same roastery
        similarCoffees = realm.objects<ITastingRecord>('TastingRecord')
          .filtered('roastery = $0 AND isDeleted = false AND NOT coffeeName = $1', 
            roastery, coffeeName);
      }
      
      // Group and calculate statistics
      const coffeeMap = new Map<string, any>();
      
      similarCoffees.forEach(tasting => {
        const key = `${tasting.roastery}-${tasting.coffeeName}`;
        
        if (coffeeMap.has(key)) {
          const existing = coffeeMap.get(key);
          existing.totalScore += tasting.matchScoreTotal || 0;
          existing.tastingCount++;
        } else {
          coffeeMap.set(key, {
            coffeeName: tasting.coffeeName,
            roastery: tasting.roastery,
            origin: tasting.origin,
            totalScore: tasting.matchScoreTotal || 0,
            tastingCount: 1,
            similarity: origin && tasting.origin === origin ? 100 : 50,
          });
        }
      });
      
      // Convert to array with average scores
      const results = Array.from(coffeeMap.values())
        .map(coffee => ({
          ...coffee,
          averageScore: coffee.totalScore / coffee.tastingCount,
          totalScore: undefined,
        }))
        .sort((a, b) => b.similarity - a.similarity || b.averageScore - a.averageScore)
        .slice(0, 10);
      
      return results;
    } catch (error) {
      RealmLogger.error('realm', 'Failed to get similar coffees', error as Error);
      return [];
    }
  }
}

export default TastingService.getInstance();