import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { HIGColors, HIGConstants } from '../../styles/common';
import { supabase } from '../../services/supabase/client';
import { useUserStore } from '../../stores/useUserStore';

interface PendingCoffee {
  id: string;
  roastery: string;
  coffee_name: string;
  origin?: string;
  variety?: string;
  process?: string;
  first_added_by: string;
  created_at: string;
  user_email?: string;
}

interface AdminStats {
  totalCoffees: number;
  pendingReviews: number;
  approvedToday: number;
  totalContributors: number;
}

export const AdminDashboardScreen = ({ navigation }: any) => {
  const { currentUser: user } = useUserStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCoffees, setPendingCoffees] = useState<PendingCoffee[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalCoffees: 0,
    pendingReviews: 0,
    approvedToday: 0,
    totalContributors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (user?.email === 'hello@zimojin.com') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      Alert.alert('접근 거부', '관리자만 접근할 수 있습니다.');
      navigation.goBack();
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPendingCoffees(),
        loadStats(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('오류', '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCoffees = async () => {
    const { data, error } = await supabase
      .from('coffee_catalog')
      .select(`
        *,
        user:first_added_by (
          email
        )
      `)
      .eq('verified_by_moderator', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    setPendingCoffees(data?.map(coffee => ({
      ...coffee,
      user_email: coffee.user?.email,
    })) || []);
  };

  const loadStats = async () => {
    // Total coffees
    const { count: totalCoffees } = await supabase
      .from('coffee_catalog')
      .select('*', { count: 'exact', head: true });

    // Pending reviews
    const { count: pendingReviews } = await supabase
      .from('coffee_catalog')
      .select('*', { count: 'exact', head: true })
      .eq('verified_by_moderator', false);

    // Approved today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: approvedToday } = await supabase
      .from('coffee_catalog')
      .select('*', { count: 'exact', head: true })
      .eq('verified_by_moderator', true)
      .gte('updated_at', today.toISOString());

    // Total contributors
    const { data: contributors } = await supabase
      .from('coffee_catalog')
      .select('first_added_by')
      .not('first_added_by', 'is', null);
    
    const uniqueContributors = new Set(contributors?.map(c => c.first_added_by));

    setStats({
      totalCoffees: totalCoffees || 0,
      pendingReviews: pendingReviews || 0,
      approvedToday: approvedToday || 0,
      totalContributors: uniqueContributors.size,
    });
  };

  const handleApprove = async (coffeeId: string) => {
    try {
      const { error } = await supabase
        .from('coffee_catalog')
        .update({ verified_by_moderator: true })
        .eq('id', coffeeId);

      if (error) throw error;

      Alert.alert('승인 완료', '커피가 승인되었습니다.');
      loadDashboardData();
    } catch (error) {
      console.error('Error approving coffee:', error);
      Alert.alert('오류', '승인 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (coffeeId: string) => {
    Alert.alert(
      '거절 확인',
      '정말로 이 커피를 거절하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '거절',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('coffee_catalog')
                .delete()
                .eq('id', coffeeId);

              if (error) throw error;

              Alert.alert('거절 완료', '커피가 거절되었습니다.');
              loadDashboardData();
            } catch (error) {
              console.error('Error rejecting coffee:', error);
              Alert.alert('오류', '거절 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (coffee: PendingCoffee) => {
    navigation.navigate('AdminCoffeeEdit', { coffee });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={HIGColors.blue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>관리자 대시보드</Text>
          <Text style={styles.subtitle}>Coffee Catalog Management</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalCoffees}</Text>
            <Text style={styles.statLabel}>전체 커피</Text>
          </View>
          <View style={[styles.statCard, styles.pendingCard]}>
            <Text style={styles.statValue}>{stats.pendingReviews}</Text>
            <Text style={styles.statLabel}>검수 대기</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.approvedToday}</Text>
            <Text style={styles.statLabel}>오늘 승인</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalContributors}</Text>
            <Text style={styles.statLabel}>기여자</Text>
          </View>
        </View>

        {/* Pending Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>검수 대기 중 ({pendingCoffees.length})</Text>
          
          {pendingCoffees.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>검수 대기 중인 커피가 없습니다 ✨</Text>
            </View>
          ) : (
            pendingCoffees.map((coffee) => (
              <View key={coffee.id} style={styles.coffeeCard}>
                <View style={styles.coffeeHeader}>
                  <Text style={styles.roasteryName}>{coffee.roastery}</Text>
                  <Text style={styles.timestamp}>
                    {new Date(coffee.created_at).toLocaleDateString('ko-KR')}
                  </Text>
                </View>
                
                <Text style={styles.coffeeName}>{coffee.coffee_name}</Text>
                
                <View style={styles.coffeeDetails}>
                  {coffee.origin && (
                    <Text style={styles.detailText}>원산지: {coffee.origin}</Text>
                  )}
                  {coffee.variety && (
                    <Text style={styles.detailText}>품종: {coffee.variety}</Text>
                  )}
                  {coffee.process && (
                    <Text style={styles.detailText}>가공: {coffee.process}</Text>
                  )}
                </View>
                
                <Text style={styles.submittedBy}>
                  제출: {coffee.user_email || 'Unknown'}
                </Text>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(coffee.id)}
                  >
                    <Text style={styles.approveButtonText}>승인</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(coffee)}
                  >
                    <Text style={styles.editButtonText}>수정</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(coffee.id)}
                  >
                    <Text style={styles.rejectButtonText}>거절</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_XL,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  subtitle: {
    fontSize: 17,
    color: HIGColors.secondaryLabel,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_LG,
  },
  statCard: {
    width: '48%',
    backgroundColor: HIGColors.gray6,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    marginRight: '2%',
    alignItems: 'center',
  },
  pendingCard: {
    backgroundColor: '#FFF3CD',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  statLabel: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
  },
  section: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_XL,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  emptyState: {
    padding: HIGConstants.SPACING_XL,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 17,
    color: HIGColors.tertiaryLabel,
  },
  coffeeCard: {
    backgroundColor: HIGColors.systemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: HIGColors.gray4,
  },
  coffeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HIGConstants.SPACING_SM,
  },
  roasteryName: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.blue,
  },
  timestamp: {
    fontSize: 13,
    color: HIGColors.tertiaryLabel,
  },
  coffeeName: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  coffeeDetails: {
    marginBottom: HIGConstants.SPACING_SM,
  },
  detailText: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  submittedBy: {
    fontSize: 13,
    color: HIGColors.tertiaryLabel,
    marginBottom: HIGConstants.SPACING_MD,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
  },
  actionButton: {
    flex: 1,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: HIGColors.green,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: HIGColors.gray5,
  },
  editButtonText: {
    color: HIGColors.label,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: HIGColors.red,
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});