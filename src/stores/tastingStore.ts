import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RealmService from '../services/realm/RealmService';
import { AchievementSystem } from '../services/AchievementSystem';
import { UserAction, Achievement } from '../types/achievements';
import { 
  FlavorPath, 
  SyncStatus, 
  SelectedFlavors, 
  SensoryAttributes, 
  SelectedSensoryExpression,
  CurrentTasting,
  TastingMode,
  HomeCafeData,
  SimpleHomeCafeData,
  LabModeData
} from '../types/tasting';

interface TastingState {
  currentTasting: CurrentTasting;
  selectedFlavors: FlavorPath[];
  selectedSensoryExpressions: SelectedSensoryExpression[];
  matchScoreTotal: number | null;
  syncStatus: SyncStatus;
  
  updateField: <K extends keyof CurrentTasting>(field: K, value: CurrentTasting[K]) => void;
  setSelectedFlavors: (flavors: FlavorPath[]) => void;
  setSelectedSensoryExpressions: (expressions: SelectedSensoryExpression[]) => void;
  saveTasting: () => Promise<void>;
  calculateMatchScore: () => void;
  reset: () => void;
  updateSyncStatus: (status: Partial<SyncStatus>) => void;
  
  // Mode management
  setTastingMode: (mode: TastingMode) => void;
  updateHomeCafeData: (data: Partial<HomeCafeData> | HomeCafeData) => void;
  updateSimpleHomeCafeData: (data: Partial<SimpleHomeCafeData> | SimpleHomeCafeData) => void;
  updateLabModeData: (data: Partial<LabModeData> | LabModeData) => void;
  
  // Auto-save functionality
  autoSave: () => Promise<void>;
  loadDraft: () => Promise<boolean>;
  clearDraft: () => Promise<void>;
  hasDraft: () => Promise<boolean>;
  
  // Achievement functionality
  checkAchievements: (userId: string) => Promise<Achievement[]>;
}

