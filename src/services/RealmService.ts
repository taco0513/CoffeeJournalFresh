import Realm, { BSON } from 'realm';
import { Coffee, TastingSession } from '../models/Coffee';

class RealmService {
  private static instance: RealmService;
  private realm: Realm | null = null;

  private constructor() {}

  static getInstance(): RealmService {
    if (!RealmService.instance) {
      RealmService.instance = new RealmService();
    }
    return RealmService.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.realm = await Realm.open({
        schema: [Coffee.schema, TastingSession.schema],
        schemaVersion: 1,
        deleteRealmIfMigrationNeeded: true, // For development
      });
      // console.log('Realm initialized successfully');
    } catch (error) {
      // console.error('Failed to initialize Realm:', error);
      throw error;
    }
  }

  getRealm(): Realm {
    if (!this.realm) {
      throw new Error('Realm not initialized. Call initialize() first.');
    }
    return this.realm;
  }

  // Coffee CRUD operations
  createCoffee(coffeeData: Partial<Coffee>): Coffee {
    const realm = this.getRealm();
    let coffee: Coffee;
    
    realm.write(() => {
      coffee = realm.create(Coffee, {
        ...coffeeData,
        updatedAt: new Date(),
      });
    });
    
    return coffee!;
  }

  getAllCoffees(): Realm.Results<Coffee> {
    const realm = this.getRealm();
    return realm.objects(Coffee).sorted('createdAt', true);
  }

  getCoffeeById(id: string): Coffee | null {
    const realm = this.getRealm();
    const objectId = new BSON.ObjectId(id);
    return realm.objectForPrimaryKey(Coffee, objectId);
  }

  updateCoffee(id: string, updates: Partial<Coffee>): void {
    const realm = this.getRealm();
    const coffee = this.getCoffeeById(id);
    
    if (coffee) {
      realm.write(() => {
        Object.assign(coffee, updates);
        coffee.updatedAt = new Date();
      });
    }
  }

  deleteCoffee(id: string): void {
    const realm = this.getRealm();
    const coffee = this.getCoffeeById(id);
    
    if (coffee) {
      realm.write(() => {
        realm.delete(coffee);
      });
    }
  }

  // TastingSession CRUD operations
  createTastingSession(sessionData: Partial<TastingSession>): TastingSession {
    const realm = this.getRealm();
    let session: TastingSession;
    
    realm.write(() => {
      session = realm.create(TastingSession, sessionData);
    });
    
    return session!;
  }

  getAllTastingSessions(): Realm.Results<TastingSession> {
    const realm = this.getRealm();
    return realm.objects(TastingSession).sorted('createdAt', true);
  }

  getTastingSessionById(id: string): TastingSession | null {
    const realm = this.getRealm();
    const objectId = new BSON.ObjectId(id);
    return realm.objectForPrimaryKey(TastingSession, objectId);
  }

  getTastingSessionsByCoffeeId(coffeeId: string): Realm.Results<TastingSession> {
    const realm = this.getRealm();
    const objectId = new BSON.ObjectId(coffeeId);
    return realm.objects(TastingSession).filtered('coffeeId == $0', objectId);
  }

  deleteTastingSession(id: string): void {
    const realm = this.getRealm();
    const session = this.getTastingSessionById(id);
    
    if (session) {
      realm.write(() => {
        realm.delete(session);
      });
    }
  }

  // Search operations
  searchCoffees(query: string): Realm.Results<Coffee> {
    const realm = this.getRealm();
    return realm.objects(Coffee)
      .filtered('name CONTAINS[c] $0 OR roastery CONTAINS[c] $0 OR origin CONTAINS[c] $0', query)
      .sorted('createdAt', true);
  }

  // Statistics
  getAverageRating(coffeeId: string): number {
    const sessions = this.getTastingSessionsByCoffeeId(coffeeId);
    if (sessions.length === 0) return 0;
    
    const totalScore = sessions.reduce((sum, session) => sum + (session.overallScore || 0), 0);
    return totalScore / sessions.length;
  }

  close(): void {
    if (this.realm && !this.realm.isClosed) {
      this.realm.close();
      this.realm = null;
    }
  }
}

export default RealmService.getInstance();