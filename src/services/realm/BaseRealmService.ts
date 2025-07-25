import Realm from 'realm';
import { schemas } from './schemas';
import { RealmLogger, PerformanceTimer } from '../../utils/logger';

/**
 * Base Realm Service that provides core Realm functionality
 * Other services should extend or use this service
 */
export class BaseRealmService {
  private static instance: BaseRealmService;
  private realm: Realm | null = null;
  private initialized: boolean = false;

  protected constructor() {}

  static getInstance(): BaseRealmService {
    if (!BaseRealmService.instance) {
      BaseRealmService.instance = new BaseRealmService();
    }
    return BaseRealmService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized && this.realm && !this.realm.isClosed) {
      return;
    }

    const timer = new PerformanceTimer('realm_init');

    try {
      RealmLogger.info('Initializing Realm database', { action: 'initialize' });
      
      this.realm = await Realm.open({
        schema: schemas,
        schemaVersion: 3, // Updated to include achievement schemas
        // Use deleteRealmIfMigrationNeeded in development for clean state
        // Or use onMigration for production data preservation, but not both
        ...__DEV__ 
          ? { deleteRealmIfMigrationNeeded: true }
          : {
              onMigration: (oldRealm: Realm, newRealm: Realm) => {
                if (oldRealm.schemaVersion < 2) {
                  const oldTastings = oldRealm.objects('TastingRecord');
                  const newTastings = newRealm.objects('TastingRecord');
                  
                  for (let i = 0; i < oldTastings.length; i++) {
                    const oldRecord = oldTastings[i] as any;
                    const newRecord = newTastings[i] as any;
                    
                    if (oldRecord.matchScore !== undefined) {
                      newRecord.matchScoreTotal = oldRecord.matchScore;
                      newRecord.matchScoreFlavor = 0;
                      newRecord.matchScoreSensory = 0;
                    }
                  }
                }
              }
            }
      });

      this.initialized = true;
      
      const duration = timer.end();
      RealmLogger.info('Realm initialized successfully', { data: { duration } });
      
      // Initialize indexes
      this.createIndexes();
      
      // Start cleanup scheduler
      this.scheduleCleanup();
      
    } catch (error) {
      try {
        const duration = timer.end();
        RealmLogger.error('Failed to initialize Realm', { error: error as Error, data: { duration } });
      } catch (timerError) {
        console.error('Timer error during Realm initialization:', timerError);
      }
      console.error('Realm initialization failed:', error);
      throw error;
    }
  }

  getRealm(): Realm {
    if (!this.realm || this.realm.isClosed) {
      throw new Error('Realm is not initialized or has been closed. Call initialize() first.');
    }
    return this.realm;
  }

  async safeGetRealm(): Promise<Realm> {
    if (!this.initialized || !this.realm || this.realm.isClosed) {
      await this.initialize();
    }
    return this.getRealm();
  }

  get isInitialized(): boolean {
    return this.initialized && this.realm !== null && !this.realm.isClosed;
  }

  private createIndexes(): void {
    // Indexes are defined in schema, this is for any runtime optimization
    RealmLogger.info('Indexes created');
  }

  private scheduleCleanup(): void {
    // Schedule periodic cleanup of old deleted records
    setInterval(() => {
      this.cleanupDeletedRecords();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  cleanupDeletedRecords(): void {
    try {
      const realm = this.getRealm();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      realm.write(() => {
        const oldDeletedRecords = realm.objects('TastingRecord')
          .filtered('isDeleted = true AND updatedAt < $0', thirtyDaysAgo);
        
        realm.delete(oldDeletedRecords);
      });
      
    } catch (error) {
      RealmLogger.error('Failed to cleanup deleted records', { error: error as Error });
    }
  }

  // Generic pagination helper
  paginateResults<T>(
    results: Realm.Results<T>, 
    limit?: number, 
    offset?: number
  ): Realm.Results<T> | T[] {
    if (limit !== undefined) {
      const startIndex = offset || 0;
      return results.slice(startIndex, startIndex + limit);
    }
    return results;
  }

  close(): void {
    if (this.realm && !this.realm.isClosed) {
      this.realm.close();
      this.realm = null;
      this.initialized = false;
    }
  }

  // Static helper for quick initialization
  static async initializeRealm(): Promise<void> {
    const instance = BaseRealmService.getInstance();
    await instance.initialize();
  }

  // Static helper for cleanup
  static async cleanupDeletedRecordsStatic(): Promise<void> {
    try {
      const instance = BaseRealmService.getInstance();
      if (!instance.isInitialized) {
        await instance.initialize();
      }
      instance.cleanupDeletedRecords();
    } catch (error) {
      RealmLogger.error('Failed to cleanup deleted records via static method', { error: error as Error });
    }
  }
}

export default BaseRealmService.getInstance();