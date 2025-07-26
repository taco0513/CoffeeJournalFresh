import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase/client';
import { FeedbackItem, FeedbackCategory, FEEDBACK_CATEGORY_LABELS, FEEDBACK_STATUS_LABELS } from '../../types/feedback';
import { HIGColors, HIGConstants } from '../../constants/HIG';
import { Logger } from '../../services/LoggingService';
import { showToast } from '../../utils/toast';

export default function AdminFeedbackScreen({ navigation }: unknown) {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<unknown>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadFeedback();
    loadStats();
}, [selectedCategory, selectedStatus]);

  const loadFeedback = async () => {
    try {
      let query = supabase
        .from('feedback_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
    }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
    }

      const { data, error } = await query;

      if (error) throw error;
      setFeedbackItems(data || []);
  } catch (error) {
      Logger.error('Error loading feedback:', 'screen', { component: 'AdminFeedbackScreen', error: error });
      showToast('피드백을 불러오는데 실패했습니다', 'error');
  } finally {
      setLoading(false);
      setRefreshing(false);
  }
};

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_analytics')
        .select('*')
        .single();

      if (error) throw error;
      setStats(data);
  } catch (error) {
      Logger.error('Error loading stats:', 'screen', { component: 'AdminFeedbackScreen', error: error });
  }
};

  const updateFeedbackStatus = async (feedbackId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('feedback_items')
        .update({ 
          status: newStatus,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
      })
        .eq('id', feedbackId);

      if (error) throw error;

      showToast('상태가 업데이트되었습니다', 'success');
      setSelectedFeedback(null);
      loadFeedback();
  } catch (error) {
      Logger.error('Error updating feedback:', 'screen', { component: 'AdminFeedbackScreen', error: error });
      showToast('업데이트에 실패했습니다', 'error');
  } finally {
      setUpdatingStatus(false);
  }
};

  const renderFeedbackItem = ({ item }: { item: FeedbackItem }) => (
    <TouchableOpacity
      style={styles.feedbackCard}
      onPress={() => {
        setSelectedFeedback(item);
        setAdminNotes(item.adminNotes || '');
    }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryIcon}>
            {FEEDBACK_CATEGORY_LABELS[item.category].icon}
          </Text>
          <Text style={styles.categoryText}>
            {FEEDBACK_CATEGORY_LABELS[item.category].ko}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {FEEDBACK_STATUS_LABELS[item.status].ko}
          </Text>
        </View>
      </View>

      <Text style={styles.feedbackTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.feedbackDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.userInfo}>
          {item.username || '익명'} • {new Date(item.createdAt).toLocaleDateString('ko-KR')}
        </Text>
        {item.rating && (
          <View style={styles.rating}>
            {'⭐'.repeat(item.rating)}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFF3E0';
      case 'reviewed': return '#E3F2FD';
      case 'in-progress': return '#FFF8E1';
      case 'resolved': return '#E8F5E9';
      case 'closed': return '#F5F5F5';
      default: return '#F5F5F5';
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>피드백 관리</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Stats Overview */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total_feedback}</Text>
            <Text style={styles.statLabel}>전체</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.pending_count}</Text>
            <Text style={styles.statLabel}>대기중</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.average_rating?.toFixed(1) || '-'}</Text>
            <Text style={styles.statLabel}>평균 평점</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.unique_users}</Text>
            <Text style={styles.statLabel}>사용자</Text>
          </View>
        </View>
      )}

      {/* Filters */}
      <ScrollView horizontal style={styles.filterContainer} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.filterChip, selectedCategory === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.filterText, selectedCategory === 'all' && styles.filterTextActive]}>
            전체
          </Text>
        </TouchableOpacity>
        {(Object.keys(FEEDBACK_CATEGORY_LABELS) as FeedbackCategory[]).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>
              {FEEDBACK_CATEGORY_LABELS[cat].ko}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feedback List */}
      <FlatList
        data={feedbackItems}
        renderItem={renderFeedbackItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadFeedback();
        }} />
      }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>피드백이 없습니다</Text>
            </View>
          )
      }
      />

      {/* Detail Modal */}
      <Modal
        visible={!!selectedFeedback}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedFeedback(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>피드백 상세</Text>
                <TouchableOpacity onPress={() => setSelectedFeedback(null)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedFeedback && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>카테고리</Text>
                    <Text style={styles.detailValue}>
                      {FEEDBACK_CATEGORY_LABELS[selectedFeedback.category].icon} {FEEDBACK_CATEGORY_LABELS[selectedFeedback.category].ko}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>제목</Text>
                    <Text style={styles.detailValue}>{selectedFeedback.title}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>내용</Text>
                    <Text style={styles.detailValue}>{selectedFeedback.description}</Text>
                  </View>

                  {selectedFeedback.rating && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>평점</Text>
                      <Text style={styles.detailValue}>{'⭐'.repeat(selectedFeedback.rating)}</Text>
                    </View>
                  )}

                  {selectedFeedback.screenshotUrl && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>스크린샷</Text>
                      <Image source={{ uri: selectedFeedback.screenshotUrl }} style={styles.screenshot} />
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>사용자 정보</Text>
                    <Text style={styles.detailValue}>
                      {selectedFeedback.username || '익명'} ({selectedFeedback.userEmail || 'N/A'})
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>디바이스 정보</Text>
                    <Text style={styles.detailValue}>
                      {selectedFeedback.deviceInfo.platform} {selectedFeedback.deviceInfo.osVersion} - {selectedFeedback.deviceInfo.model}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>관리자 메모</Text>
                    <TextInput
                      style={styles.adminNotesInput}
                      value={adminNotes}
                      onChangeText={setAdminNotes}
                      placeholder="메모를 입력하세요"
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.statusButtons}>
                    {Object.keys(FEEDBACK_STATUS_LABELS).map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusButton,
                          selectedFeedback.status === status && styles.statusButtonActive
                        ]}
                        onPress={() => updateFeedbackStatus(selectedFeedback.id, status)}
                        disabled={updatingStatus}
                      >
                        <Text style={[
                          styles.statusButtonText,
                          selectedFeedback.status === status && styles.statusButtonTextActive
                        ]}>
                          {FEEDBACK_STATUS_LABELS[status as keyof typeof FEEDBACK_STATUS_LABELS].ko}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: HIGConstants.SPACING_MD,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray6,
},
  backButton: {
    fontSize: 24,
    color: HIGColors.label,
},
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
},
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: HIGConstants.SPACING_MD,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray6,
},
  statItem: {
    alignItems: 'center',
},
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.label,
},
  statLabel: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    marginTop: 4,
},
  filterContainer: {
    paddingVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_MD,
    backgroundColor: '#FFFFFF',
},
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: HIGColors.systemGray6,
    marginRight: 8,
},
  filterChipActive: {
    backgroundColor: HIGColors.systemBlue,
},
  filterText: {
    fontSize: 14,
    color: HIGColors.label,
},
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
},
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    padding: HIGConstants.SPACING_MD,
    marginHorizontal: HIGConstants.SPACING_MD,
    marginVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS_LG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
},
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
},
  categoryIcon: {
    fontSize: 20,
    marginRight: 6,
},
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.label,
},
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
},
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: HIGColors.label,
},
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
},
  feedbackDescription: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
},
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
  userInfo: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
},
  rating: {
    flexDirection: 'row',
},
  loader: {
    marginTop: 50,
},
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
},
  emptyText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
},
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
},
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: HIGConstants.SPACING_LG,
},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_LG,
},
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
},
  closeButton: {
    fontSize: 24,
    color: HIGColors.secondaryLabel,
},
  detailSection: {
    marginBottom: HIGConstants.SPACING_MD,
},
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
},
  detailValue: {
    fontSize: 16,
    color: HIGColors.label,
},
  screenshot: {
    width: '100%',
    height: 200,
    borderRadius: HIGConstants.BORDER_RADIUS_LG,
    marginTop: HIGConstants.SPACING_SM,
},
  adminNotesInput: {
    borderWidth: 1,
    borderColor: HIGColors.systemGray5,
    borderRadius: HIGConstants.BORDER_RADIUS_LG,
    padding: HIGConstants.SPACING_SM,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
},
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: HIGConstants.SPACING_MD,
    gap: 8,
},
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: HIGColors.systemGray6,
    marginRight: 8,
    marginBottom: 8,
},
  statusButtonActive: {
    backgroundColor: HIGColors.systemBlue,
},
  statusButtonText: {
    fontSize: 14,
    color: HIGColors.label,
},
  statusButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
},
});