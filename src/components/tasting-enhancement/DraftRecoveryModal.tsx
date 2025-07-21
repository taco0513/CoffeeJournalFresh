import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTastingStore } from '../../stores/tastingStore';
import { HIGColors, HIGConstants } from '../../constants/HIG';

type RootStackParamList = {
  TastingFlow: undefined;
  // Add other screens as needed
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const DraftRecoveryModal: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { hasDraft, loadDraft, clearDraft } = useTastingStore();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkForDraft();
  }, []);

  const checkForDraft = async () => {
    try {
      const hasSavedDraft = await hasDraft();
      setVisible(hasSavedDraft);
    } catch (error) {
      console.error('Error checking for draft:', error);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      await loadDraft();
      setVisible(false);
      // Navigate to TastingFlow which will show CoffeeInfo screen
      navigation.navigate('TastingFlow');
    } catch (error) {
      console.error('Error loading draft:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNew = async () => {
    try {
      await clearDraft();
      setVisible(false);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleStartNew}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.emoji}>☕</Text>
            <Text style={styles.title}>커피 기록을 계속하시겠어요?</Text>
          </View>
          
          <Text style={styles.message}>
            아직 완료하지 않은 커피 테이스팅이 있습니다. 이어서 진행하시겠어요?
          </Text>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={handleContinue}
              disabled={loading}
            >
              <Text style={styles.continueText}>
                {loading ? '불러오는 중...' : '이어서 기록하기'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.newButton} 
              onPress={handleStartNew}
              disabled={loading}
            >
              <Text style={styles.newText}>새로 시작하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: HIGConstants.SPACING_LG,
  },
  modal: {
    backgroundColor: HIGColors.systemBackground,
    borderRadius: HIGConstants.RADIUS_LG,
    padding: HIGConstants.SPACING_LG,
    width: '100%',
    maxWidth: 320,
    shadowColor: HIGColors.label,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  emoji: {
    fontSize: 40,
    marginBottom: HIGConstants.SPACING_SM,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_LG,
  },
  actions: {
    gap: HIGConstants.SPACING_SM,
  },
  continueButton: {
    backgroundColor: HIGColors.systemBlue,
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_LG,
    borderRadius: HIGConstants.RADIUS_MD,
    alignItems: 'center',
  },
  continueText: {
    color: HIGColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  newButton: {
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  newText: {
    color: HIGColors.secondaryLabel,
    fontSize: 16,
    fontWeight: '500',
  },
});