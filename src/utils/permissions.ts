import { Platform, Linking, Alert } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  openSettings,
  Permission,
} from 'react-native-permissions';

export const CAMERA_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.CAMERA,
  android: PERMISSIONS.ANDROID.CAMERA,
}) as Permission;

export const LOCATION_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
}) as Permission;

export const PHOTO_LIBRARY_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
  android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
}) as Permission;

export const NOTIFICATION_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY, // Use a valid iOS permission as fallback
  android: PERMISSIONS.ANDROID.CAMERA, // Use a valid Android permission as fallback  
}) as Permission;

export const CONTACTS_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.CONTACTS,
  android: PERMISSIONS.ANDROID.READ_CONTACTS,
}) as Permission;

export type PermissionStatus = 
  | 'unavailable'
  | 'denied'
  | 'limited'
  | 'granted'
  | 'blocked';

interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
}

export const checkCameraPermission = async (): Promise<PermissionResult> => {
  try {
    const result = await check(CAMERA_PERMISSION);
    
    // console.log('[Permissions] Camera permission check result:', result);
    // console.log('[Permissions] Result type:', typeof result);
    // console.log('[Permissions] Result === RESULTS.GRANTED:', result === RESULTS.GRANTED);
    // console.log('[Permissions] RESULTS constants:', {
    //   UNAVAILABLE: RESULTS.UNAVAILABLE,
    //   DENIED: RESULTS.DENIED,
    //   LIMITED: RESULTS.LIMITED,
    //   GRANTED: RESULTS.GRANTED,
    //   BLOCKED: RESULTS.BLOCKED,
    // });
    // Also log string comparison
    // console.log('[Permissions] String comparison - result === "granted":', result === 'granted');
    switch (result) {
      case RESULTS.UNAVAILABLE:
        // console.log('[Permissions] Camera is unavailable');
        return { status: 'unavailable', canAskAgain: false };
      case RESULTS.DENIED:
        // console.log('[Permissions] Camera permission is denied');
        return { status: 'denied', canAskAgain: true };
      case RESULTS.LIMITED:
        // console.log('[Permissions] Camera permission is limited');
        return { status: 'limited', canAskAgain: false };
      case RESULTS.GRANTED:
        // console.log('[Permissions] Camera permission is granted');
        return { status: 'granted', canAskAgain: false };
      case RESULTS.BLOCKED:
        // console.log('[Permissions] Camera permission is blocked');
        return { status: 'blocked', canAskAgain: false };
      default:
        // console.log('[Permissions] Unknown permission result:', result);
        return { status: 'denied', canAskAgain: true };
  }
} catch (error) {
    // console.error('[Permissions] Error checking camera permission:', error);
    return { status: 'denied', canAskAgain: true };
}
};

export const requestCameraPermission = async (): Promise<PermissionResult> => {
  try {
    const result = await request(CAMERA_PERMISSION);
    
    switch (result) {
      case RESULTS.UNAVAILABLE:
        return { status: 'unavailable', canAskAgain: false };
      case RESULTS.DENIED:
        return { status: 'denied', canAskAgain: true };
      case RESULTS.LIMITED:
        return { status: 'limited', canAskAgain: false };
      case RESULTS.GRANTED:
        return { status: 'granted', canAskAgain: false };
      case RESULTS.BLOCKED:
        return { status: 'blocked', canAskAgain: false };
      default:
        return { status: 'denied', canAskAgain: true };
  }
} catch (error) {
    // console.error('Error requesting camera permission:', error);
    return { status: 'denied', canAskAgain: false };
}
};

export const handleCameraPermission = async (): Promise<boolean> => {
  // console.log('[Permissions] ========== Starting handleCameraPermission ==========');
  // First check current permission status
  const checkResult = await checkCameraPermission();
  // console.log('[Permissions] Check result:', JSON.stringify(checkResult));
  // Also try direct check for debugging
  try {
    const directResult = await check(CAMERA_PERMISSION);
    // console.log('[Permissions] Direct check result:', directResult);
    // console.log('[Permissions] Direct check type:', typeof directResult);
    // console.log('[Permissions] Direct check === "granted":', directResult === 'granted');
    // console.log('[Permissions] Direct check === RESULTS.GRANTED:', directResult === RESULTS.GRANTED);
    // console.log('[Permissions] Direct check === "limited":', directResult === 'limited');
    // console.log('[Permissions] Direct check === RESULTS.LIMITED:', directResult === RESULTS.LIMITED);
} catch (e) {
    // console.log('[Permissions] Direct check error:', e);
}
  
  // VisionCamera is temporarily disabled due to compatibility issues
  // console.log('[Permissions] Vision Camera is disabled - using react-native-permissions only');
  if (checkResult.status === 'granted' || checkResult.status === 'limited') {
    // Already granted or limited (iOS), no need to ask
    // console.log('[Permissions]  Permission already granted or limited, returning true');
    return true;
}
  
  if (checkResult.status === 'unavailable') {
    // console.log('[Permissions] Camera unavailable on this device');
    Alert.alert(
      '카메라 사용 불가',
      '이 기기에서는 카메라를 사용할 수 없습니다.',
      [{ text: '확인' }]
    );
    return false;
}
  
  if (checkResult.status === 'blocked' || !checkResult.canAskAgain) {
    // Permission was denied and can't ask again - need to go to settings
    // console.log('[Permissions] Permission blocked, showing settings alert');
    Alert.alert(
      '카메라 권한 필요',
      '커피 패키지를 스캔하려면 카메라 권한이 필요합니다. 설정에서 카메라 권한을 허용해주세요.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '설정으로 이동', 
          onPress: () => openSettings(),
      },
      ]
    );
    return false;
}
  
  // Permission is denied but we can ask again
  // console.log('[Permissions] Requesting permission...');
  const requestResult = await requestCameraPermission();
  // console.log('[Permissions] Request result:', requestResult);
  if (requestResult.status === 'granted' || requestResult.status === 'limited') {
    // console.log('[Permissions] Permission granted or limited after request');
    return true;
}
  
  if (requestResult.status === 'blocked') {
    // User denied and selected "Don't ask again"
    // console.log('[Permissions] Permission blocked after request');
    Alert.alert(
      '카메라 권한 필요',
      '커피 패키지를 스캔하려면 카메라 권한이 필요합니다. 설정에서 카메라 권한을 허용해주세요.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '설정으로 이동', 
          onPress: () => openSettings(),
      },
      ]
    );
}
  
  // console.log('[Permissions]  Permission not granted, returning false');
  // console.log('[Permissions] Final checkResult:', JSON.stringify(checkResult));
  // console.log('[Permissions] ========== End handleCameraPermission ==========');
  return false;
};

