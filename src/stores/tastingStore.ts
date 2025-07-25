import {create} from 'zustand';
import RealmService from '../services/realm/RealmService';

export interface FlavorPath {
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingUploads: number;
  error: string | null;
}

export interface SelectedFlavors extends FlavorPath {}

export interface SensoryAttributes {
  body: number;
  acidity: number;
  sweetness: number;
  finish: number;
  mouthfeel: string;
}

interface TastingState {
  currentTasting: any;
  selectedFlavors: FlavorPath[];
  matchScoreTotal: number | null;
  syncStatus: SyncStatus;
  
  updateField: (field: string, value: any) => void;
  setSelectedFlavors: (flavors: FlavorPath[]) => void;
  saveTasting: () => void;
  calculateMatchScore: () => void;
  reset: () => void;
  updateSyncStatus: (status: Partial<SyncStatus>) => void;
}

export const useTastingStore = create<TastingState>((set, get) => ({
  currentTasting: {
    cafeName: '',
    roastery: '',
    coffeeName: '',
    origin: '',
    variety: '',
    process: '',
    altitude: '',
    temperature: 'hot',
    roasterNotes: '',
    body: 3,
    acidity: 3,
    sweetness: 3,
    finish: 3,
    mouthfeel: 'Clean',
  },
  selectedFlavors: [],
  matchScoreTotal: null,
  syncStatus: {
    isOnline: false,
    isSyncing: false,
    lastSyncTime: null,
    pendingUploads: 0,
    error: null,
  },

  updateField: (field, value) =>
    set((state) => ({
      currentTasting: {
        ...state.currentTasting,
        [field]: value,
      },
    })),

  setSelectedFlavors: (flavors) =>
    set(() => ({
      selectedFlavors: flavors,
    })),

  saveTasting: () => {
    const state = get();
    const {currentTasting, selectedFlavors} = state;

    // sensoryAttributes 구조 생성
    const sensoryAttributes = {
      body: currentTasting.body || 3,
      acidity: currentTasting.acidity || 3,
      sweetness: currentTasting.sweetness || 3,
      finish: currentTasting.finish || 3,
      mouthfeel: currentTasting.mouthfeel || 'Clean',
    };

    // console.log('Saving tasting data:');
    // console.log('- currentTasting:', currentTasting);
    // console.log('- selectedFlavors:', selectedFlavors);
    // console.log('- sensoryAttributes:', sensoryAttributes);
    try {
      RealmService.getInstance().saveTasting({
        coffeeInfo: {
          cafeName: currentTasting.cafeName,
          roastery: currentTasting.roastery,
          coffeeName: currentTasting.coffeeName,
          origin: currentTasting.origin,
          variety: currentTasting.variety,
          altitude: currentTasting.altitude,
          process: currentTasting.process,
          temperature: currentTasting.temperature || 'hot',
        },
        roasterNotes: currentTasting.roasterNotes,
        selectedFlavors: selectedFlavors,
        sensoryAttributes: sensoryAttributes,
        matchScore: {
          total: state.matchScoreTotal || 0,
          flavorScore: 0,
          sensoryScore: 0,
        },
      });

      // console.log('Tasting saved successfully');
      // 저장 후 점수 계산
      state.calculateMatchScore();
    } catch (error) {
      // console.error('Error saving tasting:', error);
      throw error;
    }
  },

  calculateMatchScore: () => {
    const {currentTasting, selectedFlavors} = get();
    
    // 여기서 매칭 점수 계산 로직
    let flavorScore = 0;
    if (currentTasting.roasterNotes && selectedFlavors.length > 0) {
      // 간단한 예시 로직
      flavorScore = 70; // 실제로는 복잡한 계산
    }
    
    const sensoryScore = 80; // 실제로는 감각 평가 기반 계산
    
    const totalScore = Math.round(flavorScore * 0.6 + sensoryScore * 0.4);
    
    set({ matchScoreTotal: totalScore });
  },

  updateSyncStatus: (status) =>
    set((state) => ({
      syncStatus: {
        ...state.syncStatus,
        ...status,
      },
    })),

  reset: () =>
    set({
      currentTasting: {
        cafeName: '',
        roasterName: '',
        coffeeName: '',
        origin: '',
        variety: '',
        process: '',
        altitude: '',
        temperature: 'hot',
        roasterNotes: '',
        body: 3,
        acidity: 3,
        sweetness: 3,
        finish: 3,
        mouthfeel: 'Clean',
      },
      selectedFlavors: [],
      matchScoreTotal: null,
    }),
}));