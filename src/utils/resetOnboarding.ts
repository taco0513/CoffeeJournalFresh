import AsyncStorage from '@react-native-async-storage/async-storage';

export const resetSensoryOnboarding = async () => {
  try {
    await AsyncStorage.removeItem('hasSeenKoreanSensoryOnboarding');
    console.log('Sensory onboarding reset successfully');
  } catch (error) {
    console.error('Failed to reset sensory onboarding:', error);
  }
};

// For debugging in React Native Debugger console
(global as any).resetSensoryOnboarding = resetSensoryOnboarding;