// Helper function to open app settings directly
export const openAppSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
} else {
    openSettings();
}
};

// Generic permission checker
export const checkPermission = async (permission: Permission): Promise<PermissionResult> => {
  try {
    const result = await check(permission);
    
    switch (result) {
      case RESULTS.UNAVAILABLE:
        return { status: 'unavailable', canAskAgain: false };
      case RESULTS.DENIED:
        return { status: 'denied', canAskAgain: true };
      case RESULTS.LIMITED:
        return { status: 'limited', canAskAgain: false };
      case RESULTS.GRANTED:
        return { status: 'granted', canAskAgain: false };
      case RESULTS.BLOCKED:
        return { status: 'blocked', canAskAgain: false };
      default:
        return { status: 'denied', canAskAgain: true };
  }
} catch (error) {
    return { status: 'denied', canAskAgain: true };
}
};

// Generic permission requester
export const requestPermission = async (permission: Permission): Promise<PermissionResult> => {
  try {
    const result = await request(permission);
    
    switch (result) {
      case RESULTS.UNAVAILABLE:
        return { status: 'unavailable', canAskAgain: false };
      case RESULTS.DENIED:
        return { status: 'denied', canAskAgain: true };
      case RESULTS.LIMITED:
        return { status: 'limited', canAskAgain: false };
      case RESULTS.GRANTED:
        return { status: 'granted', canAskAgain: false };
      case RESULTS.BLOCKED:
        return { status: 'blocked', canAskAgain: false };
      default:
        return { status: 'denied', canAskAgain: true };
  }
} catch (error) {
    return { status: 'denied', canAskAgain: false };
}
};

// Location permission handler
export const handleLocationPermission = async (): Promise<boolean> => {
  const checkResult = await checkPermission(LOCATION_PERMISSION);
  
  if (checkResult.status === 'granted' || checkResult.status === 'limited') {
    return true;
}
  
  if (checkResult.status === 'unavailable') {
    Alert.alert(
      '위치 서비스 사용 불가',
      '이 기기에서는 위치 서비스를 사용할 수 없습니다.',
      [{ text: '확인' }]
    );
    return false;
}
  
  if (checkResult.status === 'blocked' || !checkResult.canAskAgain) {
    Alert.alert(
      '위치 권한 필요',
      '주변 카페를 찾기 위해 위치 권한이 필요합니다. 설정에서 위치 권한을 허용해주세요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '설정으로 이동', onPress: () => openSettings() },
      ]
    );
    return false;
}
  
  const requestResult = await requestPermission(LOCATION_PERMISSION);
  return requestResult.status === 'granted' || requestResult.status === 'limited';
};

// Photo library permission handler
export const handlePhotoLibraryPermission = async (): Promise<boolean> => {
  const checkResult = await checkPermission(PHOTO_LIBRARY_PERMISSION);
  
  if (checkResult.status === 'granted' || checkResult.status === 'limited') {
    return true;
}
  
  if (checkResult.status === 'blocked' || !checkResult.canAskAgain) {
    Alert.alert(
      '사진 라이브러리 권한 필요',
      '커피 사진을 저장하기 위해 사진 라이브러리 권한이 필요합니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '설정으로 이동', onPress: () => openSettings() },
      ]
    );
    return false;
}
  
  const requestResult = await requestPermission(PHOTO_LIBRARY_PERMISSION);
  return requestResult.status === 'granted' || requestResult.status === 'limited';
};

// Notification permission handler
export const handleNotificationPermission = async (): Promise<boolean> => {
  const checkResult = await checkPermission(NOTIFICATION_PERMISSION);
  
  if (checkResult.status === 'granted') {
    return true;
}
  
  if (checkResult.status === 'blocked' || !checkResult.canAskAgain) {
    Alert.alert(
      '알림 권한 필요',
      '커피 관련 알림을 받기 위해 알림 권한이 필요합니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '설정으로 이동', onPress: () => openSettings() },
      ]
    );
    return false;
}
  
  const requestResult = await requestPermission(NOTIFICATION_PERMISSION);
  return requestResult.status === 'granted';
};

// Check if permission is permanently denied
export const isPermissionPermanentlyDenied = async (permission: Permission = CAMERA_PERMISSION): Promise<boolean> => {
  const result = await checkPermission(permission);
  return result.status === 'blocked' || (result.status === 'denied' && !result.canAskAgain);
};