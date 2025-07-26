import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import { Logger, PerformanceTimer, logError } from '../utils/logger';

export interface PhotoResult {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
  fileName: string;
  type: string;
}

export interface PhotoOptions {
  mediaType?: MediaType;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  includeBase64?: boolean;
}

class PhotoService {
  private static instance: PhotoService;
  
  private constructor() {}
  
  static getInstance(): PhotoService {
    if (!PhotoService.instance) {
      PhotoService.instance = new PhotoService();
  }
    return PhotoService.instance;
}
  
  /**
   * Show action sheet to choose photo source
   */
  async selectPhoto(options: PhotoOptions = {}): Promise<PhotoResult | null> {
    return new Promise((resolve) => {
      Alert.alert(
        '사진 선택',
        '사진을 어떻게 추가하시겠습니까?',
        [
          { text: '취소', style: 'cancel', onPress: () => resolve(null) },
          { text: '카메라', onPress: () => this.openCamera(options).then(resolve) },
          { text: '갤러리', onPress: () => this.openLibrary(options).then(resolve) },
        ],
        { cancelable: true }
      );
  });
}
  
  /**
   * Open camera to take photo
   */
  private async openCamera(options: PhotoOptions = {}): Promise<PhotoResult | null> {
    try {
      // Request camera permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: '카메라 권한',
            message: '사진을 촬영하려면 카메라 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '확인',
        }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Logger.warn('Camera permission denied', 'photo', {
            function: 'requestCameraPermission'
        });
          return null;
      }
    }
      
      const imageOptions: unknown = {
        mediaType: options.mediaType || ('photo' as MediaType),
        quality: options.quality || 0.8,
        maxWidth: options.maxWidth || 1024,
        maxHeight: options.maxHeight || 1024,
        includeBase64: options.includeBase64 || false,
    };
      
      return new Promise((resolve) => {
        launchCamera(imageOptions, (response: ImagePickerResponse) => {
          if (response.didCancel || response.errorMessage) {
            resolve(null);
            return;
        }
          
          const asset = response.assets?.[0];
          if (asset) {
            resolve({
              uri: asset.uri!,
              width: asset.width!,
              height: asset.height!,
              fileSize: asset.fileSize!,
              fileName: asset.fileName!,
              type: asset.type!,
          });
        } else {
            resolve(null);
        }
      });
    });
  } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        function: 'openCamera',
        options
    }, 'photo');
      return null;
  }
}
  
  /**
   * Open photo library to select photo
   */
  private async openLibrary(options: PhotoOptions = {}): Promise<PhotoResult | null> {
    try {
      const imageOptions: unknown = {
        mediaType: options.mediaType || ('photo' as MediaType),
        quality: options.quality || 0.8,
        maxWidth: options.maxWidth || 1024,
        maxHeight: options.maxHeight || 1024,
        includeBase64: options.includeBase64 || false,
    };
      
      return new Promise((resolve) => {
        launchImageLibrary(imageOptions, (response: ImagePickerResponse) => {
          if (response.didCancel || response.errorMessage) {
            resolve(null);
            return;
        }
          
          const asset = response.assets?.[0];
          if (asset) {
            resolve({
              uri: asset.uri!,
              width: asset.width!,
              height: asset.height!,
              fileSize: asset.fileSize!,
              fileName: asset.fileName!,
              type: asset.type!,
          });
        } else {
            resolve(null);
        }
      });
    });
  } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        function: 'openLibrary',
        options
    }, 'photo');
      return null;
  }
}
  
  /**
   * Save photo to local storage
   */
  async savePhotoLocally(photoResult: PhotoResult, tastingId: string): Promise<string | null> {
    try {
      const documentsPath = RNFS.DocumentDirectoryPath;
      const photosDir = `${documentsPath}/photos`;
      
      // Create photos directory if it doesn't exist
      if (!(await RNFS.exists(photosDir))) {
        await RNFS.mkdir(photosDir);
    }
      
      // Generate unique filename
      const timestamp = Date.now();
      const extension = photoResult.fileName.split('.').pop() || 'jpg';
      const localFileName = `${tastingId}_${timestamp}.${extension}`;
      const localPath = `${photosDir}/${localFileName}`;
      
      // Copy photo to local storage
      await RNFS.copyFile(photoResult.uri, localPath);
      
      return localPath;
  } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        function: 'savePhoto',
        sourceUri: photoResult.uri,
        tastingId
    }, 'photo');
      return null;
  }
}
  
  /**
   * Delete photo from local storage
   */
  async deletePhotoLocally(photoPath: string): Promise<boolean> {
    try {
      if (await RNFS.exists(photoPath)) {
        await RNFS.unlink(photoPath);
        return true;
    }
      return false;
  } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        function: 'deletePhoto',
        photoPath
    }, 'photo');
      return false;
  }
}
  
  /**
   * Get photo URI for display
   */
  getPhotoUri(photoPath: string): string {
    if (photoPath.startsWith('file://')) {
      return photoPath;
  }
    return `file://${photoPath}`;
}
  
  /**
   * Create thumbnail from photo
   */
  async createThumbnail(photoPath: string, tastingId: string): Promise<string | null> {
    try {
      // For now, just return the original photo
      // In a real implementation, you'd resize the image
      return photoPath;
  } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        function: 'createThumbnail',
        photoPath,
        tastingId
    }, 'photo');
      return null;
  }
}
  
  /**
   * Clean up old photos
   */
  async cleanupOldPhotos(daysOld: number = 30): Promise<void> {
    try {
      const documentsPath = RNFS.DocumentDirectoryPath;
      const photosDir = `${documentsPath}/photos`;
      
      if (!(await RNFS.exists(photosDir))) {
        return;
    }
      
      const files = await RNFS.readDir(photosDir);
      const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      
      for (const file of files) {
        const fileDate = new Date(file.mtime || file.ctime || 0).getTime();
        if (fileDate < cutoffDate) {
          await RNFS.unlink(file.path);
      }
    }
  } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        function: 'cleanupPhotos'
    }, 'photo');
  }
}
}

export default PhotoService.getInstance();