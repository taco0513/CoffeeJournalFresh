import uuid from 'react-native-uuid';
import { BaseRealmService } from './BaseRealmService';
import { IRoasterInfo } from './schemas';
import { RealmLogger } from '../../utils/logger';

export class RoasterService {
  private static instance: RoasterService;
  private baseService: BaseRealmService;

  private constructor() {
    this.baseService = BaseRealmService.getInstance();
  }

  static getInstance(): RoasterService {
    if (!RoasterService.instance) {
      RoasterService.instance = new RoasterService();
    }
    return RoasterService.instance;
  }

  async initialize(): Promise<void> {
    if (!this.baseService.isInitialized) {
      await this.baseService.initialize();
    }
  }

  addRoaster(roaster: Omit<IRoasterInfo, 'id' | 'createdAt' | 'updatedAt' | 'coffeeCount'>): IRoasterInfo {
    const realm = this.baseService.getRealm();
    let newRoaster: IRoasterInfo;
    
    realm.write(() => {
      newRoaster = realm.create<IRoasterInfo>('RoasterInfo', {
        id: uuid.v4() as string,
        createdAt: new Date(),
        updatedAt: new Date(),
        coffeeCount: 0,
        ...roaster,
      });
    });
    
    return newRoaster!;
  }

  searchRoasters(searchTerm: string): Realm.Results<IRoasterInfo> {
    const realm = this.baseService.getRealm();
    return realm.objects<IRoasterInfo>('RoasterInfo')
      .filtered('name CONTAINS[c] $0', searchTerm)
      .sorted('coffeeCount', true) as unknown as Realm.Results<IRoasterInfo>;
  }

  updateRoasterStats(roasterName: string, newScore: number): void {
    const realm = this.baseService.getRealm();
    
    realm.write(() => {
      const roaster = realm.objects<IRoasterInfo>('RoasterInfo')
        .filtered('name = $0', roasterName)[0];
      
      if (roaster) {
        const currentAvg = roaster.averageScore || 0;
        const currentCount = roaster.coffeeCount;
        
        roaster.averageScore = 
          (currentAvg * currentCount + newScore) / (currentCount + 1);
        roaster.coffeeCount += 1;
        roaster.updatedAt = new Date();
      }
    });
  }

  getRoasterSuggestions(searchText: string): IRoasterInfo[] {
    const realm = this.baseService.getRealm();
    
    try {
      const roasters = realm.objects<IRoasterInfo>('RoasterInfo')
        .filtered('name BEGINSWITH[c] $0', searchText)
        .sorted('coffeeCount', true);
      
      return Array.from(roasters.slice(0, 5));
    } catch (error) {
      RealmLogger.error('Failed to get roaster suggestions', { error: error as Error });
      return [];
    }
  }

  incrementRoasterVisit(roasterName: string): void {
    const realm = this.baseService.getRealm();
    
    try {
      realm.write(() => {
        const roaster = realm.objects<IRoasterInfo>('RoasterInfo')
          .filtered('name = $0', roasterName)[0];
        
        if (roaster) {
          roaster.coffeeCount += 1;
          roaster.updatedAt = new Date();
        } else {
          // Create new roaster entry if it doesn't exist
          realm.create<IRoasterInfo>('RoasterInfo', {
            id: uuid.v4() as string,
            name: roasterName,
            createdAt: new Date(),
            updatedAt: new Date(),
            coffeeCount: 1,
            averageScore: 0,
          });
        }
      });
    } catch (error) {
      RealmLogger.error('Failed to increment roaster visit', { error: error as Error });
    }
  }

  getRoasterCoffees(roasterName: string, searchText?: string): string[] {
    const realm = this.baseService.getRealm();
    
    try {
      let query = realm.objects('TastingRecord')
        .filtered('roastery = $0 AND isDeleted = false', roasterName);
      
      if (searchText) {
        query = query.filtered('coffeeName CONTAINS[c] $0', searchText);
      }
      
      // Get unique coffee names
      const coffees = new Set<string>();
      query.forEach((record: any) => {
        if (record.coffeeName) {
          coffees.add(record.coffeeName);
        }
      });
      
      return Array.from(coffees).sort();
    } catch (error) {
      RealmLogger.error('Failed to get roaster coffees', { error: error as Error });
      return [];
    }
  }

  getCoffeesByRoaster(roasterName: string, searchText?: string): string[] {
    return this.getRoasterCoffees(roasterName, searchText);
  }

  getTopRoasters(limit: number): { name: string; count: number; avgScore: number }[] {
    const realm = this.baseService.getRealm();
    const roasters = realm.objects<IRoasterInfo>('RoasterInfo')
      .sorted('coffeeCount', true)
      .slice(0, limit);
    
    return Array.from(roasters).map(roaster => ({
      name: roaster.name,
      count: roaster.coffeeCount,
      avgScore: roaster.averageScore || 0,
    }));
  }

  updateRoasterFromTasting(roasterName: string, score: number): void {
    const realm = this.baseService.getRealm();
    
    const existingRoaster = realm.objects<IRoasterInfo>('RoasterInfo')
      .filtered('name = $0', roasterName)[0];
    
    if (existingRoaster) {
      realm.write(() => {
        existingRoaster.coffeeCount += 1;
        const currentAvg = existingRoaster.averageScore || 0;
        const currentCount = existingRoaster.coffeeCount - 1;
        existingRoaster.averageScore = 
          (currentAvg * currentCount + score) / existingRoaster.coffeeCount;
        existingRoaster.updatedAt = new Date();
      });
    } else {
      // Create new roaster entry
      realm.write(() => {
        realm.create<IRoasterInfo>('RoasterInfo', {
          id: uuid.v4() as string,
          name: roasterName,
          createdAt: new Date(),
          updatedAt: new Date(),
          coffeeCount: 1,
          averageScore: score,
        });
      });
    }
  }
}

export default RoasterService.getInstance();