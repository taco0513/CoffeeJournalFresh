import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import ExportService from '../services/ExportService';
import { NavigationButton, Heading2, BodyText, Caption } from '../components/common';
import { Colors } from '../constants/colors';
import { useToastStore } from '../stores/toastStore';

export default function ExportScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<{
    totalCount: number;
    records: any[];
    csvSample: string;
  } | null>(null);
  const { showSuccessToast, showErrorToast } = useToastStore();
  const exportService = ExportService.getInstance();

  useEffect(() => {
    loadPreview();
  }, []);

  const loadPreview = async () => {
    try {
      setIsLoading(true);
      const previewData = await exportService.getExportPreview();
      setPreview(previewData);
    } catch (error) {
      console.error('Failed to load preview:', error);
      showErrorToast('미리보기 로드 실패', '다시 시도해주세요');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsLoading(true);
      const result = await exportService.exportAllToCSV();
      if (result.success) {
        showSuccessToast('CSV 내보내기 성공', `${preview?.totalCount || 0}개 기록 내보내기 완료`);
      }
    } catch (error) {
      console.error('CSV export failed:', error);
      showErrorToast('내보내기 실패', 'CSV 파일 생성 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setIsLoading(true);
      const result = await exportService.exportAllToJSON();
      if (result.success) {
        showSuccessToast('JSON 내보내기 성공', `${preview?.totalCount || 0}개 기록 내보내기 완료`);
      }
    } catch (error) {
      console.error('JSON export failed:', error);
      showErrorToast('내보내기 실패', 'JSON 파일 생성 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !preview) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.GRADIENT_BROWN} />
          <BodyText style={styles.loadingText}>데이터 로딩 중...</BodyText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Heading2>데이터 내보내기</Heading2>
          <Caption style={styles.subtitle}>
            저장된 테이스팅 기록을 CSV 또는 JSON 형식으로 내보낼 수 있습니다
          </Caption>
        </View>

        {preview && (
          <>
            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>총 테이스팅 기록</Text>
              <Text style={styles.statsValue}>{preview.totalCount}개</Text>
            </View>

            {preview.totalCount > 0 && (
              <View style={styles.previewSection}>
                <Text style={styles.sectionTitle}>최근 기록 미리보기</Text>
                {preview.records.map((record, index) => (
                  <View key={record.id || index} style={styles.previewItem}>
                    <Text style={styles.coffeeName}>{record.coffeeName || '이름 없음'}</Text>
                    <Text style={styles.coffeeDetails}>
                      {record.roastery} • {new Date(record.created_at || record.timestamp).toLocaleDateString('ko-KR')}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.exportSection}>
              <Text style={styles.sectionTitle}>내보내기 형식 선택</Text>
              
              <TouchableOpacity
                style={[styles.exportButton, isLoading && styles.disabledButton]}
                onPress={handleExportCSV}
                disabled={isLoading || preview.totalCount === 0}
              >
                <Text style={styles.exportIcon}>📊</Text>
                <View style={styles.exportTextContainer}>
                  <Text style={styles.exportTitle}>CSV 형식</Text>
                  <Text style={styles.exportDescription}>
                    Excel, Google Sheets에서 열 수 있습니다
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exportButton, isLoading && styles.disabledButton]}
                onPress={handleExportJSON}
                disabled={isLoading || preview.totalCount === 0}
              >
                <Text style={styles.exportIcon}>📄</Text>
                <View style={styles.exportTextContainer}>
                  <Text style={styles.exportTitle}>JSON 형식</Text>
                  <Text style={styles.exportDescription}>
                    개발자용 데이터 형식입니다
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {preview.totalCount === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>☕️</Text>
                <BodyText style={styles.emptyText}>
                  아직 내보낼 테이스팅 기록이 없습니다
                </BodyText>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 8,
    color: Colors.TEXT_SECONDARY,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.TEXT_SECONDARY,
  },
  statsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.SHADOW_BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsLabel: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.GRADIENT_BROWN,
  },
  previewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  previewItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: Colors.SHADOW_BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  coffeeName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  coffeeDetails: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  exportSection: {
    marginBottom: 24,
  },
  exportButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.SHADOW_BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  exportIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  exportTextContainer: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  exportDescription: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
});