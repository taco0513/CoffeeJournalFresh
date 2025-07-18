import { create } from 'zustand';
import { Coffee, TastingSession } from '../models/Coffee';
import RealmService from '../services/RealmService';

interface TastingFormData {
  coffeeName: string;
  roastery: string;
  origin: string;
  brewMethod: string;
  flavors: string[];
  body: number;
  acidity: number;
  sweetness: number;
  aftertaste: number;
  overallScore: number;
  notes: string;
}

interface CoffeeStore {
  // Current tasting session data
  currentTasting: Partial<TastingFormData>;
  
  // Lists
  coffees: Coffee[];
  tastingSessions: TastingSession[];
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  setCurrentTasting: (data: Partial<TastingFormData>) => void;
  updateCurrentTasting: (field: keyof TastingFormData, value: any) => void;
  resetCurrentTasting: () => void;
  
  // CRUD operations
  loadCoffees: () => void;
  loadTastingSessions: () => void;
  saveTasting: () => Promise<void>;
  deleteCoffee: (id: string) => void;
  deleteTastingSession: (id: string) => void;
  
  // Search
  searchCoffees: (query: string) => Coffee[];
}

const initialTastingData: Partial<TastingFormData> = {
  coffeeName: '',
  roastery: '',
  origin: '',
  brewMethod: '',
  flavors: [],
  body: 3,
  acidity: 3,
  sweetness: 3,
  aftertaste: 3,
  overallScore: 0,
  notes: '',
};

export const useCoffeeStore = create<CoffeeStore>((set, get) => ({
  currentTasting: { ...initialTastingData },
  coffees: [],
  tastingSessions: [],
  isLoading: false,

  setCurrentTasting: (data) => set({ currentTasting: data }),

  updateCurrentTasting: (field, value) => set((state) => ({
    currentTasting: { ...state.currentTasting, [field]: value }
  })),

  resetCurrentTasting: () => set({ currentTasting: { ...initialTastingData } }),

  loadCoffees: () => {
    try {
      const coffees = RealmService.getAllCoffees();
      set({ coffees: Array.from(coffees) });
    } catch (error) {
      console.error('Failed to load coffees:', error);
    }
  },

  loadTastingSessions: () => {
    try {
      const sessions = RealmService.getAllTastingSessions();
      set({ tastingSessions: Array.from(sessions) });
    } catch (error) {
      console.error('Failed to load tasting sessions:', error);
    }
  },

  saveTasting: async () => {
    const { currentTasting } = get();
    set({ isLoading: true });

    try {
      console.log('Saving tasting with data:', currentTasting);
      
      // Calculate overall score if not set
      const scores = [
        currentTasting.body || 3,
        currentTasting.acidity || 3,
        currentTasting.sweetness || 3,
        currentTasting.aftertaste || 3,
      ];
      const overallScore = currentTasting.overallScore || 
        (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 2;

      // Check if Realm is initialized
      try {
        RealmService.getRealm();
      } catch (error) {
        console.error('Realm not initialized:', error);
        throw new Error('Database not ready. Please try again.');
      }

      // Check if coffee exists
      const existingCoffees = RealmService.searchCoffees(currentTasting.coffeeName || '');
      let coffee = existingCoffees.find(c => 
        c.name === currentTasting.coffeeName && 
        c.roastery === currentTasting.roastery
      );

      // Create coffee if it doesn't exist
      if (!coffee) {
        coffee = RealmService.createCoffee({
          name: currentTasting.coffeeName || '',
          roastery: currentTasting.roastery || '',
          origin: currentTasting.origin || '',
          flavors: currentTasting.flavors || [],
        });
        console.log('Created new coffee:', coffee._id.toString());
      }

      // Create tasting session
      const session = RealmService.createTastingSession({
        coffeeId: coffee._id,
        coffeeName: currentTasting.coffeeName || '',
        roastery: currentTasting.roastery || '',
        origin: currentTasting.origin || '',
        brewMethod: currentTasting.brewMethod,
        flavors: currentTasting.flavors || [],
        body: currentTasting.body,
        acidity: currentTasting.acidity,
        sweetness: currentTasting.sweetness,
        aftertaste: currentTasting.aftertaste,
        overallScore,
        notes: currentTasting.notes,
      });
      console.log('Created tasting session:', session._id.toString());

      // Update coffee's average rating
      const avgRating = RealmService.getAverageRating(coffee._id.toString());
      RealmService.updateCoffee(coffee._id.toString(), { rating: avgRating });

      // Reload data
      get().loadCoffees();
      get().loadTastingSessions();
      get().resetCurrentTasting();

    } catch (error) {
      console.error('Failed to save tasting - Full error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCoffee: (id) => {
    try {
      RealmService.deleteCoffee(id);
      get().loadCoffees();
    } catch (error) {
      console.error('Failed to delete coffee:', error);
    }
  },

  deleteTastingSession: (id) => {
    try {
      RealmService.deleteTastingSession(id);
      get().loadTastingSessions();
    } catch (error) {
      console.error('Failed to delete tasting session:', error);
    }
  },

  searchCoffees: (query) => {
    if (!query) return get().coffees;
    try {
      const results = RealmService.searchCoffees(query);
      return Array.from(results);
    } catch (error) {
      console.error('Failed to search coffees:', error);
      return [];
    }
  },
}));