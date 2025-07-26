import AsyncStorage from '@react-native-async-storage/async-storage';

import { Logger } from '../services/LoggingService';
export const resetSensoryOnboarding = async () => {
  try {
    await AsyncStorage.removeItem('hasSeenKoreanSensoryOnboarding');
    Logger.debug('Sensory onboarding reset successfully', 'util', { component: 'resetOnboarding' });
} catch (error) {
    Logger.error('Failed to reset sensory onboarding:', 'util', { component: 'resetOnboarding', error: error });
}
};

// For debugging in React Native Debugger console
(global as unknown).resetSensoryOnboarding = resetSensoryOnboarding;