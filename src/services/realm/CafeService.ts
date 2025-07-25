import uuid from 'react-native-uuid';
import { BaseRealmService } from './BaseRealmService';
import { ICafeInfo } from './schemas';
import { RealmLogger } from '../../utils/logger';

export class CafeService {
  private static instance: CafeService;
  private baseService: BaseRealmService;

  private constructor() {
    this.baseService = BaseRealmService.getInstance();
  }

  static getInstance(): CafeService {
    if (!CafeService.instance) {
      CafeService.instance = new CafeService();
    }
    return CafeService.instance;
  }

  async initialize(): Promise<void> {
    if (!this.baseService.isInitialized) {
      await this.baseService.initialize();
    }
  }

  addCafe(cafe: Omit<ICafeInfo, 'id' | 'createdAt' | 'updatedAt' | 'visitCount'>): ICafeInfo {
    const realm = this.baseService.getRealm();
    let newCafe: ICafeInfo;
    
    realm.write(() => {
      newCafe = realm.create<ICafeInfo>('CafeInfo', {
        id: uuid.v4() as string,
        createdAt: new Date(),
        updatedAt: new Date(),
        visitCount: 0,
        ...cafe,
      });
    });
    
    return newCafe!;
  }

  searchCafes(searchTerm: string): Realm.Results<ICafeInfo> {
    const realm = this.baseService.getRealm();
    return realm.objects<ICafeInfo>('CafeInfo')
      .filtered('name CONTAINS[c] $0', searchTerm)
      .sorted('visitCount', true) as unknown as Realm.Results<ICafeInfo>;
  }

  getCafesByName(searchText: string, limit: number = 10): ICafeInfo[] {
    const realm = this.baseService.getRealm();
    
    try {
      const cafes = realm.objects<ICafeInfo>('CafeInfo')
        .filtered('name CONTAINS[c] $0', searchText)
        .sorted('visitCount', true);
      
      return Array.from(cafes.slice(0, limit));
    } catch (error) {
      RealmLogger.error('Failed to get cafes by name', { error: error as Error });
      return [];
    }
  }

  getCafeSuggestions(searchText: string): ICafeInfo[] {
    const realm = this.baseService.getRealm();
    
    try {
      const cafes = realm.objects<ICafeInfo>('CafeInfo')
        .filtered('name BEGINSWITH[c] $0', searchText)
        .sorted('visitCount', true);
      
      return Array.from(cafes.slice(0, 5));
    } catch (error) {
      RealmLogger.error('Failed to get cafe suggestions', { error: error as Error });
      return [];
    }
  }

  incrementCafeVisit(cafeName: string): void {
    const realm = this.baseService.getRealm();
    
    try {
      realm.write(() => {
        const cafe = realm.objects<ICafeInfo>('CafeInfo')
          .filtered('name = $0', cafeName)[0];
        
        if (cafe) {
          cafe.visitCount += 1;
          cafe.lastVisitedAt = new Date();
          cafe.updatedAt = new Date();
        } else {
          // Create new cafe entry if it doesn't exist
          realm.create<ICafeInfo>('CafeInfo', {
            id: uuid.v4() as string,
            name: cafeName,
            createdAt: new Date(),
            updatedAt: new Date(),
            visitCount: 1,
            lastVisitedAt: new Date(),
          });
        }
      });
    } catch (error) {
      RealmLogger.error('Failed to increment cafe visit', { error: error as Error });
    }
  }

  getCafeRoasters(cafeName: string, searchText?: string): string[] {
    const realm = this.baseService.getRealm();
    
    try {
      let query = realm.objects('TastingRecord')
        .filtered('cafeName = $0 AND isDeleted = false', cafeName);
      
      if (searchText) {
        query = query.filtered('roastery CONTAINS[c] $0', searchText);
      }
      
      // Get unique roasters
      const roasters = new Set<string>();
      query.forEach((record: any) => {
        if (record.roastery) {
          roasters.add(record.roastery);
        }
      });
      
      return Array.from(roasters).sort();
    } catch (error) {
      RealmLogger.error('Failed to get cafe roasters', { error: error as Error });
      return [];
    }
  }

  getRoastersByCafe(cafeName: string): string[] {
    const realm = this.baseService.getRealm();
    
    try {
      const tastings = realm.objects('TastingRecord')
        .filtered('cafeName = $0 AND isDeleted = false', cafeName);
      
      // Get unique roasters
      const roasters = new Set<string>();
      tastings.forEach((record: any) => {
        if (record.roastery) {
          roasters.add(record.roastery);
        }
      });
      
      return Array.from(roasters).sort();
    } catch (error) {
      RealmLogger.error('Failed to get roasters by cafe', { error: error as Error });
      return [];
    }
  }

  getTopCafes(limit: number): { name: string; count: number }[] {
    const realm = this.baseService.getRealm();
    const cafes = realm.objects<ICafeInfo>('CafeInfo')
      .sorted('visitCount', true)
      .slice(0, limit);
    
    return Array.from(cafes).map(cafe => ({
      name: cafe.name,
      count: cafe.visitCount,
    }));
  }

  updateCafeFromTasting(cafeName: string): void {
    if (!cafeName) return;
    
    const realm = this.baseService.getRealm();
    
    const existingCafe = realm.objects<ICafeInfo>('CafeInfo')
      .filtered('name = $0', cafeName)[0];
    
    if (existingCafe) {
      realm.write(() => {
        existingCafe.visitCount += 1;
        existingCafe.lastVisitedAt = new Date();
        existingCafe.updatedAt = new Date();
      });
    } else {
      // Create new cafe entry
      realm.write(() => {
        realm.create<ICafeInfo>('CafeInfo', {
          id: uuid.v4() as string,
          name: cafeName,
          createdAt: new Date(),
          updatedAt: new Date(),
          visitCount: 1,
          lastVisitedAt: new Date(),
        });
      });
    }
  }
}

export default CafeService.getInstance();