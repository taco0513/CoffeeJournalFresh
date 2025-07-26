import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DevState {
  // Developer mode settings
  isDeveloperMode: boolean;
  
  // Debug settings
  showDebugInfo: boolean;
  enableNetworkLogs: boolean;
  enableRealmLogs: boolean;
  showPerformanceMetrics: boolean;
  
  // Test data settings
  skipAnimations: boolean;
  bypassLogin: boolean;
  
  // Feature flags
  enableExperimentalFeatures: boolean;
  enableBetaFeatures: boolean;
  
  // Actions
  toggleDeveloperMode: () => void;
  setDebugInfo: (show: boolean) => void;
  setNetworkLogs: (enable: boolean) => void;
  setRealmLogs: (enable: boolean) => void;
  setPerformanceMetrics: (show: boolean) => void;
  setSkipAnimations: (skip: boolean) => void;
  setBypassLogin: (bypass: boolean) => void;
  setExperimentalFeatures: (enable: boolean) => void;
  setBetaFeatures: (enable: boolean) => void;
  resetAllSettings: () => void;
}

const initialState = {
  isDeveloperMode: __DEV__, // Enable developer mode in debug builds
  showDebugInfo: false,
  enableNetworkLogs: false,
  enableRealmLogs: false,
  showPerformanceMetrics: false,
  skipAnimations: false,
  bypassLogin: __DEV__, // Enable bypass login in debug builds
  enableExperimentalFeatures: false,
  enableBetaFeatures: false,
};

export const useDevStore = create<DevState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      toggleDeveloperMode: () => {
        const currentMode = get().isDeveloperMode;
        if (!currentMode) {
          // Entering developer mode - reset all other settings
          set({
            ...initialState,
            isDeveloperMode: true,
        });
      } else {
          // Exiting developer mode - reset everything
          set({ ...initialState });
      }
    },
      
      setDebugInfo: (show: boolean) => set({ showDebugInfo: show }),
      setNetworkLogs: (enable: boolean) => set({ enableNetworkLogs: enable }),
      setRealmLogs: (enable: boolean) => set({ enableRealmLogs: enable }),
      setPerformanceMetrics: (show: boolean) => set({ showPerformanceMetrics: show }),
          setSkipAnimations: (skip: boolean) => set({ skipAnimations: skip }),
      setBypassLogin: (bypass: boolean) => set({ bypassLogin: bypass }),
      setExperimentalFeatures: (enable: boolean) => set({ enableExperimentalFeatures: enable }),
      setBetaFeatures: (enable: boolean) => set({ enableBetaFeatures: enable }),
      
      resetAllSettings: () => set({ ...initialState }),
  }),
    {
      name: 'cupnote-dev-storage',
      storage: createJSONStorage(() => AsyncStorage),
  }
  )
);