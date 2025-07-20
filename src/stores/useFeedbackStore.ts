import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeedbackService } from '../services/FeedbackService';
import { FeedbackCategory } from '../types/feedback';

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
  showFeedback: () => void;
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
  showFeedback: () => set({ isVisible: true }),
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
        context: {
          screenName: 'HomeScreen', // This would be dynamic based on current screen
          isBetaUser: state.isBetaUser,
        },
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