import { useTastingStore } from './tastingStore';
import { useUserStore } from './useUserStore';
import { useShallow } from 'zustand/react/shallow';

/**
 * Optimized selectors to prevent unnecessary re-renders
 */

// Tasting Store Selectors
export const useTastingMode = () => useTastingStore(state => state.currentTasting.mode);

export const useCoffeeInfo = () => useTastingStore(
  useShallow(state => ({
    roastery: state.currentTasting.roastery,
    coffeeName: state.currentTasting.coffeeName,
    origin: state.currentTasting.origin,
    variety: state.currentTasting.variety,
    process: state.currentTasting.process,
    altitude: state.currentTasting.altitude,
    roastLevel: state.currentTasting.roastLevel,
    temperature: state.currentTasting.temperature,
    roasterNotes: state.currentTasting.roasterNotes,
}))
);

export const useSensoryData = () => useTastingStore(
  useShallow(state => ({
    body: state.currentTasting.body,
    acidity: state.currentTasting.acidity,
    sweetness: state.currentTasting.sweetness,
    finish: state.currentTasting.finish,
    bitterness: state.currentTasting.bitterness,
    balance: state.currentTasting.balance,
    mouthfeel: state.currentTasting.mouthfeel,
}))
);

export const useFlavorData = () => useTastingStore(
  useShallow(state => ({
    selectedFlavors: state.selectedFlavors,
    selectedSensoryExpressions: state.selectedSensoryExpressions,
    setSelectedFlavors: state.setSelectedFlavors,
    setSelectedSensoryExpressions: state.setSelectedSensoryExpressions,
}))
);

export const useHomeCafeData = () => useTastingStore(
  useShallow(state => ({
    mode: state.currentTasting.mode,
    homeCafeData: state.currentTasting.homeCafeData,
    simpleHomeCafeData: state.currentTasting.simpleHomeCafeData,
    updateHomeCafeData: state.updateHomeCafeData,
    updateSimpleHomeCafeData: state.updateSimpleHomeCafeData,
}))
);

export const useTastingActions = () => useTastingStore(
  useShallow(state => ({
    updateField: state.updateField,
    saveTasting: state.saveTasting,
    reset: state.reset,
    calculateMatchScore: state.calculateMatchScore,
    autoSave: state.autoSave,
}))
);

export const useSyncStatus = () => useTastingStore(state => state.syncStatus);

export const useMatchScore = () => useTastingStore(state => state.matchScoreTotal);

// User Store Selectors
export const useCurrentUser = () => useUserStore(state => state.currentUser);

export const useUserProfile = () => useUserStore(
  useShallow(state => ({
    currentUser: state.currentUser,
    isLoading: state.isLoading,
}))
);

export const useAuthActions = () => useUserStore(
  useShallow(state => ({
    signIn: state.signIn,
    signOut: state.signOut,
    updateProfile: state.updateProfile,
}))
);

// Composite selectors for specific screens
export const useResultScreenData = () => useTastingStore(
  useShallow(state => ({
    currentTasting: state.currentTasting,
    selectedFlavors: state.selectedFlavors,
    selectedSensoryExpressions: state.selectedSensoryExpressions,
    matchScoreTotal: state.matchScoreTotal,
    saveTasting: state.saveTasting,
    reset: state.reset,
    checkAchievements: state.checkAchievements,
}))
);

export const useCoffeeInfoScreenData = () => useTastingStore(
  useShallow(state => ({
    currentTasting: state.currentTasting,
    updateField: state.updateField,
    setTastingMode: state.setTastingMode,
    autoSave: state.autoSave,
}))
);

export const useFlavorScreenData = () => useTastingStore(
  useShallow(state => ({
    mode: state.currentTasting.mode,
    selectedFlavors: state.selectedFlavors,
    setSelectedFlavors: state.setSelectedFlavors,
    updateField: state.updateField,
}))
);

export const useSensoryScreenData = () => useTastingStore(
  useShallow(state => ({
    currentTasting: state.currentTasting,
    selectedSensoryExpressions: state.selectedSensoryExpressions,
    setSelectedSensoryExpressions: state.setSelectedSensoryExpressions,
    updateField: state.updateField,
    autoSave: state.autoSave,
}))
);