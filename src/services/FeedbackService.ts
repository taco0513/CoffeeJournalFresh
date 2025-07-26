import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase/client';
import { FeedbackItem, FeedbackCategory, BetaUser } from '../types/feedback';
import uuid from 'react-native-uuid';
// import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';

import { Logger } from './LoggingService';
const FEEDBACK_QUEUE_KEY = '@feedback_queue';

export class FeedbackService {
  static async checkBetaStatus(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('beta_users')
        .select('is_active')
        .eq('user_id', userId)
        .single();
      
      return data?.is_active || false;
  } catch (error) {
      Logger.error('Error checking beta status:', 'service', { component: 'FeedbackService', error: error });
      return false;
  }
}

  static async submitFeedback(feedback: {
    category: FeedbackCategory;
    rating?: number;
    title: string;
    description: string;
    screenshotUri?: string;
    userId?: string;
    userEmail?: string;
    username?: string;
    context?: unknown;
}): Promise<void> {
    const deviceInfo = {
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      appVersion: DeviceInfo.getVersion(),
      model: DeviceInfo.getModel(),
      buildNumber: DeviceInfo.getBuildNumber(),
  };

    let screenshotUrl: string | undefined;
    
    // Upload screenshot if provided
    if (feedback.screenshotUri) {
      screenshotUrl = await this.uploadScreenshot(feedback.screenshotUri);
  }

    const feedbackItem: Partial<FeedbackItem> = {
      id: uuid.v4() as string,
      userId: feedback.userId,
      userEmail: feedback.userEmail,
      username: feedback.username,
      category: feedback.category,
      rating: feedback.rating,
      title: feedback.title,
      description: feedback.description,
      screenshotUrl,
      deviceInfo,
      context: feedback.context,
      isBetaUser: feedback.userId ? await this.checkBetaStatus(feedback.userId) : false,
      createdAt: new Date(),
  };

    try {
      const { error } = await supabase
        .from('feedback_items')
        .insert([feedbackItem]);

      if (error) throw error;

      // Send email notification to admin
      await this.sendAdminNotification(feedbackItem as FeedbackItem);
  } catch (error) {
      Logger.error('Error submitting feedback:', 'service', { component: 'FeedbackService', error: error });
      // Queue for offline submission
      await this.queueFeedback(feedbackItem as FeedbackItem);
      throw error;
  }
}

  static async uploadScreenshot(uri: string): Promise<string> {
    try {
      const base64 = await RNFS.readFile(uri, 'base64');
      const fileName = `feedback_${uuid.v4()}.jpg`;
      const filePath = `feedback-screenshots/${fileName}`;

      const { data, error } = await supabase.storage
        .from('app-assets')
        .upload(filePath, Buffer.from(base64, 'base64'), {
          contentType: 'image/jpeg',
      });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('app-assets')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
  } catch (error) {
      Logger.error('Error uploading screenshot:', 'service', { component: 'FeedbackService', error: error });
      return '';
  }
}

  static async queueFeedback(feedback: FeedbackItem): Promise<void> {
    try {
      const existingQueue = await AsyncStorage.getItem(FEEDBACK_QUEUE_KEY);
      const queue = existingQueue ? JSON.parse(existingQueue) : [];
      
      queue.push({
        ...feedback,
        isOffline: true,
    });

      await AsyncStorage.setItem(FEEDBACK_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
      Logger.error('Error queuing feedback:', 'service', { component: 'FeedbackService', error: error });
  }
}

  static async syncQueuedFeedback(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(FEEDBACK_QUEUE_KEY);
      if (!queueData) return;

      const queue = JSON.parse(queueData);
      const failedItems = [];

      for (const feedback of queue) {
        try {
          const { error } = await supabase
            .from('feedback_items')
            .insert([feedback]);

          if (error) {
            failedItems.push(feedback);
        }
      } catch (error) {
          failedItems.push(feedback);
      }
    }

      // Keep failed items in queue
      if (failedItems.length > 0) {
        await AsyncStorage.setItem(FEEDBACK_QUEUE_KEY, JSON.stringify(failedItems));
    } else {
        await AsyncStorage.removeItem(FEEDBACK_QUEUE_KEY);
    }
  } catch (error) {
      Logger.error('Error syncing queued feedback:', 'service', { component: 'FeedbackService', error: error });
  }
}

  static async sendAdminNotification(feedback: FeedbackItem): Promise<void> {
    try {
      // This would be implemented with your email service
      // For now, we'll just log it
      Logger.debug('Admin notification for feedback:', 'service', { component: 'FeedbackService', data: feedback });
      
      // You could use Supabase Edge Functions or integrate with SendGrid/Mailgun
      // await supabase.functions.invoke('send-feedback-email', { body: feedback });
  } catch (error) {
      Logger.error('Error sending admin notification:', 'service', { component: 'FeedbackService', error: error });
  }
}

  static async getFeedbackStats(): Promise<unknown> {
    try {
      const { data, error } = await supabase
        .from('feedback_analytics')
        .select('*')
        .single();

      if (error) throw error;
      return data;
  } catch (error) {
      Logger.error('Error getting feedback stats:', 'service', { component: 'FeedbackService', error: error });
      return null;
  }
}

  static async getUserFeedback(userId: string): Promise<FeedbackItem[]> {
    try {
      const { data, error } = await supabase
        .from('feedback_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
  } catch (error) {
      Logger.error('Error getting user feedback:', 'service', { component: 'FeedbackService', error: error });
      return [];
  }
}

  static async captureScreenshot(viewRef: unknown): Promise<string | null> {
    try {
      // Temporarily disabled until ViewShot is properly configured
      // const uri = await ViewShot.captureRef(viewRef, {
      //   format: 'jpg',
      //   quality: 0.8,
      // });
      // return uri;
      return null;
  } catch (error) {
      Logger.error('Error capturing screenshot:', 'service', { component: 'FeedbackService', error: error });
      return null;
  }
}
}