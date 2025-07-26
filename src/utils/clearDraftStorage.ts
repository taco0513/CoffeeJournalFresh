import AsyncStorage from '@react-native-async-storage/async-storage';

import { Logger } from '../services/LoggingService';
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
    
    Logger.debug('All draft storage cleared successfully', 'util', { component: 'clearDraftStorage' });
} catch (error) {
    Logger.error('Failed to clear draft storage:', 'util', { component: 'clearDraftStorage', error: error });
}
};

/**
 * Debug utility to check what's in draft storage
 */
export const inspectDraftStorage = async (): Promise<void> => {
  try {
    const draftData = await AsyncStorage.getItem('@tasting_draft');
    const formData = await AsyncStorage.getItem('@current_form_data');
    
    Logger.debug('Draft Storage Inspection:', 'util', { component: 'clearDraftStorage' });
    Logger.debug('- @tasting_draft:', 'util', { component: 'clearDraftStorage', data: draftData ? JSON.parse(draftData) : 'No data' });
    Logger.debug('- @current_form_data:', 'util', { component: 'clearDraftStorage', data: formData ? JSON.parse(formData) : 'No data' });
} catch (error) {
    Logger.error('Failed to inspect draft storage:', 'util', { component: 'clearDraftStorage', error: error });
}
};

// For development use - call this to immediately clear problematic drafts
if (__DEV__) {
  // Expose to global for easy access in development
  (global as unknown).clearDraftStorage = clearDraftStorage;
  (global as unknown).inspectDraftStorage = inspectDraftStorage;
}