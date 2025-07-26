import { create } from 'zustand';

interface TastingData {
  coffeeName: string;
  roastery: string;
  origin: string;
  brewMethod: string;
  flavors: string[];
  createdAt: Date;
}

interface SimpleCoffeeStore {
  // Current tasting session data
  currentTasting: Partial<TastingData>;
  
  // In-memory storage
  tastingSessions: TastingData[];
  
  // Actions
  updateCurrentTasting: (field: keyof TastingData, value: unknown) => void;
  resetCurrentTasting: () => void;
  saveTasting: () => void;
}

const initialTastingData: Partial<TastingData> = {
  coffeeName: '',
  roastery: '',
  origin: '',
  brewMethod: '',
  flavors: [],
};

export const useSimpleCoffeeStore = create<SimpleCoffeeStore>((set, get) => ({
  currentTasting: { ...initialTastingData },
  tastingSessions: [],

  updateCurrentTasting: (field, value) => set((state) => ({
    currentTasting: { ...state.currentTasting, [field]: value }
})),

  resetCurrentTasting: () => set({ currentTasting: { ...initialTastingData } }),

  saveTasting: () => {
    const { currentTasting, tastingSessions } = get();
    const newTasting: TastingData = {
      coffeeName: currentTasting.coffeeName || '',
      roastery: currentTasting.roastery || '',
      origin: currentTasting.origin || '',
      brewMethod: currentTasting.brewMethod || '',
      flavors: currentTasting.flavors || [],
      createdAt: new Date(),
  };
    
    set({ 
      tastingSessions: [...tastingSessions, newTasting],
      currentTasting: { ...initialTastingData }
  });
},
}));