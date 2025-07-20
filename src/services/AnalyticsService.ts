import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import { supabase } from './supabase/client';

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType: 'screen_view' | 'button_click' | 'feature_use' | 'error' | 'timing';
  eventName: string;
  screenName?: string;
  properties?: Record<string, any>;
  timestamp: Date;
  deviceInfo: {
    platform: string;
    osVersion: string;
    appVersion: string;
    model: string;
    buildNumber: string;
  };
}

export interface SessionData {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  screenViews: string[];
  eventCount: number;
  isActive: boolean;
}

class AnalyticsService {
  private currentSession: SessionData | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private screenStartTime: Date | null = null;
  private currentScreen: string | null = null;
  private readonly QUEUE_KEY = '@analytics_queue';
  private readonly SESSION_KEY = '@current_session';
  private readonly MAX_QUEUE_SIZE = 100;

  async initialize(userId?: string): Promise<void> {
    await this.startSession(userId);
    await this.syncQueuedEvents();
  }

  async startSession(userId?: string): Promise<void> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      sessionId,
      userId,
      startTime: new Date(),
      screenViews: [],
      eventCount: 0,
      isActive: true,
    };

    await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
    
    await this.trackEvent({
      eventType: 'feature_use',
      eventName: 'session_start',
      properties: {
        userId,
        sessionId,
      },
    });
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.endTime = new Date();
    this.currentSession.isActive = false;

    await this.trackEvent({
      eventType: 'feature_use',
      eventName: 'session_end',
      properties: {
        sessionId: this.currentSession.sessionId,
        duration: this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime(),
        screenViews: this.currentSession.screenViews.length,
        eventCount: this.currentSession.eventCount,
      },
    });

    await this.flushQueue();
    await AsyncStorage.removeItem(this.SESSION_KEY);
    this.currentSession = null;
  }

  async trackScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
    // End previous screen timing
    if (this.currentScreen && this.screenStartTime) {
      const duration = Date.now() - this.screenStartTime.getTime();
      await this.trackEvent({
        eventType: 'timing',
        eventName: 'screen_view_duration',
        screenName: this.currentScreen,
        properties: {
          duration,
          previousScreen: this.currentScreen,
        },
      });
    }

    // Start new screen timing
    this.currentScreen = screenName;
    this.screenStartTime = new Date();

    if (this.currentSession) {
      this.currentSession.screenViews.push(screenName);
    }

    await this.trackEvent({
      eventType: 'screen_view',
      eventName: 'screen_view',
      screenName,
      properties,
    });
  }

  async trackButtonClick(buttonName: string, screenName?: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventType: 'button_click',
      eventName: 'button_click',
      screenName: screenName || this.currentScreen || undefined,
      properties: {
        buttonName,
        ...properties,
      },
    });
  }

  async trackFeatureUse(featureName: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventType: 'feature_use',
      eventName: featureName,
      screenName: this.currentScreen || undefined,
      properties,
    });
  }

  async trackError(errorName: string, errorMessage: string, stackTrace?: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventType: 'error',
      eventName: errorName,
      screenName: this.currentScreen || undefined,
      properties: {
        errorMessage,
        stackTrace,
        ...properties,
      },
    });
  }

  async trackTiming(eventName: string, duration: number, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventType: 'timing',
      eventName,
      screenName: this.currentScreen || undefined,
      properties: {
        duration,
        ...properties,
      },
    });
  }

  private async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'sessionId' | 'timestamp' | 'deviceInfo' | 'userId'>): Promise<void> {
    if (!this.currentSession) {
      console.warn('Analytics: No active session, cannot track event');
      return;
    }

    const deviceInfo = {
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      appVersion: DeviceInfo.getVersion(),
      model: DeviceInfo.getModel(),
      buildNumber: DeviceInfo.getBuildNumber(),
    };

    const analyticsEvent: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.currentSession.userId,
      sessionId: this.currentSession.sessionId,
      timestamp: new Date(),
      deviceInfo,
      ...event,
    };

    this.eventQueue.push(analyticsEvent);
    this.currentSession.eventCount++;

    // Auto-flush if queue is getting large
    if (this.eventQueue.length >= this.MAX_QUEUE_SIZE) {
      await this.flushQueue();
    }

    // Save queue to storage
    await this.saveQueueToStorage();
  }

  private async flushQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(this.eventQueue);

      if (error) {
        console.error('Analytics: Error sending events to server:', error);
        // Keep events in queue for retry
        return;
      }

      // Clear queue on successful send
      this.eventQueue = [];
      await AsyncStorage.removeItem(this.QUEUE_KEY);
    } catch (error) {
      console.error('Analytics: Error flushing queue:', error);
    }
  }

  private async saveQueueToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.eventQueue));
    } catch (error) {
      console.error('Analytics: Error saving queue to storage:', error);
    }
  }

  private async syncQueuedEvents(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(this.QUEUE_KEY);
      if (queueData) {
        this.eventQueue = JSON.parse(queueData);
        await this.flushQueue();
      }
    } catch (error) {
      console.error('Analytics: Error syncing queued events:', error);
    }
  }

  async getSessionStats(): Promise<any> {
    if (!this.currentSession) return null;

    return {
      sessionId: this.currentSession.sessionId,
      duration: Date.now() - this.currentSession.startTime.getTime(),
      screenViews: this.currentSession.screenViews.length,
      eventCount: this.currentSession.eventCount,
      queueSize: this.eventQueue.length,
    };
  }

  // Coffee-specific tracking methods
  async trackCoffeeAction(action: string, coffeeId?: string, properties?: Record<string, any>): Promise<void> {
    await this.trackFeatureUse(`coffee_${action}`, {
      coffeeId,
      ...properties,
    });
  }

  async trackTastingAction(action: string, tastingId?: string, properties?: Record<string, any>): Promise<void> {
    await this.trackFeatureUse(`tasting_${action}`, {
      tastingId,
      ...properties,
    });
  }

  async trackSearchAction(query: string, results: number, searchType?: string): Promise<void> {
    await this.trackFeatureUse('search', {
      query,
      results,
      searchType,
    });
  }
}

export const analyticsService = new AnalyticsService();