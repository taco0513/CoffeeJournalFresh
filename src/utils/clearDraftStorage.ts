import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility to manually clear problematic draft data
 * Use this if the draft recovery modal keeps appearing
 */
export const clearDraftStorage = async (): Promise<void> => {
  try {
    // Clear the tasting draft
    await AsyncStorage.removeItem('@tasting_draft');
    
    // Also clear any other potential draft keys
    await AsyncStorage.removeItem('@current_form_data');
    
    console.log('✅ All draft storage cleared successfully');
  } catch (error) {
    console.error('❌ Failed to clear draft storage:', error);
  }
};

/**
 * Debug utility to check what's in draft storage
 */
export const inspectDraftStorage = async (): Promise<void> => {
  try {
    const draftData = await AsyncStorage.getItem('@tasting_draft');
    const formData = await AsyncStorage.getItem('@current_form_data');
    
    console.log('🔍 Draft Storage Inspection:');
    console.log('- @tasting_draft:', draftData ? JSON.parse(draftData) : 'No data');
    console.log('- @current_form_data:', formData ? JSON.parse(formData) : 'No data');
  } catch (error) {
    console.error('❌ Failed to inspect draft storage:', error);
  }
};

// For development use - call this to immediately clear problematic drafts
if (__DEV__) {
  // Expose to global for easy access in development
  (global as any).clearDraftStorage = clearDraftStorage;
  (global as any).inspectDraftStorage = inspectDraftStorage;
}