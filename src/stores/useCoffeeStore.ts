import { create } from 'zustand';
import { StorageService } from '../services/StorageService';
import { CurrentTasting } from '../types/tasting';
import { TastingData } from '../types/personalTaste';

interface CoffeeStore {
  // Current tasting session
  currentTasting: Partial<CurrentTasting>;
  
  // Cached tastings for display
  tastingSessions: CurrentTasting[];
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Actions
  updateCurrentTasting: (field: keyof CurrentTasting, value: unknown) => void;
  resetCurrentTasting: () => void;
  saveTasting: () => Promise<void>;
  loadTastings: () => Promise<void>;
  deleteTasting: (id: string) => Promise<void>;
  
  // Storage progress
  saveProgress: () => Promise<void>;
  loadProgress: () => Promise<void>;
}

const initialTastingData: Partial<CurrentTasting> = {
  mode: 'cafe',
  coffeeName: '',
  roastery: '',
  origin: '',
  variety: '',
  process: '',
  roasterNotes: '',
  brewingMethod: '',
  temperature: 'hot',
  body: 3,
  acidity: 3,
  sweetness: 3,
  finish: 3,
  bitterness: 3,
  balance: 3,
  mouthfeel: 'Clean',
  personalComment: ''
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
      const completeTasting: CurrentTasting = {
        mode: currentTasting.mode || 'cafe',
        coffeeName: currentTasting.coffeeName || '',
        roastery: currentTasting.roastery || '',
        origin: currentTasting.origin || '',
        variety: currentTasting.variety || '',
        process: currentTasting.process || '',
        altitude: currentTasting.altitude || '',
        roastLevel: currentTasting.roastLevel || '',
        temperature: currentTasting.temperature || 'hot',
        roasterNotes: currentTasting.roasterNotes || '',
        body: currentTasting.body || 3,
        acidity: currentTasting.acidity || 3,
        sweetness: currentTasting.sweetness || 3,
        finish: currentTasting.finish || 3,
        bitterness: currentTasting.bitterness || 3,
        balance: currentTasting.balance || 3,
        mouthfeel: currentTasting.mouthfeel || 'Clean',
        personalComment: currentTasting.personalComment || '',
        cafeName: currentTasting.cafeName,
        homeCafeData: currentTasting.homeCafeData,
        simpleHomeCafeData: currentTasting.simpleHomeCafeData,
        labModeData: currentTasting.labModeData,
    };
      
      await StorageService.saveTasting(completeTasting as unknown);
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
      set({ tastingSessions: tastings as unknown, isLoading: false });
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
      await StorageService.saveCurrentTasting(currentTasting as unknown);
  } catch (error) {
      // console.error('Error saving progress:', error);
  }
},

  loadProgress: async () => {
    try {
      const savedProgress = await StorageService.getCurrentTasting();
      if (savedProgress) {
        set({ currentTasting: savedProgress as unknown });
    }
  } catch (error) {
      // console.error('Error loading progress:', error);
  }
}
}));