import { Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import { Logger } from './LoggingService';
export interface ScreenContext {
  screenName: string;
  routeName: string;
  routeParams?: unknown;
  timestamp: string;
  navigationState?: unknown;
  userLocation?: string;
  deviceInfo: {
    platform: string;
    osVersion: string;
    appVersion: string;
    model: string;
    buildNumber: string;
    isTablet: boolean;
    screenDimensions: {
      width: number;
      height: number;
  };
};
}

class ScreenContextService {
  private static currentContext: ScreenContext | null = null;
  private static navigationRef: unknown = null;

  static setNavigationRef(ref: unknown) {
    this.navigationRef = ref;
}

  static async getCurrentContext(): Promise<ScreenContext | null> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      
      let screenName = 'Unknown';
      let routeParams = {};
      let navigationState = null;

      if (this.navigationRef) {
        try {
          navigationState = this.navigationRef.getRootState();
          const currentRoute = this.getCurrentRoute(navigationState);
          screenName = currentRoute?.name || 'Unknown';
          routeParams = currentRoute?.params || {};
      } catch (navError) {
          Logger.warn('Navigation context not available, using fallback:', 'service', { component: 'ScreenContextService', data: navError });
      }
    } else {
        Logger.warn('Navigation ref not set, using device info only', 'service', { component: 'ScreenContextService' });
    }
      
      const context: ScreenContext = {
        screenName,
        routeName: screenName,
        routeParams,
        timestamp: new Date().toISOString(),
        navigationState,
        deviceInfo,
    };

      this.currentContext = context;
      return context;
  } catch (error) {
      Logger.error('Error getting current context:', 'service', { component: 'ScreenContextService', error: error });
      return null;
  }
}

  private static getCurrentRoute(navigationState: unknown): unknown {
    if (!navigationState) return null;
    
    const route = navigationState.routes?.[navigationState.index];
    if (route?.state) {
      return this.getCurrentRoute(route.state);
  }
    return route;
}

  private static async getDeviceInfo() {
    const { width, height } = require('react-native').Dimensions.get('window');
    
    return {
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      appVersion: DeviceInfo.getVersion(),
      model: await DeviceInfo.getModel(),
      buildNumber: DeviceInfo.getBuildNumber(),
      isTablet: DeviceInfo.isTablet(),
      screenDimensions: {
        width,
        height,
    },
  };
}

  static updateContext(screenName: string, params?: Record<string, unknown>) {
    if (this.currentContext) {
      this.currentContext.screenName = screenName;
      this.currentContext.routeParams = params;
      this.currentContext.timestamp = new Date().toISOString();
  }
}

  static getLastKnownContext(): ScreenContext | null {
    return this.currentContext;
}

  static getContextSummary(context?: ScreenContext | null): string {
    const targetContext = context || this.currentContext;
    
    if (!targetContext) {
      return '스크린 정보를 가져올 수 없습니다';
  }

    const { screenName, routeParams, deviceInfo, timestamp } = targetContext;
    
    const summary = [
      ` 현재 화면: ${screenName}`,
      ` 시간: ${new Date(timestamp).toLocaleString('ko-KR')}`,
      `📲 기기: ${deviceInfo.model} (${deviceInfo.platform} ${deviceInfo.osVersion})`,
      `📐 화면 크기: ${deviceInfo.screenDimensions.width}x${deviceInfo.screenDimensions.height}`,
    ];

    if (routeParams && Object.keys(routeParams).length > 0) {
      summary.push(`🔗 화면 파라미터: ${JSON.stringify(routeParams)}`);
  }

    return summary.join('\n');
}
}

// Hook for components to easily get screen context
export const useScreenContext = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const getCurrentScreenContext = async (): Promise<ScreenContext | null> => {
    try {
      const deviceInfo = await ScreenContextService['getDeviceInfo']();
      
      return {
        screenName: route.name,
        routeName: route.name,
        routeParams: route.params,
        timestamp: new Date().toISOString(),
        navigationState: navigation.getState(),
        deviceInfo,
    };
  } catch (error) {
      Logger.error('Error getting screen context:', 'service', { component: 'ScreenContextService', error: error });
      return null;
  }
};

  return {
    getCurrentScreenContext,
    screenName: route.name,
    routeParams: route.params,
};
};

export default ScreenContextService;