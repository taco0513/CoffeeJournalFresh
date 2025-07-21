import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
// import ViewShot from 'react-native-view-shot';
import { useFeedbackStore } from '../../stores/useFeedbackStore';
import { useUserStore } from '../../stores/useUserStore';
import { FeedbackCategory, FEEDBACK_CATEGORY_LABELS } from '../../types/feedback';
import { FeedbackService } from '../../services/FeedbackService';
import ScreenContextService from '../../services/ScreenContextService';
import { HIGColors } from '../../constants/HIG';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const RATING_EMOJIS = ['😞', '😕', '😐', '😊', '😍'];

export const FeedbackModal: React.FC = () => {
  const { currentUser } = useUserStore();
  const {
    isVisible,
    category,
    rating,
    title,
    description,
    pendingScreenshot,
    screenContext,
    submitStatus,
    errorMessage,
    setCategory,
    setRating,
    setTitle,
    setDescription,
    setScreenshot,
    submitFeedback,
    hideFeedback,
    resetForm,
  } = useFeedbackStore();

  const [isCapturingScreen, setIsCapturingScreen] = useState(false);

  const handleCaptureScreen = async () => {
    setIsCapturingScreen(true);
    try {
      // Hide modal temporarily
      hideFeedback();
      
      // Wait for modal to close
      setTimeout(async () => {
        // For now, we'll disable screenshot feature until ViewShot is properly configured
        // const uri = await FeedbackService.captureScreenshot(viewShotRef.current);
        // if (uri) {
        //   setScreenshot(uri);
        // }
        // Show modal again
        useFeedbackStore.getState().showFeedback();
        setIsCapturingScreen(false);
        showErrorToast('스크린샷 기능은 준비 중입니다');
      }, 500);
    } catch (error) {
      console.error('Error capturing screen:', error);
      setIsCapturingScreen(false);
    }
  };

  const handleSubmit = async () => {
    await submitFeedback(
      currentUser?.id,
      currentUser?.email,
      currentUser?.username
    );
  };

  const handleClose = () => {
    hideFeedback();
    setTimeout(resetForm, 300);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>피드백 보내기</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Category Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>카테고리 선택</Text>
                <View style={styles.categoryGrid}>
                  {(Object.keys(FEEDBACK_CATEGORY_LABELS) as FeedbackCategory[]).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryItem,
                        category === cat && styles.categoryItemSelected
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={styles.categoryEmoji}>
                        {FEEDBACK_CATEGORY_LABELS[cat].icon}
                      </Text>
                      <Text style={[
                        styles.categoryLabel,
                        category === cat && styles.categoryLabelSelected
                      ]}>
                        {FEEDBACK_CATEGORY_LABELS[cat].ko}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Rating */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>만족도 (선택사항)</Text>
                <View style={styles.ratingContainer}>
                  {RATING_EMOJIS.map((emoji, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.ratingItem,
                        rating === index + 1 && styles.ratingItemSelected
                      ]}
                      onPress={() => setRating(index + 1)}
                    >
                      <Text style={styles.ratingEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Title */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>제목 *</Text>
                <TextInput
                  style={styles.titleInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="간단한 제목을 입력해주세요"
                  placeholderTextColor={HIGColors.tertiaryLabel}
                  maxLength={50}
                />
              </View>

              {/* Description */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>상세 내용 *</Text>
                <TextInput
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="자세한 내용을 입력해주세요"
                  placeholderTextColor={HIGColors.tertiaryLabel}
                  multiline
                  numberOfLines={5}
                  maxLength={500}
                />
                <Text style={styles.charCount}>{description.length}/500</Text>
              </View>

              {/* Screenshot */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>스크린샷 {pendingScreenshot && '✓'}</Text>
                {pendingScreenshot ? (
                  <View style={styles.screenshotContainer}>
                    <Image source={{ uri: pendingScreenshot }} style={styles.screenshot} />
                    <TouchableOpacity
                      style={styles.removeScreenshot}
                      onPress={() => setScreenshot(null)}
                    >
                      <Text style={styles.removeScreenshotText}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={handleCaptureScreen}
                    disabled={isCapturingScreen}
                  >
                    <Text style={styles.captureButtonText}>
                      {isCapturingScreen ? '캡처 중...' : '📸 현재 화면 캡처'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Screen Context Information */}
              {screenContext && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>화면 정보 (자동 수집됨) ✓</Text>
                  <View style={styles.contextContainer}>
                    <Text style={styles.contextText}>
                      {ScreenContextService.getContextSummary(screenContext)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Error Message */}
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!category || !title || !description || submitStatus === 'submitting') && 
                  styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!category || !title || !description || submitStatus === 'submitting'}
              >
                {submitStatus === 'submitting' ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {submitStatus === 'success' ? '✓ 전송 완료' : '피드백 보내기'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: HIGColors.secondaryLabel,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: HIGColors.systemGray6,
    backgroundColor: '#FFFFFF',
  },
  categoryItemSelected: {
    borderColor: HIGColors.systemBlue,
    backgroundColor: '#E3F2FD',
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: HIGColors.label,
  },
  categoryLabelSelected: {
    fontWeight: '600',
    color: HIGColors.systemBlue,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingItem: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: HIGColors.systemGray6,
  },
  ratingItemSelected: {
    backgroundColor: '#FFF3E0',
  },
  ratingEmoji: {
    fontSize: 28,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: HIGColors.systemGray6,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: HIGColors.label,
    backgroundColor: '#FFFFFF',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: HIGColors.systemGray6,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: HIGColors.label,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
  },
  charCount: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
    textAlign: 'right',
    marginTop: 5,
  },
  screenshotContainer: {
    position: 'relative',
  },
  screenshot: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: HIGColors.systemGray6,
  },
  removeScreenshot: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeScreenshotText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  captureButton: {
    borderWidth: 2,
    borderColor: HIGColors.systemBlue,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
  },
  captureButtonText: {
    color: HIGColors.systemBlue,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: HIGColors.systemRed,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: HIGColors.systemBlue,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: HIGColors.systemGray6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contextContainer: {
    backgroundColor: HIGColors.systemGray6,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: HIGColors.systemBlue,
  },
  contextText: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});