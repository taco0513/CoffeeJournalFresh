import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { HIGColors, HIGConstants } from '@/styles/common';
import { addCoffeeToCatalog } from '@/services/supabase/coffeeSearch';
import { CoffeeDiscoveryAlert } from './CoffeeDiscoveryAlert';
import { AchievementSystem } from '@/services/AchievementSystem';

interface AddCoffeeModalProps {
  visible: boolean;
  onClose: () => void;
  roastery: string;
  onCoffeeAdded: (coffeeName: string) => void;
}

export const AddCoffeeModal: React.FC<AddCoffeeModalProps> = ({
  visible,
  onClose,
  roastery,
  onCoffeeAdded,
}) => {
  const [coffeeName, setCoffeeName] = useState('');
  const [origin, setOrigin] = useState('');
  const [region, setRegion] = useState('');
  const [variety, setVariety] = useState('');
  const [process, setProcess] = useState('');
  const [altitude, setAltitude] = useState('');
  const [harvestYear, setHarvestYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscoveryAlert, setShowDiscoveryAlert] = useState(false);

  const handleSubmit = async () => {
    if (!coffeeName.trim()) {
      Alert.alert('오류', '커피 이름을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newCoffee = {
        roastery,
        coffee_name: coffeeName.trim(),
        origin: origin.trim() || undefined,
        region: region.trim() || undefined,
        variety: variety.trim() || undefined,
        process: process.trim() || undefined,
        altitude: altitude.trim() || undefined,
        harvest_year: harvestYear ? parseInt(harvestYear) : undefined,
      };

      await addCoffeeToCatalog(newCoffee);
      
      // Track achievement for coffee discovery
      try {
        const achievementSystem = new AchievementSystem();
        await achievementSystem.trackCoffeeDiscovery();
      } catch (error) {
        console.log('Achievement tracking skipped:', error);
      }
      
      // Show discovery alert instead of default alert
      setShowDiscoveryAlert(true);
    } catch (error) {
      console.error('Error adding coffee:', error);
      Alert.alert('오류', '커피 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCoffeeName('');
    setOrigin('');
    setRegion('');
    setVariety('');
    setProcess('');
    setAltitude('');
    setHarvestYear('');
  };

  return (
    <>
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>새 커피 추가</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.roasteryInfo}>
              <Text style={styles.roasteryLabel}>로스터리</Text>
              <Text style={styles.roasteryName}>{roastery}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>커피 이름 *</Text>
              <TextInput
                style={styles.input}
                value={coffeeName}
                onChangeText={setCoffeeName}
                placeholder="예: Colombia El Paraiso"
                placeholderTextColor={HIGColors.tertiaryLabel}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>원산지</Text>
              <TextInput
                style={styles.input}
                value={origin}
                onChangeText={setOrigin}
                placeholder="예: Colombia"
                placeholderTextColor={HIGColors.tertiaryLabel}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>지역</Text>
              <TextInput
                style={styles.input}
                value={region}
                onChangeText={setRegion}
                placeholder="예: Huila"
                placeholderTextColor={HIGColors.tertiaryLabel}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>품종</Text>
              <TextInput
                style={styles.input}
                value={variety}
                onChangeText={setVariety}
                placeholder="예: Caturra"
                placeholderTextColor={HIGColors.tertiaryLabel}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>가공 방식</Text>
              <TextInput
                style={styles.input}
                value={process}
                onChangeText={setProcess}
                placeholder="예: Washed"
                placeholderTextColor={HIGColors.tertiaryLabel}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>고도</Text>
              <TextInput
                style={styles.input}
                value={altitude}
                onChangeText={setAltitude}
                placeholder="예: 1,800-2,000m"
                placeholderTextColor={HIGColors.tertiaryLabel}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>수확 연도</Text>
              <TextInput
                style={styles.input}
                value={harvestYear}
                onChangeText={setHarvestYear}
                placeholder="예: 2024"
                placeholderTextColor={HIGColors.tertiaryLabel}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                💡 추가된 커피는 관리자 검수 후 승인됩니다.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? '추가 중...' : '추가하기'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  
    <CoffeeDiscoveryAlert
      visible={showDiscoveryAlert}
      type="discovered"
      coffeeName={coffeeName}
      roasteryName={roastery}
      onClose={() => {
        setShowDiscoveryAlert(false);
        onCoffeeAdded(coffeeName.trim());
        resetForm();
        onClose();
      }}
    />
  </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: HIGConstants.BORDER_RADIUS * 2,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
  },
  closeButton: {
    width: HIGConstants.MIN_TOUCH_TARGET,
    height: HIGConstants.MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: HIGColors.secondaryLabel,
  },
  form: {
    padding: HIGConstants.SPACING_LG,
  },
  roasteryInfo: {
    backgroundColor: HIGColors.gray6,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS,
    marginBottom: HIGConstants.SPACING_LG,
  },
  roasteryLabel: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  roasteryName: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  inputGroup: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  input: {
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    borderWidth: 1,
    borderColor: HIGColors.gray4,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    fontSize: 17,
    color: HIGColors.label,
    backgroundColor: '#FFFFFF',
  },
  notice: {
    backgroundColor: HIGColors.gray6,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS,
    marginTop: HIGConstants.SPACING_SM,
  },
  noticeText: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: HIGConstants.SPACING_LG,
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.gray4,
    gap: HIGConstants.SPACING_SM,
  },
  button: {
    flex: 1,
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: HIGConstants.BORDER_RADIUS,
  },
  cancelButton: {
    backgroundColor: HIGColors.gray5,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  submitButton: {
    backgroundColor: HIGColors.blue,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
});