export const useTastingStore = create<TastingState>((set, get) => ({
  currentTasting: {
    mode: 'cafe',
    cafeName: '',
    roastery: '',
    coffeeName: '',
    origin: '',
    variety: '',
    process: '',
    altitude: '',
    roastLevel: '',
    temperature: 'hot',
    roasterNotes: '',
    body: 3,
    acidity: 3,
    sweetness: 3,
    finish: 3,
    bitterness: 3,
    balance: 3,
    mouthfeel: 'Clean',
    personalComment: '',
  },
  selectedFlavors: [],
  selectedSensoryExpressions: [],
  matchScoreTotal: null,
  syncStatus: {
    isOnline: false,
    isSyncing: false,
    lastSyncTime: null,
    pendingUploads: 0,
    error: null,
  },

  updateField: (field, value) => {
    set((state) => ({
      currentTasting: {
        ...state.currentTasting,
        [field]: value,
      },
    }));
  },

  setSelectedFlavors: (flavors) => {
    set(() => ({
      selectedFlavors: flavors,
    }));
  },

  setSelectedSensoryExpressions: (expressions) => {
    // Use category tags to allow same Korean text in different categories
    // Remove duplicates based on korean+categoryId combination
    const seenExpressions = new Set<string>();
    const uniqueExpressions = expressions.filter(expr => {
      const uniqueKey = `${expr.korean}_${expr.categoryId}`;
      if (seenExpressions.has(uniqueKey)) {
        return false;
      }
      seenExpressions.add(uniqueKey);
      return true;
    });
    
    set(() => ({
      selectedSensoryExpressions: uniqueExpressions,
    }));
  },

  saveTasting: async (): Promise<void> => {
    const state = get();
    const {currentTasting, selectedFlavors, selectedSensoryExpressions} = state;

    // sensoryAttributes 구조 생성
    const sensoryAttributes = {
      body: currentTasting.body || 3,
      acidity: currentTasting.acidity || 3,
      sweetness: currentTasting.sweetness || 3,
      finish: currentTasting.finish || 3,
      bitterness: currentTasting.bitterness || 3,
      balance: currentTasting.balance || 3,
      mouthfeel: currentTasting.mouthfeel || 'Clean',
    };

    try {
      const savedTasting = RealmService.getInstance().saveTasting({
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
        selectedSensoryExpressions: selectedSensoryExpressions,
        sensoryAttributes: sensoryAttributes,
        matchScore: {
          total: state.matchScoreTotal || 0,
          flavorScore: 0,
          sensoryScore: 0,
        },
        personalComment: currentTasting.personalComment,
        mode: currentTasting.mode as 'cafe' | 'home_cafe' | undefined,
        homeCafeData: currentTasting.homeCafeData,
        labModeData: currentTasting.labModeData,
      });

      // 저장 후 점수 계산
      state.calculateMatchScore();
      
      // Check achievements after saving
      if (savedTasting && (savedTasting as any).userId) {
        try {
          const achievementSystem = new AchievementSystem();
          const action: UserAction = {
            type: 'tasting',
            data: {
              tastingId: (savedTasting as any).id,
              flavors: selectedFlavors,
              sensoryExpressions: selectedSensoryExpressions,
              mode: currentTasting.mode,
              coffeeInfo: {
                roastery: currentTasting.roastery,
                coffeeName: currentTasting.coffeeName,
                origin: currentTasting.origin,
              },
            },
            timestamp: new Date(),
          };
          await achievementSystem.checkAndUpdateAchievements((savedTasting as any).userId, action);
        } catch (achievementError) {
          console.error('Achievement check failed:', achievementError);
          // Don't throw - achievement check failure shouldn't prevent tasting save
        }
      }
      
      // return savedTasting; // Return type should be void
    } catch (error) {
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

  // Auto-save functionality
  autoSave: async () => {
    try {
      const { currentTasting, selectedFlavors, selectedSensoryExpressions } = get();
      
      // Only save if there's meaningful data (not just initial/empty state)
      const hasSignificantData = 
        currentTasting.cafeName?.trim() ||
        currentTasting.roastery?.trim() ||
        currentTasting.coffeeName?.trim() ||
        currentTasting.origin?.trim() ||
        currentTasting.variety?.trim() ||
        currentTasting.process?.trim() ||
        currentTasting.altitude?.trim() ||
        currentTasting.roasterNotes?.trim() ||
        currentTasting.personalComment?.trim() ||
        selectedFlavors.length > 0 ||
        selectedSensoryExpressions.length > 0 ||
        // Check if sensory values have been modified from defaults
        currentTasting.body !== 3 ||
        currentTasting.acidity !== 3 ||
        currentTasting.sweetness !== 3 ||
        currentTasting.finish !== 3 ||
        currentTasting.bitterness !== 3 ||
        currentTasting.balance !== 3 ||
        (currentTasting.mouthfeel && currentTasting.mouthfeel !== 'Clean');
      
      if (hasSignificantData) {
        const draftData = {
          currentTasting,
          selectedFlavors,
          selectedSensoryExpressions,
          timestamp: new Date().toISOString(),
        };
        await AsyncStorage.setItem('@tasting_draft', JSON.stringify(draftData));
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  },

  loadDraft: async () => {
    try {
      const draftData = await AsyncStorage.getItem('@tasting_draft');
      if (draftData) {
        const { currentTasting, selectedFlavors, selectedSensoryExpressions = [] } = JSON.parse(draftData);
        set({ currentTasting, selectedFlavors, selectedSensoryExpressions });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Load draft failed:', error);
      return false;
    }
  },

  clearDraft: async () => {
    try {
      await AsyncStorage.removeItem('@tasting_draft');
      console.log('Draft cleared successfully');
    } catch (error) {
      console.error('Clear draft failed:', error);
    }
  },

  hasDraft: async () => {
    try {
      const draftData = await AsyncStorage.getItem('@tasting_draft');
      return !!draftData;
    } catch (error) {
      console.error('Check draft failed:', error);
      return false;
    }
  },

  reset: () => {
    // Clear any existing draft when resetting
    get().clearDraft();
    
    set({
      currentTasting: {
        mode: 'cafe',
        cafeName: '',
        roastery: '',
        coffeeName: '',
        origin: '',
        variety: '',
        process: '',
        altitude: '',
        roastLevel: '',
        temperature: 'hot',
        roasterNotes: '',
        body: 3,
        acidity: 3,
        sweetness: 3,
        finish: 3,
        bitterness: 3,
        balance: 3,
        mouthfeel: 'Clean',
        personalComment: '',
      },
      selectedFlavors: [],
      selectedSensoryExpressions: [],
      matchScoreTotal: null,
    });
  },

  setTastingMode: (mode: TastingMode) => {
    set((state) => ({
      currentTasting: {
        ...state.currentTasting,
        mode,
        // Clear mode-specific data when switching
        ...(mode === 'cafe' ? { 
          homeCafeData: undefined, 
          simpleHomeCafeData: undefined, 
          labModeData: undefined 
        } : {}),
        ...(mode === 'home_cafe' ? { 
          cafeName: '', 
          labModeData: undefined 
        } : {}),
        ...(mode === 'lab' ? { 
          cafeName: '', 
          simpleHomeCafeData: undefined 
        } : {}),
      },
    }));
  },

  updateHomeCafeData: (data: Partial<HomeCafeData> | HomeCafeData) => {
    set((state) => ({
      currentTasting: {
        ...state.currentTasting,
        homeCafeData: data as HomeCafeData,
      },
    }));
  },

  updateSimpleHomeCafeData: (data: Partial<SimpleHomeCafeData> | SimpleHomeCafeData) => {
    set((state) => ({
      currentTasting: {
        ...state.currentTasting,
        simpleHomeCafeData: data as SimpleHomeCafeData,
      },
    }));
  },

  updateLabModeData: (data: Partial<LabModeData> | LabModeData) => {
    set((state) => ({
      currentTasting: {
        ...state.currentTasting,
        labModeData: data as LabModeData,
      },
    }));
  },


  checkAchievements: async (userId: string) => {
    if (!userId) return [];
    
    try {
      const { currentTasting, selectedFlavors, matchScoreTotal } = get();
      
      // Create UserAction for achievement checking
      const userAction: UserAction = {
        type: 'tasting',
        data: {
          coffeeInfo: {
            cafeName: currentTasting.cafeName,
            roastery: currentTasting.roastery,
            coffeeName: currentTasting.coffeeName,
            origin: currentTasting.origin,
            variety: currentTasting.variety,
            process: currentTasting.process,
            temperature: currentTasting.temperature || 'hot',
          },
          flavorNotes: selectedFlavors,
          matchScore: matchScoreTotal || 0,
          sensoryAttributes: {
            body: currentTasting.body || 3,
            acidity: currentTasting.acidity || 3,
            sweetness: currentTasting.sweetness || 3,
            finish: currentTasting.finish || 3,
            mouthfeel: currentTasting.mouthfeel || 'Clean',
          },
          timestamp: new Date(),
        },
        timestamp: new Date(),
      };

      // Check for achievements
      const realmService = RealmService.getInstance();
      const achievementSystem = new AchievementSystem(realmService.getRealm());
      await achievementSystem.initializeAchievements();
      
      const newAchievements = await achievementSystem.checkAndUpdateAchievements(
        userId,
        userAction
      );

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  },
}));