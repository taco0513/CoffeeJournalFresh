import { Platform, Share } from 'react-native';
import RealmService from './realm/RealmService';
import { ITastingRecord } from './realm/schemas';

interface ExportTasting {
  id: string;
  date: Date;
  cafeName: string;
  roastery: string;
  coffeeName: string;
  origin: string;
  variety: string;
  process: string;
  temperature: string;
  body: number;
  acidity: number;
  sweetness: number;
  finish: number;
  matchScore: number;
  flavorNotes: string[];
  roasterNotes: string;
}

class ExportService {
  private static instance: ExportService;

  private constructor() {}

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  /**
   * Fetch all tasting records from RealmService
   */
  async getAllTastings(): Promise<ExportTasting[]> {
    try {
      const realmService = RealmService.getInstance();
      
      // Ensure Realm is initialized
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }

      // Get all non-deleted tasting records
      const tastings = realmService.getTastingRecords({ isDeleted: false });
      
      // Convert Realm objects to plain objects for export
      const exportTastings: ExportTasting[] = [];
      
      for (let i = 0; i < tastings.length; i++) {
        const tasting = tastings[i];
        
        // Extract flavor notes as strings (level 1 flavors)
        const flavorNotes = tasting.flavorNotes
          .filter(note => note.level === 1)
          .map(note => note.value);
        
        exportTastings.push({
          id: tasting.id,
          date: tasting.createdAt,
          cafeName: tasting.cafeName || '',
          roastery: tasting.roastery,
          coffeeName: tasting.coffeeName,
          origin: tasting.origin || '',
          variety: tasting.variety || '',
          process: tasting.process || '',
          temperature: tasting.temperature,
          body: tasting.sensoryAttribute?.body || 3,
          acidity: tasting.sensoryAttribute?.acidity || 3,
          sweetness: tasting.sensoryAttribute?.sweetness || 3,
          finish: tasting.sensoryAttribute?.finish || 3,
          matchScore: tasting.matchScoreTotal,
          flavorNotes: flavorNotes,
          roasterNotes: tasting.roasterNotes || '',
        });
      }
      
      // Sort by date (newest first)
      exportTastings.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      return exportTastings;
    } catch (error) {
      console.error('Error getting all tastings:', error);
      throw new Error(`Failed to fetch tastings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert tastings array to CSV format
   */
  exportToCSV(tastings: ExportTasting[]): string {
    // Define CSV headers
    const headers = [
      'Date',
      'Cafe',
      'Roastery',
      'Coffee Name',
      'Origin',
      'Variety',
      'Process',
      'Temperature',
      'Body',
      'Acidity',
      'Sweetness',
      'Finish',
      'Match Score',
      'Flavor Notes',
      'Roaster Notes'
    ];

    // Create CSV content
    const csvRows = [headers.join(',')];

    tastings.forEach(tasting => {
      const row = [
        this.formatDate(tasting.date),
        this.escapeCSV(tasting.cafeName),
        this.escapeCSV(tasting.roastery),
        this.escapeCSV(tasting.coffeeName),
        this.escapeCSV(tasting.origin),
        this.escapeCSV(tasting.variety),
        this.escapeCSV(tasting.process),
        tasting.temperature,
        tasting.body.toString(),
        tasting.acidity.toString(),
        tasting.sweetness.toString(),
        tasting.finish.toString(),
        tasting.matchScore.toString(),
        this.escapeCSV(tasting.flavorNotes.join('; ')),
        this.escapeCSV(tasting.roasterNotes)
      ];
      
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Convert tastings array to formatted JSON
   */
  exportToJSON(tastings: ExportTasting[]): string {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalTastings: tastings.length,
      tastings: tastings.map(tasting => ({
        ...tasting,
        date: tasting.date.toISOString(),
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Save file using React Native Share API
   * Note: This method uses the Share API instead of react-native-fs
   * For actual file saving, react-native-fs needs to be installed
   */
  async saveFile(content: string, filename: string, type: 'csv' | 'json'): Promise<string> {
    try {
      const mimeType = type === 'csv' ? 'text/csv' : 'application/json';
      
      // For now, we'll use the Share API to share the content
      // In a real implementation with react-native-fs, we would:
      // 1. Save the file to the device's document directory
      // 2. Return the file path
      
      const result = await Share.share({
        message: Platform.OS === 'ios' ? undefined : content,
        url: Platform.OS === 'ios' ? `data:${mimeType};base64,${Buffer.from(content).toString('base64')}` : undefined,
        title: `Export ${filename}`,
      });

      if (result.action === Share.sharedAction) {
        return 'Content shared successfully';
      } else if (result.action === Share.dismissedAction) {
        throw new Error('Export cancelled');
      }

      return 'Export completed';
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export all tastings to CSV and save/share
   */
  async exportAllToCSV(): Promise<{ success: boolean; message?: string }> {
    try {
      const tastings = await this.getAllTastings();
      
      if (tastings.length === 0) {
        throw new Error('No tastings to export');
      }

      const csvContent = this.exportToCSV(tastings);
      const filename = `coffee-tastings-${this.formatDate(new Date())}.csv`;
      
      const result = await this.saveFile(csvContent, filename, 'csv');
      return { success: true, message: result };
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Export failed' };
    }
  }

  /**
   * Export all tastings to JSON and save/share
   */
  async exportAllToJSON(): Promise<{ success: boolean; message?: string }> {
    try {
      const tastings = await this.getAllTastings();
      
      if (tastings.length === 0) {
        throw new Error('No tastings to export');
      }

      const jsonContent = this.exportToJSON(tastings);
      const filename = `coffee-tastings-${this.formatDate(new Date())}.json`;
      
      const result = await this.saveFile(jsonContent, filename, 'json');
      return { success: true, message: result };
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Export failed' };
    }
  }

  /**
   * Helper method to format date for filenames and CSV
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper method to escape CSV values
   */
  private escapeCSV(value: string): string {
    if (!value) return '';
    
    // If value contains comma, quote, or newline, wrap in quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      // Escape quotes by doubling them
      const escaped = value.replace(/"/g, '""');
      return `"${escaped}"`;
    }
    
    return value;
  }

  /**
   * Get export preview (first 5 records)
   */
  async getExportPreview(): Promise<{
    totalCount: number;
    records: ExportTasting[];
    csvSample: string;
  }> {
    try {
      const allTastings = await this.getAllTastings();
      const records = allTastings.slice(0, 5);
      const csvSample = this.exportToCSV(records);
      
      return {
        totalCount: allTastings.length,
        records,
        csvSample
      };
    } catch (error) {
      console.error('Error getting export preview:', error);
      throw error;
    }
  }
}

export default ExportService;

/**
 * Note: To use actual file saving functionality, install react-native-fs:
 * 
 * npm install react-native-fs
 * cd ios && pod install
 * 
 * Then update the saveFile method to use RNFS:
 * 
 * import RNFS from 'react-native-fs';
 * 
 * async saveFile(content: string, filename: string, type: 'csv' | 'json'): Promise<string> {
 *   const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
 *   await RNFS.writeFile(path, content, 'utf8');
 *   return path;
 * }
 */