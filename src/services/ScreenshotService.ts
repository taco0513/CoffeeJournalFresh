import { Platform, Alert } from 'react-native';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import { Logger } from '../utils/logger';

export class ScreenshotService {
  /**
   * Capture screenshot of a ViewShot component
   * @param viewShotRef Reference to ViewShot component
   * @param filename Optional filename (defaults to timestamp)
   * @returns Promise<string | null> - file path or null if failed
   */
  static async captureScreen(
    viewShotRef: React.RefObject<ViewShot | null>,
    filename?: string
  ): Promise<string | null> {
    try {
      if (!viewShotRef.current) {
        throw new Error('ViewShot reference is not available');
      }

      // Generate filename if not provided
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const finalFilename = filename || `screenshot-${timestamp}.png`;

      // Capture screenshot
      const uri = await viewShotRef.current.capture();
      
      // Define destination path
      const documentsPath = Platform.OS === 'ios' 
        ? RNFS.DocumentDirectoryPath 
        : RNFS.ExternalDirectoryPath;
      
      const destinationPath = `${documentsPath}/CoffeeJournal_Screenshots/${finalFilename}`;

      // Create directory if it doesn't exist
      const dirPath = `${documentsPath}/CoffeeJournal_Screenshots`;
      const dirExists = await RNFS.exists(dirPath);
      if (!dirExists) {
        await RNFS.mkdir(dirPath);
      }

      // Copy file to destination
      await RNFS.copyFile(uri, destinationPath);

      Logger.info('Screenshot saved', 'screenshot', { data: { path: destinationPath } });
      return destinationPath;
    } catch (error) {
      Logger.error('Error capturing screenshot', 'screenshot', { error: error as Error });
      return null;
    }
  }

  /**
   * Capture multiple screenshots with delay
   * @param viewShotRef ViewShot reference
   * @param count Number of screenshots to take
   * @param delay Delay between screenshots in ms
   * @param prefix Filename prefix
   */
  static async captureMultiple(
    viewShotRef: React.RefObject<ViewShot | null>,
    count: number = 5,
    delay: number = 1000,
    prefix: string = 'auto'
  ): Promise<string[]> {
    const savedPaths: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const filename = `${prefix}-${i + 1}-${Date.now()}.png`;
      const path = await this.captureScreen(viewShotRef, filename);
      
      if (path) {
        savedPaths.push(path);
      }
      
      // Wait for delay (except on last iteration)
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return savedPaths;
  }

  /**
   * Get all saved screenshots
   */
  static async getSavedScreenshots(): Promise<string[]> {
    try {
      const documentsPath = Platform.OS === 'ios' 
        ? RNFS.DocumentDirectoryPath 
        : RNFS.ExternalDirectoryPath;
      
      const screenshotsPath = `${documentsPath}/CoffeeJournal_Screenshots`;
      
      const exists = await RNFS.exists(screenshotsPath);
      if (!exists) {
        return [];
      }
      
      const files = await RNFS.readDir(screenshotsPath);
      return files
        .filter(file => file.name.endsWith('.png'))
        .map(file => file.path)
        .sort((a, b) => b.localeCompare(a)); // Latest first
    } catch (error) {
      Logger.error('Error getting saved screenshots', 'screenshot', { error: error as Error });
      return [];
    }
  }

  /**
   * Delete all screenshots
   */
  static async clearAllScreenshots(): Promise<boolean> {
    try {
      const documentsPath = Platform.OS === 'ios' 
        ? RNFS.DocumentDirectoryPath 
        : RNFS.ExternalDirectoryPath;
      
      const screenshotsPath = `${documentsPath}/CoffeeJournal_Screenshots`;
      
      const exists = await RNFS.exists(screenshotsPath);
      if (exists) {
        await RNFS.unlink(screenshotsPath);
      }
      
      return true;
    } catch (error) {
      Logger.error('Error clearing screenshots', 'screenshot', { error: error as Error });
      return false;
    }
  }

  /**
   * Show success alert with screenshot info
   */
  static showSaveSuccess(path: string) {
    Alert.alert(
      '스크린샷 저장 완료',
      `파일이 저장되었습니다:\n${path}`,
      [{ text: '확인' }]
    );
  }

  /**
   * Show multiple screenshots save success
   */
  static showMultipleSaveSuccess(paths: string[]) {
    Alert.alert(
      '스크린샷 저장 완료',
      `${paths.length}개의 스크린샷이 저장되었습니다.\n\n저장 위치:\nCoffeeJournal_Screenshots/`,
      [{ text: '확인' }]
    );
  }
}