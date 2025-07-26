/**
 * Beta Testing Types
 * Shared types for beta testing functionality
 */

export interface BetaTestingStats {
  totalFeedback: number;
  averageRating: number;
  bugReports: number;
  activeUsers: number;
}

export interface BetaFeedbackItem {
  id: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  category: 'general' | 'bug' | 'feature' | 'performance';
  timestamp: Date;
  status: 'new' | 'reviewed' | 'resolved';
}

export interface BetaUserPreferences {
  enableNotifications: boolean;
  allowCrashReporting: boolean;
  shareUsageData: boolean;
  preferredFeedbackMethod: 'modal' | 'shake' | 'button';
}

export type BetaTestingTab = 'status' | 'feedback' | 'deployment';

export interface QuickFeedbackOptions {
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}

export interface BugReportData {
  title: string;
  description: string;
  category: 'ui' | 'performance' | 'crash' | 'feature' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reproducible: boolean;
  deviceInfo?: string;
}