import AsyncStorage from '@react-native-async-storage/async-storage';
import { TastingData } from '../types';

const STORAGE_KEYS = {
  TASTINGS: '@coffee_journal_tastings',
  CURRENT_TASTING: '@coffee_journal_current_tasting',
  PREFERENCES: '@coffee_journal_preferences',
} as const;

export class StorageService {
  // Save tasting data
  static async saveTasting(tasting: TastingData): Promise<void> {
    try {
      const existingData = await this.getTastings();
      const updatedData = [...existingData, tasting];
      await AsyncStorage.setItem(STORAGE_KEYS.TASTINGS, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving tasting:', error);
      throw error;
    }
  }

  // Get all tastings
  static async getTastings(): Promise<TastingData[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TASTINGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting tastings:', error);
      return [];
    }
  }

  // Get recent tastings
  static async getRecentTastings(limit: number = 10): Promise<TastingData[]> {
    try {
      const tastings = await this.getTastings();
      return tastings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent tastings:', error);
      return [];
    }
  }

  // Delete a tasting
  static async deleteTasting(id: string): Promise<void> {
    try {
      const tastings = await this.getTastings();
      const updatedTastings = tastings.filter(t => t.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.TASTINGS, JSON.stringify(updatedTastings));
    } catch (error) {
      console.error('Error deleting tasting:', error);
      throw error;
    }
  }

  // Update a tasting
  static async updateTasting(id: string, updates: Partial<TastingData>): Promise<void> {
    try {
      const tastings = await this.getTastings();
      const index = tastings.findIndex(t => t.id === id);
      if (index !== -1) {
        tastings[index] = { ...tastings[index], ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.TASTINGS, JSON.stringify(tastings));
      }
    } catch (error) {
      console.error('Error updating tasting:', error);
      throw error;
    }
  }

  // Save current tasting progress
  static async saveCurrentTasting(data: Partial<TastingData>): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TASTING, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving current tasting:', error);
      throw error;
    }
  }

  // Get current tasting progress
  static async getCurrentTasting(): Promise<Partial<TastingData> | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TASTING);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting current tasting:', error);
      return null;
    }
  }

  // Clear current tasting
  static async clearCurrentTasting(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TASTING);
    } catch (error) {
      console.error('Error clearing current tasting:', error);
      throw error;
    }
  }

  // Export all data
  static async exportData(): Promise<string> {
    try {
      const tastings = await this.getTastings();
      return JSON.stringify({ tastings, exportDate: new Date().toISOString() }, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Import data
  static async importData(jsonData: string): Promise<void> {
    try {
      const { tastings } = JSON.parse(jsonData);
      if (Array.isArray(tastings)) {
        await AsyncStorage.setItem(STORAGE_KEYS.TASTINGS, JSON.stringify(tastings));
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  // Get storage info
  static async getStorageInfo(): Promise<{ totalRecords: number; storageSize: string }> {
    try {
      const tastings = await this.getTastings();
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TASTINGS);
      const sizeInBytes = data ? new Blob([data]).size : 0;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);
      
      return {
        totalRecords: tastings.length,
        storageSize: `${sizeInKB} KB`
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { totalRecords: 0, storageSize: '0 KB' };
    }
  }
}