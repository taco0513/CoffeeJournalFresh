import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';

const OCRScanScreen = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>닫기</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.message}>OCR 스캔 기능 임시 비활성화</Text>
        <Text style={styles.submessage}>
          Vision Camera 호환성 문제로 인해{'\n'}
          현재 OCR 스캔 기능이 비활성화되었습니다.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BLACK,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 10,
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  message: {
    color: Colors.WHITE,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  submessage: {
    color: Colors.PLACEHOLDER,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OCRScanScreen;