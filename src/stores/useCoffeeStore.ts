import { create } from 'zustand';
import { StorageService } from '../services/StorageService';
import { TastingData } from '../types';

interface CoffeeStore {
  // Current tasting session
  currentTasting: Partial<TastingData>;
  
  // Cached tastings for display
  tastingSessions: TastingData[];
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Actions
  updateCurrentTasting: (field: keyof TastingData, value: any) => void;
  resetCurrentTasting: () => void;
  saveTasting: () => Promise<void>;
  loadTastings: () => Promise<void>;
  deleteTasting: (id: string) => Promise<void>;
  
  // Storage progress
  saveProgress: () => Promise<void>;
  loadProgress: () => Promise<void>;
}

const initialTastingData: Partial<TastingData> = {
  coffeeName: '',
  roastery: '',
  origin: '',
  variety: '',
  process: '',
  roasterNotes: '',
  brewMethod: '',
  temperature: 'Hot',
  selectedFlavors: {
    level1: [],
    level2: [],
    level3: [],
    level4: []
  },
  sensoryScore: {
    body: 3,
    acidity: 3,
    sweetness: 3,
    finish: 3
  }
};

export const useCoffeeStore = create<CoffeeStore>((set, get) => ({
  currentTasting: { ...initialTastingData },
  tastingSessions: [],
  isLoading: false,
  isSaving: false,

  updateCurrentTasting: (field, value) => {
    set((state) => ({
      currentTasting: { ...state.currentTasting, [field]: value }
    }));
    // Auto-save progress
    get().saveProgress();
  },

  resetCurrentTasting: () => {
    set({ currentTasting: { ...initialTastingData } });
    StorageService.clearCurrentTasting();
  },

  saveTasting: async () => {
    set({ isSaving: true });
    try {
      const { currentTasting } = get();
      const newTasting: TastingData = {
        id: Date.now().toString(),
        coffeeName: currentTasting.coffeeName || '',
        roastery: currentTasting.roastery || '',
        origin: currentTasting.origin || '',
        variety: currentTasting.variety || '',
        process: currentTasting.process || '',
        roasterNotes: currentTasting.roasterNotes || '',
        brewMethod: currentTasting.brewMethod || 'Pour Over',
        temperature: currentTasting.temperature || 'Hot',
        selectedFlavors: currentTasting.selectedFlavors || { level1: [], level2: [], level3: [], level4: [] },
        sensoryScore: currentTasting.sensoryScore || { body: 3, acidity: 3, sweetness: 3, finish: 3 },
        matchScore: currentTasting.matchScore || { total: 0, flavor: 0, sensory: 0 },
        createdAt: new Date(),
      };
      
      await StorageService.saveTasting(newTasting);
      await StorageService.clearCurrentTasting();
      
      // Reload tastings to update UI
      await get().loadTastings();
      
      set({ 
        currentTasting: { ...initialTastingData },
        isSaving: false 
      });
    } catch (error) {
      // console.error('Error saving tasting:', error);
      set({ isSaving: false });
      throw error;
    }
  },

  loadTastings: async () => {
    set({ isLoading: true });
    try {
      const tastings = await StorageService.getTastings();
      set({ tastingSessions: tastings, isLoading: false });
    } catch (error) {
      // console.error('Error loading tastings:', error);
      set({ isLoading: false });
    }
  },

  deleteTasting: async (id: string) => {
    try {
      await StorageService.deleteTasting(id);
      await get().loadTastings();
    } catch (error) {
      // console.error('Error deleting tasting:', error);
      throw error;
    }
  },

  saveProgress: async () => {
    try {
      const { currentTasting } = get();
      await StorageService.saveCurrentTasting(currentTasting);
    } catch (error) {
      // console.error('Error saving progress:', error);
    }
  },

  loadProgress: async () => {
    try {
      const savedProgress = await StorageService.getCurrentTasting();
      if (savedProgress) {
        set({ currentTasting: savedProgress });
      }
    } catch (error) {
      // console.error('Error loading progress:', error);
    }
  }
}));