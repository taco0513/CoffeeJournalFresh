import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { HIGColors, HIGConstants } from '@/styles/common';
import { supabase } from '@/services/supabase/client';

export const AdminCoffeeEditScreen = ({ navigation, route }: any) => {
  const { coffee } = route.params;
  
  const [editedCoffee, setEditedCoffee] = useState({
    roastery: coffee.roastery || '',
    coffee_name: coffee.coffee_name || '',
    origin: coffee.origin || '',
    region: coffee.region || '',
    variety: coffee.variety || '',
    process: coffee.process || '',
    altitude: coffee.altitude || '',
    harvest_year: coffee.harvest_year?.toString() || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editedCoffee.roastery || !editedCoffee.coffee_name) {
      Alert.alert('오류', '로스터리와 커피 이름은 필수입니다.');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        ...editedCoffee,
        harvest_year: editedCoffee.harvest_year ? parseInt(editedCoffee.harvest_year) : null,
        verified_by_moderator: true, // Auto-approve after edit
      };

      const { error } = await supabase
        .from('coffee_catalog')
        .update(updateData)
        .eq('id', coffee.id);

      if (error) throw error;

      Alert.alert('저장 완료', '커피 정보가 수정되고 승인되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error saving coffee:', error);
      Alert.alert('오류', '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedCoffee(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>‹ 뒤로</Text>
            </TouchableOpacity>
            <Text style={styles.title}>커피 정보 수정</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButton}>
              <Text style={[styles.saveButtonText, saving && styles.disabledText]}>
                {saving ? '저장 중...' : '저장'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>로스터리 *</Text>
              <TextInput
                style={styles.input}
                value={editedCoffee.roastery}
                onChangeText={(text) => handleInputChange('roastery', text)}
                placeholder="예: Fritz Coffee Company"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>커피 이름 *</Text>
              <TextInput
                style={styles.input}
                value={editedCoffee.coffee_name}
                onChangeText={(text) => handleInputChange('coffee_name', text)}
                placeholder="예: Ethiopia Yirgacheffe G1"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>원산지</Text>
              <TextInput
                style={styles.input}
                value={editedCoffee.origin}
                onChangeText={(text) => handleInputChange('origin', text)}
                placeholder="예: Ethiopia"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>지역</Text>
              <TextInput
                style={styles.input}
                value={editedCoffee.region}
                onChangeText={(text) => handleInputChange('region', text)}
                placeholder="예: Yirgacheffe"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>품종</Text>
              <TextInput
                style={styles.input}
                value={editedCoffee.variety}
                onChangeText={(text) => handleInputChange('variety', text)}
                placeholder="예: Heirloom"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>가공 방식</Text>
              <TextInput
                style={styles.input}
                value={editedCoffee.process}
                onChangeText={(text) => handleInputChange('process', text)}
                placeholder="예: Washed"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>고도</Text>
              <TextInput
                style={styles.input}
                value={editedCoffee.altitude}
                onChangeText={(text) => handleInputChange('altitude', text)}
                placeholder="예: 1,900-2,100m"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>수확 연도</Text>
              <TextInput
                style={styles.input}
                value={editedCoffee.harvest_year}
                onChangeText={(text) => handleInputChange('harvest_year', text)}
                placeholder="예: 2024"
                keyboardType="numeric"
              />
            </View>

            {/* Original Info */}
            <View style={styles.originalInfo}>
              <Text style={styles.originalTitle}>원본 정보</Text>
              <Text style={styles.originalText}>제출자: {coffee.user_email || 'Unknown'}</Text>
              <Text style={styles.originalText}>
                제출일: {new Date(coffee.created_at).toLocaleDateString('ko-KR')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  backButton: {
    minWidth: HIGConstants.MIN_TOUCH_TARGET,
  },
  backButtonText: {
    fontSize: 17,
    color: HIGColors.blue,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  saveButton: {
    minWidth: HIGConstants.MIN_TOUCH_TARGET,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.blue,
  },
  disabledText: {
    opacity: 0.5,
  },
  form: {
    padding: HIGConstants.SPACING_LG,
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
    backgroundColor: HIGColors.systemBackground,
  },
  originalInfo: {
    marginTop: HIGConstants.SPACING_XL,
    padding: HIGConstants.SPACING_MD,
    backgroundColor: HIGColors.gray6,
    borderRadius: HIGConstants.BORDER_RADIUS,
  },
  originalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  originalText: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
});