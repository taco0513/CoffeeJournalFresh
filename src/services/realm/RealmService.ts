/**
 * RealmService Facade
 * 
 * This is a facade that maintains backward compatibility with the old RealmService
 * while delegating to the new modular services.
 * 
 * Eventually, code should be migrated to use the specific services directly.
 */

import Realm from 'realm';
import { BaseRealmService } from './BaseRealmService';
import { TastingService } from './TastingService';
import { CafeService } from './CafeService';
import { RoasterService } from './RoasterService';
import { CoffeeLibraryService } from './CoffeeLibraryService';
import { StatisticsService } from './StatisticsService';
import { ITastingRecord, ICoffeeLibrary, ICafeInfo, IRoasterInfo } from './schemas';
import { 
  TastingData, 
  TastingFilter, 
  CoffeeSearchResult, 
  SameCoffeeComparison, 
  SimilarCoffee,
  Statistics,
  FlavorProfile,
  TastingStatistics,
  Last30DaysStats,
  AchievementProgress,
  CoffeeJourneyStats
} from './types';

class RealmService {
  private static instance: RealmService;
  private baseService: BaseRealmService;
  private tastingService: TastingService;
  private cafeService: CafeService;
  private roasterService: RoasterService;
  private coffeeLibraryService: CoffeeLibraryService;
  private statisticsService: StatisticsService;

  private constructor() {
    this.baseService = BaseRealmService.getInstance();
    this.tastingService = TastingService.getInstance();
    this.cafeService = CafeService.getInstance();
    this.roasterService = RoasterService.getInstance();
    this.coffeeLibraryService = CoffeeLibraryService.getInstance();
    this.statisticsService = StatisticsService.getInstance();
}

  static getInstance(): RealmService {
    if (!RealmService.instance) {
      RealmService.instance = new RealmService();
  }
    return RealmService.instance;
}

  // Base service delegation
  async initialize(): Promise<void> {
    return this.baseService.initialize();
}

  getRealm(): Realm {
    return this.baseService.getRealm();
}

  get isInitialized(): boolean {
    return this.baseService.isInitialized;
}

  get initialized(): boolean {
    return this.baseService.isInitialized;
}

  get realm(): Realm | null {
    return this.baseService.isInitialized ? this.baseService.getRealm() : null;
}

  close(): void {
    this.baseService.close();
}

  cleanupDeletedRecords(): void {
    this.baseService.cleanupDeletedRecords();
}

  // Tasting service delegation
  async saveTasting(data: TastingData): Promise<ITastingRecord> {
    return this.tastingService.saveTasting(data);
}

  async getTastingRecords(filter?: TastingFilter): Promise<Realm.Results<ITastingRecord>> {
    return this.tastingService.getTastingRecords(filter);
}

  async getTastingRecordById(id: string): Promise<ITastingRecord | null> {
    return this.tastingService.getTastingRecordById(id);
}

  async updateTastingRecord(id: string, updates: Partial<ITastingRecord>): Promise<void> {
    return this.tastingService.updateTastingRecord(id, updates);
}

  async deleteTastingRecord(id: string, hardDelete: boolean = false): Promise<void> {
    return this.tastingService.deleteTastingRecord(id, hardDelete);
}

  // Alias for backward compatibility
  async deleteTasting(id: string, hardDelete: boolean = false): Promise<void> {
    return this.tastingService.deleteTastingRecord(id, hardDelete);
}

