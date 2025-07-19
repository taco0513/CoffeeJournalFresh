import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HIGConstants, HIGColors } from '../styles/common';
import { useUserStore } from '../stores/useUserStore';

interface CommunityReview {
  id: string;
  username: string;
  avatar?: string;
  coffeeName: string;
  roasteryName: string;
  brewMethod: string;
  rating: number;
  reviewText: string;
  photoUri?: string;
  createdAt: Date;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

const CommunityFeedScreen = () => {
  const navigation = useNavigation();
  const { currentUser } = useUserStore();
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCommunityReviews();
  }, []);

  const loadCommunityReviews = async () => {
    try {
      // TODO: Replace with actual Supabase API calls
      // For now, using mock data
      const mockReviews: CommunityReview[] = [
        {
          id: '1',
          username: 'coffee_lover',
          coffeeName: 'Colombia Huila',
          roasteryName: 'Blue Bottle',
          brewMethod: 'V60',
          rating: 4.5,
          reviewText: '정말 맛있는 커피였습니다! 초콜릿과 견과류 향이 뛰어나고 산미가 균형잡혀 있어요.',
          createdAt: new Date('2024-01-15'),
          likesCount: 12,
          commentsCount: 3,
          isLiked: false,
        },
        {
          id: '2',
          username: 'barista_kim',
          coffeeName: 'Ethiopia Yirgacheffe',
          roasteryName: 'Stumptown',
          brewMethod: 'Chemex',
          rating: 4.8,
          reviewText: '플로럴하고 시트러스한 향이 정말 인상적이었습니다. 아침에 마시기 완벽한 커피예요.',
          createdAt: new Date('2024-01-14'),
          likesCount: 8,
          commentsCount: 1,
          isLiked: true,
        },
        {
          id: '3',
          username: 'coffee_explorer',
          coffeeName: 'Guatemala Antigua',
          roasteryName: 'Counter Culture',
          brewMethod: 'French Press',
          rating: 4.2,
          reviewText: '풀바디하고 초콜릿 향이 진해서 좋았습니다. 디저트와 함께 마시면 더 좋을 것 같아요.',
          createdAt: new Date('2024-01-13'),
          likesCount: 15,
          commentsCount: 5,
          isLiked: false,
        },
      ];

      setReviews(mockReviews);
    } catch (error) {
      // console.error('Failed to load community reviews:', error);
      Alert.alert('오류', '커뮤니티 리뷰를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCommunityReviews();
  };

  const handleLike = async (reviewId: string) => {
    // TODO: Implement like functionality with Supabase
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            isLiked: !review.isLiked,
            likesCount: review.isLiked ? review.likesCount - 1 : review.likesCount + 1
          }
        : review
    ));
  };

  const handleComment = (reviewId: string) => {
    navigation.navigate('CommunityReview' as never, { reviewId } as never);
  };

  const handleShare = (reviewId: string) => {
    // TODO: Implement share functionality
    Alert.alert('공유', '공유 기능은 추후 구현 예정입니다.');
  };

  const handleUserPress = (username: string) => {
    // TODO: Navigate to user profile
    Alert.alert('사용자 프로필', `${username}의 프로필은 추후 구현 예정입니다.`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={`full-${i}`} style={styles.star}>★</Text>);
    }

    if (hasHalfStar) {
      stars.push(<Text key="half" style={styles.star}>☆</Text>);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Text key={`empty-${i}`} style={styles.emptyStar}>☆</Text>);
    }

    return stars;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1일 전';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return `${Math.floor(diffDays / 30)}개월 전`;
  };

  const renderReviewItem = ({ item }: { item: CommunityReview }) => (
    <View style={styles.reviewCard}>
      {/* Header */}
      <View style={styles.reviewHeader}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => handleUserPress(item.username)}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.timeAgo}>{formatDate(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Coffee Info */}
      <View style={styles.coffeeInfo}>
        <Text style={styles.coffeeName}>{item.coffeeName}</Text>
        <Text style={styles.roasteryName}>{item.roasteryName}</Text>
        <View style={styles.brewMethodContainer}>
          <Text style={styles.brewMethod}>{item.brewMethod}</Text>
        </View>
      </View>

      {/* Rating */}
      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>
          {renderStars(item.rating)}
        </View>
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>

      {/* Review Text */}
      <Text style={styles.reviewText}>{item.reviewText}</Text>

      {/* Photo */}
      {item.photoUri && (
        <Image source={{ uri: item.photoUri }} style={styles.reviewPhoto} />
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Text style={[styles.actionIcon, item.isLiked && styles.likedIcon]}>
            {item.isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.actionText}>{item.likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleComment(item.id)}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{item.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(item.id)}
        >
          <Text style={styles.actionIcon}>↗️</Text>
          <Text style={styles.actionText}>공유</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>☕</Text>
      <Text style={styles.emptyText}>아직 커뮤니티 리뷰가 없습니다</Text>
      <Text style={styles.emptySubtext}>
        첫 번째 리뷰를 공유해보세요!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <Text style={styles.headerSubtitle}>다른 사람들의 커피 리뷰</Text>
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        // 메모리 최적화 설정
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={10}
        updateCellsBatchingPeriod={50}
        getItemLayout={(data, index) => ({
          length: 380, // 리뷰 카드 높이 (이미지 포함)
          offset: 380 * index,
          index,
        })}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  header: {
    padding: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_SM,
    backgroundColor: HIGColors.systemBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  headerSubtitle: {
    fontSize: 17,
    color: HIGColors.secondaryLabel,
  },
  feedContent: {
    padding: HIGConstants.SPACING_LG,
    flexGrow: 1,
  },
  reviewCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_LG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewHeader: {
    marginBottom: HIGConstants.SPACING_MD,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HIGColors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: HIGConstants.SPACING_MD,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
  },
  coffeeInfo: {
    marginBottom: HIGConstants.SPACING_MD,
  },
  coffeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  roasteryName: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  brewMethodContainer: {
    alignSelf: 'flex-start',
  },
  brewMethod: {
    fontSize: 13,
    color: HIGColors.blue,
    backgroundColor: HIGColors.systemBackground,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.BORDER_RADIUS / 2,
    borderWidth: 1,
    borderColor: HIGColors.blue,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: HIGConstants.SPACING_SM,
  },
  star: {
    fontSize: 16,
    color: '#FFD700',
  },
  emptyStar: {
    fontSize: 16,
    color: HIGColors.gray4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  reviewText: {
    fontSize: 16,
    lineHeight: 24,
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  reviewPhoto: {
    width: '100%',
    height: 200,
    borderRadius: HIGConstants.BORDER_RADIUS,
    marginBottom: HIGConstants.SPACING_MD,
    backgroundColor: HIGColors.gray5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: HIGConstants.SPACING_MD,
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.gray4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_MD,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: HIGConstants.SPACING_XS,
  },
  likedIcon: {
    // Additional styles for liked state
  },
  actionText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  separator: {
    height: HIGConstants.SPACING_MD,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: HIGConstants.SPACING_LG,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: HIGConstants.SPACING_MD,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  emptySubtext: {
    fontSize: 15,
    color: HIGColors.tertiaryLabel,
    textAlign: 'center',
  },
});

export default CommunityFeedScreen;