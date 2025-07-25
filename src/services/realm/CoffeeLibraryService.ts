import uuid from 'react-native-uuid';
import { BaseRealmService } from './BaseRealmService';
import { ICoffeeLibrary, ITastingRecord } from './schemas';
import { RealmLogger } from '../../utils/logger';

export class CoffeeLibraryService {
  private static instance: CoffeeLibraryService;
  private baseService: BaseRealmService;

  private constructor() {
    this.baseService = BaseRealmService.getInstance();
  }

  static getInstance(): CoffeeLibraryService {
    if (!CoffeeLibraryService.instance) {
      CoffeeLibraryService.instance = new CoffeeLibraryService();
    }
    return CoffeeLibraryService.instance;
  }

  async initialize(): Promise<void> {
    if (!this.baseService.isInitialized) {
      await this.baseService.initialize();
    }
  }

  addCoffeeToLibrary(coffee: Omit<ICoffeeLibrary, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>): ICoffeeLibrary {
    const realm = this.baseService.getRealm();
    let newCoffee: ICoffeeLibrary;
    
    realm.write(() => {
      newCoffee = realm.create<ICoffeeLibrary>('CoffeeLibrary', {
        id: uuid.v4() as string,
        createdAt: new Date(),
        updatedAt: new Date(),
        useCount: 0,
        ...coffee,
      });
    });
    
    return newCoffee!;
  }

  searchCoffeeLibrary(searchTerm: string): Realm.Results<ICoffeeLibrary> {
    const realm = this.baseService.getRealm();
    return realm.objects<ICoffeeLibrary>('CoffeeLibrary')
      .filtered('coffeeName CONTAINS[c] $0 OR roastery CONTAINS[c] $0', searchTerm)
      .sorted('useCount', true) as unknown as Realm.Results<ICoffeeLibrary>;
  }

  incrementCoffeeUseCount(coffeeId: string): void {
    const realm = this.baseService.getRealm();
    
    realm.write(() => {
      const coffee = realm.objectForPrimaryKey<ICoffeeLibrary>('CoffeeLibrary', coffeeId);
      if (coffee) {
        coffee.useCount += 1;
        coffee.updatedAt = new Date();
      }
    });
  }

