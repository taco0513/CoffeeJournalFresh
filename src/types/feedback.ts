export type FeedbackCategory = 'bug' | 'improvement' | 'idea' | 'praise';

export interface FeedbackItem {
  id: string;
  userId: string;
  userEmail?: string;
  username?: string;
  category: FeedbackCategory;
  rating?: number; // 1-5 stars
  title: string;
  description: string;
  screenshotUrl?: string;
  deviceInfo: {
    platform: string;
    osVersion: string;
    appVersion: string;
    model: string;
    buildNumber?: string;
};
  context?: {
    screenName?: string;
    feature?: string;
    breadcrumbs?: string[];
};
  status: 'pending' | 'reviewed' | 'in-progress' | 'resolved' | 'closed';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  isBetaUser: boolean;
  isOffline?: boolean; // For queued feedback
}

export interface FeedbackStats {
  totalFeedback: number;
  byCategory: Record<FeedbackCategory, number>;
  averageRating: number;
  resolvedCount: number;
  pendingCount: number;
}

export interface BetaUser {
  userId: string;
  joinedBetaAt: Date;
  feedbackCount: number;
  lastFeedbackAt?: Date;
  isActive: boolean;
}

// Category labels in Korean
export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, { ko: string; en: string; icon: string }> = {
  bug: { ko: '버그 신고', en: 'Bug Report', icon: '' },
  improvement: { ko: '개선 제안', en: 'Improvement', icon: '' },
  idea: { ko: '새로운 아이디어', en: 'New Idea', icon: '' },
  praise: { ko: '칭찬하기', en: 'Praise', icon: '' }
};

export const FEEDBACK_STATUS_LABELS = {
  pending: { ko: '대기중', en: 'Pending' },
  reviewed: { ko: '검토됨', en: 'Reviewed' },
  'in-progress': { ko: '진행중', en: 'In Progress' },
  resolved: { ko: '해결됨', en: 'Resolved' },
  closed: { ko: '종료됨', en: 'Closed' }
};