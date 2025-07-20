import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeedbackService } from '../services/FeedbackService';
import { FeedbackCategory } from '../types/feedback';
import { errorContextService } from '../services/ErrorContextService';

interface FeedbackStore {
  // State
  isVisible: boolean;
  isBetaUser: boolean;
  pendingScreenshot: string | null;
  submitStatus: 'idle' | 'submitting' | 'success' | 'error';
  errorMessage: string | null;
  
  // Feedback form data
  category: FeedbackCategory | null;
  rating: number | null;
  title: string;
  description: string;
  
  // Actions
  showFeedback: (screenName?: string, context?: string) => void;
  showSmartFeedback: () => Promise<void>; // Auto-fill with context
  hideFeedback: () => void;
  setCategory: (category: FeedbackCategory) => void;
  setRating: (rating: number) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setScreenshot: (uri: string | null) => void;
  setBetaStatus: (status: boolean) => void;
  
  // Submit
  submitFeedback: (userId?: string, userEmail?: string, username?: string) => Promise<void>;
  resetForm: () => void;
  
  // Beta features
  enableShakeToFeedback: boolean;
  toggleShakeToFeedback: () => void;
}

const SHAKE_ENABLED_KEY = '@shake_to_feedback_enabled';

export const useFeedbackStore = create<FeedbackStore>((set, get) => ({
  // Initial state
  isVisible: false,
  isBetaUser: false,
  pendingScreenshot: null,
  submitStatus: 'idle',
  errorMessage: null,
  category: null,
  rating: null,
  title: '',
  description: '',
  enableShakeToFeedback: true,

  // Actions
  showFeedback: (screenName?: string, context?: string) => {
    const updates: any = { isVisible: true };
    
    if (screenName && !get().title) {
      updates.title = `Feedback for ${screenName}`;
    }
    
    if (context && !get().description) {
      updates.description = `Context: ${context}\n\n`;
    }
    
    set(updates);
  },
  
  showSmartFeedback: async () => {
    try {
      // Get current context
      const context = await errorContextService.getContextForFeedback();
      
      // Smart suggestions based on context
      const suggestedCategory = errorContextService.suggestFeedbackCategory(context);
      const suggestedTitle = errorContextService.generateSmartTitle(context);
      const suggestedDescription = errorContextService.generateSmartDescription(context);
      
      // Auto-fill form with smart suggestions
      set({ 
        isVisible: true,
        category: suggestedCategory,
        title: suggestedTitle,
        description: suggestedDescription,
      });
    } catch (error) {
      console.error('Error generating smart feedback:', error);
      // Fallback to regular feedback
      set({ isVisible: true });
    }
  },
  
  hideFeedback: () => set({ isVisible: false }),
  
  setCategory: (category) => set({ category }),
  setRating: (rating) => set({ rating }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setScreenshot: (uri) => set({ pendingScreenshot: uri }),
  setBetaStatus: (status) => set({ isBetaUser: status }),

  submitFeedback: async (userId, userEmail, username) => {
    const state = get();
    
    if (!state.category || !state.title || !state.description) {
      set({ 
        submitStatus: 'error', 
        errorMessage: '필수 항목을 모두 입력해주세요.' 
      });
      return;
    }

    set({ submitStatus: 'submitting', errorMessage: null });

    try {
      await FeedbackService.submitFeedback({
        category: state.category,
        rating: state.rating || undefined,
        title: state.title,
        description: state.description,
        screenshotUri: state.pendingScreenshot || undefined,
        userId,
        userEmail,
        username,
        context: await errorContextService.getContextForFeedback(),
      });

      set({ 
        submitStatus: 'success',
        isVisible: false 
      });

      // Reset form after a delay
      setTimeout(() => {
        get().resetForm();
      }, 1000);
    } catch (error) {
      set({ 
        submitStatus: 'error', 
        errorMessage: '피드백 전송에 실패했습니다. 다시 시도해주세요.' 
      });
    }
  },

  resetForm: () => set({
    category: null,
    rating: null,
    title: '',
    description: '',
    pendingScreenshot: null,
    submitStatus: 'idle',
    errorMessage: null,
  }),

  toggleShakeToFeedback: async () => {
    const current = get().enableShakeToFeedback;
    const newValue = !current;
    
    set({ enableShakeToFeedback: newValue });
    
    try {
      await AsyncStorage.setItem(SHAKE_ENABLED_KEY, JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving shake preference:', error);
    }
  },
}));

// Initialize shake preference from storage
AsyncStorage.getItem(SHAKE_ENABLED_KEY).then((value) => {
  if (value !== null) {
    useFeedbackStore.setState({ 
      enableShakeToFeedback: JSON.parse(value) 
    });
  }
});