  updateCoffeeLibrary(coffeeData: {
    roastery: string;
    coffeeName: string;
    origin?: string;
    variety?: string;
    altitude?: string;
    process?: string;
    roasterNotes?: string;
  }): void {
    const realm = this.baseService.getRealm();
    
    try {
      // Find existing coffee in library
      const existingCoffee = realm.objects<ICoffeeLibrary>('CoffeeLibrary')
        .filtered('roastery = $0 AND coffeeName = $1', coffeeData.roastery, coffeeData.coffeeName)[0];
      
      if (existingCoffee) {
        // Update existing coffee
        realm.write(() => {
          existingCoffee.useCount += 1;
          existingCoffee.updatedAt = new Date();
          
          // Update fields if they have new values
          if (coffeeData.origin && !existingCoffee.origin) {
            existingCoffee.origin = coffeeData.origin;
          }
          if (coffeeData.variety && !existingCoffee.variety) {
            existingCoffee.variety = coffeeData.variety;
          }
          if (coffeeData.altitude && !existingCoffee.altitude) {
            existingCoffee.altitude = coffeeData.altitude;
          }
          if (coffeeData.process && !existingCoffee.process) {
            existingCoffee.process = coffeeData.process;
          }
          if (coffeeData.roasterNotes && !existingCoffee.roasterNotes) {
            existingCoffee.roasterNotes = coffeeData.roasterNotes;
          }
        });
      } else {
        // Create new coffee entry
        realm.write(() => {
          realm.create<ICoffeeLibrary>('CoffeeLibrary', {
            id: uuid.v4() as string,
            roastery: coffeeData.roastery,
            coffeeName: coffeeData.coffeeName,
            origin: coffeeData.origin || '',
            variety: coffeeData.variety || '',
            altitude: coffeeData.altitude || '',
            process: coffeeData.process || '',
            roasterNotes: coffeeData.roasterNotes || '',
            useCount: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });
      }
    } catch (error) {
      RealmLogger.error('Failed to update coffee library', { error: error as Error });
    }
  }

  getCoffeeNameSuggestions(searchText: string): string[] {
    const realm = this.baseService.getRealm();
    
    try {
      const coffees = realm.objects<ICoffeeLibrary>('CoffeeLibrary')
        .filtered('coffeeName BEGINSWITH[c] $0', searchText)
        .sorted('useCount', true);
      
      const suggestions = new Set<string>();
      coffees.forEach(coffee => {
        suggestions.add(coffee.coffeeName);
      });
      
      return Array.from(suggestions).slice(0, 5);
    } catch (error) {
      RealmLogger.error('Failed to get coffee name suggestions', { error: error as Error });
      return [];
    }
  }

  getOriginSuggestions(searchText: string): string[] {
    const realm = this.baseService.getRealm();
    
    try {
      const coffees = realm.objects<ICoffeeLibrary>('CoffeeLibrary')
        .filtered('origin BEGINSWITH[c] $0', searchText);
      
      const suggestions = new Set<string>();
      coffees.forEach(coffee => {
        if (coffee.origin) {
          suggestions.add(coffee.origin);
        }
      });
      
      return Array.from(suggestions).slice(0, 5);
    } catch (error) {
      RealmLogger.error('Failed to get origin suggestions', { error: error as Error });
      return [];
    }
  }

  getVarietySuggestions(searchText: string): string[] {
    const realm = this.baseService.getRealm();
    
    try {
      const coffees = realm.objects<ICoffeeLibrary>('CoffeeLibrary')
        .filtered('variety BEGINSWITH[c] $0', searchText);
      
      const suggestions = new Set<string>();
      coffees.forEach(coffee => {
        if (coffee.variety) {
          suggestions.add(coffee.variety);
        }
      });
      
      return Array.from(suggestions).slice(0, 5);
    } catch (error) {
      RealmLogger.error('Failed to get variety suggestions', { error: error as Error });
      return [];
    }
  }

  getProcessSuggestions(searchText: string): string[] {
    const realm = this.baseService.getRealm();
    
    try {
      const coffees = realm.objects<ICoffeeLibrary>('CoffeeLibrary')
        .filtered('process BEGINSWITH[c] $0', searchText);
      
      const suggestions = new Set<string>();
      coffees.forEach(coffee => {
        if (coffee.process) {
          suggestions.add(coffee.process);
        }
      });
      
      return Array.from(suggestions).slice(0, 5);
    } catch (error) {
      RealmLogger.error('Failed to get process suggestions', { error: error as Error });
      return [];
    }
  }

  getCoffeeDetails(roasterName: string, coffeeName: string): Partial<ITastingRecord> | null {
    const realm = this.baseService.getRealm();
    
    try {
      // First try to find in coffee library
      const libraryEntry = realm.objects<ICoffeeLibrary>('CoffeeLibrary')
        .filtered('roastery = $0 AND coffeeName = $1', roasterName, coffeeName)[0];
      
      if (libraryEntry) {
        return {
          origin: libraryEntry.origin,
          variety: libraryEntry.variety,
          altitude: libraryEntry.altitude,
          process: libraryEntry.process,
          roasterNotes: libraryEntry.roasterNotes,
        };
      }
      
      // If not in library, try to find from recent tasting records
      const recentTasting = realm.objects<ITastingRecord>('TastingRecord')
        .filtered('roastery = $0 AND coffeeName = $1 AND isDeleted = false', roasterName, coffeeName)
        .sorted('createdAt', true)[0];
      
      if (recentTasting) {
        return {
          origin: recentTasting.origin,
          variety: recentTasting.variety,
          altitude: recentTasting.altitude,
          process: recentTasting.process,
          roasterNotes: recentTasting.roasterNotes,
        };
      }
      
      return null;
    } catch (error) {
      RealmLogger.error('Failed to get coffee details', { error: error as Error });
      return null;
    }
  }

  getTopCoffees(limit: number): { name: string; roastery: string; count: number }[] {
    const realm = this.baseService.getRealm();
    const coffees = realm.objects<ICoffeeLibrary>('CoffeeLibrary')
      .sorted('useCount', true)
      .slice(0, limit);
    
    return Array.from(coffees).map(coffee => ({
      name: coffee.coffeeName,
      roastery: coffee.roastery,
      count: coffee.useCount,
    }));
  }
}

export default CoffeeLibraryService.getInstance();