  async createTastingRecord(data: Omit<ITastingRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITastingRecord> {
    return this.tastingService.createTastingRecord(data);
}

  // Alias for backward compatibility
  async saveTastingRecord(data: Omit<ITastingRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITastingRecord> {
    return this.tastingService.createTastingRecord(data);
}

  getUnsyncedRecords(): Realm.Results<ITastingRecord> {
    return this.tastingService.getUnsyncedRecords();
}

  markAsSynced(recordIds: string[]): void {
    this.tastingService.markAsSynced(recordIds);
}

  clearAllTastings(): void {
    this.tastingService.clearAllTastings();
}

  searchCoffees(searchText: string, limit: number = 10): CoffeeSearchResult[] {
    return this.tastingService.searchCoffees(searchText, limit);
}

  getSameCoffeeComparison(coffeeName: string, roastery: string): SameCoffeeComparison | null {
    return this.tastingService.getSameCoffeeComparison(coffeeName, roastery);
}

  getSimilarCoffees(coffeeName: string, roastery: string, origin?: string): SimilarCoffee[] {
    return this.tastingService.getSimilarCoffees(coffeeName, roastery, origin);
}

  // Cafe service delegation
  addCafe(cafe: Omit<ICafeInfo, 'id' | 'createdAt' | 'updatedAt' | 'visitCount'>): ICafeInfo {
    return this.cafeService.addCafe(cafe);
}

  searchCafes(searchTerm: string): Realm.Results<ICafeInfo> {
    return this.cafeService.searchCafes(searchTerm);
}

  getCafesByName(searchText: string, limit: number = 10): ICafeInfo[] {
    return this.cafeService.getCafesByName(searchText, limit);
}

  getCafeSuggestions(searchText: string): ICafeInfo[] {
    return this.cafeService.getCafeSuggestions(searchText);
}

  incrementCafeVisit(cafeName: string): void {
    this.cafeService.incrementCafeVisit(cafeName);
}

  getCafeRoasters(cafeName: string, searchText?: string): string[] {
    return this.cafeService.getCafeRoasters(cafeName, searchText);
}

  getRoastersByCafe(cafeName: string): string[] {
    return this.cafeService.getRoastersByCafe(cafeName);
}

  getTopCafes(limit: number): { name: string; count: number }[] {
    return this.cafeService.getTopCafes(limit);
}

  // Roaster service delegation
  addRoaster(roaster: Omit<IRoasterInfo, 'id' | 'createdAt' | 'updatedAt' | 'coffeeCount'>): IRoasterInfo {
    return this.roasterService.addRoaster(roaster);
}

  searchRoasters(searchTerm: string): Realm.Results<IRoasterInfo> {
    return this.roasterService.searchRoasters(searchTerm);
}

  updateRoasterStats(roasterName: string, newScore: number): void {
    this.roasterService.updateRoasterStats(roasterName, newScore);
}

  getRoasterSuggestions(searchText: string): IRoasterInfo[] {
    return this.roasterService.getRoasterSuggestions(searchText);
}

  incrementRoasterVisit(roasterName: string): void {
    this.roasterService.incrementRoasterVisit(roasterName);
}

  getRoasterCoffees(roasterName: string, searchText?: string): string[] {
    return this.roasterService.getRoasterCoffees(roasterName, searchText);
}

  getCoffeesByRoaster(roasterName: string, searchText?: string): string[] {
    return this.roasterService.getCoffeesByRoaster(roasterName, searchText);
}

  getTopRoasters(limit: number): { name: string; count: number; avgScore: number }[] {
    return this.roasterService.getTopRoasters(limit);
}

  // Coffee library service delegation
  addCoffeeToLibrary(coffee: Omit<ICoffeeLibrary, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>): ICoffeeLibrary {
    return this.coffeeLibraryService.addCoffeeToLibrary(coffee);
}

  searchCoffeeLibrary(searchTerm: string): Realm.Results<ICoffeeLibrary> {
    return this.coffeeLibraryService.searchCoffeeLibrary(searchTerm);
}

  incrementCoffeeUseCount(coffeeId: string): void {
    this.coffeeLibraryService.incrementCoffeeUseCount(coffeeId);
}

  getCoffeeNameSuggestions(searchText: string): string[] {
    return this.coffeeLibraryService.getCoffeeNameSuggestions(searchText);
}

  getOriginSuggestions(searchText: string): string[] {
    return this.coffeeLibraryService.getOriginSuggestions(searchText);
}

  getVarietySuggestions(searchText: string): string[] {
    return this.coffeeLibraryService.getVarietySuggestions(searchText);
}

  getProcessSuggestions(searchText: string): string[] {
    return this.coffeeLibraryService.getProcessSuggestions(searchText);
}

  getCoffeeDetails(roasterName: string, coffeeName: string): Partial<ITastingRecord> | null {
    return this.coffeeLibraryService.getCoffeeDetails(roasterName, coffeeName);
}

  getTopCoffees(limit: number): { name: string; roastery: string; count: number }[] {
    return this.coffeeLibraryService.getTopCoffees(limit);
}

  // Statistics service delegation
  getStatistics(): Statistics {
    return this.statisticsService.getStatistics();
}

  getFlavorProfile(): FlavorProfile[] {
    return this.statisticsService.getFlavorProfile();
}

  getTastingStatistics(): TastingStatistics {
    return this.statisticsService.getTastingStatistics();
}

  // Private method that was used internally - now delegates to coffee library service
  private updateCoffeeLibrary(coffeeData: {
    roastery: string;
    coffeeName: string;
    origin?: string;
    variety?: string;
    altitude?: string;
    process?: string;
    roasterNotes?: string;
}): void {
    this.coffeeLibraryService.updateCoffeeLibrary(coffeeData);
}

  // Static methods for backward compatibility
  static async getRecentTastings(limit: number = 10): Promise<{
    id: string;
    cafeName: string;
    roastery: string;
    coffeeName: string;
    matchScoreTotal: number;
    createdAt: Date;
}[]> {
    return TastingService.getRecentTastings(limit);
}

  static async initializeRealm(): Promise<void> {
    return BaseRealmService.initializeRealm();
}

  static async cleanupDeletedRecordsStatic(): Promise<void> {
    return BaseRealmService.cleanupDeletedRecordsStatic();
}
}

export default RealmService;